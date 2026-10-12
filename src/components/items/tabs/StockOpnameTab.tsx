import { Fragment, useState, useMemo } from "react";
import {
  useGetInvoiceItemsFlat,
  useGetItemsStocksSummary,
} from "@/features/items/api";
import { useGetDapurs } from "@/features/dapur/api";
import { useAuth } from "@/features/auth/context";
import { axiosInstance } from "@/core/http/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Package,
  ChevronRight,
  ChevronDown,
  Download,
} from "lucide-react";
import type {
  InvoiceItemFlat,
  ItemStocksSummary,
} from "@/features/items/types";
import type { ApiResponse } from "@/types/response";
import DataTablePagination from "@/components/shared/DataTablePagination";
import { TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";
import { downloadXlsx, type XlsxRow, type XlsxSheet } from "@/lib/xlsx-utils";

type TimeRange = "1d" | "1w" | "1m" | "all";

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "1d", label: "Hari Ini" },
  { value: "1w", label: "1 Minggu" },
  { value: "1m", label: "1 Bulan" },
  { value: "all", label: "Semua Waktu" },
];

const getDateRange = (range: TimeRange): { from?: Date; to?: Date } => {
  if (range === "all") return {};
  const now = dayjs();
  const to = now.endOf("day").toDate();
  const from =
    range === "1d"
      ? now.startOf("day").toDate()
      : range === "1w"
        ? now.subtract(6, "day").startOf("day").toDate()
        : now.subtract(29, "day").startOf("day").toDate();
  return { from, to };
};

const EXPORT_HEADERS = [
  "TANGGAL",
  "NO",
  "NO INVOICE",
  "NAMA BARANG",
  "QTY",
  "SATUAN",
  "HARGA BELI",
  "HARGA JUAL",
  "TOTAL HARGA BELI",
  "TOTAL HARGA JUAL",
];

const formatNumberID = (value: number) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);

const formatRupiahPlain = (value: number) => `Rp${formatNumberID(value)}`;

const normalizeExportDate = (value: string) => {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM") : value || "-";
};

const groupByDate = (items: InvoiceItemFlat[]) =>
  items.reduce<Record<string, InvoiceItemFlat[]>>((acc, item) => {
    const key = item.date || "-";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

const cells = (values: (string | number)[], style = 0): XlsxRow["cells"] =>
  values.map((value) => ({ value, style }));

const buildStockOpnameSheet = (
  items: InvoiceItemFlat[],
  dapurName: string,
): XlsxSheet => {
  const title = `PO MINGGUAN ${dapurName.toUpperCase()}`;
  const rows: XlsxRow[] = [
    {
      height: 24,
      cells: [
        { value: title, style: 1 },
        ...Array.from({ length: 9 }, () => ({ value: "", style: 1 })),
      ],
    },
    { height: 6, cells: cells(Array.from({ length: 10 }, () => ""), 0) },
    {
      height: 20,
      cells: EXPORT_HEADERS.map((header) => ({
        value: header,
        style: 2,
      })),
    },
  ];

  let grandTotalBuy = 0;
  let grandTotalSell = 0;
  const grouped = groupByDate(items);

  Object.entries(grouped).forEach(([date, group]) => {
    let totalBuy = 0;
    let totalSell = 0;

    group.forEach((item, index) => {
      totalBuy += item.totalBuyPrice;
      totalSell += item.totalSellPrice;
      rows.push({
        cells: [
          { value: index === 0 ? normalizeExportDate(date) : "", style: index === 0 ? 4 : 6 },
          { value: index + 1, style: 6 },
          { value: item.invoiceNumber, style: 6 },
          { value: item.itemName, style: 7 },
          { value: formatNumberID(item.amount), style: 6 },
          { value: item.measureUnit, style: 6 },
          { value: formatNumberID(item.buyPrice), style: 6 },
          { value: formatNumberID(item.sellPrice), style: 6 },
          { value: formatRupiahPlain(item.totalBuyPrice), style: 6 },
          { value: formatRupiahPlain(item.totalSellPrice), style: 6 },
        ],
      });
    });

    grandTotalBuy += totalBuy;
    grandTotalSell += totalSell;
    rows.push({
      cells: [
        { value: "", style: 5 },
        { value: "", style: 5 },
        { value: "", style: 5 },
        { value: "", style: 5 },
        { value: "", style: 5 },
        { value: "", style: 5 },
        { value: "", style: 5 },
        { value: "TOTAL", style: 5 },
        { value: formatRupiahPlain(totalBuy), style: 5 },
        { value: formatRupiahPlain(totalSell), style: 5 },
      ],
    });
  });

  if (Object.keys(grouped).length > 1) {
    rows.push({
      height: 20,
      cells: [
        { value: "", style: 5 },
        { value: "", style: 5 },
        { value: "", style: 5 },
        { value: "", style: 5 },
        { value: "", style: 5 },
        { value: "", style: 5 },
        { value: "", style: 5 },
        { value: "TOTAL MINGGUAN", style: 5 },
        { value: formatRupiahPlain(grandTotalBuy), style: 5 },
        { value: formatRupiahPlain(grandTotalSell), style: 5 },
      ],
    });
  }

  return {
    name: dapurName,
    rows,
    columns: [
      { width: 11 },
      { width: 6 },
      { width: 14 },
      { width: 28 },
      { width: 10 },
      { width: 11 },
      { width: 14 },
      { width: 14 },
      { width: 18 },
      { width: 18 },
    ],
    merges: [{ from: "A1", to: "J1" }],
    freezePane: "A4",
  };
};

const StockOpnameTab = () => {
  const auth = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [exporting, setExporting] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { from: dateFrom, to: dateTo } = getDateRange(timeRange);

  const { data: summaryData, isLoading: summaryLoading } =
    useGetItemsStocksSummary(searchQuery, page, limit, dateFrom, dateTo);

  const { data: allInvoiceData } =
    useGetInvoiceItemsFlat("", 1, 10000, "OUT", dateFrom, dateTo);

  const { data: dapurs } = useGetDapurs();

  const allInvoices = allInvoiceData?.data ?? [];
  const currentDapurName =
    dapurs?.find((dapur) => dapur.id === auth.user?.currentDapurId)?.name ??
    "SPPG";

  // Group invoices by item name for expandable rows
  const invoicesByItem = useMemo(() => {
    const map = new Map<string, InvoiceItemFlat[]>();
    for (const inv of allInvoices) {
      const key = inv.itemName;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(inv);
    }
    return map;
  }, [allInvoices]);

  const items = summaryData?.data ?? [];

  const totals = useMemo(() => {
    let totalBuy = 0;
    let totalSell = 0;
    for (const item of items) {
      totalBuy += (item.buyPrice ?? 0) * (item.currentStock ?? 0);
      totalSell += (item.sellPrice ?? 0) * (item.currentStock ?? 0);
    }
    return { totalBuy, totalSell, diff: totalSell - totalBuy };
  }, [items]);

  const handleTimeRangeChange = (val: TimeRange) => {
    setTimeRange(val);
    setPage(1);
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        size: "10000",
        stock_type: "OUT",
      });
      if (searchQuery) params.append("search_query", searchQuery);
      if (dateFrom) params.append("start_date", dateFrom.toISOString());
      if (dateTo) params.append("end_date", dateTo.toISOString());

      const { data } = await axiosInstance.get<ApiResponse<InvoiceItemFlat[]>>(
        `/items/invoices/items-flat?${params.toString()}`,
      );
      const allItems = data.data ?? [];

      const label =
        TIME_RANGE_OPTIONS.find((o) => o.value === timeRange)?.label ??
        timeRange;
      downloadXlsx(
        `stock-opname-${label}-${dayjs().format("YYYY-MM-DD")}.xlsx`,
        [buildStockOpnameSheet(allItems, currentDapurName)],
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <TabsContent value="stok-opname" className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border bg-card p-4">
        <div>
          <p className="text-xs text-muted-foreground">Total Nilai Beli</p>
          <p className="text-sm font-bold tabular-nums">{formatCurrency(totals.totalBuy)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total Nilai Jual</p>
          <p className="text-sm font-bold tabular-nums">{formatCurrency(totals.totalSell)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Selisih</p>
          <p className={`text-sm font-bold tabular-nums ${totals.diff >= 0 ? "text-success" : "text-destructive"}`}>
            {totals.diff > 0 ? "+" : ""}{formatCurrency(totals.diff)}
          </p>
        </div>
        <div className="ml-auto">
          <p className="text-xs text-muted-foreground">Item</p>
          <p className="text-sm font-bold tabular-nums">{summaryData?.paging?.totalItem ?? 0}</p>
        </div>
      </div>

      {/* Single table */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">Stok Opname</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Klik baris untuk melihat detail invoice per bahan</p>
              <div className="mt-2 flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari bahan..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9 w-48"
                  />
                </div>
                <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue placeholder="Rentang Waktu" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_RANGE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exporting}
              className="shrink-0 self-start"
            >
              {exporting ? (
                <span className="flex items-center gap-1.5">
                  <Download className="w-4 h-4 animate-bounce" />
                  Mengunduh...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  Export Excel
                </span>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="relative border-y text-nowrap h-full w-full">
            <Table className="relative w-full">
              <TableHeader className="sticky top-0 bg-background z-10 border-b">
                <TableRow>
                  <TableHead className="w-[40px]" />
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Bahan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Stok Awal</TableHead>
                  <TableHead>Masuk</TableHead>
                  <TableHead>Keluar</TableHead>
                  <TableHead>Stok Saat Ini</TableHead>
                  <TableHead>Harga Beli</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead>Selisih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 12 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full rounded-md" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="p-0">
                      <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 px-4">
                        <Package className="h-12 w-12 mb-3 opacity-50" />
                        <p className="text-sm font-medium">
                          {searchQuery
                            ? "Tidak ada hasil pencarian"
                            : "Data masih kosong"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item: ItemStocksSummary, index: number) => {
                    const itemId = item.itemId ?? `item-${index}`;
                    const isExpanded = expandedItems.has(itemId);
                    const itemInvoices = invoicesByItem.get(item.name ?? "") ?? [];
                    const selisih = (item.sellPrice ?? 0) - (item.buyPrice ?? 0);                      return (
                      <Fragment key={itemId}>
                        {/* Summary row */}
                        <TableRow
                          key={`row-${itemId}`}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleExpand(itemId)}
                        >
                          <TableCell className="w-[40px] px-2">
                            {itemInvoices.length > 0 ? (
                              isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              )
                            ) : null}
                          </TableCell>
                          <TableCell className="font-medium text-muted-foreground">
                            {(page - 1) * limit + index + 1}
                          </TableCell>
                          <TableCell className="font-mono text-sm font-medium">
                            {item.itemId}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {item.category}
                            </span>
                          </TableCell>
                          <TableCell>
                            {item.initialStock} {item.measureUnit}
                          </TableCell>
                          <TableCell className="text-success font-medium">
                            +{item.totalIn ?? 0}
                          </TableCell>
                          <TableCell className="text-destructive font-medium">
                            -{item.totalOut ?? 0}
                          </TableCell>
                          <TableCell
                            className={`font-medium ${(item.currentStock ?? 0) <= 0 ? "text-destructive" : ""}`}
                          >
                            {item.currentStock} {item.measureUnit}
                          </TableCell>
                          <TableCell>{formatCurrency(item.buyPrice ?? 0)}</TableCell>
                          <TableCell>{formatCurrency(item.sellPrice ?? 0)}</TableCell>
                          <TableCell
                            className={`font-medium ${selisih > 0 ? "text-success" : selisih < 0 ? "text-destructive" : ""}`}
                          >
                            {selisih > 0 ? "+" : ""}
                            {formatCurrency(selisih)}
                          </TableCell>
                        </TableRow>

                        {/* Expanded invoice details */}
                        {isExpanded && itemInvoices.length > 0 && (
                          <TableRow key={`detail-header-${itemId}`} className="bg-muted/30">
                            <TableCell colSpan={12} className="py-0">
                              <div className="pl-10 pr-4 py-2">
                                <p className="text-xs font-semibold text-muted-foreground mb-2">
                                  Detail Invoice ({itemInvoices.length} transaksi)
                                </p>
                                <div className="space-y-1">
                                  {itemInvoices.map((inv, invIdx) => (
                                    <div
                                      key={`${inv.invoiceNumber}-${invIdx}`}
                                      className="flex items-center gap-4 text-xs py-1.5 border-b border-border/50 last:border-0"
                                    >
                                      <span className="font-mono font-medium w-28 shrink-0">
                                        {inv.invoiceNumber}
                                      </span>
                                      <span className="text-muted-foreground w-20 shrink-0">
                                        {inv.date || "-"}
                                      </span>
                                      <span className="w-16 text-right shrink-0 tabular-nums">
                                        {inv.amount} {inv.measureUnit}
                                      </span>
                                      <span className="text-muted-foreground w-24 text-right shrink-0 tabular-nums">
                                        @{formatCurrency(inv.buyPrice)}
                                      </span>
                                      <span className="text-muted-foreground w-24 text-right shrink-0 tabular-nums">
                                        @{formatCurrency(inv.sellPrice)}
                                      </span>
                                      <span className="font-medium text-primary w-28 text-right shrink-0 tabular-nums">
                                        {formatCurrency(inv.totalBuyPrice)}
                                      </span>
                                      <span className="font-medium text-success w-28 text-right shrink-0 tabular-nums">
                                        {formatCurrency(inv.totalSellPrice)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        {isExpanded && itemInvoices.length === 0 && (
                          <TableRow key={`detail-empty-${itemId}`} className="bg-muted/30">
                            <TableCell colSpan={12} className="py-2 pl-14">
                              <p className="text-xs text-muted-foreground">Tidak ada invoice untuk bahan ini</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={9} className="font-bold text-right">
                    Total Nilai Halaman Ini
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(
                      items.reduce(
                        (acc, s) => acc + (s.buyPrice ?? 0) * (s.currentStock ?? 0),
                        0,
                      ),
                    )}
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(
                      items.reduce(
                        (acc, s) => acc + (s.sellPrice ?? 0) * (s.currentStock ?? 0),
                        0,
                      ),
                    )}
                  </TableCell>
                  <TableCell className="font-bold">
                    {(() => {
                      const pageDiff = items.reduce(
                        (acc, s) =>
                          acc +
                          ((s.sellPrice ?? 0) - (s.buyPrice ?? 0)) *
                            (s.currentStock ?? 0),
                        0,
                      );
                      return (
                        <span className={pageDiff >= 0 ? "text-success" : "text-destructive"}>
                          {pageDiff > 0 ? "+" : ""}
                          {formatCurrency(pageDiff)}
                        </span>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          <div className="px-2 pb-2 pt-1">
            <DataTablePagination
              currentPage={page}
              pageSize={limit}
              totalPages={summaryData?.paging?.totalPage || 1}
              totalItems={summaryData?.paging?.totalItem || 0}
              onPageChange={setPage}
              onPageSizeChange={(n) => {
                setLimit(n);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default StockOpnameTab;

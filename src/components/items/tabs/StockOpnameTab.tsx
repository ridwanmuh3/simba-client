import { useState, useMemo } from "react";
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
  CardDescription,
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
  TrendingUp,
  ShoppingCart,
  DollarSign,
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
      cells: EXPORT_HEADERS.map((header, index) => ({
        value: header,
        style: index === 0 ? 4 : index >= 8 ? 3 : 2,
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

  const [rekapSearch, setRekapSearch] = useState("");
  const [rekapPage, setRekapPage] = useState(1);
  const [rekapLimit, setRekapLimit] = useState(10);

  const { from: dateFrom, to: dateTo } = getDateRange(timeRange);

  const { data: invoiceItemsData, isLoading } = useGetInvoiceItemsFlat(
    searchQuery,
    page,
    limit,
    "OUT",
    dateFrom,
    dateTo,
  );

  const { data: summaryData, isLoading: summaryLoading } =
    useGetInvoiceItemsFlat("", 1, 100, "OUT", dateFrom, dateTo);

  const { data: rekapData, isLoading: rekapLoading } = useGetItemsStocksSummary(
    rekapSearch,
    rekapPage,
    rekapLimit,
    dateFrom,
    dateTo,
  );
  const { data: dapurs } = useGetDapurs();

  const items = invoiceItemsData?.data ?? [];
  const currentDapurName =
    dapurs?.find((dapur) => dapur.id === auth.user?.currentDapurId)?.name ??
    "SPPG";

  const summary = useMemo(() => {
    const all = summaryData?.data ?? [];
    const totalBuy = all.reduce((acc, s) => acc + s.totalBuyPrice, 0);
    const totalSell = all.reduce((acc, s) => acc + s.totalSellPrice, 0);
    return { totalBuy, totalSell, diff: totalSell - totalBuy };
  }, [summaryData]);

  const handleTimeRangeChange = (val: TimeRange) => {
    setTimeRange(val);
    setPage(1);
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Harga Beli
            </CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <p className="text-2xl font-bold">
                {formatCurrency(summary.totalBuy)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Harga Jual
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <p className="text-2xl font-bold">
                {formatCurrency(summary.totalSell)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Selisih Harga
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <p
                className={`text-2xl font-bold ${summary.diff >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {summary.diff > 0 ? "+" : ""}
                {formatCurrency(summary.diff)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">Stock Opname</CardTitle>
              <CardDescription className="mt-2 flex flex-wrap gap-2 items-center">
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
              </CardDescription>
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
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>No Invoice</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Harga Beli</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead>Total Harga Beli</TableHead>
                  <TableHead>Total Harga Jual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full rounded-md" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="p-0">
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
                  items.map((item, index) => (
                    <TableRow key={`${item.invoiceNumber}-${index}`}>
                      <TableCell className="font-medium text-muted-foreground">
                        {(page - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium">
                        {item.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {item.date || "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.itemName}
                      </TableCell>
                      <TableCell>{item.amount}</TableCell>
                      <TableCell>{item.measureUnit}</TableCell>
                      <TableCell>{formatCurrency(item.buyPrice)}</TableCell>
                      <TableCell>{formatCurrency(item.sellPrice)}</TableCell>
                      <TableCell className="text-blue-600 font-medium">
                        {formatCurrency(item.totalBuyPrice)}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {formatCurrency(item.totalSellPrice)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={8} className="font-bold text-right">
                    Total Halaman Ini
                  </TableCell>
                  <TableCell className="font-bold text-blue-600">
                    {formatCurrency(
                      items.reduce((acc, s) => acc + s.totalBuyPrice, 0),
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    {formatCurrency(
                      items.reduce((acc, s) => acc + s.totalSellPrice, 0),
                    )}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          <div className="px-2 pb-2 pt-1">
            <DataTablePagination
              currentPage={page}
              pageSize={limit}
              totalPages={invoiceItemsData?.paging?.totalPage || 1}
              totalItems={invoiceItemsData?.paging?.totalItem || 0}
              onPageChange={setPage}
              onPageSizeChange={(n) => {
                setLimit(n);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>
      {/* Rekap Inventaris */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">Rekap Stok</CardTitle>
              <CardDescription className="mt-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari bahan..."
                    value={rekapSearch}
                    onChange={(e) => {
                      setRekapSearch(e.target.value);
                      setRekapPage(1);
                    }}
                    className="pl-9 w-48"
                  />
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="relative border-y text-nowrap h-full w-full">
            <Table className="relative w-full">
              <TableHeader className="sticky top-0 bg-background z-10 border-b">
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Bahan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Stok Awal</TableHead>
                  <TableHead>Total Masuk</TableHead>
                  <TableHead>Total Keluar</TableHead>
                  <TableHead>Stok Saat Ini</TableHead>
                  <TableHead>Nilai Harga Beli</TableHead>
                  <TableHead>Nilai Harga Jual</TableHead>
                  <TableHead>Selisih Harga</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rekapLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 11 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full rounded-md" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : !rekapData?.data?.length ? (
                  <TableRow>
                    <TableCell colSpan={11} className="p-0">
                      <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 px-4">
                        <Package className="h-12 w-12 mb-3 opacity-50" />
                        <p className="text-sm font-medium">
                          {rekapSearch
                            ? "Tidak ada hasil pencarian"
                            : "Data masih kosong"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rekapData.data.map(
                    (item: ItemStocksSummary, index: number) => {
                      const selisih =
                        (item.sellPrice ?? 0) - (item.buyPrice ?? 0);
                      return (
                        <TableRow key={`${item.itemId}-${index}`}>
                          <TableCell className="font-medium text-muted-foreground">
                            {(rekapPage - 1) * rekapLimit + index + 1}
                          </TableCell>
                          <TableCell className="font-mono text-sm font-medium">
                            {item.itemId}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {item.category}
                            </span>
                          </TableCell>
                          <TableCell>
                            {item.initialStock} {item.measureUnit}
                          </TableCell>
                          <TableCell className="text-green-600 font-medium">
                            +{item.totalIn ?? 0}
                          </TableCell>
                          <TableCell className="text-red-500 font-medium">
                            -{item.totalOut ?? 0}
                          </TableCell>
                          <TableCell
                            className={`font-medium ${(item.currentStock ?? 0) <= 0 ? "text-red-500" : ""}`}
                          >
                            {item.currentStock} {item.measureUnit}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.buyPrice ?? 0)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.sellPrice ?? 0)}
                          </TableCell>
                          <TableCell
                            className={`font-medium ${selisih > 0 ? "text-green-600" : selisih < 0 ? "text-red-500" : ""}`}
                          >
                            {selisih > 0 ? "+" : ""}
                            {formatCurrency(selisih)}
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="font-bold text-right">
                    Total Harga Halaman Ini
                  </TableCell>
                  <TableCell className="font-bold">
                    {rekapData?.data?.reduce(
                      (acc, s) => acc + (s.initialStock ?? 0),
                      0,
                    ) ?? 0}
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    +
                    {rekapData?.data?.reduce(
                      (acc, s) => acc + (s.totalIn ?? 0),
                      0,
                    ) ?? 0}
                  </TableCell>
                  <TableCell className="font-bold text-red-500">
                    -
                    {rekapData?.data?.reduce(
                      (acc, s) => acc + (s.totalOut ?? 0),
                      0,
                    ) ?? 0}
                  </TableCell>
                  <TableCell className="font-bold">
                    {rekapData?.data?.reduce(
                      (acc, s) => acc + (s.currentStock ?? 0),
                      0,
                    ) ?? 0}
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(
                      rekapData?.data?.reduce(
                        (acc, s) => acc + (s.buyPrice ?? 0),
                        0,
                      ) ?? 0,
                    )}
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(
                      rekapData?.data?.reduce(
                        (acc, s) => acc + (s.sellPrice ?? 0),
                        0,
                      ) ?? 0,
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    {formatCurrency(
                      rekapData?.data?.reduce(
                        (acc, s) =>
                          acc + ((s.sellPrice ?? 0) - (s.buyPrice ?? 0)),
                        0,
                      ) ?? 0,
                    )}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          <div className="px-2 pb-2 pt-1">
            <DataTablePagination
              currentPage={rekapPage}
              pageSize={rekapLimit}
              totalPages={rekapData?.paging?.totalPage || 1}
              totalItems={rekapData?.paging?.totalItem || 0}
              onPageChange={setRekapPage}
              onPageSizeChange={(n) => {
                setRekapLimit(n);
                setRekapPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default StockOpnameTab;

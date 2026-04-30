import { useState, useMemo } from "react";
import { useGetItemsStocksSummary } from "@/features/items/api";
import { axiosInstance } from "@/core/http/axios";
import { ApiResponse } from "@/types/response";
import { ItemStocksSummary } from "@/features/items/types";
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
import { Badge } from "@/components/ui/badge";
import { Search, Package, FileDown, Loader2, TrendingUp, ShoppingCart, DollarSign } from "lucide-react";
import DataTablePagination from "@/components/shared/DataTablePagination";
import { TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { exportOpnameToCSV } from "@/lib/csv-utils";
import dayjs from "dayjs";

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

const StockOpnameTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [exporting, setExporting] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  const { from: dateFrom, to: dateTo } = getDateRange(timeRange);

  const { data: stocksData, isLoading } = useGetItemsStocksSummary(
    searchQuery,
    page,
    limit,
    dateFrom,
    dateTo,
  );

  // Fetch all items (no pagination) for summary card totals
  const { data: allStocksData } = useGetItemsStocksSummary(
    "",
    1,
    9999,
    dateFrom,
    dateTo,
  );

  const stocks = stocksData?.data ?? [];
  const allStocks = allStocksData?.data ?? [];

  const summary = useMemo(() => {
    const totalBuy = allStocks.reduce((acc, s) => acc + (s.buyPrice ?? 0), 0);
    const totalSell = allStocks.reduce((acc, s) => acc + (s.sellPrice ?? 0), 0);
    return { totalBuy, totalSell, totalDiff: totalSell - totalBuy };
  }, [allStocks]);

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleTimeRangeChange = (val: TimeRange) => {
    setTimeRange(val);
    setPage(1);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ page: "1", size: "100" });
      if (searchQuery) params.append("search_query", searchQuery);
      if (dateFrom) params.append("start_date", dateFrom.toISOString());
      if (dateTo) params.append("end_date", dateTo.toISOString());

      const { data } = await axiosInstance.get<ApiResponse<ItemStocksSummary[]>>(
        `/items/stocks/opname?${params.toString()}`,
      );

      const exportDate = dayjs().format("DD-MM-YYYY");
      exportOpnameToCSV(data.data ?? [], exportDate);
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
            {isLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <p className="text-2xl font-bold">{formatCurrency(summary.totalBuy)}</p>
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
            {isLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <p className="text-2xl font-bold">{formatCurrency(summary.totalSell)}</p>
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
            {isLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <p
                className={`text-2xl font-bold ${
                  summary.totalDiff >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summary.totalDiff > 0 ? "+" : ""}
                {formatCurrency(summary.totalDiff)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">Stok Opname - Rekap Inventaris</CardTitle>
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
              disabled={exporting || isLoading}
              className="shrink-0 mt-1"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 mr-2" />
              )}
              Export Excel
            </Button>
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
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 11 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full rounded-md" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : stocks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="p-0">
                      <div className="flex w-full items-center justify-center">
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 px-4">
                          <Package className="h-12 w-12 mb-3 opacity-50" />
                          <p className="text-sm font-medium">
                            {searchQuery ? "Tidak ada hasil pencarian" : "Data masih kosong"}
                          </p>
                          {searchQuery && (
                            <p className="text-xs mt-1 text-muted-foreground/80 max-w-xs">
                              Coba kata kunci lain atau tambah bahan baru
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  stocks.map((stock, index) => {
                    const totalIn = stock.totalIn ?? 0;
                    const totalOut = stock.totalOut ?? 0;
                    const initialStock = stock.initialStock ?? 0;
                    const currentStock = stock.currentStock ?? 0;
                    const buyPrice = stock.buyPrice ?? 0;
                    const sellPrice = stock.sellPrice ?? 0;
                    const priceDifference = sellPrice - buyPrice;

                    return (
                      <TableRow key={stock.itemId}>
                        <TableCell className="font-medium text-muted-foreground">
                          {(page - 1) * limit + index + 1}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{stock.itemId}</TableCell>
                        <TableCell className="font-medium">{stock.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{stock.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {initialStock} {stock.measureUnit}
                        </TableCell>
                        <TableCell className="text-green-600">+{totalIn}</TableCell>
                        <TableCell className="text-red-600">
                          {totalOut > 0 ? `-${totalOut}` : "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              currentStock < 20 ? "text-destructive font-bold" : "font-medium"
                            }
                          >
                            {currentStock} {stock.measureUnit}
                          </span>
                        </TableCell>
                        <TableCell>{formatCurrency(buyPrice)}</TableCell>
                        <TableCell>{formatCurrency(sellPrice)}</TableCell>
                        <TableCell
                          className={priceDifference >= 0 ? "text-green-600" : "text-red-600"}
                        >
                          {priceDifference > 0 ? "+" : ""}
                          {formatCurrency(priceDifference)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="font-bold text-right">
                    Total Harga Halaman Ini
                  </TableCell>
                  <TableCell className="font-bold">
                    {stocks.reduce((acc, curr) => acc + (curr.initialStock ?? 0), 0)}
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    +{stocks.reduce((acc, curr) => acc + (curr.totalIn ?? 0), 0)}
                  </TableCell>
                  <TableCell className="font-bold text-red-600">
                    -{stocks.reduce((acc, curr) => acc + (curr.totalOut ?? 0), 0)}
                  </TableCell>
                  <TableCell className="font-bold">
                    {stocks.reduce((acc, curr) => acc + (curr.currentStock ?? 0), 0)}
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(stocks.reduce((acc, curr) => acc + (curr.buyPrice ?? 0), 0))}
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(stocks.reduce((acc, curr) => acc + (curr.sellPrice ?? 0), 0))}
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(
                      stocks.reduce(
                        (acc, curr) => acc + ((curr.sellPrice ?? 0) - (curr.buyPrice ?? 0)),
                        0,
                      ),
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
              totalPages={stocksData?.paging?.totalPage || 1}
              totalItems={stocksData?.paging?.totalItem || 0}
              onPageChange={handlePageChange}
              onPageSizeChange={handleLimitChange}
            />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default StockOpnameTab;

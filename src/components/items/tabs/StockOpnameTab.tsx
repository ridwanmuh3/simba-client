import { useState } from "react";
import {
  useGetItemsStocksSummary,
  useGetStocksFinanceSummary,
} from "@/api/items";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Search, Package } from "lucide-react";
import DataTablePagination from "@/components/shared/DataTablePagination";
import { TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Spinner from "@/components/shared/Spinner";

const StockOpnameTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: stocksData, isLoading } = useGetItemsStocksSummary(
    searchQuery,
    page,
    limit,
  );
  const stocksSummary = useGetStocksFinanceSummary();

  const stocks = stocksData?.data ?? [];
  const stocksBudgetSummary = stocksSummary.data;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <TabsContent value="stok-opname" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Stok Opname - Rekap Inventaris
            </CardTitle>
            <CardDescription className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari bahan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 max-w-sm"
              />
            </CardDescription>
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
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 11 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
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
                              {searchQuery
                                ? "Tidak ada hasil pencarian"
                                : "Data masih kosong"}
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
                    stocks.map((stock) => {
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
                            {(page - 1) * limit + stocks.indexOf(stock) + 1}
                          </TableCell>
                          {/* 1. Kode */}
                          <TableCell className="font-mono text-sm">
                            {stock.itemId}
                          </TableCell>
                          <TableCell className="font-medium">
                            {stock.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{stock.category}</Badge>
                          </TableCell>
                          {/* 5. Stok Awal */}
                          <TableCell>
                            {initialStock} {stock.measureUnit}
                          </TableCell>
                          {/* 6. Total Masuk */}
                          <TableCell className="text-green-600">
                            +{totalIn}
                          </TableCell>
                          {/* 7. Total Keluar */}
                          <TableCell className="text-red-600">
                            {totalOut > 0 ? `-${totalOut}` : "-"}
                          </TableCell>
                          {/* 8. Stok Saat Ini */}
                          <TableCell>
                            <span
                              className={
                                currentStock < 20
                                  ? "text-destructive font-bold"
                                  : "font-medium"
                              }
                            >
                              {currentStock} {stock.measureUnit}
                            </span>
                          </TableCell>
                          {/* 9. Nilai Harga Beli */}
                          <TableCell>
                            {formatCurrency(buyPrice)}
                          </TableCell>
                          {/* 10. Nilai Harga Jual */}
                          <TableCell>
                            {formatCurrency(sellPrice)}
                          </TableCell>
                          {/* 12. Selisih Harga */}
                          <TableCell
                            className={
                              priceDifference >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
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
                      Total Halaman Ini
                    </TableCell>
                    <TableCell className="font-bold">
                      {stocks.reduce(
                        (acc, curr) => acc + (curr.initialStock ?? 0),
                        0,
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      +{stocks.reduce(
                        (acc, curr) => acc + (curr.totalIn ?? 0),
                        0,
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-red-600">
                      -{stocks.reduce(
                        (acc, curr) => acc + (curr.totalOut ?? 0),
                        0,
                      )}
                    </TableCell>
                    <TableCell className="font-bold">
                      {stocks.reduce(
                        (acc, curr) => acc + (curr.currentStock ?? 0),
                        0,
                      )}
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(
                        stocks.reduce(
                          (acc, curr) => acc + (curr.buyPrice ?? 0),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(
                        stocks.reduce(
                          (acc, curr) => acc + (curr.sellPrice ?? 0),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(
                        stocks.reduce(
                          (acc, curr) =>
                            acc +
                            ((curr.sellPrice ?? 0) - (curr.buyPrice ?? 0)),
                          0,
                        ),
                      )}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Card className="sticky lg:col-span-1 h-fit">
          {stocksBudgetSummary && !stocksSummary.isLoading ? (
            <>
              <CardHeader>
                <CardTitle className="text-lg">Ringkasan Anggaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Aset */}
                <div className="flex justify-between items-center gap-0.5">
                  <span className="text-sm font-semibold">
                    Nilai Stok (Aset)
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(
                      stocksBudgetSummary?.data?.masterItemsTotalBudget ?? 0,
                    )}
                  </span>
                </div>

                {/* Modal */}
                <div className="border-t pt-4 flex justify-between items-center gap-0.5">
                  <span className="text-sm font-semibold text-red-600">
                    Modal (Pembelian)
                  </span>
                  <span className="font-semibold text-red-600">
                    -{formatCurrency(stocksBudgetSummary?.data?.budgetIn ?? 0)}
                  </span>
                </div>

                {/* Pendapatan */}
                <div className="flex justify-between items-center gap-0.5">
                  <span className="text-sm font-semibold text-green-600">
                    Pendapatan (Penjualan)
                  </span>
                  <span className="font-semibold text-green-600">
                    +{formatCurrency(stocksBudgetSummary?.data?.budgetOut ?? 0)}
                  </span>
                </div>

                {/* Laba */}
                <div className="border-t pt-4 flex justify-between items-center gap-0.5">
                  <span className="text-sm font-semibold">Laba</span>
                  <span
                    className={`font-bold ${
                      stocksBudgetSummary?.data?.profit < 0
                        ? "text-red-600"
                        : stocksBudgetSummary?.data?.profit > 0
                          ? "text-green-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    {formatCurrency(stocksBudgetSummary?.data?.profit ?? 0)}
                  </span>
                </div>

                {/* Total */}
                <div className="border-t pt-4 flex justify-between items-center gap-0.5">
                  <span className="font-semibold text-sm">
                    Total Nilai Bersih
                  </span>
                  <span className="font-bold text-lg text-primary">
                    {formatCurrency(
                      stocksBudgetSummary?.data?.currentBudget ?? 0,
                    )}
                  </span>
                </div>
              </CardContent>
            </>
          ) : (
            <Spinner />
          )}
        </Card>
      </div>
      <DataTablePagination
        currentPage={page}
        pageSize={limit}
        totalPages={stocksData?.paging?.totalPage || 1}
        totalItems={stocksData?.paging?.totalItem || 0}
        onPageChange={handlePageChange}
        onPageSizeChange={handleLimitChange}
      />
    </TabsContent>
  );
};

export default StockOpnameTab;

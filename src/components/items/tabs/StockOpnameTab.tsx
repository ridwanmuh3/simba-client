import { useState } from "react";
import {
  useGetAllItemsStocks,
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
          <CardContent className="p-0 max-h-[500px] overflow-auto">
            <div className="relative border-y text-nowrap h-full w-full">
              <Table className="relative min-h-full w-full">
                <TableHeader className="sticky top-0 bg-background z-10 border-b">
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Bahan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Stok Awal</TableHead>
                    <TableHead>Total Masuk</TableHead>
                    <TableHead>Total Keluar</TableHead>
                    <TableHead>Stok Saat Ini</TableHead>
                    <TableHead>Nilai Stok</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 9 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton className="h-4 w-full rounded-md" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : stocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="p-0">
                        <div className="flex min-h-[500px] w-full items-center justify-center">
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
                    stocks.map((stock, index) => {
                      return (
                        <TableRow key={stock.itemId}>
                          <TableCell>
                            {(page - 1) * limit + index + 1}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {stock.itemId}
                          </TableCell>
                          <TableCell className="font-medium">
                            {stock.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{stock.category}</Badge>
                          </TableCell>
                          <TableCell>
                            {stock.initialStock} {stock.measureUnit}
                          </TableCell>
                          <TableCell className="text-green-600">
                            +{stock.totalIn}
                          </TableCell>
                          <TableCell className="text-red-600">
                            -{stock.totalOut}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                stock.currentStock < 20
                                  ? "text-destructive font-bold"
                                  : "font-medium"
                              }
                            >
                              {stock.currentStock} {stock.measureUnit}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(stock.stockValue)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
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
                <div className="flex justify-between items-center gap-0.5">
                  <span className="text-sm text-semibold ">Anggaran Kasar</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      stocksBudgetSummary?.data?.masterItemsTotalBudget || 0,
                    )}
                  </span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center gap-0.5">
                  <span className="text-sm font-semibold text-green-600">
                    Total Masuk
                  </span>
                  <span className="font-semibold text-green-600">
                    +{formatCurrency(stocksBudgetSummary?.data?.budgetIn || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-0.5">
                  <span className="text-sm font-semibold  text-red-600">
                    Total Keluar
                  </span>
                  <span className="font-semibold text-red-600">
                    - {formatCurrency(stocksBudgetSummary?.data?.budgetOut || 0)}
                  </span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center gap-0.5">
                  <span className="text-sm font-semibold">Laba</span>
                  <span
                    className={`font-bold ${stocksBudgetSummary?.data?.profit < 0 ? "text-red-600" : stocksBudgetSummary?.data?.profit > 0 ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    {formatCurrency(stocksBudgetSummary?.data?.profit || 0)}
                  </span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center gap-0.5">
                  <span className="font-semibold text-sm">Anggaran Bersih</span>
                  <span className="font-bold text-lg text-primary">
                    {formatCurrency(
                      stocksBudgetSummary?.data?.currentBudget || 0,
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

import { useMemo, useState } from "react";
import { useGetAllItemsStocks } from "@/api/items"; // Pake Master Data
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Save, RotateCcw, Package } from "lucide-react";
import Spinner from "@/components/shared/Spinner";
import DataTablePagination from "@/components/shared/DataTablePagination";
import { TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const StockOpnameTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: stocksData, isLoading } = useGetAllItemsStocks(
    searchQuery,
    page,
    limit,
  );

  const stocks = stocksData?.data ?? [];

  const incomingStocks = stocks.filter((stock) => stock.type === "IN");

  const outcomingStocks = stocks.filter((stock) => stock.type === "OUT");

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const outcomingStocksTotalPrice = outcomingStocks.reduce(
    (sum, s) => sum + s.unitPrice * s.amount,
    0,
  );
  const incomingStocksTotalPrice = incomingStocks.reduce(
    (sum, s) => sum + s.unitPrice * s.amount,
    0,
  );

  const actualTotalPrice = stocks.reduce(
    (sum, s) => sum + s.item?.initialStock * s.item?.unitPrice,
    0,
  );
  const revenueProfit = outcomingStocksTotalPrice - incomingStocksTotalPrice;

  return (
    <TabsContent value="stok-opname" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Stok Opname - Rekap Inventaris
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari bahan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>
          <div className="relative max-h-[500px] overflow-auto border-y text-nowrap w-full">
            <Table className="min-h-full w-full">
              <TableHeader className="sticky top-0 bg-background z-10 border-b">
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Kode</TableHead> <TableHead>Nama Bahan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-center">Stok Awal</TableHead>
                  <TableHead className="text-center">Total Masuk</TableHead>
                  <TableHead className="text-center">Total Keluar</TableHead>
                  <TableHead className="text-center">Stok Saat Ini</TableHead>
                  <TableHead className="text-right">Nilai Stok</TableHead>
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
                      <div className="flex min-h-[400px] w-full items-center justify-center">
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
                  stocks
                    ?.filter(
                      (stock, index, self) =>
                        index ===
                        self?.findIndex((t) => t.item?.id === stock.item?.id),
                    )
                    .map((stock, index) => {
                      const totalIn = incomingStocks
                        .filter((t) => t.item?.id === stock.item?.id)
                        .reduce((sum, t) => sum + t.amount, 0);

                      const totalOut = outcomingStocks
                        .filter((t) => t.item?.id === stock.item?.id)
                        .reduce((sum, t) => sum + t.amount, 0);

                      return (
                        <TableRow key={stock.item?.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {stock.item?.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {stock.item?.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {stock.item?.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {stock.item?.initialStock} {stock.item?.measureUnit}
                          </TableCell>
                          <TableCell className="text-center text-green-600">
                            +{totalIn}
                          </TableCell>
                          <TableCell className="text-center text-red-600">
                            -{totalOut}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={
                                stock.item?.stock < 20
                                  ? "text-destructive font-bold"
                                  : "font-medium"
                              }
                            >
                              {stock.item?.stock} {stock.item?.measureUnit}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(
                              (stock.item?.stock || 0) *
                                (stock.item?.unitPrice || 0),
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="border-t bg-white py-4 space-y-4 mt-6">
            <div className="flex justify-between  items-center">
              <span className="text-sm text-semibold ">
                Total Pendapatan Inventaris
              </span>
              <span className="font-semibold">
                {formatCurrency(actualTotalPrice)}
              </span>
            </div>

            <div className="border-t pt-4 flex justify-between  items-center">
              <span className="text-sm font-semibold text-green-600">
                Total Masuk
              </span>
              <span className="font-semibold text-green-600">
                + {formatCurrency(outcomingStocksTotalPrice)}
              </span>
            </div>
            <div className="flex justify-between  items-center">
              <span className="text-sm font-semibold  text-red-600">
                Total Keluar
              </span>
              <span className="font-semibold text-red-600">
                - {formatCurrency(incomingStocksTotalPrice)}
              </span>
            </div>
            <div className="border-t pt-4 flex justify-between  items-center">
              <span className="text-sm font-semibold">Laba Bersih</span>
              <span
                className={`font-bold ${revenueProfit < 0 ? "text-red-600" : revenueProfit > 0 ? "text-green-600" : "text-muted-foreground"}`}
              >
                {formatCurrency(revenueProfit)}
              </span>
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="font-semibold text-lg">Pendapatan Saat Ini</span>
              <span className="font-bold text-lg text-primary">
                {formatCurrency(actualTotalPrice + revenueProfit)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
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

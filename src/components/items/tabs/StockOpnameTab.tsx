import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Search } from "lucide-react";
import { useState } from "react";
import { useGetAllItemsStocks } from "@/api/items";
import { formatCurrency } from "@/lib/utils";
import { useSearchParams } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const StockOpnameTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const { data: stocksData, isLoading } = useGetAllItemsStocks(
    searchQuery,
    page,
    limit,
  );

  const stocks = stocksData?.data ?? [];

  const incomingStocks = stocks.filter((stock) => stock.type === "IN");

  const outcomingStocks = stocks.filter((stock) => stock.type === "OUT");

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
          <div className="relative max-h-[500px] overflow-auto border-t text-nowrap">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 border-b">
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Bahan</TableHead>
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
                      {Array.from({ length: 8 }).map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-4 w-full rounded-md" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : stocks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
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
                  stocksData?.data
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
                          {" "}
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
          <div className="flex justify-end mt-4 pt-4 border-t">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Total Nilai Inventaris
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(
                  stocks.reduce(
                    (sum, stock) =>
                      sum + stock.newStock * stock.item?.unitPrice,
                    0,
                  ),
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default StockOpnameTab;

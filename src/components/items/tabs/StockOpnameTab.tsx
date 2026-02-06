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
import { Search } from "lucide-react";
import { useState } from "react";
import { useGetAllItemsStocks } from "@/api/items";
import { formatCurrency } from "@/lib/utils";
import { useSearchParams } from "react-router";
import { Badge } from "@/components/ui/badge";

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
  const incomingStocks = stocksData.data?.filter(
    (stock) => stock.type === "IN",
  );
  const outcomingStocks = stocksData.data?.filter(
    (stock) => stock.type === "OUT",
  );

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
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Bahan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-center">Stok Saat Ini</TableHead>
                  <TableHead className="text-center">Total Masuk</TableHead>
                  <TableHead className="text-center">Total Keluar</TableHead>
                  <TableHead className="text-right">Nilai Stok</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocksData?.data
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
                          <span
                            className={
                              stock.item?.stock < 20
                                ? "text-destructive font-bold"
                                : "font-medium"
                            }
                          >
                            {/* Gunakan stock dari Master Item, bukan history transaksi */}
                            {stock.item?.stock} {stock.item?.measureUnit}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-green-600">
                          +{totalIn}
                        </TableCell>
                        <TableCell className="text-center text-red-600">
                          -{totalOut}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(
                            (stock.item?.stock || 0) *
                              (stock.item?.unitPrice || 0),
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                  stocksData?.data?.reduce(
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

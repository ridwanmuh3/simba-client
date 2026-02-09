import { useState } from "react";
import { useSearchParams } from "react-router";
import { useGetAllItems } from "@/api/items"; // Pake Master Data
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Search, Save, RotateCcw } from "lucide-react";
import Spinner from "@/components/shared/Spinner";
import DataTablePagination from "@/components/shared/DataTablePagination";

const StockOpnameTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const [physicalStocks, setPhysicalStocks] = useState<Record<string, number>>(
    {},
  );

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const { data: itemsData, isLoading } = useGetAllItems(
    searchQuery,
    page,
    limit,
  );

  const handlePhysicalStockChange = (itemId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setPhysicalStocks((prev) => ({
      ...prev,
      [itemId]: numValue,
    }));
  };

  const handleSaveOpname = () => {
    const adjustments = itemsData?.data
      ?.map((item) => {
        const fisik = physicalStocks[item.id] ?? item.stock;
        const selisih = fisik - item.stock;

        if (selisih !== 0) {
          return {
            itemId: item.id,
            systemStock: item.stock,
            physicalStock: fisik,
            difference: selisih,
            type: selisih > 0 ? "IN" : "OUT", // Logika Adjustment
          };
        }
        return null;
      })
      .filter(Boolean);

    console.log("Data Adjustment yg dikirim ke API:", adjustments);
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set("page", String(newPage));
      return prev;
    });
  };

  const handleLimitChange = (newLimit: number) => {
    setSearchParams((prev) => {
      prev.set("limit", String(newLimit));
      prev.set("page", "1");
      return prev;
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Stok Opname (Penyesuaian Stok)</CardTitle>
        <Button onClick={handleSaveOpname} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" /> Simpan Penyesuaian
        </Button>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead>Barang</TableHead>
                <TableHead className="text-center">Stok Sistem</TableHead>
                <TableHead className="text-center w-[150px]">
                  Stok Fisik (Input)
                </TableHead>
                <TableHead className="text-center">Selisih</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Spinner />
                  </TableCell>
                </TableRow>
              ) : itemsData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : (
                itemsData?.data?.map((item, index) => {
                  const systemStock = item.stock;
                  // Jika user belum input, defaultnya kosong atau sama dengan sistem (tergantung preferensi UX)
                  const physicalStock =
                    physicalStocks[item.id] !== undefined
                      ? physicalStocks[item.id]
                      : "";

                  const diff =
                    physicalStock !== ""
                      ? Number(physicalStock) - systemStock
                      : 0;

                  return (
                    <TableRow key={item.id}>
                      <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{item.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.id}
                          </span>
                        </div>
                      </TableCell>

                      {/* Kolom Stok Sistem */}
                      <TableCell className="text-center bg-muted/20">
                        <span className="font-mono font-medium">
                          {systemStock}
                        </span>
                        <span className="text-xs ml-1 text-muted-foreground">
                          {item.measureUnit}
                        </span>
                      </TableCell>

                      {/* Kolom Input Stok Fisik */}
                      <TableCell>
                        <Input
                          type="number"
                          className={`text-center ${diff !== 0 ? "border-primary ring-1 ring-primary/20" : ""}`}
                          placeholder={String(systemStock)}
                          value={physicalStock}
                          onChange={(e) =>
                            handlePhysicalStockChange(item.id, e.target.value)
                          }
                        />
                      </TableCell>

                      {/* Kolom Selisih */}
                      <TableCell className="text-center">
                        {physicalStock !== "" && diff !== 0 ? (
                          <span
                            className={
                              diff > 0
                                ? "text-green-600 font-bold"
                                : "text-red-600 font-bold"
                            }
                          >
                            {diff > 0 ? "+" : ""}
                            {diff}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Status Kesesuaian */}
                      <TableCell className="text-right">
                        {physicalStock === "" ? (
                          <Badge variant="outline">Belum Cek</Badge>
                        ) : diff === 0 ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 hover:bg-green-100"
                          >
                            Sesuai
                          </Badge>
                        ) : diff < 0 ? (
                          <Badge variant="destructive">Hilang</Badge>
                        ) : (
                          <Badge className="bg-blue-500 hover:bg-blue-600">
                            Lebih
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4">
          <DataTablePagination
            currentPage={page}
            pageSize={limit}
            totalPages={itemsData?.paging?.totalPage || 1}
            totalItems={itemsData?.paging?.totalItem || 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handleLimitChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StockOpnameTab;

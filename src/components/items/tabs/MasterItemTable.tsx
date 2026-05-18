import {
  Download,
  FileDown,
  FileText,
  Package,
  Search,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangeEvent, useRef, useState } from "react";
import { useGetAllItems, useImportItems } from "@/features/items/api";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Spinner from "@/components/shared/Spinner";
import { Item } from "@/features/items/types";
import { toast } from "@/hooks/use-toast";
import DataTablePagination from "@/components/shared/DataTablePagination";
import { axiosInstance } from "@/core/http/axios";
import { ApiResponse } from "@/types/response";
import { downloadCSV, exportToCSV } from "@/lib/csv-utils";
import { formatDateDetail } from "@/lib/date-utils";

interface MasterItemTableProps {
  selectedItemId: string | null | undefined;
  onSelectItem: (item: Item) => void;
}

const MasterItemTable = ({ selectedItemId, onSelectItem }: MasterItemTableProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const importItem = useImportItems();

  const {
    data: itemsData,
    isLoading: isItemsLoading,
    isFetching,
  } = useGetAllItems(searchQuery, page, limit);

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleExportCsv = async () => {
    const exportedItems = await axiosInstance.get<ApiResponse<Item[]>>("/items/export");
    if (exportedItems && exportedItems.data) {
      exportToCSV(exportedItems.data?.data || []);
    }
  };

  const handleImportCsv = async (file: File) => {
    const formData = new FormData();
    formData.append("import_file", file);
    try {
      await importItem.mutateAsync(formData);
      toast({
        title: "Berhasil dokumen data bahan",
        description: "Anda berhasil menambahkan data bahan dari dokumen yang diunggah",
      });
    } catch {
      toast({
        title: "Gagal mengunggah dokumen data bahan",
        description: "File CSV tidak dapat diproses. Pastikan format sesuai template dan kolom wajib (nama, kategori, stok, satuan, harga) terisi.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      await handleImportCsv(file);
    }
    e.target.value = "";
  };

  const handleDownloadCsv = () => {
    const headers = [
      "Tanggal Input",
      "Nama Bahan",
      "Kategori",
      "Stok",
      "Satuan Perhitungan",
      "Satuan Harga",
    ];
    const rows = [
      ["30 Apr 2026 10:00", "Beras Bulog", "Karbohidrat", "100", "kg", "30000"],
    ];
    downloadCSV("template-bahan-mbg.csv", headers, rows);
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-4">
        <div className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            Daftar Bahan
            {isFetching && !isItemsLoading && <Spinner color="text-muted-foreground" />}
          </CardTitle>
          <div className="flex gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-0.5" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportCsv}>
                  <FileText className="w-4 h-4 mr-0.5" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadCsv}>
                  <FileDown className="w-4 h-4 mr-0.5" />
                  Download Template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-0.5" />
              Import
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari bahan..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative overflow-x-auto border-t text-nowrap">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10 border-b">
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead>Tanggal Input</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Bahan</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Stok Awal</TableHead>
                <TableHead>Stok Saat Ini</TableHead>
                <TableHead>Harga Satuan</TableHead>
                <TableHead>Total Harga</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isItemsLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 8 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-4 w-full rounded-md" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : itemsData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-0">
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
                itemsData?.data?.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedItemId === item.id ? "bg-muted" : ""
                    }`}
                    onClick={() => onSelectItem(item)}
                  >
                    <TableCell className="font-medium text-muted-foreground">
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell>
                      {item.createdAt ? formatDateDetail(new Date(item.createdAt)) : "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.initialStock ?? 0} {item.measureUnit}
                    </TableCell>
                    <TableCell>
                      <span className={item.stock < 20 ? "text-destructive font-semibold" : ""}>
                        {item.stock || 0} {item.measureUnit}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.stock * item.unitPrice || 0)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="font-bold text-right">
                  Total Harga Halaman Ini
                </TableCell>
                <TableCell className="font-bold">
                  {itemsData?.data?.reduce((acc, curr) => acc + (curr.initialStock ?? 0), 0) || 0}
                </TableCell>
                <TableCell className="font-bold">
                  {itemsData?.data?.reduce((acc, curr) => acc + curr.stock, 0) || 0}
                </TableCell>
                <TableCell className="font-bold">-</TableCell>
                <TableCell className="font-bold">
                  {formatCurrency(
                    itemsData?.data?.reduce((acc, curr) => acc + curr.stock * curr.unitPrice, 0) || 0,
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

export default MasterItemTable;

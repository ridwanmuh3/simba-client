import {
  Download,
  FileDown,
  FileText,
  Package,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TabsContent } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { downloadCSVTemplate } from "../../lib/csv-utils";
import {
  AddMasterItemFormInputs,
  addMasterItemSchema,
} from "@/schemas/item/add-master-item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useRef, useState } from "react";
import { useGetAllItems } from "@/api/items";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

const MasterItemTab = () => {
  const form = useForm<AddMasterItemFormInputs>({
    resolver: zodResolver(addMasterItemSchema),
    defaultValues: {
      name: "",
      category: "",
      stock: 0,
      measureUnit: "",
      pricePerUnit: 0.0,
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: itemsData, isLoading: isItemsLoading } = useGetAllItems();

  const handleAddMasterItem = (values: AddMasterItemFormInputs) => {
    //     if (!formItemName || !formUnit || !formCategory) {
    //       toast.error("Lengkapi semua field yang diperlukan");
    //       return;
    //     }
    //     if (selectedId) {
    //       setItems(
    //         items.map((item) =>
    //           item.id === selectedId
    //             ? {
    //                 ...item,
    //                 name: formItemName,
    //                 unit: formUnit,
    //                 pricePerUnit: Number(formPrice) || 0,
    //                 category: formCategory,
    //                 stock: Number(formCurrentStock) || 0,
    //               }
    //             : item,
    //         ),
    //       );
    //       toast.success("Data bahan berhasil diperbarui");
    //     } else {
    //       const newItem: ItemData = {
    //         id: items.length + 1,
    //         code: `BHN-${String(items.length + 1).padStart(3, "0")}`,
    //         name: formItemName,
    //         category: formCategory,
    //         stock: Number(formCurrentStock) || 0,
    //         unit: formUnit,
    //         pricePerUnit: Number(formPrice) || 0,
    //         status: "active",
    //       };
    //       setItems([...items, newItem]);
    //       toast.success("Bahan baru berhasil ditambahkan");
    //     }
    //     form.reset();
  };

  const handleDeleteMasterItem = () => {};

  const handleExportCsv = () => {};

  const handleFileSelect = () => {};

  return (
    <TabsContent value="data-bahan" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Data Bahan</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleAddMasterItem)}
            >
              <div className="space-y-2">
                <Label>Kode Bahan</Label>
                <Input
                  // value={formItemCode}
                  disabled
                  placeholder="Auto-generate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nama Bahan</Label>
                <Input
                  {...form.register("name")}
                  placeholder="Masukkan nama bahan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Controller
                  name="category"
                  control={form.control}
                  rules={{ required: "Kategori harus dipilih" }}
                  render={({ field }) => (
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Karbohidrat">Karbohidrat</SelectItem>
                        <SelectItem value="Protein">Protein</SelectItem>
                        <SelectItem value="Sayuran">Sayuran</SelectItem>
                        <SelectItem value="Pendukung">Pendukung</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="measureUnit">Satuan</Label>
                <Controller
                  name="measureUnit"
                  control={form.control}
                  rules={{ required: "Barang harus memiliki unit perhitungan" }}
                  render={({ field }) => (
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih satuan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="ikat">Ikat</SelectItem>
                        <SelectItem value="buah">Buah</SelectItem>
                        <SelectItem value="bungkus">Bungkus</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerUnit">Harga Satuan (Rp)</Label>
                <Input
                  {...form.register("pricePerUnit")}
                  type="number"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stok Awal</Label>
                <Input
                  {...form.register("stock")}
                  type="number"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  className="w-full"
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteMasterItem}
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </Button>
                <Button className="w-full" size="sm">
                  <Save className="w-4 h-4" />
                  Simpan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <CardTitle className="text-lg">Daftar Bahan</CardTitle>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleExportCsv}>
                      <FileText className="w-4 h-4 mr-2" />
                      Export CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={downloadCSVTemplate}>
                      <FileDown className="w-4 h-4 mr-2" />
                      Download Template
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-1" />
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
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari bahan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Bahan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-center">Stok</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isItemsLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 6 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton className="h-4 w-full rounded-md" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : itemsData?.data.length === 0 ? (
                    <TableRow className="h-full">
                      <TableCell colSpan={6} className="h-full text-center">
                        <div className="flex w-full h-full flex-col items-center justify-center text-muted-foreground">
                          <Package className="h-8 w-8 mb-2 opacity-50" />
                          <p>Data tidak ditemukan.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    itemsData?.data.map((item, index) => (
                      <TableRow
                        key={item.id}
                        // className={`cursor-pointer ${selectedId === item.id ? "bg-primary/10" : ""}`}
                        // onClick={() => handleSelectItem(item)}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={
                              item.stock < 20
                                ? "text-destructive font-medium"
                                : ""
                            }
                          >
                            {item.stock} {item.measureUnit}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.pricePerUnit)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default MasterItemTab;

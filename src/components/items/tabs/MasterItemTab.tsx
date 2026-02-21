import {
  Download,
  FileDown,
  FileText,
  Package,
  Save,
  Search,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { downloadCSV, exportToCSV } from "@/lib/csv-utils";
import {
  MasterItemFormInputs,
  masterItemSchema,
} from "@/schemas/item/master-item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangeEvent, MouseEvent, useRef, useState } from "react";
import {
  useAddItem,
  useDeleteItem,
  useEditItem,
  useGetAllItems,
  useImportItems,
} from "@/api/items";
import { formatCurrency, parseCurrency, safeIncludes } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AxiosError } from "axios";
import Spinner from "@/components/shared/Spinner";
import { Item } from "@/types/item";
import { toast } from "@/hooks/use-toast";
import DeleteDialog from "../DeleteDialog";
import { useSearchParams } from "react-router";
import DataTablePagination from "@/components/shared/DataTablePagination";
import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/response";
import RequiredInputIdentifier from "@/components/shared/RequiredInputIdentifier";

const MasterItemTab = () => {
  const form = useForm<MasterItemFormInputs>({
    resolver: zodResolver(masterItemSchema),
    defaultValues: {
      name: "",
      category: "",
      stock: 1,
      measureUnit: "",
      pricePerUnit: 0,
      customCategory: "",
      customMeasureUnit: "",
    },
  });
  const [isEditForm, setIsEditForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const addItem = useAddItem();
  const editItem = useEditItem();
  const importItem = useImportItems();
  const deleteItem = useDeleteItem();

  const { data: itemsData, isLoading: isItemsLoading } = useGetAllItems(
    searchQuery,
    page,
    limit,
  );

  const handleAddMasterItem = async (values: MasterItemFormInputs) => {
    setErrMsg("");

    if (values.category === "Lainnya") {
      values.category = values.customCategory;
    }

    if (values.measureUnit === "lainnya") {
      values.measureUnit = values.customMeasureUnit;
    }

    try {
      const response = await addItem.mutateAsync({
        name: values.name,
        category: values.category,
        stock: values.stock,
        measureUnit: values.measureUnit,
        unitPrice: values.pricePerUnit,
      });
      if (response.status === 201) {
        toast({
          title: "Berhasil menambah data bahan baru",
          description: `Anda berhasil menambah bahan baru "${response.data.name}"`,
        });
      }
    } catch (e: unknown) {
      const err = e as AxiosError;
      switch (err.status) {
        case 400:
          setErrMsg("Terjadi kesalahan input data bahan");
          break;
        case 409:
          setErrMsg("Data bahan sudah ditambahkan");
          break;
        default:
          setErrMsg("Terjadi kesalahan server");
      }
    } finally {
      form.reset();
    }
  };

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setIsEditForm(true);
    form.setValue("name", item.name);
    form.setValue("category", item.category);
    form.setValue("stock", item.stock);
    form.setValue("measureUnit", item.measureUnit);
    form.setValue("pricePerUnit", item.unitPrice);
  };

  const handleEditMasterItem = async (values: MasterItemFormInputs) => {
    setErrMsg("");

    if (values.category === "Lainnya") {
      values.category = values.customCategory;
    }

    if (values.measureUnit === "lainnya") {
      values.measureUnit = values.customMeasureUnit;
    }

    try {
      const response = await editItem.mutateAsync({
        id: selectedItem.id,
        name: values.name,
        category: values.category,
        measureUnit: values.measureUnit,
        unitPrice: values.pricePerUnit,
      });
      if (response.status === 200) {
        toast({
          title: "Berhasil mengubah data bahan",
          description: `Anda berhasil mengubah data bahan "${response.data.name}"`,
        });
      }
    } catch (e: unknown) {
      const err = e as AxiosError;
      switch (err.status) {
        case 400:
          setErrMsg("Terjadi kesalahan input data bahan");
          break;
        default:
          setErrMsg("Terjadi kesalahan server");
          break;
      }
    }
  };

  const handleDeleteMasterItem = async () => {
    setErrMsg("");
    try {
      const response = await deleteItem.mutateAsync({
        id: selectedItem.id,
      });
      if (response.status === 200) {
        setSelectedItem(null);
        toast({
          title: "Berhasil menghapus data bahan",
          description: `Anda berhasil menghapus data bahan`,
        });
      }
    } catch (e: unknown) {
      const err = e as AxiosError;
      switch (err.status) {
        case 404:
          setErrMsg("Data tidak ditemukan");
          break;
        default:
          setErrMsg("Terjadi kesalahan server");
      }
    } finally {
      form.reset();
    }
  };

  const handleCancelEditItem = (e: MouseEvent) => {
    e.preventDefault();
    setSelectedItem(null);
    setIsEditForm(false);
    setErrMsg("");
    form.reset();
  };

  const handleExportCsv = async () => {
    const exportedItems =
      await axiosInstance.get<ApiResponse<Item[]>>("/items/export");
    if (exportedItems && exportedItems.data) {
      exportToCSV(exportedItems.data?.data || []);
    }
  };

  const handleImportCsv = async (file: any) => {
    const formData = new FormData();
    formData.append("import_file", file);

    try {
      await importItem.mutateAsync(formData);
      toast({
        title: "Berhasil dokumen data bahan",
        description:
          "Anda berhasil menambahkan data bahan dari dokumen yang diunggah",
      });
    } catch (error) {
      toast({
        title: "Gagal menggunggah dokumen data bahan",
        description: "Terjadi kesalahan server",
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleFormType = (isEditMode: boolean) => {
    const formHandler = isEditMode ? handleEditMasterItem : handleAddMasterItem;
    return form.handleSubmit(formHandler);
  };

  const handleDownloadCsv = () => {
    const headers = [
      "Nama Bahan",
      "Kategori",
      "Stok",
      "Satuan Perhitungan",
      "Satuan Harga",
    ];
    const rows = [["Beras Bulog", "Karbohidrat", "100", "kg", "30000"]];
    downloadCSV("template-bahan-mbg.csv", headers, rows);
  };

  return (
    <TabsContent value="data-bahan" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* FORM */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {selectedItem ? "Edit Bahan" : "Tambah Bahan"}
            </CardTitle>
            <CardDescription className="text-sm font-bold text-muted-foreground">
              Input dengan tanda (*) wajib diisi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleFormType(isEditForm)}>
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Bahan <RequiredInputIdentifier />
                </Label>
                <Input
                  {...form.register("name")}
                  placeholder="Masukkan nama bahan"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">
                  Kategori
                  <RequiredInputIdentifier />
                </Label>
                <Controller
                  name="category"
                  control={form.control}
                  rules={{ required: "Kategori harus dipilih" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Karbohidrat">Karbohidrat</SelectItem>
                        <SelectItem value="Protein Hewani">
                          Protein Hewani
                        </SelectItem>
                        <SelectItem value="Protein Nabati">
                          Protein Nabati
                        </SelectItem>
                        <SelectItem value="Sayuran">Sayuran</SelectItem>
                        <SelectItem value="Buah Buahan">Buah-Buahan</SelectItem>
                        <SelectItem value="Pendukung">Pendukung</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.category && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.category.message}
                  </p>
                )}
                {form.watch("category") === "Lainnya" && (
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori Lainnya</Label>
                    <Input
                      name="customCategory"
                      {...form.register("customCategory")}
                    />
                    {form.formState.errors.customCategory && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.customCategory.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="measureUnit">
                  Satuan
                  <RequiredInputIdentifier />
                </Label>
                <Controller
                  name="measureUnit"
                  control={form.control}
                  rules={{ required: "Satuan harus dipilih" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih satuan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="liter">Liter (lt)</SelectItem>
                        <SelectItem value="ikat">Ikat</SelectItem>
                        <SelectItem value="buah">Buah</SelectItem>
                        <SelectItem value="botol">Botol</SelectItem>
                        <SelectItem value="dus">Dus</SelectItem>
                        <SelectItem value="bungkus">Bungkus</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.measureUnit && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.measureUnit.message}
                  </p>
                )}
                {form.watch("measureUnit") === "lainnya" && (
                  <div className="space-y-2">
                    <Label htmlFor="customMeasureUnit">Satuan Lainnya</Label>
                    <Input
                      name="customMeasureUnit"
                      {...form.register("customMeasureUnit")}
                    />
                    {form.formState.errors.customMeasureUnit && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.customMeasureUnit.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerUnit">
                  Harga Satuan
                  <RequiredInputIdentifier />
                </Label>
                <Controller
                  name="pricePerUnit"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      inputMode="numeric"
                      value={formatCurrency(field.value)}
                      onChange={(e) => {
                        const raw = parseCurrency(e.target.value);
                        field.onChange(raw);
                      }}
                    />
                  )}
                />
                {form.formState.errors.pricePerUnit && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.pricePerUnit.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stok Awal</Label>
                <Input
                  {...form.register("stock")}
                  type="number"
                  placeholder="0"
                  min="0"
                  disabled={isEditForm}
                />
                {form.formState.errors.stock && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.stock.message}
                  </p>
                )}
              </div>
              <div className="flex gap-4 pt-2 flex-wrap-reverse">
                {selectedItem ? (
                  <>
                    <Button
                      type="button"
                      className="w-full"
                      variant="outline"
                      onClick={handleCancelEditItem}
                    >
                      Batal
                    </Button>
                    <DeleteDialog
                      handleDelete={handleDeleteMasterItem}
                      isPending={deleteItem.isPending}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={editItem.isPending}
                    >
                      {editItem.isPending ? (
                        <Spinner color="text-background" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-0.5" />
                          Simpan
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={addItem.isPending}
                  >
                    {addItem.isPending ? (
                      <Spinner color="text-background" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-0.5" />
                        Simpan
                      </>
                    )}
                  </Button>
                )}
              </div>
              {errMsg && (
                <p className="text-sm text-destructive text-center">{errMsg}</p>
              )}
            </form>
          </CardContent>
        </Card>
        {/* TABLE */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <CardTitle className="text-lg">Daftar Bahan</CardTitle>
              <div className="flex gap-2">
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative max-h-[500px] overflow-auto border-t text-nowrap">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 border-b">
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Bahan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Harga Satuan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isItemsLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 5 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton className="h-4 w-full rounded-md" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : itemsData.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="p-0">
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
                    itemsData.data?.map((item) => (
                      <TableRow
                        key={item.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedItem?.id === item.id ? "bg-muted" : ""
                        }`}
                        onClick={() => handleSelectItem(item)}
                      >
                        <TableCell className="font-mono text-sm">
                          {item.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              item.stock < 20
                                ? "text-destructive font-semibold"
                                : ""
                            }
                          >
                            {item.stock} {item.measureUnit}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.unitPrice)}
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
      <DataTablePagination
        currentPage={page}
        pageSize={limit}
        totalPages={itemsData?.paging?.totalPage || 1}
        totalItems={itemsData?.paging?.totalItem || 0}
        onPageChange={handlePageChange}
        onPageSizeChange={handleLimitChange}
      />
    </TabsContent>
  );
};

export default MasterItemTab;

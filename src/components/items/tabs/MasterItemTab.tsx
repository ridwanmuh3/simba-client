import {
  Calendar,
  Download,
  FileDown,
  FileText,
  Package,
  Save,
  Search,
  Upload,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { formatDateDetail, formatDateTable } from "@/lib/date-utils";
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
  TableFooter,
} from "@/components/ui/table";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { downloadCSV, exportToCSV } from "@/lib/csv-utils";
import {
  MasterItemFormInputs,
  masterItemSchema,
} from "@/features/items/schemas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import {
  useAddItem,
  useDeleteItem,
  useEditItem,
  useGetAllItems,
  useImportItems,
} from "@/features/items/api";
import { formatCurrency, parseCurrency, safeIncludes } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AxiosError } from "axios";
import Spinner from "@/components/shared/Spinner";
import { Item } from "@/features/items/types";
import { toast } from "@/hooks/use-toast";
import DeleteDialog from "../DeleteDialog";
import DataTablePagination from "@/components/shared/DataTablePagination";
import { axiosInstance } from "@/core/http/axios";
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
      dateAdded: new Date(),
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isDateAddedOpen, setIsDateAddedOpen] = useState(false);

  const [savedCategories, setSavedCategories] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("simba_custom_categories") ?? "[]",
      );
    } catch {
      return [];
    }
  });

  const [savedUnits, setSavedUnits] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("simba_custom_units") ?? "[]");
    } catch {
      return [];
    }
  });

  const saveCustomCategory = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSavedCategories((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      localStorage.setItem("simba_custom_categories", JSON.stringify(next));
      return next;
    });
  };

  const saveCustomUnit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSavedUnits((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      localStorage.setItem("simba_custom_units", JSON.stringify(next));
      return next;
    });
  };

  const addItem = useAddItem();
  const editItem = useEditItem();
  const importItem = useImportItems();
  const deleteItem = useDeleteItem();

  const {
    data: itemsData,
    isLoading: isItemsLoading,
    isFetching,
  } = useGetAllItems(searchQuery, page, limit);

  const handleAddMasterItem = async (values: MasterItemFormInputs) => {
    setErrMsg("");

    if (values.category === "Lainnya") {
      saveCustomCategory(values.customCategory);
      values.category = values.customCategory;
    }

    if (values.measureUnit === "lainnya") {
      saveCustomUnit(values.customMeasureUnit);
      values.measureUnit = values.customMeasureUnit;
    }
    try {
      const response = await addItem.mutateAsync({
        name: values.name,
        category: values.category,
        stock: values.stock,
        measureUnit: values.measureUnit,
        unitPrice: values.pricePerUnit,
        dateAdded: values.dateAdded,
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
          setErrMsg(
            "Data bahan tidak valid. Pastikan nama, kategori, satuan, dan harga terisi dengan benar.",
          );
          break;
        case 409:
          setErrMsg(
            "Bahan dengan nama tersebut sudah ada. Gunakan nama lain atau edit bahan yang ada.",
          );
          break;
        default:
          setErrMsg(
            "Gagal menambah bahan. Periksa koneksi Anda atau coba lagi.",
          );
      }
    } finally {
      form.reset();
    }
  };

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    form.setValue("name", item.name);

    if (!foodOptions.some((option) => option.value === item.category)) {
      form.setValue("category", "Lainnya");
      form.setValue("customCategory", item.category);
    } else {
      form.setValue("category", item.category);
    }

    if (
      !measureUnitOptions.some((option) => option.value === item.measureUnit)
    ) {
      form.setValue("measureUnit", "lainnya");
      form.setValue("customMeasureUnit", item.measureUnit);
    } else {
      form.setValue("measureUnit", item.measureUnit);
    }

    form.setValue("stock", item.initialStock ?? item.stock);
    form.setValue("initialStock", item.initialStock);
    form.setValue("pricePerUnit", item.unitPrice);
    form.setValue(
      "dateAdded",
      item.createdAt ? new Date(item.createdAt) : new Date(),
    );
  };

  const handleEditMasterItem = async (values: MasterItemFormInputs) => {
    setErrMsg("");

    if (values.category === "Lainnya") {
      saveCustomCategory(values.customCategory);
      values.category = values.customCategory;
    }

    if (values.measureUnit === "lainnya") {
      saveCustomUnit(values.customMeasureUnit);
      values.measureUnit = values.customMeasureUnit;
    }

    try {
      const response = await editItem.mutateAsync({
        id: selectedItem.id,
        name: values.name,
        category: values.category,
        measureUnit: values.measureUnit,
        initialStock: values.stock,
        unitPrice: values.pricePerUnit,
        dateAdded: values.dateAdded,
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
          setErrMsg(
            "Perubahan tidak valid. Periksa kembali nama, kategori, satuan, dan harga bahan.",
          );
          break;
        case 404:
          setErrMsg(
            "Bahan tidak ditemukan. Kemungkinan sudah dihapus oleh pengguna lain.",
          );
          break;
        default:
          setErrMsg(
            "Gagal menyimpan perubahan bahan. Periksa koneksi Anda atau coba lagi.",
          );
          break;
      }
    } finally {
      form.reset();
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
          setErrMsg(
            "Bahan tidak ditemukan. Kemungkinan sudah dihapus sebelumnya.",
          );
          break;
        case 409:
          setErrMsg(
            "Bahan tidak dapat dihapus karena masih memiliki riwayat stok. Hapus riwayat stoknya terlebih dahulu.",
          );
          break;
        default:
          setErrMsg(
            "Gagal menghapus bahan. Periksa koneksi Anda atau coba lagi.",
          );
      }
    } finally {
      form.reset();
    }
  };

  const handleCancelEditItem = (e: MouseEvent) => {
    e.preventDefault();
    setSelectedItem(null);
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

  const handleImportCsv = async (file: File) => {
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
        title: "Gagal mengunggah dokumen data bahan",
        description:
          "File CSV tidak dapat diproses. Pastikan format sesuai template dan kolom wajib (nama, kategori, stok, satuan, harga) terisi.",
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

  const handleFormType = () => {
    const formHandler = selectedItem ? handleEditMasterItem : handleAddMasterItem;
    return form.handleSubmit(formHandler);
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

  const defaultCategories = [
    "Karbohidrat",
    "Protein Hewani",
    "Protein Nabati",
    "Sayuran",
    "Buah Buahan",
    "Pendukung",
    "Lainnya",
  ];
  const defaultUnits = [
    "kg",
    "liter",
    "ikat",
    "buah",
    "botol",
    "dus",
    "bungkus",
    "lainnya",
  ];

  const foodOptions = [
    { value: "Karbohidrat", label: "Karbohidrat" },
    { value: "Protein Hewani", label: "Protein Hewani" },
    { value: "Protein Nabati", label: "Protein Nabati" },
    { value: "Sayuran", label: "Sayuran" },
    { value: "Buah Buahan", label: "Buah-Buahan" },
    { value: "Pendukung", label: "Pendukung" },
    ...savedCategories
      .filter((c) => !defaultCategories.includes(c))
      .map((c) => ({ value: c, label: c })),
    { value: "Lainnya", label: "Lainnya" },
  ];

  const measureUnitOptions = [
    { value: "kg", label: "Kilogram (kg)" },
    { value: "liter", label: "Liter (lt)" },
    { value: "ikat", label: "Ikat" },
    { value: "buah", label: "Buah" },
    { value: "botol", label: "Botol" },
    { value: "dus", label: "Dus" },
    { value: "bungkus", label: "Bungkus" },
    ...savedUnits
      .filter((u) => !defaultUnits.includes(u))
      .map((u) => ({ value: u, label: u })),
    { value: "lainnya", label: "Lainnya" },
  ];

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
            <form className="space-y-4" onSubmit={handleFormType()}>
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
                        {foodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
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
                        {measureUnitOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
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
              <div
                className={
                  selectedItem ? "grid grid-cols-2 gap-4" : "space-y-2"
                }
              >
                <div className="space-y-2">
                  <Label htmlFor="stock">Stok Awal</Label>
                  <Input
                    {...form.register("stock")}
                    type="number"
                    placeholder="0"
                    min="0"
                    step="any"
                  />
                  {form.formState.errors.stock && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.stock.message}
                    </p>
                  )}
                </div>
                {selectedItem && (
                  <div className="space-y-2">
                    <Label>Stok Saat Ini</Label>
                    <Input
                      value={`${selectedItem.stock} ${
                        form.watch("measureUnit") === "lainnya"
                          ? form.watch("customMeasureUnit") || ""
                          : form.watch("measureUnit") || ""
                      }`.trim()}
                      disabled
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateAdded">
                  Tanggal Penambahan Bahan
                  <RequiredInputIdentifier />
                </Label>
                <Controller
                  name="dateAdded"
                  control={form.control}
                  render={({ field }) => (
                    <Popover
                      open={isDateAddedOpen}
                      onOpenChange={setIsDateAddedOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start font-normal"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          {field.value
                            ? formatDateTable(field.value)
                            : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 px-4 py-2"
                        align="start"
                      >
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={(d) => {
                            if (d) field.onChange(d);
                            setIsDateAddedOpen(false);
                          }}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {form.formState.errors.dateAdded && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.dateAdded.message}
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
              <CardTitle className="text-lg flex items-center gap-2">
                Daftar Bahan
                {isFetching && !isItemsLoading && (
                  <Spinner color="text-muted-foreground" />
                )}
              </CardTitle>
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
                    itemsData.data?.map((item, index) => (
                      <TableRow
                        key={item.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedItem?.id === item.id ? "bg-muted" : ""
                        }`}
                        onClick={() => handleSelectItem(item)}
                      >
                        <TableCell className="font-medium text-muted-foreground">
                          {(page - 1) * limit + index + 1}
                        </TableCell>
                        <TableCell>
                          {item.createdAt
                            ? formatDateDetail(new Date(item.createdAt))
                            : "-"}
                        </TableCell>
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
                          {item.initialStock ?? 0} {item.measureUnit}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              item.stock < 20
                                ? "text-destructive font-semibold"
                                : ""
                            }
                          >
                            {item.stock || 0} {item.measureUnit}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
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
                      {itemsData?.data?.reduce(
                        (acc, curr) => acc + (curr.initialStock ?? 0),
                        0,
                      ) || 0}
                    </TableCell>
                    <TableCell className="font-bold">
                      {itemsData?.data?.reduce(
                        (acc, curr) => acc + curr.stock,
                        0,
                      ) || 0}
                    </TableCell>
                    <TableCell className="font-bold">-</TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(
                        itemsData?.data?.reduce(
                          (acc, curr) => acc + curr.stock * curr.unitPrice,
                          0,
                        ) || 0,
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
      </div>
    </TabsContent>
  );
};

export default MasterItemTab;

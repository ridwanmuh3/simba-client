import { Calendar, Save } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { formatDateTable } from "@/lib/date-utils";
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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MasterItemFormInputs,
  masterItemSchema,
} from "@/features/items/schemas";
import { MouseEvent, useEffect, useState } from "react";
import { useAddItem, useDeleteItem, useEditItem } from "@/features/items/api";
import { formatCurrency, parseCurrency } from "@/lib/utils";
import { AxiosError } from "axios";
import Spinner from "@/components/shared/Spinner";
import { Item } from "@/features/items/types";
import { toast } from "@/hooks/use-toast";
import DeleteDialog from "../DeleteDialog";
import RequiredInputIdentifier from "@/components/shared/RequiredInputIdentifier";

const defaultCategories = [
  "Karbohidrat",
  "Protein Hewani",
  "Protein Nabati",
  "Sayuran",
  "Buah Buahan",
  "Pendukung",
  "Lainnya",
];

const defaultUnits = ["kg", "liter", "ikat", "buah", "botol", "dus", "bungkus", "lainnya"];

interface MasterItemFormProps {
  selectedItem: Item | null;
  onChangeSelection: (item: Item | null) => void;
}

const MasterItemForm = ({ selectedItem, onChangeSelection }: MasterItemFormProps) => {
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

  const [errMsg, setErrMsg] = useState("");
  const [isDateAddedOpen, setIsDateAddedOpen] = useState(false);

  const [savedCategories, setSavedCategories] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("simba_custom_categories") ?? "[]");
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

  const addItem = useAddItem();
  const editItem = useEditItem();
  const deleteItem = useDeleteItem();

  useEffect(() => {
    if (!selectedItem) {
      form.reset();
      return;
    }
    form.setValue("name", selectedItem.name);

    if (!foodOptions.some((option) => option.value === selectedItem.category)) {
      form.setValue("category", "Lainnya");
      form.setValue("customCategory", selectedItem.category);
    } else {
      form.setValue("category", selectedItem.category);
    }

    if (!measureUnitOptions.some((option) => option.value === selectedItem.measureUnit)) {
      form.setValue("measureUnit", "lainnya");
      form.setValue("customMeasureUnit", selectedItem.measureUnit);
    } else {
      form.setValue("measureUnit", selectedItem.measureUnit);
    }

    form.setValue("stock", selectedItem.initialStock ?? selectedItem.stock);
    form.setValue("initialStock", selectedItem.initialStock);
    form.setValue("pricePerUnit", selectedItem.unitPrice);
    form.setValue("dateAdded", selectedItem.createdAt ? new Date(selectedItem.createdAt) : new Date());
  }, [selectedItem]);

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
          setErrMsg("Data bahan tidak valid. Pastikan nama, kategori, satuan, dan harga terisi dengan benar.");
          break;
        case 409:
          setErrMsg("Bahan dengan nama tersebut sudah ada. Gunakan nama lain atau edit bahan yang ada.");
          break;
        default:
          setErrMsg("Gagal menambah bahan. Periksa koneksi Anda atau coba lagi.");
      }
    } finally {
      form.reset();
    }
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
        id: selectedItem!.id,
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
          setErrMsg("Perubahan tidak valid. Periksa kembali nama, kategori, satuan, dan harga bahan.");
          break;
        case 404:
          setErrMsg("Bahan tidak ditemukan. Kemungkinan sudah dihapus oleh pengguna lain.");
          break;
        default:
          setErrMsg("Gagal menyimpan perubahan bahan. Periksa koneksi Anda atau coba lagi.");
      }
    } finally {
      form.reset();
    }
  };

  const handleDeleteMasterItem = async () => {
    setErrMsg("");
    try {
      const response = await deleteItem.mutateAsync({ id: selectedItem!.id });
      if (response.status === 200) {
        onChangeSelection(null);
        toast({
          title: "Berhasil menghapus data bahan",
          description: "Anda berhasil menghapus data bahan",
        });
      }
    } catch (e: unknown) {
      const err = e as AxiosError;
      switch (err.status) {
        case 404:
          setErrMsg("Bahan tidak ditemukan. Kemungkinan sudah dihapus sebelumnya.");
          break;
        case 409:
          setErrMsg("Bahan tidak dapat dihapus karena masih memiliki riwayat stok. Hapus riwayat stoknya terlebih dahulu.");
          break;
        default:
          setErrMsg("Gagal menghapus bahan. Periksa koneksi Anda atau coba lagi.");
      }
    } finally {
      form.reset();
    }
  };

  const handleCancelEditItem = (e: MouseEvent) => {
    e.preventDefault();
    onChangeSelection(null);
    setErrMsg("");
    form.reset();
  };

  const handleFormType = () => {
    const formHandler = selectedItem ? handleEditMasterItem : handleAddMasterItem;
    return form.handleSubmit(formHandler);
  };

  return (
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
            <Input {...form.register("name")} placeholder="Masukkan nama bahan" />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
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
              <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
            )}
            {form.watch("category") === "Lainnya" && (
              <div className="space-y-2">
                <Label htmlFor="category">Kategori Lainnya</Label>
                <Input name="customCategory" {...form.register("customCategory")} />
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
              <p className="text-sm text-destructive">{form.formState.errors.measureUnit.message}</p>
            )}
            {form.watch("measureUnit") === "lainnya" && (
              <div className="space-y-2">
                <Label htmlFor="customMeasureUnit">Satuan Lainnya</Label>
                <Input name="customMeasureUnit" {...form.register("customMeasureUnit")} />
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
                  onChange={(e) => field.onChange(parseCurrency(e.target.value))}
                />
              )}
            />
            {form.formState.errors.pricePerUnit && (
              <p className="text-sm text-destructive">{form.formState.errors.pricePerUnit.message}</p>
            )}
          </div>
          <div className={selectedItem ? "grid grid-cols-2 gap-4" : "space-y-2"}>
            <div className="space-y-2">
              <Label htmlFor="stock">Stok Awal</Label>
              <Input {...form.register("stock")} type="number" placeholder="0" min="0" step="any" />
              {form.formState.errors.stock && (
                <p className="text-sm text-destructive">{form.formState.errors.stock.message}</p>
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
                <Popover open={isDateAddedOpen} onOpenChange={setIsDateAddedOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start font-normal"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {field.value ? formatDateTable(field.value) : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 px-4 py-2" align="start">
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
              <p className="text-sm text-destructive">{form.formState.errors.dateAdded.message}</p>
            )}
          </div>
          <div className="flex gap-4 pt-2 flex-wrap-reverse">
            {selectedItem ? (
              <>
                <Button type="button" className="w-full" variant="outline" onClick={handleCancelEditItem}>
                  Batal
                </Button>
                <DeleteDialog handleDelete={handleDeleteMasterItem} isPending={deleteItem.isPending} />
                <Button type="submit" className="w-full" disabled={editItem.isPending}>
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
              <Button type="submit" className="w-full" disabled={addItem.isPending}>
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
  );
};

export default MasterItemForm;

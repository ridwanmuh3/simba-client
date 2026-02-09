import { Label } from "@/components/ui/label";
import Dropzone from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Plus, Receipt, UploadCloud } from "lucide-react";
import { Input } from "../ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useAddFinance } from "@/api/finance";
import { toast } from "@/hooks/use-toast";
import { AxiosError } from "axios";

const transactionCategories = [
  "Bahan Makanan",
  "Bahan Pendukung",
  "Operasional",
  "Logistik",
  "Peralatan",
  "Lainnya",
];

const addFinanceSchema = z.object({
  type: z.string(),
  category: z.string(),
  description: z.string().min(1, "Harus ada deskripsi"),
  amount: z.coerce.number().min(1, "Besaran uang harus lebih dari Rp. 1"),
  extraNote: z.string().optional(),
  proofImage: z.instanceof(File, {
    message: "Bukti foto wajib diupload",
  }),
});

type AddFinanceFormInputs = z.infer<typeof addFinanceSchema>;

const AddFinanceDialog = () => {
  const form = useForm<AddFinanceFormInputs>({
    resolver: zodResolver(addFinanceSchema),
    defaultValues: {
      type: "",
      category: "",
      description: "",
      amount: 0,
      extraNote: "",
      proofImage: null,
    },
  });
  const addFinance = useAddFinance();
  const [preview, setPreview] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const handleAddFinance = async (data: AddFinanceFormInputs) => {
    setErrMsg("");
    try {
      const formData = new FormData();

      formData.append("type", data.type);
      formData.append("category", data.category);
      formData.append("description", data.description);
      formData.append("amount", data.amount.toString());

      if (data.extraNote) {
        formData.append("extra_note", data.extraNote);
      }

      if (data.proofImage) {
        formData.append("proof_image", data.proofImage);
      }
      await addFinance.mutateAsync(formData);

      toast({
        title: "Berhasil",
        description: `Data keuangan  berhasil ditambahkan`,
      });

      form.reset();
      setIsAddDialogOpen(false);
    } catch (e) {
      const err = e as AxiosError;
      switch (err.status) {
        case 400:
          setErrMsg("Terjadi kesalahan input data bahan");
          break;
        case 404:
          setErrMsg("Data tidak ditemukan");
        default:
          setErrMsg("Terjadi kesalahan server");
          break;
      }
    }
  };

  const imagePreview = form.watch("proofImage");

  useEffect(() => {
    if (!imagePreview) return;

    const objectUrl = URL.createObjectURL(imagePreview);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imagePreview]);

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Input Keuangan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        {/* Header: Fixed di atas */}
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle>Input Keuangan dari Nota</DialogTitle>
            <DialogDescription>
              Catat Keuangan pembelian bahan atau kebutuhan MBG berdasarkan nota
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form: Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <form
            id="add-finance-form"
            onSubmit={form.handleSubmit(handleAddFinance)}
            className="grid gap-4"
          >
            <div className="grid gap-3">
              <Label htmlFor="type">Jenis</Label>
              <Controller
                name="type"
                control={form.control}
                rules={{ required: "Jenis harus dipilih" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Jenis Pengeluaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PEMASUKAN">PEMASUKAN</SelectItem>
                      <SelectItem value="PENGELUARAN">PENGELUARAN</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.type && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.type.message}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="category">Kategori Pengeluaran</Label>
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
                      {transactionCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
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
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Deskripsi Pengeluaran</Label>
              <Input
                id="description"
                {...form.register("description")}
                placeholder="Contoh: Pembelian Beras 500kg"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <Input {...form.register("amount")} type="number" />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              <Label>Foto Bukti</Label>
              <Controller
                name="proofImage"
                control={form.control}
                render={({ field: { value, onBlur, onChange } }) => (
                  <Dropzone
                    multiple={false}
                    accept={{ "image/*": [] }}
                    onDrop={(files) => onChange(files[0])}
                  >
                    {({ getRootProps, getInputProps, isDragActive }) => (
                      <div
                        {...getRootProps()}
                        className={`
                    relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out
                    ${
                      isDragActive
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 bg-background"
                    }
                    ${!!value ? "border-primary/50" : ""}
                  `}
                      >
                        <input {...getInputProps()} onBlur={onBlur} />

                        {value ? (
                          <div className="flex flex-col items-center gap-4 w-full">
                            <div className="relative aspect-video w-full  overflow-hidden rounded-lg border shadow-sm">
                              <img
                                src={
                                  typeof value === "string"
                                    ? value
                                    : URL.createObjectURL(value)
                                }
                                alt="Preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                                {value.name || "Gambar terpilih"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Klik untuk ganti gambar
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-center">
                            <div className="p-4 rounded-full bg-muted">
                              <UploadCloud className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                Klik untuk upload
                                <span className="font-normal text-muted-foreground">
                                  {" "}
                                  atau seret gambar ke sini
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                SVG, PNG, JPG atau GIF (Maks. 5MB)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Dropzone>
                )}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="note">Catatan Tambahan</Label>
              <Input id="note" {...form.register("extraNote")} />
            </div>
          </form>
        </div>

        <div className="p-6 pt-2">
          <DialogFooter className="flex gap-4 flex-row">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              form="add-finance-form"
              className="flex-1"
              type="submit"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Receipt className="w-4 h-4 mr-2" />
              Simpan
            </Button>
          </DialogFooter>
          {errMsg && (
            <p className="text-center text-sm text-destructive mt-2">
              {errMsg}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFinanceDialog;

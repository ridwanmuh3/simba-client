import { MouseEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, UploadCloud } from "lucide-react";
import { compressImage, formatCurrency, parseCurrency } from "@/lib/utils";
import { useAddFinance, useDeleteFinance, useEditFinance } from "@/features/finance/api";
import { FinanceData } from "@/features/finance/types";
import { toast } from "@/hooks/use-toast";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import RequiredInputIdentifier from "@/components/shared/RequiredInputIdentifier";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Dropzone from "react-dropzone";
import { Textarea } from "@/components/ui/textarea";
import DeleteDialog from "./DeleteDialog";
import Spinner from "@/components/shared/Spinner";

const addFinanceSchema = z.object({
  type: z.enum(["PEMASUKAN", "PENGELUARAN"]),
  category: z.string(),
  description: z.string().min(1, "Harus ada deskripsi"),
  amount: z.coerce.number().min(1, "Besaran uang harus lebih dari Rp. 1"),
  extraNote: z.string().optional(),
  proofImage: z.instanceof(File).nullable().optional(),
});

type AddFinanceFormInputs = z.infer<typeof addFinanceSchema>;

const transactionCategories = [
  "Bahan Makanan",
  "Bahan Pendukung",
  "Operasional",
  "Logistik",
  "Peralatan",
  "Lainnya",
];

const getHttpStatusCode = (error: unknown): number | undefined => {
  if (!axios.isAxiosError(error)) return undefined;
  return error.response?.status;
};

interface FinanceFormProps {
  selectedFinance: FinanceData | null;
  onClearSelection: () => void;
}

export default function FinanceForm({ selectedFinance, onClearSelection }: FinanceFormProps) {
  const [errMsg, setErrMsg] = useState("");

  const form = useForm<AddFinanceFormInputs>({
    resolver: zodResolver(addFinanceSchema),
    defaultValues: {
      type: "PEMASUKAN",
      category: "",
      description: "",
      amount: 0,
      extraNote: "",
      proofImage: null,
    },
  });

  const addFinance = useAddFinance();
  const editFinance = useEditFinance();
  const deleteFinance = useDeleteFinance();
  const transactionType = form.watch("type");
  const proofImageValue = form.watch("proofImage");

  const selectedProofImagePreview = useMemo(() => {
    if (!(proofImageValue instanceof File)) {
      return selectedFinance?.proofImage ?? "";
    }
    return URL.createObjectURL(proofImageValue);
  }, [proofImageValue, selectedFinance?.proofImage]);

  useEffect(() => {
    if (!(proofImageValue instanceof File)) return;
    return () => {
      URL.revokeObjectURL(selectedProofImagePreview);
    };
  }, [proofImageValue, selectedProofImagePreview]);

  useEffect(() => {
    if (!selectedFinance) {
      form.reset();
      return;
    }
    form.setValue("type", selectedFinance.type);
    form.setValue("category", selectedFinance.category);
    form.setValue("description", selectedFinance.description);
    form.setValue("amount", selectedFinance.amount);
    form.setValue("extraNote", selectedFinance.extraNote);
  }, [selectedFinance]);

  const handleAddFinance = async (data: AddFinanceFormInputs) => {
    setErrMsg("");
    try {
      const formData = new FormData();
      if (!data.proofImage) {
        setErrMsg("Bukti foto wajib diupload");
        return;
      }
      formData.append("type", data.type);
      formData.append("description", data.description);
      formData.append("amount", data.amount.toString());
      if (data.type === "PEMASUKAN") {
        formData.append("category", "Pemasukan");
      } else {
        formData.append("category", data.category);
      }
      if (data.extraNote) formData.append("extra_note", data.extraNote);
      if (data.proofImage instanceof File) formData.append("proof_image", data.proofImage);
      await addFinance.mutateAsync(formData);
      toast({ title: "Berhasil", description: "Data keuangan  berhasil ditambahkan" });
      form.reset();
    } catch (error: unknown) {
      const statusCode = getHttpStatusCode(error);
      switch (statusCode) {
        case 400:
          setErrMsg("Data transaksi tidak valid. Pastikan jumlah, deskripsi, dan foto bukti sudah terisi dengan benar.");
          break;
        case 413:
          setErrMsg("Ukuran foto bukti terlalu besar. Gunakan gambar di bawah 5MB.");
          break;
        case 404:
          setErrMsg("Kategori atau data terkait tidak ditemukan. Muat ulang halaman dan coba lagi.");
          break;
        default:
          setErrMsg("Gagal menyimpan data keuangan. Periksa koneksi Anda atau coba lagi.");
      }
    }
  };

  const handleEditFinance = async (data: AddFinanceFormInputs) => {
    setErrMsg("");
    try {
      if (!selectedFinance) {
        toast({
          title: "Data belum dipilih",
          description: "Pilih salah satu data keuangan dari tabel terlebih dahulu sebelum mengubah.",
          variant: "destructive",
        });
        return;
      }
      const formData = new FormData();
      formData.append("type", data.type);
      formData.append("description", data.description);
      formData.append("amount", data.amount.toString());
      if (data.type === "PEMASUKAN") {
        formData.append("category", "Pemasukan");
      } else {
        formData.append("category", data.category);
      }
      if (data.extraNote) formData.append("extra_note", data.extraNote);
      if (data.proofImage instanceof File) formData.append("proof_image", data.proofImage);
      await editFinance.mutateAsync({ financeId: selectedFinance.id, formData });
      onClearSelection();
      toast({ title: "Berhasil", description: "Data keuangan berhasil diubah" });
      form.reset();
    } catch (error: unknown) {
      const statusCode = getHttpStatusCode(error);
      switch (statusCode) {
        case 400:
          setErrMsg("Data transaksi tidak valid. Periksa kembali jumlah, deskripsi, dan foto bukti.");
          break;
        case 404:
          setErrMsg("Data keuangan tidak ditemukan. Kemungkinan sudah dihapus oleh pengguna lain.");
          break;
        default:
          setErrMsg("Gagal menyimpan perubahan. Periksa koneksi Anda atau coba lagi.");
      }
    }
  };

  const handleDeleteFinance = async () => {
    setErrMsg("");
    if (!selectedFinance) {
      setErrMsg("Pilih data keuangan dari tabel terlebih dahulu sebelum menghapus.");
      return;
    }
    try {
      await deleteFinance.mutateAsync({ id: selectedFinance.id });
      onClearSelection();
      toast({ title: "Berhasil menghapus data keuangan", description: "Anda berhasil menghapus data keuangan" });
      form.reset();
    } catch (error: unknown) {
      const statusCode = getHttpStatusCode(error);
      switch (statusCode) {
        case 404:
          setErrMsg("Data keuangan tidak ditemukan. Kemungkinan sudah dihapus sebelumnya.");
          break;
        default:
          setErrMsg("Gagal menghapus data keuangan. Periksa koneksi Anda atau coba lagi.");
      }
    }
  };

  const handleCancelEdit = (e: MouseEvent) => {
    e.preventDefault();
    onClearSelection();
    setErrMsg("");
    form.reset();
  };

  const handleFormSubmit = () => {
    return form.handleSubmit(selectedFinance ? handleEditFinance : handleAddFinance);
  };

  return (
    <Card className="lg:col-span-1 h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Input Keuangan</CardTitle>
        <CardDescription className="text-sm font-bold text-muted-foreground">
          Input dengan tanda (*) wajib diisi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit()} className="space-y-4">
          {/* JENIS */}
          <div className="space-y-2">
            <Label>
              Jenis <RequiredInputIdentifier />
            </Label>
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PEMASUKAN">PEMASUKAN</SelectItem>
                    <SelectItem value="PENGELUARAN">PENGELUARAN</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* PENGELUARAN KATEGORI */}
          {transactionType === "PENGELUARAN" && (
            <div className="space-y-2">
              <Label>
                Kategori <RequiredInputIdentifier />
              </Label>
              <Controller
                name="category"
                control={form.control}
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
            </div>
          )}

          <div className="space-y-2">
            <Label>
              {transactionType === "PENGELUARAN" ? "Deskripsi" : "Sumber Pemasukan"}
              <RequiredInputIdentifier />
            </Label>
            <Input
              {...form.register("description")}
              placeholder={
                transactionType === "PENGELUARAN"
                  ? "Misal: Pembelian gas 10kg"
                  : "Misal: Pendanaan perusahaan"
              }
            />
          </div>

          {/* JUMLAH */}
          <div className="space-y-2">
            <Label>
              Jumlah (Rp) <RequiredInputIdentifier />
            </Label>
            <Controller
              name="amount"
              control={form.control}
              render={({ field }) => (
                <Input
                  inputMode="numeric"
                  value={formatCurrency(field.value)}
                  onChange={(e) => field.onChange(parseCurrency(e.target.value))}
                />
              )}
            />
          </div>

          {/* FOTO BUKTI */}
          <div className="space-y-2">
            <Label>
              Foto Bukti <RequiredInputIdentifier />
            </Label>
            <Controller
              name="proofImage"
              control={form.control}
              render={({ field: { value, onBlur, onChange } }) => (
                <Dropzone
                  multiple={false}
                  accept={{
                    "image/jpeg": [".jpg", ".jpeg"],
                    "image/png": [".png"],
                  }}
                  onDrop={async (files) => {
                    if (!files || files.length === 0) return;
                    const compressedFile = await compressImage(files[0]);
                    onChange(compressedFile);
                  }}
                >
                  {({ getRootProps, getInputProps, isDragActive }) => (
                    <div
                      {...getRootProps()}
                      className={`relative flex flex-col items-center justify-center w-full p-3 sm:p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out ${isDragActive ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 bg-background"} ${!value ? "border-primary/50" : ""} `}
                    >
                      <input {...getInputProps()} onBlur={onBlur} />
                      {value ? (
                        <div className="flex flex-col items-center gap-4 w-full">
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg border shadow-sm">
                            <img
                              src={selectedProofImagePreview}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                              {value.name || "Gambar terpilih"}
                            </p>
                            <p className="text-xs text-muted-foreground">Klik untuk ganti gambar</p>
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
                              <span className="font-normal text-muted-foreground"> atau seret gambar ke sini</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG atau JPEG (Maks. 5MB)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Dropzone>
              )}
            />
          </div>

          {/* CATATAN */}
          <div className="space-y-2">
            <Label>Catatan Tambahan</Label>
            <Textarea className="min-h-10" {...form.register("extraNote")} rows={2} />
          </div>

          <div className="flex gap-4 pt-2 flex-wrap-reverse">
            {selectedFinance ? (
              <>
                <Button type="button" className="w-full" variant="outline" onClick={handleCancelEdit}>
                  Batal
                </Button>
                <DeleteDialog handleDelete={handleDeleteFinance} isPending={deleteFinance.isPending} />
                <Button type="submit" className="w-full" disabled={editFinance.isPending}>
                  {editFinance.isPending ? (
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
              <Button type="submit" className="w-full" disabled={addFinance.isPending}>
                {addFinance.isPending ? (
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
}

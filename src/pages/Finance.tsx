import { MouseEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReportViewer from "@/components/finance/ReportViewer";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageViewer from "../components/shared/ImageViewer";
import {
  Search,
  Download,
  Calendar,
  ArrowDownRight,
  FileText,
  ArrowUpRight,
  UploadCloud,
  Save,
  Wallet,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  capitalizeFirstLetterString,
  compressImage,
  formatCurrency,
  parseCurrency,
} from "@/lib/utils";
import {
  useAddFinance,
  useDeleteFinance,
  useEditFinance,
  useGetAllFinances,
} from "@/api/finance";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateDetail, formatDateTable } from "@/lib/date-utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { FinanceData } from "@/types/finance";
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
import DeleteDialog from "@/components/finance/DeleteDialog";
import Spinner from "@/components/shared/Spinner";
import DataTablePagination from "@/components/shared/DataTablePagination";
import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/response";
import { exportFinanceToCSV } from "@/lib/csv-utils";

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
  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  return error.response?.status;
};

export default function Finance() {
  const [errMsg, setErrMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState<Date | undefined>();
  const [tempDateTo, setTempDateTo] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isEditForm, setIsEditForm] = useState(false);
  const [selectedFinance, setSelectedFinance] = useState<FinanceData | null>(
    null,
  );
  const {
    data: financeData,
    isLoading,
    isError: isFinanceError,
    error: financeError,
  } = useGetAllFinances(
    searchQuery,
    page,
    limit,
    dateFrom,
    dateTo,
  );
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
  const financeRows = useMemo(() => financeData?.data ?? [], [financeData?.data]);
  const financeErrorMessage = isFinanceError
    ? financeError instanceof Error
      ? financeError.message
      : "Tidak dapat memuat data keuangan."
    : "";
  const selectedProofImagePreview = useMemo(() => {
    if (!(proofImageValue instanceof File)) {
      return selectedFinance?.proofImage ?? "";
    }

    return URL.createObjectURL(proofImageValue);
  }, [proofImageValue, selectedFinance?.proofImage]);

  useEffect(() => {
    if (!(proofImageValue instanceof File)) {
      return;
    }

    return () => {
      URL.revokeObjectURL(selectedProofImagePreview);
    };
  }, [proofImageValue, selectedProofImagePreview]);

  const currentPageNetTotal = useMemo(
    () =>
      financeRows.reduce(
        (accumulator, row) =>
          row.type === "PEMASUKAN"
            ? accumulator + row.amount
            : accumulator - row.amount,
        0,
      ),
    [financeRows],
  );

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

      if (data.extraNote) {
        formData.append("extra_note", data.extraNote);
      }

      if (data.proofImage && data.proofImage instanceof File) {
        formData.append("proof_image", data.proofImage);
      }
      await addFinance.mutateAsync(formData);

      toast({
        title: "Berhasil",
        description: `Data keuangan  berhasil ditambahkan`,
      });
      form.reset();
    } catch (error: unknown) {
      const statusCode = getHttpStatusCode(error);
      switch (statusCode) {
        case 400:
          setErrMsg(
            "Data transaksi tidak valid. Pastikan jumlah, deskripsi, dan foto bukti sudah terisi dengan benar.",
          );
          break;
        case 413:
          setErrMsg(
            "Ukuran foto bukti terlalu besar. Gunakan gambar di bawah 5MB.",
          );
          break;
        case 404:
          setErrMsg(
            "Kategori atau data terkait tidak ditemukan. Muat ulang halaman dan coba lagi.",
          );
          break;
        default:
          setErrMsg(
            "Gagal menyimpan data keuangan. Periksa koneksi Anda atau coba lagi.",
          );
          break;
      }
    }
  };

  const handleEditFinance = async (data: AddFinanceFormInputs) => {
    setErrMsg("");
    try {
      if (!selectedFinance) {
        toast({
          title: "Data belum dipilih",
          description:
            "Pilih salah satu data keuangan dari tabel terlebih dahulu sebelum mengubah.",
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

      if (data.extraNote) {
        formData.append("extra_note", data.extraNote);
      }

      if (data.proofImage && data.proofImage instanceof File) {
        formData.append("proof_image", data.proofImage);
      }

      await editFinance.mutateAsync({
        financeId: selectedFinance.id,
        formData: formData,
      });

      setSelectedFinance(null);
      toast({
        title: "Berhasil",
        description: `Data keuangan berhasil diubah`,
      });
      setIsEditForm(false);
      form.reset();
    } catch (error: unknown) {
      const statusCode = getHttpStatusCode(error);
      switch (statusCode) {
        case 400:
          setErrMsg(
            "Data transaksi tidak valid. Periksa kembali jumlah, deskripsi, dan foto bukti.",
          );
          break;
        case 404:
          setErrMsg(
            "Data keuangan tidak ditemukan. Kemungkinan sudah dihapus oleh pengguna lain.",
          );
          break;
        default:
          setErrMsg(
            "Gagal menyimpan perubahan. Periksa koneksi Anda atau coba lagi.",
          );
          break;
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
      await deleteFinance.mutateAsync({
        id: selectedFinance.id,
      });

      setSelectedFinance(null);
      toast({
        title: "Berhasil menghapus data keuangan",
        description: `Anda berhasil menghapus data keuangan`,
      });
      setIsEditForm(false);
      form.reset();
    } catch (error: unknown) {
      const statusCode = getHttpStatusCode(error);
      switch (statusCode) {
        case 404:
          setErrMsg(
            "Data keuangan tidak ditemukan. Kemungkinan sudah dihapus sebelumnya.",
          );
          break;
        default:
          setErrMsg(
            "Gagal menghapus data keuangan. Periksa koneksi Anda atau coba lagi.",
          );
          break;
      }
    }
  };

  const handleSelectFinance = (finance: FinanceData) => {
    setSelectedFinance(finance);
    setIsEditForm(true);

    form.setValue("type", finance.type);
    form.setValue("category", finance.category);
    form.setValue("description", finance.description);
    form.setValue("amount", finance.amount);
    form.setValue("extraNote", finance.extraNote);
    // form.setValue("proofImage", finance.proofImage);
  };

  const handleCancelEditFinance = (e: MouseEvent) => {
    e.preventDefault();
    setSelectedFinance(null);
    setIsEditForm(false);
    setErrMsg("");
    form.reset();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleOpenFromChange = (open: boolean) => {
    if (open) {
      setTempDateFrom(dateFrom);
    }
    setIsFromOpen(open);
  };

  const handleOpenToChange = (open: boolean) => {
    if (open) {
      setTempDateTo(dateTo);
    }
    setIsToOpen(open);
  };

  const handleConfirmFrom = () => {
    setDateFrom(tempDateFrom);
    setIsFromOpen(false);
  };

  const handleConfirmTo = () => {
    setDateTo(tempDateTo);
    setIsToOpen(false);
  };

  const handleFormType = (isEditMode: boolean) => {
    const formHandler = isEditMode ? handleEditFinance : handleAddFinance;
    return form.handleSubmit(formHandler);
  };

  const handleExportFinances = async () => {
    try {
      const exportedFinance =
        await axiosInstance.get<ApiResponse<FinanceData[]>>("/finances/export");

      if (exportedFinance.data?.data) {
        exportFinanceToCSV(exportedFinance.data.data);

        toast({
          title: "Export data keuangan berhasil",
          description: "Anda berhasil melakukan export data keuangan",
        });
      }
    } catch {
      toast({
        title: "Export data keuangan gagal",
        description:
          "Tidak dapat mengunduh data keuangan saat ini. Periksa koneksi Anda dan coba lagi.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchQuery, dateFrom, dateTo]);

  return (
    <DashboardLayout
      title="Kelola Keuangan"
      subtitle="Catat pengeluaran dari nota pembelian bahan MBG"
    >
      {/* Tabs for Transactions & Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="finance" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="finance">Data Keuangan</TabsTrigger>
              <TabsTrigger value="reports">Laporan Keuangan</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="w-full sm:w-fit"
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportFinances}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <TabsContent className="space-y-4" value="finance">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-1 h-fit">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Input Keuangan</CardTitle>
                  <CardDescription className="text-sm font-bold text-muted-foreground">
                    Input dengan tanda (*) wajib diisi.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleFormType(isEditForm)}
                    className="space-y-4"
                  >
                    {/* JENIS */}
                    <div className="space-y-2">
                      <Label>
                        Jenis <RequiredInputIdentifier />
                      </Label>
                      <Controller
                        name="type"
                        control={form.control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PEMASUKAN">
                                PEMASUKAN
                              </SelectItem>
                              <SelectItem value="PENGELUARAN">
                                PENGELUARAN
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {/* PENGELUARAN */}
                    {transactionType === "PENGELUARAN" && (
                      <div className="space-y-2">
                        <Label>
                          Kategori <RequiredInputIdentifier />
                        </Label>
                        <Controller
                          name="category"
                          control={form.control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
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
                        {transactionType === "PENGELUARAN"
                          ? "Deskripsi"
                          : "Sumber Pemasukan"}
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
                            onChange={(e) =>
                              field.onChange(parseCurrency(e.target.value))
                            }
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
                              const compressedFile = await compressImage(
                                files[0],
                              );
                              onChange(compressedFile);
                            }}
                          >
                            {({
                              getRootProps,
                              getInputProps,
                              isDragActive,
                            }) => (
                              <div
                                {...getRootProps()}
                                className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out ${isDragActive ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 bg-background"} ${!value ? "border-primary/50" : ""} `}
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
                                        PNG, JPG atau JPEG (Maks. 5MB)
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

                    {/* CATATAN */}
                    <div className="space-y-2">
                      <Label>Catatan Tambahan</Label>
                      <Textarea
                        className="min-h-10"
                        {...form.register("extraNote")}
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-4 pt-2 flex-wrap-reverse">
                      {selectedFinance ? (
                        <>
                          <Button
                            type="button"
                            className="w-full"
                            variant="outline"
                            onClick={handleCancelEditFinance}
                          >
                            Batal
                          </Button>
                          <DeleteDialog
                            handleDelete={handleDeleteFinance}
                            isPending={deleteFinance.isPending}
                          />
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={editFinance.isPending}
                          >
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
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={addFinance.isPending}
                        >
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
                      <p className="text-sm text-destructive text-center">
                        {errMsg}
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader className="pb-4">
                  <div className="flex flex-row gap-4 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari transaksi, nota, atau kategori..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Popover
                      open={isFromOpen}
                      onOpenChange={handleOpenFromChange}
                    >
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          {dateFrom ? formatDateDetail(dateFrom) : "Dari"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 px-4 py-2"
                        align="start"
                      >
                        <CalendarComponent
                          mode="single"
                          selected={tempDateFrom}
                          onSelect={setTempDateFrom}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                        <div className="flex gap-2 mt-2 mb-2">
                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => {
                              setDateFrom(undefined);
                              setIsFromOpen(false);
                            }}
                          >
                            Batal
                          </Button>
                          <Button
                            className="w-full"
                            onClick={handleConfirmFrom}
                          >
                            Pilih
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Popover open={isToOpen} onOpenChange={handleOpenToChange}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          {dateTo ? formatDateTable(dateTo) : "Sampai"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 px-4 py-2"
                        align="start"
                      >
                        <CalendarComponent
                          mode="single"
                          selected={tempDateTo}
                          onSelect={setTempDateTo}
                          initialFocus
                          disabled={(date) => date > new Date()}
                        />
                        <div className="flex gap-2 mt-2 mb-2">
                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => {
                              setDateTo(undefined);
                              setIsToOpen(false);
                            }}
                          >
                            Batal
                          </Button>
                          <Button className="w-full" onClick={handleConfirmTo}>
                            Pilih
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardHeader>
                <CardContent className="p-0 relative overflow-x-auto border-t text-nowrap">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10 border-b">
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Bukti</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            {Array.from({ length: 7 }).map((_, cellIndex) => (
                              <TableCell key={cellIndex}>
                                <Skeleton className="h-4 w-full rounded-md" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : isFinanceError ? (
                        <TableRow>
                          <TableCell colSpan={7} className="py-10 text-center">
                            <p className="text-sm text-destructive">
                              {financeErrorMessage}
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : financeRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0">
                            <div className="flex w-full items-center justify-center">
                              <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 px-4">
                                <Wallet className="h-12 w-12 mb-3 opacity-50" />
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
                        financeRows.map((f, index) => (
                          <TableRow
                            key={f.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedFinance?.id === f.id ? "bg-muted" : ""
                            } relative`}
                            onClick={() => {
                              handleSelectFinance(f);
                            }}
                          >
                            <TableCell>
                              {(page - 1) * limit + index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {f.type === "PENGELUARAN" ? (
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-destructive/10 text-destructive">
                                    <ArrowDownRight className="w-4 h-4" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-success/10 text-success">
                                    <ArrowUpRight className="w-4 h-4" />
                                  </div>
                                )}
                                <p>{capitalizeFirstLetterString(f.type)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <span className="font-medium block">
                                  {f.description}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {f.extraNote}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{f.category}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDateTable(f.createdAt)}
                            </TableCell>
                            <TableCell className="font-medium ">
                              {formatCurrency(f.amount)}
                            </TableCell>
                            <TableCell>
                              <ImageViewer src={f.proofImage} />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={5} className="font-bold text-right">
                          Total Bersih Halaman Ini
                        </TableCell>
                        <TableCell className="font-bold" colSpan={2}>
                          {formatCurrency(currentPageNetTotal)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
            </div>
            <DataTablePagination
              currentPage={page}
              pageSize={limit}
              totalPages={financeData?.paging?.totalPage || 1}
              totalItems={financeData?.paging?.totalItem || 0}
              onPageChange={handlePageChange}
              onPageSizeChange={handleLimitChange}
            />
          </TabsContent>
          <TabsContent value="reports">
            <ReportViewer transactions={financeRows} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}

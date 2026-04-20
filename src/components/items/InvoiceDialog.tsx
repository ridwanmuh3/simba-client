import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar, Clock, FileText, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGenerateInvoice, GenerateInvoiceRequest } from "@/api/items";
import { toast } from "@/hooks/use-toast";
import { combineDateTime, formatDateDetail } from "@/lib/date-utils";
import RequiredInputIdentifier from "@/components/shared/RequiredInputIdentifier";
import dayjs from "dayjs";
import { AxiosError } from "axios";
import {
  useGetCompanyProfile,
  useGetNextDocumentNumbers,
  useUpdateCompanyProfile,
} from "@/api/settings";

type TimeInputProps = { value: string; onChange: (v: string) => void };

const TimeInput = ({ value, onChange }: TimeInputProps) => {
  const parts = value.split(":").map((p) => parseInt(p, 10) || 0);
  const [h, m, s] = parts;

  const emit = (nh: number, nm: number, ns: number) => {
    const clamp = (n: number, max: number) =>
      Math.max(0, Math.min(max, isNaN(n) ? 0 : n));
    const pad = (n: number) => String(n).padStart(2, "0");
    onChange(
      `${pad(clamp(nh, 23))}:${pad(clamp(nm, 59))}:${pad(clamp(ns, 59))}`,
    );
  };

  const segClass =
    "w-9 h-8 text-center text-sm font-semibold bg-muted rounded-md border-0 outline-none focus:bg-primary focus:text-primary-foreground transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden";

  return (
    <div className="flex items-center justify-center gap-1">
      <input
        type="number"
        min={0}
        max={23}
        value={String(h).padStart(2, "0")}
        onChange={(e) => emit(parseInt(e.target.value, 10), m, s)}
        onFocus={(e) => e.target.select()}
        className={segClass}
      />
      <span className="text-muted-foreground font-bold text-sm select-none">
        :
      </span>
      <input
        type="number"
        min={0}
        max={59}
        value={String(m).padStart(2, "0")}
        onChange={(e) => emit(h, parseInt(e.target.value, 10), s)}
        onFocus={(e) => e.target.select()}
        className={segClass}
      />
      <span className="text-muted-foreground font-bold text-sm select-none">
        :
      </span>
      <input
        type="number"
        min={0}
        max={59}
        value={String(s).padStart(2, "0")}
        onChange={(e) => emit(h, m, parseInt(e.target.value, 10))}
        onFocus={(e) => e.target.select()}
        className={segClass}
      />
    </div>
  );
};

const invoiceSchema = z
  .object({
    companyName: z.string().min(1, "Nama perusahaan wajib diisi"),
    companyAddress: z.string().min(1, "Alamat perusahaan wajib diisi"),
    companyContact: z.string().min(1, "Nomor kontak wajib diisi"),
    invoiceNo: z.string().min(1, "Nomor invoice wajib diisi"),
    poNo: z.string().optional(),
    quoNo: z.string().optional(),
    receiverName: z.string().min(1, "Nama penerima wajib diisi"),
    receiverAddress: z.string().min(1, "Alamat penerima wajib diisi"),
    keterangan: z.string().optional(),
    penanggungjawab: z.string().min(1, "Nama penanggungjawab wajib diisi"),
    jabatan: z.string().min(1, "Jabatan wajib diisi"),
    bankAccount: z.string().optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
  })
  .refine((d) => !d.dateFrom || !d.dateTo || d.dateFrom <= d.dateTo, {
    message: "Tanggal awal harus lebih kecil atau sama dengan tanggal akhir",
    path: ["dateTo"],
  });

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceDialogProps {
  stockType?: "IN" | "OUT";
}

const InvoiceDialog = ({ stockType = "OUT" }: InvoiceDialogProps) => {
  const stockLabel = stockType === "IN" ? "bahan masuk" : "bahan keluar";
  const stockLabelTitle = stockType === "IN" ? "Bahan Masuk" : "Bahan Keluar";

  const [open, setOpen] = useState(false);
  const [serverErr, setServerErr] = useState("");

  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState<Date | undefined>();
  const [tempDateTo, setTempDateTo] = useState<Date | undefined>();
  const [timeFrom, setTimeFrom] = useState("00:00:00");
  const [timeTo, setTimeTo] = useState("23:59:59");

  const generateInvoice = useGenerateInvoice();
  const updateCompanyProfile = useUpdateCompanyProfile();
  const { data: companyProfileData, refetch: refetchProfile } =
    useGetCompanyProfile();
  const { data: documentSequenceData, refetch: refetchSeq } =
    useGetNextDocumentNumbers();

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      companyName: "",
      companyAddress: "",
      companyContact: "",
      invoiceNo: "",
      poNo: "",
      quoNo: "",
      receiverName: "",
      receiverAddress: "",
      keterangan: "",
      penanggungjawab: "",
      jabatan: "",
      bankAccount: "",
      dateFrom: undefined,
      dateTo: undefined,
    },
  });

  const dateFrom = form.watch("dateFrom");
  const dateTo = form.watch("dateTo");

  useEffect(() => {
    if (open) {
      const profile = companyProfileData?.data;
      const seq = documentSequenceData?.data;
      form.reset({
        companyName: profile?.companyName ?? "",
        companyAddress: profile?.companyAddress ?? "",
        companyContact: profile?.companyContact ?? "",
        invoiceNo: seq?.nextInvoiceNo ?? "",
        poNo: "",
        quoNo: seq?.nextQuotationNo ?? "",
        receiverName: "",
        receiverAddress: "",
        keterangan: "",
        penanggungjawab: "",
        jabatan: "",
        bankAccount: profile?.bankAccount ?? "",
        dateFrom: undefined,
        dateTo: undefined,
      });
      setTempDateFrom(undefined);
      setTempDateTo(undefined);
      setTimeFrom("00:00:00");
      setTimeTo("23:59:59");
      setServerErr("");
    }
  }, [open, companyProfileData, documentSequenceData]);

  const fillDocumentNumbers = async () => {
    const res = await refetchSeq();
    const next = res.data?.data;
    if (next) {
      form.setValue("invoiceNo", next.nextInvoiceNo, { shouldValidate: true });
      form.setValue("quoNo", next.nextQuotationNo, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: InvoiceFormValues) => {
    setServerErr("");

    const request: GenerateInvoiceRequest = {
      companyName: values.companyName,
      companyAddress: values.companyAddress,
      companyContact: values.companyContact,
      invoiceNo: values.invoiceNo,
      date: dayjs().locale("id").format("DD MMMM YYYY"),
      poNo: values.poNo ?? "",
      quoNo: values.quoNo ?? "",
      receiverName: values.receiverName,
      receiverAddress: values.receiverAddress,
      stockType,
      dateFrom: values.dateFrom?.toISOString(),
      dateTo: values.dateTo?.toISOString(),
      keterangan: values.keterangan ?? "",
      penanggungjawab: values.penanggungjawab,
      jabatan: values.jabatan,
      bankAccount: values.bankAccount ?? "",
    };

    try {
      await updateCompanyProfile.mutateAsync({
        companyName: values.companyName,
        companyAddress: values.companyAddress,
        companyContact: values.companyContact,
        bankAccount: values.bankAccount,
      });

      const { blob, filename } = await generateInvoice.mutateAsync(request);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      toast({ title: "Berhasil", description: "Invoice berhasil diunduh" });
      setOpen(false);
    } catch (e: unknown) {
      const err = e as AxiosError<{ error?: string }>;
      let msg = "Gagal mengunduh invoice. Periksa koneksi Anda dan coba lagi.";

      const data = err.response?.data;

      if (data instanceof Blob) {
        try {
          if (data.type === "application/json") {
            const text = await data.text();
            const parsed = JSON.parse(text) as { error?: string };
            if (parsed?.error) msg = parsed.error;
          }
        } catch {
          // ignore
        }
      } else if (data?.error) {
        msg = data.error;
      }

      const status = err.response?.status;
      if (status === 404) {
        if (
          msg === "Gagal mengunduh invoice. Periksa koneksi Anda dan coba lagi."
        ) {
          msg = `Tidak ada data ${stockLabel} pada rentang tanggal yang dipilih. Coba ubah rentang tanggal atau kosongkan untuk mengambil semua data.`;
        }
      } else if (status === 400) {
        msg =
          "Data invoice tidak valid. Periksa kembali semua field dan format data yang Anda masukkan.";
      } else if (status && status >= 500) {
        msg =
          "Server sedang bermasalah saat men-generate invoice. Silakan coba lagi beberapa saat.";
      }

      setServerErr(msg);
      toast({
        title: "Gagal generate invoice",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const isPending = generateInvoice.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (val) {
          refetchProfile();
          refetchSeq();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-1" />
          Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Invoice</DialogTitle>
          <DialogDescription>
            Isi data invoice untuk {stockLabel}. Field bertanda (*) wajib diisi.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Data Perusahaan */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Data Perusahaan / Toko
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nama Perusahaan <RequiredInputIdentifier />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="PT. Contoh Sejahtera" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nomor Kontak <RequiredInputIdentifier />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="081234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="companyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Alamat Perusahaan <RequiredInputIdentifier />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jl. Contoh No. 123, Jakarta"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Detail Invoice */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Detail Invoice
                </h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={fillDocumentNumbers}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Iterasi nomor
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="invoiceNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        No. Invoice <RequiredInputIdentifier />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="INV-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="poNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO No.</FormLabel>
                      <FormControl>
                        <Input placeholder="PO-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quoNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quo No.</FormLabel>
                      <FormControl>
                        <Input placeholder="QUO-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Ditujukan Kepada */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Ditujukan Kepada
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="receiverName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nama Penerima <RequiredInputIdentifier />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nama penerima" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receiverAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Alamat Penerima <RequiredInputIdentifier />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Alamat penerima" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Rentang Tanggal */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Rentang Tanggal {stockLabelTitle}
              </h4>
              <p className="text-xs text-muted-foreground">
                Kosongkan untuk mengambil semua data {stockLabel}.
              </p>
              <div className="flex flex-wrap gap-2">
                {/* Date From */}
                <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-[180px]"
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      {dateFrom ? formatDateDetail(dateFrom) : "Dari"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex">
                      <CalendarComponent
                        mode="single"
                        selected={tempDateFrom}
                        onSelect={setTempDateFrom}
                        initialFocus
                      />
                      <div className="border-l flex flex-col p-3 w-[152px] gap-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium text-muted-foreground">
                            Waktu (24j)
                          </span>
                        </div>
                        <div className="flex justify-center">
                          <TimeInput value={timeFrom} onChange={setTimeFrom} />
                        </div>
                        <div className="flex-1" />
                        <div className="flex gap-1.5">
                          <Button
                            className="w-full"
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={() => {
                              form.setValue("dateFrom", undefined, {
                                shouldValidate: true,
                              });
                              setTempDateFrom(undefined);
                              setIsFromOpen(false);
                            }}
                          >
                            Batal
                          </Button>
                          <Button
                            className="w-full"
                            size="sm"
                            type="button"
                            onClick={() => {
                              form.setValue(
                                "dateFrom",
                                combineDateTime(tempDateFrom, timeFrom),
                                { shouldValidate: true },
                              );
                              setIsFromOpen(false);
                            }}
                          >
                            Pilih
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Date To */}
                <Popover open={isToOpen} onOpenChange={setIsToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-[180px]"
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      {dateTo ? formatDateDetail(dateTo) : "Sampai"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex">
                      <CalendarComponent
                        mode="single"
                        selected={tempDateTo}
                        onSelect={setTempDateTo}
                        initialFocus
                      />
                      <div className="border-l flex flex-col p-3 w-[152px] gap-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium text-muted-foreground">
                            Waktu (24j)
                          </span>
                        </div>
                        <div className="flex justify-center">
                          <TimeInput value={timeTo} onChange={setTimeTo} />
                        </div>
                        <div className="flex-1" />
                        <div className="flex gap-1.5">
                          <Button
                            className="w-full"
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={() => {
                              form.setValue("dateTo", undefined, {
                                shouldValidate: true,
                              });
                              setTempDateTo(undefined);
                              setIsToOpen(false);
                            }}
                          >
                            Batal
                          </Button>
                          <Button
                            className="w-full"
                            size="sm"
                            type="button"
                            onClick={() => {
                              form.setValue(
                                "dateTo",
                                combineDateTime(tempDateTo, timeTo),
                                { shouldValidate: true },
                              );
                              setIsToOpen(false);
                            }}
                          >
                            Pilih
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {form.formState.errors.dateTo && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.dateTo.message}
                </p>
              )}
            </div>

            {/* Keterangan & Penanggungjawab */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Keterangan & Penanggungjawab
              </h4>
              <FormField
                control={form.control}
                name="keterangan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Catatan tambahan (opsional)"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="penanggungjawab"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nama Penanggungjawab <RequiredInputIdentifier />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nama penanggungjawab" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jabatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Jabatan <RequiredInputIdentifier />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Jabatan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="bankAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Rekening</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama Bank - 1234567890 a.n. Pemilik (opsional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {serverErr && (
              <p className="text-sm text-destructive text-center">
                {serverErr}
              </p>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengunduh...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Unduh Invoice
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDialog;

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
import {
  Calendar,
  FileText,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGenerateInvoice,
  GenerateInvoiceRequest,
  useGetAllItemsStocks,
} from "@/features/items/api";
import { toast } from "@/hooks/use-toast";
import { formatDateDetail } from "@/lib/date-utils";
import RequiredInputIdentifier from "@/components/shared/RequiredInputIdentifier";
import dayjs from "dayjs";
import { AxiosError } from "axios";
import {
  useGetCompanyProfile,
  useGetNextDocumentNumbers,
  useUpdateCompanyProfile,
} from "@/features/settings/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const invoiceSchema = z.object({
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
  invoiceDate: z.date({ required_error: "Tanggal penerbitan wajib diisi" }),
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
  const [isInvoiceDateOpen, setIsInvoiceDateOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [stockSearch, setStockSearch] = useState("");
  const [stockPage, setStockPage] = useState(1);

  const { data: stocksData, isLoading: isStocksLoading } = useGetAllItemsStocks(
    stockSearch,
    stockPage,
    20,
    undefined,
    undefined,
    stockType,
    open,
  );


  const stockRows = useMemo(() => stocksData?.data ?? [], [stocksData]);

  const toggleId = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const allIds = stockRows.map((r) => r.id!).filter(Boolean);
    const allSelected = allIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) allIds.forEach((id) => next.delete(id));
      else allIds.forEach((id) => next.add(id));
      return next;
    });
  };

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
      invoiceDate: new Date(),
    },
  });

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
        invoiceDate: new Date(),
      });
      setServerErr("");
      setSelectedIds(new Set());
      setStockSearch("");
      setStockPage(1);
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

    if (selectedIds.size === 0) {
      setServerErr(`Pilih minimal satu data ${stockLabel} untuk dimasukkan ke invoice.`);
      return;
    }

    const request: GenerateInvoiceRequest = {
      companyName: values.companyName,
      companyAddress: values.companyAddress,
      companyContact: values.companyContact,
      invoiceNo: values.invoiceNo,
      date: dayjs(values.invoiceDate).locale("id").format("DD MMMM YYYY"),
      poNo: values.poNo ?? "",
      quoNo: values.quoNo ?? "",
      receiverName: values.receiverName,
      receiverAddress: values.receiverAddress,
      stockType,
      stockIds: Array.from(selectedIds),
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
              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tanggal Penerbitan <RequiredInputIdentifier />
                    </FormLabel>
                    <Popover
                      open={isInvoiceDateOpen}
                      onOpenChange={setIsInvoiceDateOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start font-normal"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            {field.value
                              ? formatDateDetail(field.value)
                              : "Pilih tanggal"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 px-4 py-2" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={(d) => {
                            if (d) field.onChange(d);
                            setIsInvoiceDateOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

            {/* Pilih Bahan */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Pilih {stockLabelTitle}
                </h4>
                {selectedIds.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {selectedIds.size} dipilih
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-muted-foreground"
                      onClick={() => setSelectedIds(new Set())}
                    >
                      Batal pilih
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Centang baris yang ingin dimasukkan ke invoice. Minimal 1 baris harus dipilih.
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder={`Cari ${stockLabel}...`}
                  value={stockSearch}
                  onChange={(e) => {
                    setStockSearch(e.target.value);
                    setStockPage(1);
                  }}
                  className="pl-9 h-8 text-sm"
                />
              </div>
              <div className="border rounded-md overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-8 py-2">
                          <Checkbox
                            checked={
                              stockRows.length > 0 &&
                              stockRows.every((r) => r.id && selectedIds.has(r.id))
                            }
                            onCheckedChange={toggleAll}
                          />
                        </TableHead>
                        <TableHead className="py-2 text-xs">Tanggal</TableHead>
                        <TableHead className="py-2 text-xs">Bahan</TableHead>
                        <TableHead className="py-2 text-xs text-right">Jumlah</TableHead>
                        <TableHead className="py-2 text-xs text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isStocksLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-4">
                            Memuat data...
                          </TableCell>
                        </TableRow>
                      ) : stockRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-4">
                            {stockSearch ? "Tidak ada hasil pencarian" : `Belum ada data ${stockLabel}`}
                          </TableCell>
                        </TableRow>
                      ) : (
                        stockRows.map((row) => (
                          <TableRow
                            key={row.id}
                            className={`cursor-pointer text-xs ${row.id && selectedIds.has(row.id) ? "bg-muted" : "hover:bg-muted/50"}`}
                            onClick={() => row.id && toggleId(row.id)}
                          >
                            <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={!!(row.id && selectedIds.has(row.id))}
                                onCheckedChange={() => row.id && toggleId(row.id)}
                              />
                            </TableCell>
                            <TableCell className="py-2 text-nowrap">
                              {row.createdAt ? formatDateDetail(new Date(row.createdAt)) : "-"}
                            </TableCell>
                            <TableCell className="py-2 font-medium">{row.item?.name ?? "-"}</TableCell>
                            <TableCell className="py-2 text-right text-nowrap">
                              {row.amount} {row.item?.measureUnit}
                            </TableCell>
                            <TableCell className="py-2 text-right text-nowrap">
                              {formatCurrency(row.totalPrice ?? 0)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {(stocksData?.paging?.totalPage ?? 1) > 1 && (
                  <div className="flex items-center justify-between px-3 py-2 border-t text-xs text-muted-foreground">
                    <span>
                      Hal {stockPage} / {stocksData?.paging?.totalPage ?? 1}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        disabled={stockPage <= 1}
                        onClick={() => setStockPage((p) => p - 1)}
                      >
                        ‹
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        disabled={stockPage >= (stocksData?.paging?.totalPage ?? 1)}
                        onClick={() => setStockPage((p) => p + 1)}
                      >
                        ›
                      </Button>
                    </div>
                  </div>
                )}
              </div>
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

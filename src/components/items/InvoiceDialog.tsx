import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar, Clock, FileText, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

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
import { useGenerateInvoice, GenerateInvoiceRequest } from "@/api/items";
import { toast } from "@/hooks/use-toast";
import { combineDateTime, formatDateDetail } from "@/lib/date-utils";
import RequiredInputIdentifier from "@/components/shared/RequiredInputIdentifier";
import dayjs from "dayjs";
import { AxiosError } from "axios";
import { useGetCompanyProfile, useGetNextDocumentNumbers, useUpdateCompanyProfile } from "@/api/settings";

interface InvoiceDialogProps {
  stockType?: "IN" | "OUT";
}

const InvoiceDialog = ({ stockType = "OUT" }: InvoiceDialogProps) => {
  const stockLabel = stockType === "IN" ? "bahan masuk" : "bahan keluar";
  const stockLabelTitle = stockType === "IN" ? "Bahan Masuk" : "Bahan Keluar";
  const [open, setOpen] = useState(false);
  const generateInvoice = useGenerateInvoice();
  const updateCompanyProfile = useUpdateCompanyProfile();
  const { data: companyProfileData, refetch: refetchProfile } =
    useGetCompanyProfile();
  const { data: documentSequenceData, refetch: refetchSeq } =
    useGetNextDocumentNumbers();

  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyContact, setCompanyContact] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [poNo, setPoNo] = useState("");
  const [quoNo, setQuoNo] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [penanggungjawab, setPenanggungjawab] = useState("");
  const [jabatan, setJabatan] = useState("");

  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [tempDateFrom, setTempDateFrom] = useState<Date | undefined>();
  const [tempDateTo, setTempDateTo] = useState<Date | undefined>();
  const [timeFrom, setTimeFrom] = useState("00:00:00");
  const [timeTo, setTimeTo] = useState("23:59:59");
  const [errMsg, setErrMsg] = useState("");

  const fillDocumentNumbers = async () => {
    const response = await refetchSeq();
    const nextNumbers = response.data?.data;

    if (nextNumbers) {
      setInvoiceNo(nextNumbers.nextInvoiceNo);
      setQuoNo(nextNumbers.nextQuotationNo);
    }
  };

  useEffect(() => {
    if (open) {
      if (companyProfileData?.data) {
        setCompanyName(companyProfileData.data.companyName);
        setCompanyAddress(companyProfileData.data.companyAddress);
        setCompanyContact(companyProfileData.data.companyContact);
      }
      if (documentSequenceData?.data) {
        setInvoiceNo(documentSequenceData.data.nextInvoiceNo);
        setQuoNo(documentSequenceData.data.nextQuotationNo);
      }
    }
  }, [open, companyProfileData, documentSequenceData]);

  const resetForm = () => {
    setCompanyName(companyProfileData?.data?.companyName || "");
    setCompanyAddress(companyProfileData?.data?.companyAddress || "");
    setCompanyContact(companyProfileData?.data?.companyContact || "");
    setInvoiceNo(documentSequenceData?.data?.nextInvoiceNo || "");
    setPoNo("");
    setQuoNo(documentSequenceData?.data?.nextQuotationNo || "");
    setReceiverName("");
    setReceiverAddress("");
    setKeterangan("");
    setPenanggungjawab("");
    setJabatan("");
    setDateFrom(undefined);
    setDateTo(undefined);

    // fix: reset semua state tambahan
    setTempDateFrom(undefined);
    setTempDateTo(undefined);
    setTimeFrom("00:00:00");
    setTimeTo("23:59:59");
    setIsFromOpen(false);
    setIsToOpen(false);

    setErrMsg("");
  };

  const handleGenerate = async () => {
    setErrMsg("");

    // prevent double submit
    if (generateInvoice.isPending) return;

    if (
      !companyName ||
      !companyAddress ||
      !companyContact ||
      !invoiceNo ||
      !receiverName ||
      !receiverAddress ||
      !penanggungjawab ||
      !jabatan
    ) {
      setErrMsg(
        "Mohon lengkapi semua field bertanda (*): nama/alamat/kontak perusahaan, no. invoice, penerima, penanggungjawab, dan jabatan.",
      );
      return;
    }

    // fix: validasi tanggal
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setErrMsg(
        "Rentang tanggal tidak valid. Tanggal awal harus lebih kecil atau sama dengan tanggal akhir.",
      );
      return;
    }

    const request: GenerateInvoiceRequest = {
      companyName,
      companyAddress,
      companyContact,
      invoiceNo,
      date: dayjs().locale("id").format("DD MMMM YYYY"),
      poNo,
      quoNo,
      receiverName,
      receiverAddress,
      stockType,
      dateFrom: !dateFrom ? undefined : dateFrom.toISOString(),
      dateTo: !dateTo ? undefined : dateTo.toISOString(),
      keterangan,
      penanggungjawab,
      jabatan,
    };

    try {
      await updateCompanyProfile.mutateAsync({
        companyName,
        companyAddress,
        companyContact,
      });

      const { blob, filename } = await generateInvoice.mutateAsync(request);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // fix: delay revoke biar aman
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      toast({
        title: "Berhasil",
        description: "Invoice berhasil diunduh",
      });

      resetForm();
      setOpen(false);
    } catch (e: unknown) {
      const err = e as AxiosError<{ message?: string }>;
      let msg = "Gagal mengunduh invoice. Periksa koneksi Anda dan coba lagi.";

      const data = err.response?.data;

      // fix: safer blob parsing
      if (data instanceof Blob) {
        try {
          if (data.type === "application/json") {
            const text = await data.text();
            const parsed = JSON.parse(text) as { message?: string };
            if (parsed?.message) msg = parsed.message;
          }
        } catch {
          // ignore parsing error
        }
      } else if (data?.message) {
        msg = data.message;
      }

      if (err.response?.status === 404) {
        if (!data || !msg || msg === "Gagal mengunduh invoice. Periksa koneksi Anda dan coba lagi.") {
          msg = `Tidak ada data ${stockLabel} pada rentang tanggal yang dipilih. Coba ubah rentang tanggal atau kosongkan untuk mengambil semua data.`;
        }
      } else if (err.response?.status === 400) {
        msg =
          "Data invoice tidak valid. Periksa kembali semua field dan format data yang Anda masukkan.";
      } else if (err.response?.status && err.response.status >= 500) {
        msg =
          "Server sedang bermasalah saat men-generate invoice. Silakan coba lagi beberapa saat.";
      }

      setErrMsg(msg);

      toast({
        title: "Gagal generate invoice",
        description: msg,
        variant: "destructive",
      });
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (val) {
          refetchProfile();
          refetchSeq();
        } else {
          resetForm();
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

        <div className="space-y-5">
          {/* Data Perusahaan */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Data Perusahaan / Toko
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>
                  Nama Perusahaan
                  <RequiredInputIdentifier />
                </Label>
                <Input
                  placeholder="PT. Contoh Sejahtera"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>
                  Nomor Kontak
                  <RequiredInputIdentifier />
                </Label>
                <Input
                  placeholder="081234567890"
                  value={companyContact}
                  onChange={(e) => setCompanyContact(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>
                Alamat Perusahaan
                <RequiredInputIdentifier />
              </Label>
              <Input
                placeholder="Jl. Contoh No. 123, Jakarta"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Data Invoice */}
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
                disabled={refetchSeq == null}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Iterasi nomor
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>
                  No. Invoice
                  <RequiredInputIdentifier />
                </Label>
                <Input
                  placeholder="INV-001"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>PO No.</Label>
                <Input
                  placeholder="PO-001"
                  value={poNo}
                  onChange={(e) => setPoNo(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Quo No.</Label>
                <Input
                  placeholder="QUO-001"
                  value={quoNo}
                  onChange={(e) => setQuoNo(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Data Penerima */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Ditujukan Kepada
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>
                  Nama Penerima
                  <RequiredInputIdentifier />
                </Label>
                <Input
                  placeholder="Nama penerima"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>
                  Alamat Penerima
                  <RequiredInputIdentifier />
                </Label>
                <Input
                  placeholder="Alamat penerima"
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Filter Tanggal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Rentang Tanggal {stockLabelTitle}
            </h4>
            <p className="text-xs text-muted-foreground">
              Kosongkan untuk mengambil semua data {stockLabel}.
            </p>
            <div className="flex flex-wrap gap-2">
              <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="min-w-[180px]">
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
                          onClick={() => {
                            setDateFrom(undefined);
                            setTempDateFrom(undefined);
                            setIsFromOpen(false);
                          }}
                        >
                          Batal
                        </Button>
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={() => {
                            setDateFrom(
                              combineDateTime(tempDateFrom, timeFrom),
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
              <Popover open={isToOpen} onOpenChange={setIsToOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="min-w-[180px]">
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
                          onClick={() => {
                            setDateTo(undefined);
                            setTempDateTo(undefined);
                            setIsToOpen(false);
                          }}
                        >
                          Batal
                        </Button>
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={() => {
                            setDateTo(combineDateTime(tempDateTo, timeTo));
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
          </div>

          {/* Footer */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Keterangan & Penanggungjawab
            </h4>
            <div className="space-y-1">
              <Label>Keterangan</Label>
              <Textarea
                placeholder="Catatan tambahan (opsional)"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>
                  Nama Penanggungjawab
                  <RequiredInputIdentifier />
                </Label>
                <Input
                  placeholder="Nama penanggungjawab"
                  value={penanggungjawab}
                  onChange={(e) => setPenanggungjawab(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>
                  Jabatan
                  <RequiredInputIdentifier />
                </Label>
                <Input
                  placeholder="Jabatan"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                />
              </div>
            </div>
          </div>

          {errMsg && (
            <p className="text-sm text-destructive text-center">{errMsg}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
            disabled={generateInvoice.isPending}
          >
            Batal
          </Button>
          <Button onClick={handleGenerate} disabled={generateInvoice.isPending}>
            {generateInvoice.isPending ? (
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
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDialog;

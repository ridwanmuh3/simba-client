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
import { Calendar, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { useGenerateInvoice, GenerateInvoiceRequest } from "@/api/items";
import { toast } from "@/hooks/use-toast";
import { formatDateTable } from "@/lib/date-utils";
import RequiredInputIdentifier from "@/components/shared/RequiredInputIdentifier";
import dayjs from "dayjs";

const InvoiceDialog = () => {
  const [open, setOpen] = useState(false);
  const generateInvoice = useGenerateInvoice();

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

  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState<Date | undefined>();
  const [tempDateTo, setTempDateTo] = useState<Date | undefined>();

  const [errMsg, setErrMsg] = useState("");

  const resetForm = () => {
    setCompanyName("");
    setCompanyAddress("");
    setCompanyContact("");
    setInvoiceNo("");
    setPoNo("");
    setQuoNo("");
    setReceiverName("");
    setReceiverAddress("");
    setKeterangan("");
    setPenanggungjawab("");
    setJabatan("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setErrMsg("");
  };

  const handleGenerate = async () => {
    setErrMsg("");

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
      setErrMsg("Harap isi semua field yang wajib (*)");
      return;
    }

    const request: GenerateInvoiceRequest = {
      companyName,
      companyAddress,
      companyContact,
      invoiceNo,
      date: dayjs().format("DD MMMM YYYY"),
      poNo,
      quoNo,
      receiverName,
      receiverAddress,
      dateFrom: dateFrom ? dateFrom.toISOString() : undefined,
      dateTo: dateTo ? dateTo.toISOString() : undefined,
      keterangan,
      penanggungjawab,
      jabatan,
    };

    try {
      const blob = await generateInvoice.mutateAsync(request);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Berhasil",
        description: "Invoice berhasil diunduh",
      });

      resetForm();
      setOpen(false);
    } catch {
      setErrMsg("Gagal mengunduh invoice. Coba lagi.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetForm();
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
            Isi data invoice untuk bahan keluar. Field bertanda (*) wajib diisi.
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
            <h4 className="text-sm font-semibold text-muted-foreground">
              Detail Invoice
            </h4>
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

          {/* Filter Tanggal Bahan Keluar */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Rentang Tanggal Bahan Keluar
            </h4>
            <p className="text-xs text-muted-foreground">
              Kosongkan untuk mengambil semua data bahan keluar.
            </p>
            <div className="flex flex-wrap gap-2">
              <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="min-w-[140px]">
                    <Calendar className="w-4 h-4 mr-1" />
                    {dateFrom ? formatDateTable(dateFrom) : "Dari"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 px-4 py-2" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={tempDateFrom}
                    onSelect={setTempDateFrom}
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
                      onClick={() => {
                        setDateFrom(tempDateFrom);
                        setIsFromOpen(false);
                      }}
                    >
                      Pilih
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover open={isToOpen} onOpenChange={setIsToOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="min-w-[140px]">
                    <Calendar className="w-4 h-4 mr-1" />
                    {dateTo ? formatDateTable(dateTo) : "Sampai"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 px-4 py-2" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={tempDateTo}
                    onSelect={setTempDateTo}
                    initialFocus
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
                    <Button
                      className="w-full"
                      onClick={() => {
                        setDateTo(tempDateTo);
                        setIsToOpen(false);
                      }}
                    >
                      Pilih
                    </Button>
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
          <Button
            onClick={handleGenerate}
            disabled={generateInvoice.isPending}
          >
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

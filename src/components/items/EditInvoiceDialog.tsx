import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateInvoice } from "@/features/items/api";
import { toast } from "@/hooks/use-toast";
import RequiredInputIdentifier from "@/components/shared/RequiredInputIdentifier";
import type { InvoiceHistoryData } from "@/features/items/types";

const editSchema = z.object({
  companyName: z.string().min(2, "Nama perusahaan wajib diisi"),
  companyAddress: z.string().min(2, "Alamat perusahaan wajib diisi"),
  companyContact: z.string().min(2, "Nomor kontak wajib diisi"),
  receiverName: z.string().optional(),
  receiverAddress: z.string().optional(),
  invoiceDate: z.string().optional(),
  keterangan: z.string().optional(),
  penanggungjawab: z.string().optional(),
  jabatan: z.string().optional(),
  bankAccount: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

interface EditInvoiceDialogProps {
  invoice: InvoiceHistoryData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditInvoiceDialog = ({
  invoice,
  open,
  onOpenChange,
}: EditInvoiceDialogProps) => {
  const updateInvoice = useUpdateInvoice();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      companyName: "",
      companyAddress: "",
      companyContact: "",
      receiverName: "",
      receiverAddress: "",
      invoiceDate: "",
      keterangan: "",
      penanggungjawab: "",
      jabatan: "",
      bankAccount: "",
    },
  });

  useEffect(() => {
    if (open && invoice) {
      form.reset({
        companyName: invoice.companyName,
        companyAddress: invoice.companyAddress,
        companyContact: invoice.companyContact,
        receiverName: invoice.receiverName ?? "",
        receiverAddress: invoice.receiverAddress ?? "",
        invoiceDate: invoice.invoiceDate ?? "",
        keterangan: invoice.keterangan ?? "",
        penanggungjawab: invoice.penanggungjawab ?? "",
        jabatan: invoice.jabatan ?? "",
        bankAccount: invoice.bankAccount ?? "",
      });
    }
  }, [open, invoice]);

  const onSubmit = async (values: EditFormValues) => {
    if (!invoice) return;

    try {
      await updateInvoice.mutateAsync({
        id: invoice.id,
        request: {
          companyName: values.companyName,
          companyAddress: values.companyAddress,
          companyContact: values.companyContact,
          receiverName: values.receiverName,
          receiverAddress: values.receiverAddress,
          invoiceDate: values.invoiceDate,
          keterangan: values.keterangan,
          penanggungjawab: values.penanggungjawab,
          jabatan: values.jabatan,
          bankAccount: values.bankAccount,
        },
      });

      toast({ title: "Berhasil", description: "Invoice berhasil diperbarui" });
      onOpenChange(false);
    } catch {
      toast({
        title: "Gagal memperbarui invoice",
        description: "Terjadi kesalahan. Periksa koneksi dan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const isPending = updateInvoice.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            Perbaiki data invoice. Nomor invoice, PO, dan QUO tidak dapat
            diubah.
          </DialogDescription>
        </DialogHeader>

        {invoice && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Detail Invoice
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "No. Invoice", value: invoice.invoiceNumber },
                { label: "PO No.", value: invoice.poNumber },
                { label: "Quo No.", value: invoice.quoNumber },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-2">
                  <p className="text-sm font-medium leading-none">{label}</p>
                  <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-1 text-sm text-muted-foreground select-none">
                    {value || "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Tanggal & Penerima
              </h4>
              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Penerbitan</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: 24 April 2026" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="receiverName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Penerima</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Alamat Penerima</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                      <Textarea rows={2} {...field} />
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
                      <FormLabel>Nama Penanggungjawab</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Jabatan</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        placeholder="Nama Bank - 1234567890 a.n. Pemilik"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInvoiceDialog;

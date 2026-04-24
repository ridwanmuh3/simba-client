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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetInvoiceDetail,
  useGetAllItemsStocks,
  useGetItemCategories,
  useUpdateInvoice,
} from "@/features/items/api";
import { toast } from "@/hooks/use-toast";
import RequiredInputIdentifier from "@/components/shared/RequiredInputIdentifier";
import type { InvoiceHistoryData } from "@/features/items/types";
import { formatCurrency } from "@/lib/utils";
import { formatDateDetail } from "@/lib/date-utils";

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

const MAX_SELECTION = 6;

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

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [stockSearch, setStockSearch] = useState("");
  const [stockPage, setStockPage] = useState(1);
  const [stockCategory, setStockCategory] = useState("");

  const { data: detail, isLoading: isDetailLoading } = useGetInvoiceDetail(
    open && invoice ? invoice.id : null,
  );

  const { data: categoriesData } = useGetItemCategories();
  const categories = categoriesData ?? [];

  const stockType = invoice?.stockType ?? "OUT";
  const stockLabel = stockType === "IN" ? "bahan masuk" : "bahan keluar";

  const { data: stocksData, isLoading: isStocksLoading } = useGetAllItemsStocks(
    stockSearch,
    stockPage,
    20,
    undefined,
    undefined,
    stockType,
    stockCategory,
  );
  const stockRows = useMemo(() => stocksData?.data ?? [], [stocksData]);

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
      setSelectedIds(new Set());
      setStockSearch("");
      setStockPage(1);
      setStockCategory("");
    }
  }, [open, invoice]);

  const warnMaxExceeded = () =>
    toast({
      title: "Batas maksimal tercapai",
      description: `Maksimal ${MAX_SELECTION} bahan dapat dipilih per invoice.`,
      variant: "destructive",
    });

  const toggleId = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_SELECTION) {
          warnMaxExceeded();
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

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
          ...(selectedIds.size > 0 && { stockIds: Array.from(selectedIds) }),
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
  const currentItems = detail?.items ?? [];

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

            {/* Barang Invoice */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Barang Invoice
              </h4>

              {/* Current items snapshot */}
              {isDetailLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memuat barang...
                </div>
              ) : currentItems.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">
                    Barang saat ini:
                  </p>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="py-2 text-xs">Nama</TableHead>
                          <TableHead className="py-2 text-xs">
                            Kategori
                          </TableHead>
                          <TableHead className="py-2 text-xs text-right">
                            Jumlah
                          </TableHead>
                          <TableHead className="py-2 text-xs text-right">
                            Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentItems.map((item) => (
                          <TableRow key={item.id} className="text-xs">
                            <TableCell className="py-2 font-medium">
                              {item.itemName}
                            </TableCell>
                            <TableCell className="py-2">
                              <Badge variant="secondary">{item.category}</Badge>
                            </TableCell>
                            <TableCell className="py-2 text-right text-nowrap">
                              {item.amount} {item.measureUnit}
                            </TableCell>
                            <TableCell className="py-2 text-right text-nowrap">
                              {formatCurrency(item.totalPrice)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : null}

              {/* New items selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {currentItems.length > 0
                      ? "Pilih barang baru untuk mengganti (opsional):"
                      : `Pilih ${stockLabel} untuk invoice:`}
                  </p>
                  {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{selectedIds.size} dipilih</Badge>
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
                <div className="flex gap-2">
                  <div className="relative flex-1">
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
                  <Select
                    value={stockCategory || "__all__"}
                    onValueChange={(val) => {
                      setStockCategory(val === "__all__" ? "" : val);
                      setStockPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 text-sm w-40 shrink-0">
                      <SelectValue placeholder="Semua kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Semua kategori</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="border rounded-md overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="w-8 py-2" />
                          <TableHead className="py-2 text-xs">Tanggal</TableHead>
                          <TableHead className="py-2 text-xs">Bahan</TableHead>
                          <TableHead className="py-2 text-xs">Kategori</TableHead>
                          <TableHead className="py-2 text-xs text-right">
                            Jumlah
                          </TableHead>
                          <TableHead className="py-2 text-xs text-right">
                            Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isStocksLoading ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center text-xs text-muted-foreground py-4"
                            >
                              Memuat data...
                            </TableCell>
                          </TableRow>
                        ) : stockRows.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center text-xs text-muted-foreground py-4"
                            >
                              {stockSearch
                                ? "Tidak ada hasil pencarian"
                                : `Belum ada data ${stockLabel}`}
                            </TableCell>
                          </TableRow>
                        ) : (
                          stockRows.map((row) => (
                            <TableRow
                              key={row.id}
                              className={`cursor-pointer text-xs ${row.id && selectedIds.has(row.id) ? "bg-muted" : "hover:bg-muted/50"}`}
                              onClick={() => row.id && toggleId(row.id)}
                            >
                              <TableCell
                                className="py-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Checkbox
                                  checked={!!(row.id && selectedIds.has(row.id))}
                                  onCheckedChange={() =>
                                    row.id && toggleId(row.id)
                                  }
                                />
                              </TableCell>
                              <TableCell className="py-2 text-nowrap">
                                {row.createdAt
                                  ? formatDateDetail(new Date(row.createdAt))
                                  : "-"}
                              </TableCell>
                              <TableCell className="py-2 font-medium">
                                {row.item?.name ?? "-"}
                              </TableCell>
                              <TableCell className="py-2">
                                <Badge variant="secondary">
                                  {row.item?.category ?? "-"}
                                </Badge>
                              </TableCell>
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
                        Hal {stockPage} /{" "}
                        {stocksData?.paging?.totalPage ?? 1}
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
                          disabled={
                            stockPage >=
                            (stocksData?.paging?.totalPage ?? 1)
                          }
                          onClick={() => setStockPage((p) => p + 1)}
                        >
                          ›
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {selectedIds.size > 0 && currentItems.length > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Barang saat ini akan diganti dengan {selectedIds.size} barang
                    yang dipilih.
                  </p>
                )}
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

import { useEffect, useMemo, useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DataTablePagination from "@/components/shared/DataTablePagination";
import {
  Calendar as CalendarIcon,
  Download,
  Eye,
  MoreHorizontal,
  Search,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateDetail, formatDateTable } from "@/lib/date-utils";
import { useDownloadInvoicePDF, useGetInvoiceHistory } from "@/api/items";
import { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import type { InvoiceHistoryData } from "@/types/invoice";

const normalizeDocumentNumber = (value: string) => {
  if (!value) {
    return "-";
  }

  const matched = value.match(/^(INV|PO|QUO)-\d{4}-(\d+)$/i);
  if (!matched) {
    return value;
  }

  return `${matched[1].toUpperCase()}-${matched[2]}`;
};

const InvoiceHistoryTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState<Date | undefined>();
  const [tempDateTo, setTempDateTo] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: historyData, isLoading } = useGetInvoiceHistory(
    searchQuery,
    page,
    limit,
    dateFrom,
    dateTo,
  );
  const downloadInvoice = useDownloadInvoicePDF();

  const invoiceRows = useMemo(
    () => historyData?.data ?? [],
    [historyData?.data],
  );
  const totalPages = historyData?.paging?.totalPage || 1;
  const totalItems = historyData?.paging?.totalItem || 0;

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

  useEffect(() => {
    setPage(1);
  }, [searchQuery, dateFrom, dateTo]);

  const parseInvoiceError = async (e: unknown) => {
    const err = e as AxiosError<{ message?: string; error?: string }>;
    const data = err.response?.data;

    if (data instanceof Blob) {
      try {
        if (data.type === "application/json") {
          const text = await data.text();
          const parsed = JSON.parse(text) as {
            message?: string;
            error?: string;
          };
          return parsed?.message || parsed?.error || null;
        }
      } catch {
        return null;
      }
    } else if (data?.message || data?.error) {
      return data.message || data.error;
    }

    return null;
  };

  const handleDownloadInvoice = async (invoice: InvoiceHistoryData) => {
    if (downloadInvoice.isPending) return;
    try {
      const { blob, filename } = await downloadInvoice.mutateAsync({
        id: invoice.id,
        mode: "download",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      toast({
        title: "Berhasil",
        description: `Nota ${normalizeDocumentNumber(invoice.invoiceNumber)} berhasil diunduh.`,
      });
    } catch (e) {
      const msg =
        (await parseInvoiceError(e)) ||
        "Gagal mengunduh nota. Periksa koneksi Anda dan coba lagi.";
      toast({
        title: "Gagal unduh nota",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const handleViewInvoice = async (invoice: InvoiceHistoryData) => {
    if (downloadInvoice.isPending) return;
    try {
      const { blob } = await downloadInvoice.mutateAsync({
        id: invoice.id,
        mode: "view",
      });

      const url = window.URL.createObjectURL(blob);
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) {
        toast({
          title: "Popup diblokir",
          description:
            "Browser memblokir tab baru. Izinkan popup untuk melihat nota.",
          variant: "destructive",
        });
      }

      setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      const msg =
        (await parseInvoiceError(e)) ||
        "Gagal menampilkan nota. Periksa koneksi Anda dan coba lagi.";
      toast({
        title: "Gagal lihat nota",
        description: msg,
        variant: "destructive",
      });
    }
  };

  return (
    <TabsContent value="riwayat-invoice" className="space-y-4 px-1 md:px-2">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            Riwayat invoice
          </CardTitle>
          <CardDescription>
            Daftar invoice tersimpan dari tabel invoice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 px-6 pt-2">
            <div className="relative lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor invoice, perusahaan, PO, atau QUO"
                className="pl-9"
              />
            </div>
            <Popover open={isFromOpen} onOpenChange={handleOpenFromChange}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
                      setTempDateFrom(undefined);
                      setDateFrom(undefined);
                      setIsFromOpen(false);
                    }}
                  >
                    Batal
                  </Button>
                  <Button className="w-full" onClick={handleConfirmFrom}>
                    Pilih
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Popover open={isToOpen} onOpenChange={handleOpenToChange}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
                      setTempDateTo(undefined);
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

          <div className="relative border-y text-nowrap overflow-x-auto">
            <Table className="relative w-full">
              <TableHeader className="sticky top-0 bg-background z-10 border-b">
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>No. Invoice</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Perusahaan</TableHead>
                  <TableHead className="hidden xl:table-cell">Kontak</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    PO / QUO
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Dibuat</TableHead>
                  <TableHead className="w-12 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: 8 }).map((__, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-5 w-full rounded-md" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : invoiceRows.length > 0 ? (
                  invoiceRows.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="group transition-colors hover:bg-muted/40"
                    >
                      <TableCell>
                        {formatDateTable(invoice.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {normalizeDocumentNumber(invoice.invoiceNumber)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="whitespace-nowrap rounded-full border-0 bg-[#E6F4FF] px-3 py-1 text-xs font-semibold text-[#0070A8] hover:bg-[#E6F4FF]"
                        >
                          {invoice.stockType === "IN"
                            ? "Bahan Masuk"
                            : "Bahan Keluar"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[260px]">
                          <p className="truncate font-medium">
                            {invoice.companyName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {invoice.companyAddress}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-muted-foreground">
                        {invoice.companyContact}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {normalizeDocumentNumber(invoice.poNumber)} /{" "}
                        {normalizeDocumentNumber(invoice.quoNumber)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDateDetail(invoice.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Buka menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi Nota</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={!invoice.hasItems}
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat nota
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={!invoice.hasItems}
                              onClick={() => handleDownloadInvoice(invoice)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Unduh nota
                            </DropdownMenuItem>
                            {!invoice.hasItems && (
                              <>
                                <DropdownMenuSeparator />
                                <div className="px-2 py-1.5 text-xs text-muted-foreground max-w-[220px]">
                                  Nota lama tanpa rincian bahan tidak dapat
                                  diunduh ulang.
                                </div>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Belum ada riwayat invoice.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-2 pb-2">
            <DataTablePagination
              currentPage={page}
              pageSize={limit}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handleLimitChange}
            />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default InvoiceHistoryTab;

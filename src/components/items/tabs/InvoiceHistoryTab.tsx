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
  ChevronRight,
  ReceiptText,
  Search,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { formatDateDetail, formatDateTable } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useGetInvoiceHistory } from "@/api/items";

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

  return (
    <TabsContent value="riwayat-invoice" className="space-y-4">
      <Card className="border-border/60 bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            Riwayat invoice
          </CardTitle>
          <CardDescription>
            Daftar invoice tersimpan dari tabel invoice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
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

          <div className="overflow-hidden rounded-xl border bg-background">
            <Table>
              <TableHeader>
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
                  <TableHead className="w-8" />
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
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            invoice.stockType === "IN"
                              ? "border-success/40 text-success"
                              : "border-warning/40 text-warning",
                          )}
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
                        {invoice.poNumber || "-"} / {invoice.quoNumber || "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDateDetail(invoice.createdAt)}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
        </CardContent>
      </Card>
      <DataTablePagination
        currentPage={page}
        pageSize={limit}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handleLimitChange}
      />
    </TabsContent>
  );
};

export default InvoiceHistoryTab;

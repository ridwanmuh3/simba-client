import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Search,
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { capitalizeFirstLetterString, formatCurrency } from "@/lib/utils";
import { formatDateDetail, formatDateTable } from "@/lib/date-utils";
import { useGetAllFinances } from "@/features/finance/api";
import { FinanceData } from "@/features/finance/types";
import ImageViewer from "@/components/shared/ImageViewer";
import DataTablePagination from "@/components/shared/DataTablePagination";

interface FinanceTableProps {
  selectedFinanceId: number | null;
  onSelectFinance: (finance: FinanceData) => void;
}

export default function FinanceTable({ selectedFinanceId, onSelectFinance }: FinanceTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [openPopover, setOpenPopover] = useState<"from" | "to" | null>(null);
  const [tempDates, setTempDates] = useState<{ from?: Date; to?: Date }>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: financeData,
    isLoading,
    isError: isFinanceError,
    error: financeError,
  } = useGetAllFinances(searchQuery, page, limit, dateFrom, dateTo);

  const financeRows = useMemo(() => financeData?.data ?? [], [financeData?.data]);

  const financeErrorMessage = isFinanceError
    ? financeError instanceof Error
      ? financeError.message
      : "Tidak dapat memuat data keuangan."
    : "";

  const currentPageNetTotal = useMemo(
    () =>
      financeRows.reduce(
        (acc, row) => (row.type === "PEMASUKAN" ? acc + row.amount : acc - row.amount),
        0,
      ),
    [financeRows],
  );

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleOpenFromChange = (open: boolean) => {
    if (open) setTempDates((d) => ({ ...d, from: dateFrom }));
    setOpenPopover(open ? "from" : null);
  };

  const handleOpenToChange = (open: boolean) => {
    if (open) setTempDates((d) => ({ ...d, to: dateTo }));
    setOpenPopover(open ? "to" : null);
  };

  const handleConfirmFrom = () => {
    setDateFrom(tempDates.from);
    setPage(1);
    setOpenPopover(null);
  };

  const handleConfirmTo = () => {
    setDateTo(tempDates.to);
    setPage(1);
    setOpenPopover(null);
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari transaksi, nota, atau kategori..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
          <Popover open={openPopover === "from"} onOpenChange={handleOpenFromChange}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-1" />
                {dateFrom ? formatDateDetail(dateFrom) : "Dari"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 px-4 py-2" align="start">
              <CalendarComponent
                mode="single"
                selected={tempDates.from}
                onSelect={(d) => setTempDates((prev) => ({ ...prev, from: d }))}
                disabled={(date) => date > new Date()}
                initialFocus
              />
              <div className="flex gap-2 mt-2 mb-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => { setDateFrom(undefined); setPage(1); setOpenPopover(null); }}
                >
                  Batal
                </Button>
                <Button className="w-full" onClick={handleConfirmFrom}>Pilih</Button>
              </div>
            </PopoverContent>
          </Popover>
          <Popover open={openPopover === "to"} onOpenChange={handleOpenToChange}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-1" />
                {dateTo ? formatDateTable(dateTo) : "Sampai"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 px-4 py-2" align="start">
              <CalendarComponent
                mode="single"
                selected={tempDates.to}
                onSelect={(d) => setTempDates((prev) => ({ ...prev, to: d }))}
                initialFocus
                disabled={(date) => date > new Date()}
              />
              <div className="flex gap-2 mt-2 mb-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => { setDateTo(undefined); setPage(1); setOpenPopover(null); }}
                >
                  Batal
                </Button>
                <Button className="w-full" onClick={handleConfirmTo}>Pilih</Button>
              </div>
            </PopoverContent>
          </Popover>
          </div>
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
                  <p className="text-sm text-destructive">{financeErrorMessage}</p>
                </TableCell>
              </TableRow>
            ) : financeRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <div className="flex w-full items-center justify-center">
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 px-4">
                      <Wallet className="h-12 w-12 mb-3 opacity-50" />
                      <p className="text-sm font-medium">
                        {searchQuery ? "Tidak ada hasil pencarian" : "Data masih kosong"}
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
                    selectedFinanceId === f.id ? "bg-muted" : ""
                  } relative`}
                  onClick={() => onSelectFinance(f)}
                >
                  <TableCell>{(page - 1) * limit + index + 1}</TableCell>
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
                      <span className="font-medium block">{f.description}</span>
                      <span className="text-xs text-muted-foreground">{f.extraNote}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{f.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTable(f.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(f.amount)}</TableCell>
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
        <div className="px-2 pb-2 pt-1">
          <DataTablePagination
            currentPage={page}
            pageSize={limit}
            totalPages={financeData?.paging?.totalPage || 1}
            totalItems={financeData?.paging?.totalItem || 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handleLimitChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}

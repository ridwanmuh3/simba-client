import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportViewer } from "@/components/finance/ReportViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageViewer from "../components/shared/ImageViewer";

import {
  Search,
  Download,
  Calendar,
  ArrowDownRight,
  FileSpreadsheet,
  FileText,
  Package,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { formatCurrency } from "@/lib/utils";
import AddFinanceDialog from "@/components/finance/AddFinanceDialog";
import { useGetAllFinances } from "@/api/finance";
import { useSearchParams } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateTable } from "@/lib/date-utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  status: "completed" | "locked";
  note: string;
  category: string;
}

export default function Finance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState<Date | undefined>();
  const [tempDateTo, setTempDateTo] = useState<Date | undefined>();
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const { data: financeData, isLoading } = useGetAllFinances(
    searchQuery,
    page,
    limit,
    dateFrom,
    dateTo,
  );
  console.log(financeData?.data);
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
        <Tabs defaultValue="transactions" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="transactions">Data Keuangan</TabsTrigger>
              {/* <TabsTrigger value="reports">Laporan Harian/Mingguan</TabsTrigger> */}
            </TabsList>
            <div className="flex gap-2">
              <AddFinanceDialog />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                {/* <DropdownMenuContent>
                  <DropdownMenuItem>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                </DropdownMenuContent> */}
              </DropdownMenu>
            </div>
          </div>
          <TabsContent value="transactions">
            <Card>
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
                        {dateFrom ? formatDateTable(dateFrom) : "Dari"}
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
                        <Button className="w-full" onClick={handleConfirmFrom}>
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
              <CardContent className="p-0 relative max-h-[500px] overflow-auto border-t text-nowrap">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10 border-b">
                    <TableRow>
                      {/* <TableHead>No</TableHead> */}
                      {/* <TableHead>Jenis</TableHead> */}
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
                    ) : financeData?.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <div className="flex min-h-[400px] w-full items-center justify-center">
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 px-4">
                              <Package className="h-12 w-12 mb-3 opacity-50" />
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
                      financeData?.data?.map(
                        (f, index) =>
                          f.proofImage && (
                            <motion.tr
                              key={f.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="group"
                            >
                              {/* <TableCell>{index + 1}</TableCell> */}
                              {/* <TableCell>
                                <div className="flex items-center gap-3">
                                  {" "}
                                   <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-destructive/10 text-destructive">
                                    <ArrowDownRight className="w-4 h-4" />
                                  </div>
                                  <p>{f.description}</p>
                                </div>
                              </TableCell> */}
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
                                <Badge variant="outline">{f.category}</Badge>
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
                            </motion.tr>
                          ),
                      )
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="reports">
            <ReportViewer transactions={transactions} />
          </TabsContent> */}
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}

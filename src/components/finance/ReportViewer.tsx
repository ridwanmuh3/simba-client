import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar as CalendarIcon,
  Download,
  FileText,
  TrendingDown,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Utensils,
  ShoppingCart,
  Package,
  Truck,
  Eye,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
  note: string;
}

interface ReportViewerProps {
  transactions: Transaction[];
}

// Generate mock daily report data
const generateDailyReportData = (date: Date) => {
  const dateStr = format(date, "yyyy-MM-dd");
  const dayOfWeek = date.getDay();
  const baseAmount = 15000000 + Math.random() * 10000000;
  const portions = Math.floor(800 + Math.random() * 400);
  
  return {
    date: dateStr,
    formattedDate: format(date, "EEEE, d MMMM yyyy", { locale: id }),
    totalExpense: Math.floor(baseAmount),
    portionsServed: portions,
    categories: [
      { name: "Bahan Makanan", amount: Math.floor(baseAmount * 0.55), icon: ShoppingCart, color: "hsl(var(--chart-1))" },
      { name: "Bahan Pendukung", amount: Math.floor(baseAmount * 0.20), icon: Package, color: "hsl(var(--chart-2))" },
      { name: "Operasional", amount: Math.floor(baseAmount * 0.15), icon: Utensils, color: "hsl(var(--chart-3))" },
      { name: "Logistik", amount: Math.floor(baseAmount * 0.10), icon: Truck, color: "hsl(var(--chart-4))" },
    ],
    costPerPortion: Math.floor(baseAmount / portions),
    comparedToYesterday: dayOfWeek === 1 ? 0 : (Math.random() - 0.5) * 20,
  };
};

// Generate mock weekly report data
const generateWeeklyReportData = (weekStart: Date) => {
  const days = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  });
  
  const dailyData = days.map((day) => ({
    date: format(day, "EEE", { locale: id }),
    fullDate: format(day, "d MMM", { locale: id }),
    expense: Math.floor(15000000 + Math.random() * 10000000),
    portions: Math.floor(800 + Math.random() * 400),
  }));

  const totalExpense = dailyData.reduce((sum, d) => sum + d.expense, 0);
  const totalPortions = dailyData.reduce((sum, d) => sum + d.portions, 0);

  return {
    weekStart: format(weekStart, "d MMMM", { locale: id }),
    weekEnd: format(endOfWeek(weekStart, { weekStartsOn: 1 }), "d MMMM yyyy", { locale: id }),
    dailyData,
    totalExpense,
    totalPortions,
    avgDailyExpense: Math.floor(totalExpense / 7),
    avgDailyCost: Math.floor(totalExpense / totalPortions),
    categories: [
      { name: "Bahan Makanan", amount: Math.floor(totalExpense * 0.55), percentage: 55 },
      { name: "Bahan Pendukung", amount: Math.floor(totalExpense * 0.20), percentage: 20 },
      { name: "Operasional", amount: Math.floor(totalExpense * 0.15), percentage: 15 },
      { name: "Logistik", amount: Math.floor(totalExpense * 0.10), percentage: 10 },
    ],
  };
};

export function ReportViewer({ transactions }: ReportViewerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedWeek, setSelectedWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [activeTab, setActiveTab] = useState("daily");

  const dailyReport = generateDailyReportData(selectedDate);
  const weeklyReport = generateWeeklyReportData(selectedWeek);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatShortCurrency = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (selectedDate < tomorrow) {
      setSelectedDate(new Date(selectedDate.getTime() + 86400000));
    }
  };

  const handlePreviousWeek = () => {
    setSelectedWeek(subDays(selectedWeek, 7));
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(selectedWeek.getTime() + 86400000 * 7);
    if (nextWeek <= new Date()) {
      setSelectedWeek(nextWeek);
    }
  };

  const getDayTransactions = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return transactions.filter((tx) => tx.date === dateStr);
  };

  const dayTransactions = getDayTransactions(selectedDate);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Laporan Keuangan
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Lihat ringkasan pengeluaran harian dan mingguan
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Cetak
            </Button>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-4 pt-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="daily" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                Laporan Harian
              </TabsTrigger>
              <TabsTrigger value="weekly" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                Laporan Mingguan
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Daily Report */}
          <TabsContent value="daily" className="mt-0">
            <div className="p-4 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2 font-medium">
                        <CalendarIcon className="w-4 h-4" />
                        {dailyReport.formattedDate}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {isToday(selectedDate) && (
                    <Badge variant="secondary">Hari Ini</Badge>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextDay}
                  disabled={isToday(selectedDate)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={dailyReport.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4 space-y-4"
              >
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground mb-1">Total Pengeluaran</p>
                    <p className="text-xl font-bold text-destructive">
                      {formatCurrency(dailyReport.totalExpense)}
                    </p>
                    {dailyReport.comparedToYesterday !== 0 && (
                      <div className={cn(
                        "flex items-center gap-1 text-xs mt-1",
                        dailyReport.comparedToYesterday > 0 ? "text-destructive" : "text-success"
                      )}>
                        {dailyReport.comparedToYesterday > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(dailyReport.comparedToYesterday).toFixed(1)}% vs kemarin
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground mb-1">Porsi Terlayani</p>
                    <p className="text-xl font-bold text-primary">
                      {dailyReport.portionsServed.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">porsi makanan</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground mb-1">Biaya per Porsi</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(dailyReport.costPerPortion)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">rata-rata</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground mb-1">Transaksi</p>
                    <p className="text-xl font-bold">{dayTransactions.length || "-"}</p>
                    <p className="text-xs text-muted-foreground mt-1">tercatat</p>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="rounded-lg border overflow-hidden">
                  <div className="p-3 bg-muted/30 border-b">
                    <h4 className="font-medium text-sm">Rincian per Kategori</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {dailyReport.categories.map((cat, index) => (
                      <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{cat.name}</span>
                            <span className="text-sm font-medium">{formatCurrency(cat.amount)}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(cat.amount / dailyReport.totalExpense) * 100}%` }}
                              transition={{ delay: index * 0.1, duration: 0.5 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Day Transactions */}
                {dayTransactions.length > 0 && (
                  <div className="rounded-lg border overflow-hidden">
                    <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                      <h4 className="font-medium text-sm">Transaksi Hari Ini</h4>
                      <Badge variant="secondary">{dayTransactions.length} transaksi</Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dayTransactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell>
                              <span className="font-medium">{tx.description}</span>
                              <span className="block text-xs text-muted-foreground">{tx.note}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{tx.category}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium text-destructive">
                              -{formatCurrency(tx.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Weekly Report */}
          <TabsContent value="weekly" className="mt-0">
            <div className="p-4 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handlePreviousWeek}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="gap-2 font-medium">
                    <CalendarIcon className="w-4 h-4" />
                    {weeklyReport.weekStart} - {weeklyReport.weekEnd}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextWeek}
                  disabled={selectedWeek >= startOfWeek(new Date(), { weekStartsOn: 1 })}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={weeklyReport.weekStart}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4 space-y-4"
              >
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground mb-1">Total Pengeluaran</p>
                    <p className="text-xl font-bold text-destructive">
                      {formatCurrency(weeklyReport.totalExpense)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">7 hari</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground mb-1">Total Porsi</p>
                    <p className="text-xl font-bold text-primary">
                      {weeklyReport.totalPortions.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">porsi makanan</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground mb-1">Rata-rata Harian</p>
                    <p className="text-xl font-bold">
                      {formatShortCurrency(weeklyReport.avgDailyExpense)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">per hari</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground mb-1">Biaya per Porsi</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(weeklyReport.avgDailyCost)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">rata-rata</p>
                  </div>
                </div>

                {/* Daily Breakdown Chart */}
                <div className="rounded-lg border overflow-hidden">
                  <div className="p-3 bg-muted/30 border-b">
                    <h4 className="font-medium text-sm">Pengeluaran per Hari</h4>
                  </div>
                  <div className="p-4">
                    <div className="flex items-end justify-between gap-2 h-40">
                      {weeklyReport.dailyData.map((day, index) => {
                        const maxExpense = Math.max(...weeklyReport.dailyData.map((d) => d.expense));
                        const height = (day.expense / maxExpense) * 100;
                        
                        return (
                          <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                            <div className="text-xs font-medium text-center">
                              {formatShortCurrency(day.expense)}
                            </div>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ delay: index * 0.05, duration: 0.5 }}
                              className="w-full bg-primary/80 rounded-t-md min-h-[4px] relative group cursor-pointer hover:bg-primary transition-colors"
                            >
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border rounded shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                <div className="font-medium">{day.fullDate}</div>
                                <div>{formatCurrency(day.expense)}</div>
                                <div className="text-muted-foreground">{day.portions} porsi</div>
                              </div>
                            </motion.div>
                            <div className="text-xs text-muted-foreground font-medium">
                              {day.date}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Category Summary */}
                <div className="rounded-lg border overflow-hidden">
                  <div className="p-3 bg-muted/30 border-b">
                    <h4 className="font-medium text-sm">Ringkasan per Kategori</h4>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-center">Persentase</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weeklyReport.categories.map((cat, index) => (
                        <motion.tr
                          key={cat.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <TableCell className="font-medium">{cat.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${cat.percentage}%` }}
                                  transition={{ delay: index * 0.1, duration: 0.5 }}
                                  className="h-full bg-primary rounded-full"
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-10 text-right">
                                {cat.percentage}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(cat.amount)}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Search,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Lock,
  FileSpreadsheet,
  FileText,
  Clock,
  BarChart3,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const financeStats = [
  {
    title: "Total Pendapatan",
    value: "Rp 245.8M",
    change: "+12.5%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "Total Pengeluaran",
    value: "Rp 78.2M",
    change: "-3.2%",
    trend: "down",
    icon: TrendingDown,
  },
  {
    title: "Laba Bersih",
    value: "Rp 167.6M",
    change: "+18.3%",
    trend: "up",
    icon: Wallet,
  },
  {
    title: "Saldo Rekening",
    value: "Rp 89.4M",
    change: "+5.1%",
    trend: "up",
    icon: Wallet,
  },
];

const revenueData = [
  { month: "Jul", pendapatan: 35000000, pengeluaran: 12000000 },
  { month: "Aug", pendapatan: 42000000, pengeluaran: 15000000 },
  { month: "Sep", pendapatan: 38000000, pengeluaran: 11000000 },
  { month: "Oct", pendapatan: 45000000, pengeluaran: 14000000 },
  { month: "Nov", pendapatan: 48000000, pengeluaran: 13000000 },
  { month: "Dec", pendapatan: 52000000, pengeluaran: 16000000 },
];

const expenseCategories = [
  { name: "Operasional", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Gaji", value: 40, color: "hsl(var(--chart-2))" },
  { name: "Marketing", value: 15, color: "hsl(var(--chart-3))" },
  { name: "Lainnya", value: 10, color: "hsl(var(--chart-4))" },
];

const recentTransactions = [
  {
    id: 1,
    description: "Penjualan Laptop ASUS",
    amount: 18500000,
    type: "income",
    date: "2024-01-15",
    status: "completed",
  },
  {
    id: 2,
    description: "Pembelian Stok iPhone",
    amount: -72000000,
    type: "expense",
    date: "2024-01-14",
    status: "completed",
  },
  {
    id: 3,
    description: "Gaji Karyawan Januari",
    amount: -25000000,
    type: "expense",
    date: "2024-01-10",
    status: "completed",
  },
  {
    id: 4,
    description: "Penjualan Bulk Batik",
    amount: 15750000,
    type: "income",
    date: "2024-01-09",
    status: "completed",
  },
  {
    id: 5,
    description: "Biaya Sewa Gudang",
    amount: -8000000,
    type: "expense",
    date: "2024-01-05",
    status: "locked",
  },
];

const scheduledReports = [
  { name: "Laporan Harian", frequency: "Setiap hari", nextRun: "Besok 06:00" },
  { name: "Laporan Mingguan", frequency: "Setiap Senin", nextRun: "20 Jan 06:00" },
  { name: "Laporan Bulanan", frequency: "Setiap tanggal 1", nextRun: "1 Feb 06:00" },
];

export default function Finance() {
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Math.abs(value));
  };

  return (
    <DashboardLayout
      title="Kelola Keuangan"
      subtitle="Pantau pendapatan, pengeluaran, dan laporan keuangan"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {financeStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover-lift cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-destructive" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === "up"
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue vs Expense Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Pendapatan vs Pengeluaran
              </CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Pendapatan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-muted-foreground">Pengeluaran</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      tickFormatter={(value) => `${value / 1000000}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [
                        `Rp ${(value / 1000000).toFixed(1)}M`,
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="pendapatan"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pengeluaran"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--destructive))", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Komposisi Pengeluaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Persentase"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {expenseCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-muted-foreground">{cat.name}</span>
                    </div>
                    <span className="font-medium">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs for Transactions & Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Tabs defaultValue="transactions" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="transactions">Transaksi</TabsTrigger>
              <TabsTrigger value="reports">Laporan Terjadwal</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tarik Data Rekening
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <TabsContent value="transactions">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari transaksi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Filter Tanggal
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((tx, index) => (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                tx.type === "income"
                                  ? "bg-success/10 text-success"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {tx.type === "income" ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4" />
                              )}
                            </div>
                            <span className="font-medium">{tx.description}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tx.date}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            tx.type === "income"
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {tx.status === "locked" ? (
                            <Badge
                              variant="outline"
                              className="border-muted-foreground/30"
                            >
                              <Lock className="w-3 h-3 mr-1" />
                              Terkunci
                            </Badge>
                          ) : (
                            <Badge className="bg-success/10 text-success hover:bg-success/20 border-0">
                              Selesai
                            </Badge>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {scheduledReports.map((report, index) => (
                    <div
                      key={report.name}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.frequency}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Jadwal Berikutnya
                          </p>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {report.nextRun}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}

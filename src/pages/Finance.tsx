import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  FileSpreadsheet,
  FileText,
  Clock,
  BarChart3,
  Plus,
  Receipt,
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
    title: "Total Transaksi",
    value: "1,234",
    change: "+8.7%",
    trend: "up",
    icon: Receipt,
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

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  status: "completed" | "locked";
  note: string;
  category: string;
}

const initialTransactions: Transaction[] = [
  {
    id: 1,
    description: "Penjualan Laptop ASUS",
    amount: 18500000,
    type: "income",
    date: "2024-01-15",
    status: "completed",
    note: "Nota #INV-001 - Pembeli: PT ABC",
    category: "Penjualan",
  },
  {
    id: 2,
    description: "Pembelian Stok iPhone",
    amount: 72000000,
    type: "expense",
    date: "2024-01-14",
    status: "completed",
    note: "Nota #PO-045 - Supplier: CV Tech",
    category: "Pembelian Stok",
  },
  {
    id: 3,
    description: "Gaji Karyawan Januari",
    amount: 25000000,
    type: "expense",
    date: "2024-01-10",
    status: "completed",
    note: "Slip Gaji Januari 2024 - 5 Karyawan",
    category: "Gaji",
  },
  {
    id: 4,
    description: "Penjualan Bulk Batik",
    amount: 15750000,
    type: "income",
    date: "2024-01-09",
    status: "completed",
    note: "Nota #INV-002 - Pembeli: Toko Batik Jaya",
    category: "Penjualan",
  },
  {
    id: 5,
    description: "Biaya Sewa Gudang",
    amount: 8000000,
    type: "expense",
    date: "2024-01-05",
    status: "locked",
    note: "Kwitansi Sewa - Periode Jan 2024",
    category: "Operasional",
  },
];

const scheduledReports = [
  { name: "Laporan Harian", frequency: "Setiap hari", nextRun: "Besok 06:00" },
  { name: "Laporan Mingguan", frequency: "Setiap Senin", nextRun: "20 Jan 06:00" },
  { name: "Laporan Bulanan", frequency: "Setiap tanggal 1", nextRun: "1 Feb 06:00" },
];

const transactionCategories = [
  "Penjualan",
  "Pembelian Stok",
  "Gaji",
  "Operasional",
  "Marketing",
  "Lainnya",
];

export default function Finance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    type: "income" as "income" | "expense",
    note: "",
    category: "",
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Math.abs(value));
  };

  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      return;
    }

    const transaction: Transaction = {
      id: transactions.length + 1,
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      type: newTransaction.type,
      date: new Date().toISOString().split("T")[0],
      status: "completed",
      note: newTransaction.note,
      category: newTransaction.category,
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      description: "",
      amount: "",
      type: "income",
      note: "",
      category: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleLockTransaction = (id: number) => {
    setTransactions(
      transactions.map((tx) =>
        tx.id === id ? { ...tx, status: "locked" as const } : tx
      )
    );
  };

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Kelola Keuangan"
      subtitle="Input transaksi dari nota dan pantau laporan keuangan"
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
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Input Transaksi
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Input Transaksi dari Nota</DialogTitle>
                    <DialogDescription>
                      Masukkan data transaksi berdasarkan nota atau bukti transaksi
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Jenis Transaksi</Label>
                      <Select
                        value={newTransaction.type}
                        onValueChange={(value: "income" | "expense") =>
                          setNewTransaction({ ...newTransaction, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis transaksi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">
                            <div className="flex items-center gap-2">
                              <ArrowUpRight className="w-4 h-4 text-success" />
                              Pemasukan
                            </div>
                          </SelectItem>
                          <SelectItem value="expense">
                            <div className="flex items-center gap-2">
                              <ArrowDownRight className="w-4 h-4 text-destructive" />
                              Pengeluaran
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Select
                        value={newTransaction.category}
                        onValueChange={(value) =>
                          setNewTransaction({ ...newTransaction, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {transactionCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Deskripsi Transaksi</Label>
                      <Input
                        id="description"
                        placeholder="Contoh: Penjualan Laptop ASUS"
                        value={newTransaction.description}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Jumlah (Rp)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Contoh: 15000000"
                        value={newTransaction.amount}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            amount: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="note">Catatan Nota / Bukti Transaksi</Label>
                      <Textarea
                        id="note"
                        placeholder="Contoh: Nota #INV-001 - Pembeli: PT ABC"
                        value={newTransaction.note}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            note: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button onClick={handleAddTransaction}>
                      <Receipt className="w-4 h-4 mr-2" />
                      Simpan Transaksi
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                      placeholder="Cari transaksi, nota, atau kategori..."
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
                      <TableHead>Kategori</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx, index) => (
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
                            <div>
                              <span className="font-medium block">{tx.description}</span>
                              <span className="text-xs text-muted-foreground">{tx.note}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tx.category}</Badge>
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
                        <TableCell className="text-center">
                          {tx.status !== "locked" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLockTransaction(tx.id)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Lock className="w-4 h-4" />
                            </Button>
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
                  {scheduledReports.map((report) => (
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

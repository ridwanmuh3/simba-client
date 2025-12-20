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
  Wallet,
  ArrowDownRight,
  Lock,
  FileSpreadsheet,
  FileText,
  Clock,
  BarChart3,
  Plus,
  Receipt,
  ShoppingCart,
  Utensils,
  Package,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Bar,
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
    title: "Total Anggaran",
    value: "Rp 500.0M",
    description: "Anggaran Tahun Ini",
    icon: Wallet,
  },
  {
    title: "Total Pengeluaran",
    value: "Rp 245.8M",
    description: "49.2% dari anggaran",
    icon: ShoppingCart,
  },
  {
    title: "Sisa Anggaran",
    value: "Rp 254.2M",
    description: "50.8% tersisa",
    icon: Package,
  },
  {
    title: "Total Porsi Terlayani",
    value: "125,400",
    description: "Porsi makanan",
    icon: Utensils,
  },
];

const monthlyExpenseData = [
  { month: "Jul", bahan: 28000000, operasional: 8000000 },
  { month: "Aug", bahan: 32000000, operasional: 9000000 },
  { month: "Sep", bahan: 30000000, operasional: 7500000 },
  { month: "Oct", bahan: 35000000, operasional: 10000000 },
  { month: "Nov", bahan: 38000000, operasional: 9500000 },
  { month: "Dec", bahan: 42000000, operasional: 11000000 },
];

const expenseCategories = [
  { name: "Bahan Makanan", value: 55, color: "hsl(var(--chart-1))" },
  { name: "Bahan Pendukung", value: 20, color: "hsl(var(--chart-2))" },
  { name: "Operasional", value: 15, color: "hsl(var(--chart-3))" },
  { name: "Logistik", value: 10, color: "hsl(var(--chart-4))" },
];

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  status: "completed" | "locked";
  note: string;
  category: string;
}

const initialTransactions: Transaction[] = [
  {
    id: 1,
    description: "Pembelian Beras 500kg",
    amount: 7500000,
    date: "2024-01-15",
    status: "completed",
    note: "Nota #PO-001 - Supplier: UD Tani Makmur",
    category: "Bahan Makanan",
  },
  {
    id: 2,
    description: "Pembelian Sayuran Segar",
    amount: 3500000,
    date: "2024-01-14",
    status: "completed",
    note: "Nota #PO-002 - Supplier: Pasar Induk",
    category: "Bahan Makanan",
  },
  {
    id: 3,
    description: "Pembelian Daging Ayam 200kg",
    amount: 12000000,
    date: "2024-01-13",
    status: "completed",
    note: "Nota #PO-003 - Supplier: PT Ayam Segar",
    category: "Bahan Makanan",
  },
  {
    id: 4,
    description: "Pembelian Minyak Goreng",
    amount: 2800000,
    date: "2024-01-12",
    status: "completed",
    note: "Nota #PO-004 - Supplier: CV Mitra Oil",
    category: "Bahan Pendukung",
  },
  {
    id: 5,
    description: "Biaya Transportasi Distribusi",
    amount: 5000000,
    date: "2024-01-10",
    status: "locked",
    note: "Kwitansi Transport - Periode Jan 2024",
    category: "Logistik",
  },
  {
    id: 6,
    description: "Pembelian Gas LPG 50 Tabung",
    amount: 7500000,
    date: "2024-01-08",
    status: "locked",
    note: "Nota #PO-005 - Supplier: Agen Gas Jaya",
    category: "Operasional",
  },
];

const scheduledReports = [
  { name: "Laporan Harian", frequency: "Setiap hari", nextRun: "Besok 06:00" },
  { name: "Laporan Mingguan", frequency: "Setiap Senin", nextRun: "20 Jan 06:00" },
  { name: "Laporan Bulanan", frequency: "Setiap tanggal 1", nextRun: "1 Feb 06:00" },
];

const transactionCategories = [
  "Bahan Makanan",
  "Bahan Pendukung",
  "Operasional",
  "Logistik",
  "Peralatan",
  "Lainnya",
];

export default function Finance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
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
      date: new Date().toISOString().split("T")[0],
      status: "completed",
      note: newTransaction.note,
      category: newTransaction.category,
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      description: "",
      amount: "",
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
      subtitle="Catat pengeluaran dari nota pembelian bahan MBG"
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
                    <p className="text-sm text-muted-foreground mt-1">
                      {stat.description}
                    </p>
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
        {/* Monthly Expense Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Pengeluaran Bulanan
              </CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Bahan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chart-2" />
                  <span className="text-muted-foreground">Operasional</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyExpenseData}>
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
                    <Bar
                      dataKey="bahan"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="operasional"
                      fill="hsl(var(--chart-2))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
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
              <TabsTrigger value="transactions">Transaksi Pengeluaran</TabsTrigger>
              <TabsTrigger value="reports">Laporan Terjadwal</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Input Pengeluaran
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Input Pengeluaran dari Nota</DialogTitle>
                    <DialogDescription>
                      Catat pengeluaran pembelian bahan atau kebutuhan MBG berdasarkan nota
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Kategori Pengeluaran</Label>
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
                      <Label htmlFor="description">Deskripsi Pengeluaran</Label>
                      <Input
                        id="description"
                        placeholder="Contoh: Pembelian Beras 500kg"
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
                        placeholder="Contoh: 7500000"
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
                      <Label htmlFor="note">Catatan Nota / Bukti Pembelian</Label>
                      <Textarea
                        id="note"
                        placeholder="Contoh: Nota #PO-001 - Supplier: UD Tani Makmur"
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
                      Simpan Pengeluaran
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
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-destructive/10 text-destructive">
                              <ArrowDownRight className="w-4 h-4" />
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
                        <TableCell className="text-right font-medium text-destructive">
                          -{formatCurrency(tx.amount)}
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
                              title="Kunci transaksi"
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

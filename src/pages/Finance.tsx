import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportViewer } from "@/components/finance/ReportViewer";
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
import ImageViewer from "../components/shared/ImageViewer";
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
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
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
    if (
      !newTransaction.description ||
      !newTransaction.amount ||
      !newTransaction.category
    ) {
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
        tx.id === id ? { ...tx, status: "locked" as const } : tx,
      ),
    );
  };

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <DashboardLayout
      title="Kelola Keuangan"
      subtitle="Catat pengeluaran dari nota pembelian bahan MBG"
    >
      {/* Tabs for Transactions & Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Tabs defaultValue="transactions" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="transactions">
                Transaksi Pengeluaran
              </TabsTrigger>
              <TabsTrigger value="reports">Laporan Harian/Mingguan</TabsTrigger>
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
                      Catat pengeluaran pembelian bahan atau kebutuhan MBG
                      berdasarkan nota
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Kategori Pengeluaran</Label>
                      <Select
                        value={newTransaction.category}
                        onValueChange={(value) =>
                          setNewTransaction({
                            ...newTransaction,
                            category: value,
                          })
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
                      <Label htmlFor="note">
                        Catatan Nota / Bukti Pembelian
                      </Label>
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
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
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
                      <TableHead>No</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Bukti</TableHead>
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
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-destructive/10 text-destructive">
                              <ArrowDownRight className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-medium block">
                                {tx.description}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {tx.note}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tx.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tx.date}
                        </TableCell>
                        <TableCell className="font-medium text-destructive">
                          -{formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell>
                          <ImageViewer />
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <ReportViewer transactions={transactions} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}

import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PackagePlus,
  PackageMinus,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Pie,
  Cell,
  PieChart,
  LineChart,
  Line,
  Legend,
} from "recharts";

const stockStatsCards = [
  {
    title: "Total Bahan",
    value: "1324",
    change: "Beras Merah - 50 Kg",
    icon: Package,
    color: "primary",
  },
  {
    title: "Bahan Masuk",
    value: "1,284",
    icon: PackagePlus,
    color: "success",
  },
  {
    title: "Bahan Keluar",
    value: "24",
    icon: PackageMinus,
    color: "destructive",
  },
];

const financeStatsCards = [
  {
    title: "Total Anggaran",
    value: "Rp 5 Milyar",
    icon: Wallet,
    change: "+2% naik dari bulan lalu",
    trend: "up",
    color: "primary",
  },
  {
    title: "Anggaran Masuk",
    value: "Rp 7 Milyar",
    icon: Wallet,
    change: "+3% naik dari bulan lalu",
    trend: "up",
    color: "success",
  },
  {
    title: "Anggaran Keluar",
    value: "Rp 2 Milyar",
    icon: Wallet,
    change: "-1% turun dari bulan lalu",
    trend: "down",
    color: "destructive",
  },
];

const expenseCategories = [
  { name: "Bahan Makanan", value: 55, color: "hsl(var(--chart-1))" },
  { name: "Bahan Pendukung", value: 20, color: "hsl(var(--chart-2))" },
  { name: "Operasional", value: 15, color: "hsl(var(--chart-3))" },
  { name: "Logistik", value: 10, color: "hsl(var(--chart-4))" },
];

export const monthlyExpenseData = [
  {
    month: "Jan",
    pemasukan: 25000000, // Awal tahun anggaran turun besar
    pengeluaran: 18500000, // Belanja stok awal banyak
  },
  {
    month: "Feb",
    pemasukan: 20000000,
    pengeluaran: 16200000, // Operasional stabil
  },
  {
    month: "Mar",
    pemasukan: 22500000,
    pengeluaran: 19800000, // Harga bahan pasar naik sedikit
  },
  {
    month: "Apr",
    pemasukan: 18000000, // Pemasukan sedikit turun
    pengeluaran: 15500000, // Penghematan bahan
  },
  {
    month: "Mei",
    pemasukan: 24000000, // Ada dana tambahan cair
    pengeluaran: 21000000, // Pengeluaran meningkat (mungkin ada event)
  },
  {
    month: "Jun",
    pemasukan: 28000000, // Penutupan semester
    pengeluaran: 23500000, // Restock besar untuk bulan depan
  },
];

const recentActivities = [
  {
    action: "Bahan baru ditambahkan",
    item: "Beras Premium 50kg",
    time: "5 menit lalu",
    type: "add",
  },
  {
    action: "Stok diperbarui",
    item: "Telur Ayam - 500 butir",
    time: "15 menit lalu",
    type: "update",
  },
  {
    action: "Operator baru terdaftar",
    item: "dapur_central@mbg.com",
    time: "1 jam lalu",
    type: "user",
  },
  {
    action: "Export laporan bahan",
    item: "Format Excel",
    time: "2 jam lalu",
    type: "export",
  },
];

export default function Dashboard() {
  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Selamat datang kembali! Berikut ringkasan data terbaru."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {stockStatsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="h-full" /* 1. Tambahkan h-full di sini */
          >
            {/* 2. Hapus h-fit, ganti dengan h-full */}
            <Card className="hover-lift cursor-pointer h-full flex flex-col justify-between">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm font-medium">{stat.change}</span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      stat.color === "primary"
                        ? "bg-primary/10 text-primary"
                        : stat.color === "success"
                          ? "bg-success/10 text-success"
                          : stat.color === "warning"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {financeStatsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="h-full" /* 3. Tambahkan h-full di sini juga */
          >
            {/* 4. Tambahkan h-full di sini */}
            <Card className="hover-lift cursor-pointer h-full flex flex-col justify-between">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center mt-2 gap-1.5">
                      <span>
                        {stat.trend === "up" ? (
                          <TrendingUp className="text-green-500 size-4" />
                        ) : (
                          <TrendingDown className="text-red-500 size-4" />
                        )}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === "up"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      stat.color === "primary"
                        ? "bg-primary/10 text-primary"
                        : stat.color === "success"
                          ? "bg-success/10 text-success"
                          : stat.color === "warning"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Anggaran Bulanan
              </CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-chart-2" />
                  <span className="text-muted-foreground">Masuk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-chart-5" />
                  <span className="text-muted-foreground">Keluar</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyExpenseData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      dy={10} // Memberi jarak sedikit ke bawah
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      dx={-10} // Memberi jarak sedikit ke kiri
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                      tickFormatter={(value) => `${value / 1000000}M`}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--card-foreground))",
                      }}
                      formatter={(value: number) => [
                        `Rp ${(value / 1000000).toFixed(1)}M`,
                      ]}
                    />

                    {/* Menampilkan Legenda (Petunjuk Warna) */}
                    {/* <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-sm text-muted-foreground capitalize">
                          {value}
                        </span>
                      )}
                    /> */}

                    {/* Garis 1: Pemasukan (Anggaran Masuk) */}
                    <Line
                      type="monotone" // Membuat garis melengkung halus
                      dataKey="pemasukan" // Pastikan field ini ada di JSON data Anda
                      name="Pemasukan"
                      stroke="hsl(var(--chart-2))" // Warna garis
                      strokeWidth={3}
                      dot={false} // Hilangkan titik data jika terlalu ramai
                      activeDot={{ r: 6, strokeWidth: 0 }} // Titik saat di-hover
                    />

                    {/* Garis 2: Pengeluaran (Anggaran Keluar) */}
                    <Line
                      type="monotone"
                      dataKey="pengeluaran" // Pastikan field ini ada di JSON data Anda
                      name="Pengeluaran"
                      stroke="hsl(var(--chart-5))" // Warna garis (merah/chart-2)
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
                  <div
                    key={cat.name}
                    className="flex items-center justify-between text-sm"
                  >
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

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === "add"
                        ? "bg-success/10 text-success"
                        : activity.type === "update"
                          ? "bg-primary/10 text-primary"
                          : activity.type === "user"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {activity.type === "add" && <Package className="w-5 h-5" />}
                    {activity.type === "update" && (
                      <Wallet className="w-5 h-5" />
                    )}
                    {activity.type === "user" && <Users className="w-5 h-5" />}
                    {activity.type === "export" && (
                      <BarChart3 className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.item}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}

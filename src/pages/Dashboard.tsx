import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  PackagePlus,
  PackageMinus,
  LineChartIcon,
  PieChartIcon,
  ActivityIcon,
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
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import Spinner from "@/components/shared/Spinner";
import { formatDateRelative } from "@/lib/date-utils";
import { formatCurrency } from "@/lib/utils";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <Spinner />
      </DashboardLayout>
    );
  }

  const stockStatsCards = [
    {
      title: "Total Bahan",
      value: (dashboard?.data?.totalItems ?? 0).toLocaleString("id-ID"),
      change: "Berdasarkan seluruh data",
      icon: Package,
      color: "primary",
    },
    {
      title: "Stok Bahan Masuk",
      value: (dashboard?.data?.stockIn ?? 0).toLocaleString("id-ID"),
      icon: PackagePlus,
      color: "success",
    },
    {
      title: "Stok Bahan Keluar",
      value: (dashboard?.data?.stockOut ?? 0).toLocaleString("id-ID"),
      icon: PackageMinus,
      color: "destructive",
    },
  ];

  const financeStatsCards = [
    {
      title: "Total Anggaran",
      value: formatCurrency(dashboard?.data?.totalBudget ?? 0),
      icon: Wallet,
      trend: "up",
      change: "Akumulasi anggaran",
      color: "primary",
    },
    {
      title: "Anggaran Masuk",
      value: formatCurrency(dashboard?.data?.budgetIn ?? 0),
      icon: Wallet,
      trend: "up",
      change: "Dana diterima",
      color: "success",
    },
    {
      title: "Anggaran Keluar",
      value: formatCurrency(dashboard?.data?.budgetOut ?? 0),
      icon: Wallet,
      trend: "down",
      change: "Realisasi belanja",
      color: "destructive",
    },
  ];

  const recentActivities = dashboard?.data?.systemActivities ?? [];

  const totalExpense =
    dashboard?.data?.expenseComposition?.reduce(
      (sum, e) => sum + e.amount,
      0,
    ) ?? 0;

  const expenseCategories =
    dashboard?.data?.expenseComposition?.map((e, index) => ({
      name: e.category,
      value:
        totalExpense > 0
          ? Number(((e.amount / totalExpense) * 100).toFixed(1))
          : 0,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    })) ?? [];

  const monthlyExpenseData =
    dashboard?.data?.monthlyBudget?.map((m) => ({
      month: m.month,
      pemasukan: m.in,
      pengeluaran: m.out,
    })) ?? [];
  console.log(dashboard?.data?.monthlyBudget);
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
                {monthlyExpenseData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyExpenseData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="month"
                        interval="preserveStartEnd"
                        minTickGap={20}
                      />

                      <YAxis
                        domain={["auto", "auto"]}
                        tickFormatter={(v) =>
                          `${(v / 1_000_000).toFixed(0)} Juta`
                        }
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--card-foreground))",
                        }}
                        formatter={(value: number) => [
                          formatCurrency(value),
                          "Jumlah",
                        ]}
                      />

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
                ) : (
                  <div className="flex items-center justify-center flex-col gap-2 h-full">
                    <LineChartIcon className="size-8 text-muted-foreground" />
                    <p className="text-center w-full  text-muted-foreground">
                      Data masih kosong
                    </p>
                  </div>
                )}
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
              {expenseCategories.length > 0 ? (
                <>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={0}
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
                          formatter={(value: number) => [
                            `${value}%`,
                            "Persentase",
                          ]}
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
                          <span className="text-muted-foreground">
                            {cat.name}
                          </span>
                        </div>
                        <span className="font-medium">{cat.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center flex-col gap-2 h-full">
                  <PieChartIcon className="size-8 text-muted-foreground" />
                  <p className="text-center w-full  text-muted-foreground">
                    Data masih kosong
                  </p>
                </div>
              )}
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
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type.includes("ADD")
                          ? "bg-success/10 text-success"
                          : activity.type.includes("UPDATE")
                            ? "bg-primary/10 text-primary"
                            : activity.type.includes("USER")
                              ? "bg-warning/10 text-warning"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {/* {activity.type.includes("ITEM") ? (
                        <Package className="w-5 h-5" />
                      ) : activity.type.includes("UPDATE") ? (
                        <Wallet className="w-5 h-5" />
                      ) : activity.type.includes("USER") ? (
                        <Users className="w-5 h-5" />
                      ) : ( */}
                      {activity.type && <ActivityIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDateRelative(activity.createdAt)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center flex-col gap-2 h-full">
                  <ActivityIcon className="size-8 text-muted-foreground" />
                  <p className="text-center w-full  text-muted-foreground">
                    Belum ada aktivitas
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}

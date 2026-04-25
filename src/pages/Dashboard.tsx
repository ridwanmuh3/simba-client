import DashboardLayout from "@/components/layout/DashboardLayout";
import { Package, Wallet, PackagePlus, PackageMinus } from "lucide-react";
import { useDashboardStats } from "@/features/dashboard/api";
import { formatCurrency } from "@/lib/utils";
import SystemActivity from "@/components/dashboard/SystemActivity";
import MonthlyExpenseCharts from "@/components/dashboard/MonthlyCharts";
import DashboardStatsCards from "@/components/dashboard/DashboardStatsCards";
import { BudgetStats, StockStats } from "@/features/dashboard/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const DashboardSkeleton = () => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card className="lg:col-span-2">
        <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
        <CardContent><Skeleton className="h-[300px] w-full rounded-lg" /></CardContent>
      </Card>
      <Card>
        <CardHeader><Skeleton className="h-5 w-44" /></CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
              <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </>
);

const Dashboard = () => {
  const { data: dashboard, isLoading, isError, error } = useDashboardStats();

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (isError || !dashboard) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex h-[50vh] items-center justify-center text-destructive">
          <p>
            Gagal memuat data dashboard:{" "}
            {error instanceof Error ? error.message : "Terjadi kesalahan"}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const {
    totalItems = 0,
    stockIn = 0,
    stockOut = 0,
    totalBudget = 0,
    budgetIn = 0,
    budgetOut = 0,
    systemActivities = [],
    expenseComposition = [],
    monthlyBudget = [],
  } = dashboard;

  const stockStats: StockStats[] = [
    {
      title: "Total Bahan",
      value: totalItems.toLocaleString("id-ID"),
      icon: Package,
      color: "primary",
    },
    {
      title: "Stok Bahan Masuk",
      value: stockIn.toLocaleString("id-ID", { maximumFractionDigits: 4 }),
      icon: PackagePlus,
      color: "success",
    },
    {
      title: "Stok Bahan Keluar",
      value: stockOut.toLocaleString("id-ID", { maximumFractionDigits: 4 }),
      icon: PackageMinus,
      color: "destructive",
    },
  ];

  const budgetStats: BudgetStats[] = [
    {
      title: "Total Anggaran (1 Tahun)",
      value: formatCurrency(totalBudget),
      icon: Wallet,
      color: "primary",
    },
    {
      title: "Anggaran Masuk (1 Tahun)",
      value: formatCurrency(budgetIn),
      icon: Wallet,
      color: "success",
    },
    {
      title: "Anggaran Keluar (1 Tahun)",
      value: formatCurrency(budgetOut),
      icon: Wallet,
      color: "destructive",
    },
  ];

  const safeExpenseComposition = expenseComposition || [];
  const safeMonthlyBudget = monthlyBudget || [];
  const safeSystemActivities = systemActivities || [];
  const total = safeExpenseComposition?.reduce((sum, e) => sum + e.amount, 0);

  const expenseCategories =
    total > 0
      ? safeExpenseComposition?.map((e, index) => ({
          name: e.category,
          value: Number(((e.amount / total) * 100).toFixed(1)),
          color: `hsl(var(--chart-${(index % 5) + 1}))`,
        }))
      : [];

  const monthlyExpenseData = safeMonthlyBudget?.map((m) => ({
    month: m.month,
    pemasukan: m.in,
    pengeluaran: m.out,
  }));

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Selamat datang! Berikut ringkasan data keuangan dan barang terbaru."
    >
      <DashboardStatsCards stockStats={stockStats} budgetStats={budgetStats} />
      <MonthlyExpenseCharts
        monthlyExpense={monthlyExpenseData}
        expenseCategories={expenseCategories}
      />
      <SystemActivity activities={safeSystemActivities} />
    </DashboardLayout>
  );
};

export default Dashboard;

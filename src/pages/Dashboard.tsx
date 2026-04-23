import DashboardLayout from "@/components/layout/DashboardLayout";
import { Package, Wallet, PackagePlus, PackageMinus } from "lucide-react";
import { useDashboardStats } from "@/features/dashboard/api";
import Spinner from "@/components/shared/Spinner";
import { formatCurrency } from "@/lib/utils";
import SystemActivity from "@/components/dashboard/SystemActivity";
import MonthlyExpenseCharts from "@/components/dashboard/MonthlyCharts";
import DashboardStatsCards from "@/components/dashboard/DashboardStatsCards";
import { BudgetStats, StockStats } from "@/features/dashboard/types";

const Dashboard = () => {
  const { data: dashboard, isLoading, isError, error } = useDashboardStats();

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <Spinner />
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

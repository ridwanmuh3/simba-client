import DashboardLayout from "@/components/layout/DashboardLayout";
import { Package, Wallet, PackagePlus, PackageMinus } from "lucide-react";
import { useDashboardStats } from "@/api/dashboard";
import Spinner from "@/components/shared/Spinner";
import { formatCurrency } from "@/lib/utils";
import SystemActivity from "@/components/dashboard/SystemActivity";
import MonthlyExpenseCharts from "@/components/dashboard/MonthlyCharts";
import DashboardStatsCards from "@/components/dashboard/DashboardStatsCards";
import { BudgetStats, StockStats } from "@/types/dashboard";

const Dashboard = () => {
  const { data: dashboard, isLoading } = useDashboardStats();

  if (isLoading || !dashboard) {
    return (
      <DashboardLayout title="Dashboard">
        <Spinner />
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
      change: "Berdasarkan seluruh data",
      icon: Package,
      color: "primary",
    },
    {
      title: "Stok Bahan Masuk",
      value: stockIn.toLocaleString("id-ID"),
      icon: PackagePlus,
      color: "success",
    },
    {
      title: "Stok Bahan Keluar",
      value: stockOut.toLocaleString("id-ID"),
      icon: PackageMinus,
      color: "destructive",
    },
  ];

  const budgetStats: BudgetStats[] = [
    {
      title: "Total Anggaran",
      value: formatCurrency(totalBudget),
      icon: Wallet,
      trend: "up",
      change: "Akumulasi anggaran",
      color: "primary",
    },
    {
      title: "Anggaran Masuk",
      value: formatCurrency(budgetIn),
      icon: Wallet,
      trend: "up",
      change: "Dana diterima",
      color: "success",
    },
    {
      title: "Anggaran Keluar",
      value: formatCurrency(budgetOut),
      icon: Wallet,
      trend: "down",
      change: "Realisasi belanja",
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

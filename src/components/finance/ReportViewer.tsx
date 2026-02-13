"use client";

import { useMemo, useState } from "react";
import {
  format,
  isSameDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subDays,
} from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
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
import { Wallet } from "lucide-react";

export interface FinanceData {
  id?: number;
  type?: string;
  category?: string;
  description?: string;
  amount?: number;
  proofImage?: string;
  extraNote?: string;
  createdAt?: string;
}

interface ReportViewerProps {
  transactions: FinanceData[];
}

export default function ReportViewer({ transactions }: ReportViewerProps) {
  const [tab, setTab] = useState("daily");
  const today = new Date();

  // =========================
  // FILTER PERIODE
  // =========================

  const dailyTransactions = useMemo(() => {
    return transactions.filter((tx) =>
      tx.createdAt ? isSameDay(new Date(tx.createdAt), today) : false,
    );
  }, [transactions]);

  const tenDaysStart = subDays(today, 9);
  const tenDaysEnd = today;

  const tenDaysTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (!tx.createdAt) return false;
      const d = new Date(tx.createdAt);
      return d >= tenDaysStart && d <= tenDaysEnd;
    });
  }, [transactions]);

  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (!tx.createdAt) return false;
      const d = new Date(tx.createdAt);
      return d >= monthStart && d <= monthEnd;
    });
  }, [transactions]);

  // =========================
  // SUMMARY
  // =========================

  const calculateSummary = (data: FinanceData[]) => {
    const totalIn = data
      .filter((t) => t.type === "PEMASUKAN")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalOut = data
      .filter((t) => t.type === "PENGELUARAN")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      totalIn,
      totalOut,
      profit: totalIn - totalOut,
      count: data.length,
    };
  };

  const dailySummary = calculateSummary(dailyTransactions);
  const tenDaysSummary = calculateSummary(tenDaysTransactions);
  const monthlySummary = calculateSummary(monthlyTransactions);

  // =========================
  // TREND DATA
  // =========================

  const tenDaysTrend = useMemo(() => {
    const days = eachDayOfInterval({
      start: tenDaysStart,
      end: tenDaysEnd,
    });

    return days.map((day) => {
      const dayTx = tenDaysTransactions.filter(
        (tx) => tx.createdAt && isSameDay(new Date(tx.createdAt), day),
      );

      const masuk = dayTx
        .filter((t) => t.type === "PEMASUKAN")
        .reduce((s, t) => s + (t.amount || 0), 0);

      const keluar = dayTx
        .filter((t) => t.type === "PENGELUARAN")
        .reduce((s, t) => s + (t.amount || 0), 0);

      return {
        label: format(day, "EEEE", { locale: id }),
        masuk,
        keluar,
      };
    });
  }, [tenDaysTransactions]);

  const monthlyTrend = useMemo(() => {
    return [
      {
        label: format(today, "MMMM yyyy", { locale: id }),
        masuk: monthlySummary.totalIn,
        keluar: monthlySummary.totalOut,
      },
    ];
  }, [monthlySummary]);

  // =========================
  // CATEGORY BREAKDOWN
  // =========================

  const categoryBreakdown = (data: FinanceData[]) => {
    const grouped: Record<string, number> = {};

    data
      .filter((t) => t.type === "PENGELUARAN")
      .forEach((t) => {
        const key = t.category || "Lainnya";
        grouped[key] = (grouped[key] || 0) + (t.amount || 0);
      });

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const dailyCategory = categoryBreakdown(dailyTransactions);
  const tenDaysCategory = categoryBreakdown(tenDaysTransactions);
  const monthlyCategory = categoryBreakdown(monthlyTransactions);

  // =========================
  // COMPONENT REUSABLE
  // =========================

  const SummarySection = ({ summary }: any) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Pemasukan</p>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(summary.totalIn)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Pengeluaran</p>
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(summary.totalOut)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Laba / Rugi</p>
          <p
            className={`text-lg font-bold ${
              summary.profit >= 0 ? "text-chart-1" : "text-chart-2"
            }`}
          >
            {formatCurrency(summary.profit)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Transaksi</p>
          <p className="text-lg font-bold">{summary.count}</p>
        </CardContent>
      </Card>
    </div>
  );

  const ChartSection = ({ data }: any) => (
    <Card className="lg:col-span-2">
      <CardContent className="p-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(v) => `${(v / 100_000).toFixed(0)} Rb`}
            />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Line
              type="monotone"
              dataKey="masuk"
              stroke="hsl(var(--chart-2))"
              strokeWidth={3}
            />
            <Line
              type="monotone"
              dataKey="keluar"
              stroke="hsl(var(--chart-5))"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const CategorySection = ({ data }: any) => {
    const total = data.reduce((sum: number, item: any) => sum + item.value, 0);

    return (
      <Card className="md:col-span-1">
        <CardContent className="p-4">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-center flex-col text-muted-foreground py-12 px-4">
              <Wallet className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-muted-foreground font-medium text-sm">
                Data masih kosong
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* DONUT CHART */}
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={0}
                    >
                      {data.map((_: any, index: number) => (
                        <Cell
                          key={index}
                          fill={`hsl(var(--chart-${index + 1}))`}
                        />
                      ))}
                    </Pie>

                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* LEGEND CUSTOM */}
              <div className="space-y-4">
                {data.map((item: any, index: number) => {
                  const percentage = ((item.value / total) * 100).toFixed(1);

                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: `hsl(var(--chart-${index + 1}))`,
                          }}
                        />
                        <span>{item.name}</span>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.value)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {percentage}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // =========================
  // RENDER
  // =========================

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Laporan Keuangan</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 max-w-lg mb-6">
            <TabsTrigger value="daily">Harian</TabsTrigger>
            <TabsTrigger value="tenDays">Per 10 Hari</TabsTrigger>
            <TabsTrigger value="monthly">Bulanan</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            <SummarySection summary={dailySummary} />
            <div className="space-y-4">
              <ChartSection
                data={[
                  {
                    label: format(today, "dd MMM"),
                    masuk: dailySummary.totalIn,
                    keluar: dailySummary.totalOut,
                  },
                ]}
              />
              <CategorySection data={dailyCategory} />
            </div>
          </TabsContent>

          <TabsContent value="tenDays" className="space-y-6">
            <SummarySection summary={tenDaysSummary} />
            <div className="space-y-4">
              <ChartSection data={tenDaysTrend} />
              <CategorySection data={tenDaysCategory} />
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <SummarySection summary={monthlySummary} />
            <div className="space-y-4">
              <ChartSection data={monthlyTrend} />
              <CategorySection data={monthlyCategory} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

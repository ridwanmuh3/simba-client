"use client";

import { memo, useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import {
  Line,
  LineChart,
  Pie,
  PieChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFinanceReport } from "@/features/finance/hooks";
import type {
  FinanceCategoryPoint,
  FinanceData,
  FinanceSummary,
  FinanceTrendPoint,
} from "@/features/finance/types";

type ReportTab = "daily" | "tenDays" | "monthly";

interface ReportViewerProps {
  transactions: FinanceData[];
}

interface SummarySectionProps {
  summary: FinanceSummary;
}

interface TrendChartSectionProps {
  data: FinanceTrendPoint[];
}

interface CategorySectionProps {
  data: FinanceCategoryPoint[];
}

const isReportTab = (value: string): value is ReportTab =>
  value === "daily" || value === "tenDays" || value === "monthly";

const SummarySection = memo(function SummarySection({
  summary,
}: SummarySectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
});

const TrendChartSection = memo(function TrendChartSection({
  data,
}: TrendChartSectionProps) {
  return (
    <Card className="lg:col-span-2">
      <CardContent className="h-[300px] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(value: number) =>
                `${(value / 100_000).toFixed(0)} Rb`
              }
            />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
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
});

const CategorySection = memo(function CategorySection({ data }: CategorySectionProps) {
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data],
  );

  if (data.length === 0) {
    return (
      <Card className="md:col-span-1">
        <CardContent className="p-4">
          <div className="flex h-[300px] flex-col items-center justify-center px-4 py-12 text-center text-muted-foreground">
            <Wallet className="mb-3 h-12 w-12 opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">
              Data masih kosong
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-1">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
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
                  {data.map((item, index) => (
                    <Cell
                      key={`${item.name}-${index}`}
                      fill={`hsl(var(--chart-${index + 1}))`}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {data.map((item, index) => {
              const percentage =
                total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";

              return (
                <div
                  key={`${item.name}-legend-${index}`}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: `hsl(var(--chart-${index + 1}))`,
                      }}
                    />
                    <span>{item.name}</span>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.value)}</p>
                    <p className="text-xs text-muted-foreground">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default function ReportViewer({ transactions }: ReportViewerProps) {
  const [tab, setTab] = useState<ReportTab>("daily");
  const reportDate = useMemo(() => new Date(), []);
  const {
    dailySummary,
    tenDaysSummary,
    monthlySummary,
    dailyTrend,
    tenDaysTrend,
    monthlyTrend,
    dailyCategory,
    tenDaysCategory,
    monthlyCategory,
  } = useFinanceReport(transactions, reportDate);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Laporan Keuangan</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs
          value={tab}
          onValueChange={(value) => {
            if (isReportTab(value)) {
              setTab(value);
            }
          }}
        >
          <TabsList className="mb-6 grid max-w-lg grid-cols-3">
            <TabsTrigger value="daily">Harian</TabsTrigger>
            <TabsTrigger value="tenDays">Per 10 Hari</TabsTrigger>
            <TabsTrigger value="monthly">Bulanan</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            <SummarySection summary={dailySummary} />
            <div className="space-y-4">
              <TrendChartSection data={dailyTrend} />
              <CategorySection data={dailyCategory} />
            </div>
          </TabsContent>

          <TabsContent value="tenDays" className="space-y-6">
            <SummarySection summary={tenDaysSummary} />
            <div className="space-y-4">
              <TrendChartSection data={tenDaysTrend} />
              <CategorySection data={tenDaysCategory} />
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <SummarySection summary={monthlySummary} />
            <div className="space-y-4">
              <TrendChartSection data={monthlyTrend} />
              <CategorySection data={monthlyCategory} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

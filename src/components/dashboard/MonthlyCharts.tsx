import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChartIcon, PieChartIcon } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Pie,
  Cell,
  PieChart,
  LineChart,
  Line,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { ExpenseItem, MonthlyBudget } from "@/types/dashboard";

interface ExpenseItemChart {
  name?: string;
  value?: number;
  color?: string;
}

interface MonthlyExpenseChartsProps {
  monthlyExpense: MonthlyBudget[];
  expenseCategories: ExpenseItemChart[];
}

const MonthlyExpenseCharts = ({
  monthlyExpense,
  expenseCategories,
}: MonthlyExpenseChartsProps) => {
  return (
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
              {monthlyExpense.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyExpense}>
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
                    <Line
                      type="monotone"
                      dataKey="pemasukan"
                      name="Pemasukan"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pengeluaran"
                      name="Pengeluaran"
                      stroke="hsl(var(--chart-5))"
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
  );
};

export default MonthlyExpenseCharts;

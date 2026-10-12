import { Card, CardContent } from "@/components/ui/card";
import { BudgetStats, StockStats } from "@/features/dashboard/types";

interface DashboardStatsCardsProps {
  stockStats: StockStats[];
  budgetStats: BudgetStats[];
}

const colorClass = (color?: string) =>
  color === "success"
    ? "bg-success/10 text-success"
    : color === "warning"
      ? "bg-warning/10 text-warning"
      : color === "destructive"
        ? "bg-destructive/10 text-destructive"
        : "bg-primary/10 text-primary";

const StatItem = ({ stat }: { stat: StockStats | BudgetStats }) => (
  <div className="flex items-center gap-3">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass(stat.color)}`}>
      {stat.icon && <stat.icon className="w-4 h-4" />}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
      <p className="text-base font-bold tabular-nums">{stat.value}</p>
    </div>
  </div>
);

const DashboardStatsCards = ({ stockStats, budgetStats }: DashboardStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm font-semibold">Stok Bahan</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {stockStats.map((stat) => (
              <StatItem key={stat.title} stat={stat} />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm font-semibold">Anggaran</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {budgetStats.map((stat) => (
              <StatItem key={stat.title} stat={stat} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStatsCards;

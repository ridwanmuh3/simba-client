import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { BudgetStats, StockStats } from "@/types/dashboard";

interface DashboardStatsCardsProps {
  stockStats: StockStats[];
  budgetStats: BudgetStats[];
}

const DashboardStatsCards = ({
  stockStats,
  budgetStats,
}: DashboardStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {stockStats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="h-full"
        >
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
      {budgetStats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="h-full"
        >
          <Card className="hover-lift cursor-pointer h-full flex flex-col justify-between">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {/* <div className="flex items-center mt-2 gap-1.5">
                    <span>
                      {stat.trend === "up" ? (
                        <TrendingUp className="text-green-500 size-4" />
                      ) : (
                        <TrendingDown className="text-red-500 size-4" />
                      )}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === "up" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div> */}
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
  );
};

export default DashboardStatsCards;

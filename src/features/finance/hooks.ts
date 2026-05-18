import dayjs from "dayjs";
import "dayjs/locale/id";
import { useMemo } from "react";
import {
  FinanceCategoryPoint,
  FinanceData,
  FinanceSummary,
  FinanceTrendPoint,
} from "./types";

interface FinanceReportData {
  dailySummary: FinanceSummary;
  tenDaysSummary: FinanceSummary;
  monthlySummary: FinanceSummary;
  dailyTrend: FinanceTrendPoint[];
  tenDaysTrend: FinanceTrendPoint[];
  monthlyTrend: FinanceTrendPoint[];
  dailyCategory: FinanceCategoryPoint[];
  tenDaysCategory: FinanceCategoryPoint[];
  monthlyCategory: FinanceCategoryPoint[];
}

const eachDayOfInterval = (start: Date, end: Date): Date[] => {
  const days: Date[] = [];
  let current = dayjs(start).startOf("day");
  const endDay = dayjs(end).startOf("day");
  while (!current.isAfter(endDay)) {
    days.push(current.toDate());
    current = current.add(1, "day");
  }
  return days;
};

const calculateSummary = (data: FinanceData[]): FinanceSummary => {
  const totalIn = data
    .filter((t) => t.type === "PEMASUKAN")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOut = data
    .filter((t) => t.type === "PENGELUARAN")
    .reduce((sum, t) => sum + t.amount, 0);
  return { totalIn, totalOut, profit: totalIn - totalOut, count: data.length };
};

const calculateCategoryBreakdown = (data: FinanceData[]): FinanceCategoryPoint[] => {
  const grouped = data.reduce<Record<string, number>>((acc, t) => {
    if (t.type !== "PENGELUARAN") return acc;
    const name = t.category || "Lainnya";
    acc[name] = (acc[name] ?? 0) + t.amount;
    return acc;
  }, {});
  return Object.entries(grouped).map(([name, value]) => ({ name, value }));
};

export const useFinanceReport = (
  transactions: FinanceData[],
  reportDate: Date,
): FinanceReportData => {
  return useMemo(() => {
    const tenDaysStart = dayjs(reportDate).subtract(9, "day").startOf("day").toDate();
    const tenDaysEnd = dayjs(reportDate).endOf("day").toDate();
    const monthStart = dayjs(reportDate).startOf("month").toDate();
    const monthEnd = dayjs(reportDate).endOf("month").toDate();

    const dailyTransactions = transactions.filter((t) =>
      dayjs(t.createdAt).isSame(reportDate, "day"),
    );
    const tenDaysTransactions = transactions.filter((t) => {
      const d = new Date(t.createdAt);
      return d >= tenDaysStart && d <= tenDaysEnd;
    });
    const monthlyTransactions = transactions.filter((t) => {
      const d = new Date(t.createdAt);
      return d >= monthStart && d <= monthEnd;
    });

    const dailyTrend: FinanceTrendPoint[] = Array.from(
      { length: 24 },
      (_, hour) => {
        const hourTx = dailyTransactions.filter(
          (t) => dayjs(t.createdAt).hour() === hour,
        );
        const masuk = hourTx
          .filter((t) => t.type === "PEMASUKAN")
          .reduce((sum, t) => sum + t.amount, 0);
        const keluar = hourTx
          .filter((t) => t.type === "PENGELUARAN")
          .reduce((sum, t) => sum + t.amount, 0);
        return { label: `${String(hour).padStart(2, "0")}:00`, masuk, keluar };
      },
    );

    const tenDaysTrend = eachDayOfInterval(tenDaysStart, tenDaysEnd).map((day) => {
      const dayTx = tenDaysTransactions.filter((t) =>
        dayjs(t.createdAt).isSame(day, "day"),
      );
      const masuk = dayTx
        .filter((t) => t.type === "PEMASUKAN")
        .reduce((sum, t) => sum + t.amount, 0);
      const keluar = dayTx
        .filter((t) => t.type === "PENGELUARAN")
        .reduce((sum, t) => sum + t.amount, 0);
      return { label: dayjs(day).locale("id").format("DD MMM"), masuk, keluar };
    });

    const monthlyTrend: FinanceTrendPoint[] = [1, 2, 3, 4].map((week) => {
      const weekStart = (week - 1) * 7 + 1;
      const weekEnd = week === 4 ? 31 : week * 7;
      const weekTx = monthlyTransactions.filter((t) => {
        const day = dayjs(t.createdAt).date();
        return day >= weekStart && day <= weekEnd;
      });
      const masuk = weekTx
        .filter((t) => t.type === "PEMASUKAN")
        .reduce((sum, t) => sum + t.amount, 0);
      const keluar = weekTx
        .filter((t) => t.type === "PENGELUARAN")
        .reduce((sum, t) => sum + t.amount, 0);
      return { label: `Minggu ${week}`, masuk, keluar };
    });

    return {
      dailySummary: calculateSummary(dailyTransactions),
      tenDaysSummary: calculateSummary(tenDaysTransactions),
      monthlySummary: calculateSummary(monthlyTransactions),
      dailyTrend,
      tenDaysTrend,
      monthlyTrend,
      dailyCategory: calculateCategoryBreakdown(dailyTransactions),
      tenDaysCategory: calculateCategoryBreakdown(tenDaysTransactions),
      monthlyCategory: calculateCategoryBreakdown(monthlyTransactions),
    };
  }, [transactions, reportDate]);
};

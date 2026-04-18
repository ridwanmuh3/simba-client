import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  format,
  getHours,
  getDate,
  isSameDay,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { id } from "date-fns/locale";
import { useMemo } from "react";
import {
  FinanceCategoryPoint,
  FinanceData,
  FinanceSummary,
  FinanceTrendPoint,
} from "@/types/finance";

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

const calculateSummary = (data: FinanceData[]): FinanceSummary => {
  const totalIn = data
    .filter((transaction) => transaction.type === "PEMASUKAN")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalOut = data
    .filter((transaction) => transaction.type === "PENGELUARAN")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    totalIn,
    totalOut,
    profit: totalIn - totalOut,
    count: data.length,
  };
};

const calculateCategoryBreakdown = (
  data: FinanceData[],
): FinanceCategoryPoint[] => {
  const groupedCategory = data.reduce<Record<string, number>>(
    (accumulator, transaction) => {
      if (transaction.type !== "PENGELUARAN") {
        return accumulator;
      }

      const categoryName = transaction.category || "Lainnya";
      accumulator[categoryName] =
        (accumulator[categoryName] ?? 0) + transaction.amount;
      return accumulator;
    },
    {},
  );

  return Object.entries(groupedCategory).map(([name, value]) => ({
    name,
    value,
  }));
};

export const useFinanceReport = (
  transactions: FinanceData[],
  reportDate: Date,
): FinanceReportData => {
  return useMemo(() => {
    const tenDaysStart = startOfDay(subDays(reportDate, 9));
    const tenDaysEnd = endOfDay(reportDate);
    const monthStart = startOfMonth(reportDate);
    const monthEnd = endOfMonth(reportDate);

    const dailyTransactions = transactions.filter((transaction) =>
      isSameDay(new Date(transaction.createdAt), reportDate),
    );

    const tenDaysTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate >= tenDaysStart && transactionDate <= tenDaysEnd;
    });

    const monthlyTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const dailySummary = calculateSummary(dailyTransactions);
    const tenDaysSummary = calculateSummary(tenDaysTransactions);
    const monthlySummary = calculateSummary(monthlyTransactions);

    // Daily trend: group by hour (0-23)
    const dailyTrend: FinanceTrendPoint[] = Array.from({ length: 24 }, (_, hour) => {
      const hourTransactions = dailyTransactions.filter(
        (t) => getHours(new Date(t.createdAt)) === hour,
      );
      const masuk = hourTransactions
        .filter((t) => t.type === "PEMASUKAN")
        .reduce((sum, t) => sum + t.amount, 0);
      const keluar = hourTransactions
        .filter((t) => t.type === "PENGELUARAN")
        .reduce((sum, t) => sum + t.amount, 0);
      return { label: `${String(hour).padStart(2, "0")}:00`, masuk, keluar };
    });

    // 10-day trend: group by day (unchanged)
    const tenDaysTrend = eachDayOfInterval({
      start: tenDaysStart,
      end: tenDaysEnd,
    }).map((day) => {
      const dailyTransaction = tenDaysTransactions.filter((transaction) =>
        isSameDay(new Date(transaction.createdAt), day),
      );

      const masuk = dailyTransaction
        .filter((transaction) => transaction.type === "PEMASUKAN")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const keluar = dailyTransaction
        .filter((transaction) => transaction.type === "PENGELUARAN")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      return {
        label: format(day, "dd MMM", { locale: id }),
        masuk,
        keluar,
      };
    });

    // Monthly trend: group by week (Minggu 1-4)
    const monthlyTrend: FinanceTrendPoint[] = [1, 2, 3, 4].map((week) => {
      const weekStart = (week - 1) * 7 + 1;
      const weekEnd = week === 4 ? 31 : week * 7;
      const weekTransactions = monthlyTransactions.filter((t) => {
        const day = getDate(new Date(t.createdAt));
        return day >= weekStart && day <= weekEnd;
      });
      const masuk = weekTransactions
        .filter((t) => t.type === "PEMASUKAN")
        .reduce((sum, t) => sum + t.amount, 0);
      const keluar = weekTransactions
        .filter((t) => t.type === "PENGELUARAN")
        .reduce((sum, t) => sum + t.amount, 0);
      return { label: `Minggu ${week}`, masuk, keluar };
    });

    return {
      dailySummary,
      tenDaysSummary,
      monthlySummary,
      dailyTrend,
      tenDaysTrend,
      monthlyTrend,
      dailyCategory: calculateCategoryBreakdown(dailyTransactions),
      tenDaysCategory: calculateCategoryBreakdown(tenDaysTransactions),
      monthlyCategory: calculateCategoryBreakdown(monthlyTransactions),
    };
  }, [transactions, reportDate]);
};

import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  format,
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
        label: format(day, "EEEE", { locale: id }),
        masuk,
        keluar,
      };
    });

    return {
      dailySummary,
      tenDaysSummary,
      monthlySummary,
      dailyTrend: [
        {
          label: format(reportDate, "dd MMM"),
          masuk: dailySummary.totalIn,
          keluar: dailySummary.totalOut,
        },
      ],
      tenDaysTrend,
      monthlyTrend: [
        {
          label: format(reportDate, "MMMM yyyy", { locale: id }),
          masuk: monthlySummary.totalIn,
          keluar: monthlySummary.totalOut,
        },
      ],
      dailyCategory: calculateCategoryBreakdown(dailyTransactions),
      tenDaysCategory: calculateCategoryBreakdown(tenDaysTransactions),
      monthlyCategory: calculateCategoryBreakdown(monthlyTransactions),
    };
  }, [transactions, reportDate]);
};

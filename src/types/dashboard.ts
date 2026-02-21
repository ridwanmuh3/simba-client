import { LucideIcon } from "lucide-react";
import { Component, ForwardRefExoticComponent, ReactElement } from "react";

export interface MonthlyBudget {
  month?: string;
  in?: number;
  out?: number;
}

export interface ExpenseItem {
  category?: string;
  amount?: number;
}

export interface SystemActivityData {
  id?: number;
  type?: string;
  title?: string;
  description?: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalItems?: number;
  stockIn?: number;
  stockOut?: number;
  totalBudget?: number;
  budgetIn?: number;
  budgetOut?: number;
  monthlyBudget?: MonthlyBudget[];
  expenseComposition?: ExpenseItem[];
  systemActivities?: SystemActivityData[];
}

export interface StockStats {
  title?: string;
  value?: string;
  icon?: LucideIcon;
  color?: string;
  change?: string;
}

export interface BudgetStats {
  title?: string;
  value?: string;
  icon?: LucideIcon;
  trend?: string;
  change?: string;
  color?: string;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useCurrentAuth } from "@/api/auth";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const getInitialsIdentity = (name: string) => {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "U"
  );
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export const getUserFromCookie = () => {
  const token = document.cookie;

  if (!token) {
    return null;
  }

  const { data: user } = useCurrentAuth();

  return user;
};

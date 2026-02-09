import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useCurrentAuth } from "@/api/auth";
import { toast } from "@/hooks/use-toast";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const safeIncludes = (
  text: string | null | undefined,
  query: string,
) => {
  return (text || "").toLowerCase().includes(query.toLowerCase());
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

export const parseCurrency = (value: string | number) => {
  if (typeof value === "number") return value;

  if (!value) return 0;

  const numeric = value.replace(/[^\d]/g, "");

  return numeric ? Number(numeric) : 0;
};

export const getUserFromCookie = () => {
  const token = document.cookie;

  if (!token) {
    return null;
  }

  const { data: user } = useCurrentAuth();

  return user;
};

export const downloadHandler = async (filename: string) => {
  try {
    const url = `/${filename}`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);

    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    toast({
      title: "Gagal mengunduh dokumen",
      description: "Terjadi kesalahan ketika mengunduh dokumen.",
      variant: "destructive",
    });
  }
};

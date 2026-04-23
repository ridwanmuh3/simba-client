import imageCompression from "browser-image-compression";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "@/hooks/use-toast";
import { isAxiosError } from "axios";

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
      description:
        "Dokumen tidak dapat diunduh. Pastikan file tersedia dan browser Anda mengizinkan unduhan.",
      variant: "destructive",
    });
  }
};

export const compressImage = async (file: File): Promise<File> => {
  const compressedBlob = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    initialQuality: 0.5,
    useWebWorker: true,
  });

  const jpgBlob =
    compressedBlob.type === "image/jpeg"
      ? compressedBlob
      : await convertBlobToJpg(compressedBlob, 0.5);

  return new File([jpgBlob], file.name.replace(/\.(png|jpeg|jpg)$/i, ".jpg"), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
};

const convertBlobToJpg = async (blob: Blob, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return reject("Canvas not supported");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (jpgBlob) => {
          if (!jpgBlob) return reject("Failed to convert to JPG");
          resolve(jpgBlob);
        },
        "image/jpeg",
        quality,
      );

      URL.revokeObjectURL(url);
    };

    img.onerror = reject;
    img.src = url;
  });
};

export const capitalizeFirstLetterString = (str: string) => {
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
};

export const extractErrorMessage = (
  error: unknown,
  fallback = "Terjadi kesalahan. Coba lagi.",
): string => {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.error;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return fallback;
};

export const isPlainObject = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const getItemTotalPrice = (
  _initialStock: number,
  currentStock: number,
  unitPrice: number,
) => currentStock * unitPrice;

import { FinanceData } from "@/types/finance";
import { Item } from "@/types/item";
import dayjs from "dayjs";
import { formatDateDetail } from "./date-utils";

const itemHeaders = [
  "Nama",
  "Kategori",
  "Stok",
  "Satuan Perhitungan",
  "Satuan Harga",
  "Tanggal Penambahan",
];

const financeHeaders = [
  "ID",
  "Tipe",
  "Kategori",
  "Deskripsi",
  "Jumlah Anggaran",
  "Link Foto Bukti",
  "Catatan Tambahan",
  "Tanggal Ditambahkan",
];

export const exportToCSV = (items: Item[], filename: string = "bahan-mbg") => {
  const csvContent = [
    itemHeaders.join(","),
    ...items.map((item) =>
      [
        `"${item.name}"`,
        item.category,
        item.stock,
        item.measureUnit,
        item.unitPrice,
        formatDateDetail(item.createdAt),
      ].join(","),
    ),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}-${dayjs().format("DD-MM-YYYY-HH-mm-ss")}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const escapeCSV = (value: string | number | null | undefined) => {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, '""')}"`;
};

export const exportFinanceToCSV = (
  items: FinanceData[],
  filename: string = "finance-data",
) => {
  const csvContent = [
    financeHeaders.join(","),
    ...items.map((item) =>
      [
        item.id ?? "",
        escapeCSV(item.type),
        escapeCSV(item.category),
        escapeCSV(item.description),
        item.amount ?? 0,
        escapeCSV(item.proofImage),
        escapeCSV(item.extraNote),
        escapeCSV(formatDateDetail(item.createdAt)),
      ].join(","),
    ),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}-${dayjs().format("DD-MM-YYYY-HH-mm-ss")}.csv`,
  );

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};

export const parseCSV = (csvText: string): Item[] => {
  const lines = csvText.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error(
      "File CSV harus memiliki header dan minimal satu baris data",
    );
  }

  const dataLines = lines.slice(1);

  return dataLines.map((line, index) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length < 5) {
      throw new Error(`Baris ${index + 2} tidak memiliki kolom yang cukup`);
    }

    return {
      id: values[0],
      name: values[1],
      category: values[2],
      stock: parseFloat(values[3]) || 0,
      measureUnit: values[4],
      unitPrice: parseFloat(values[5]) || 0,
    };
  });
};

export const parseFinanceCSV = (csvText: string): FinanceData[] => {
  const lines = csvText.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error(
      "File CSV harus memiliki header dan minimal satu baris data",
    );
  }

  const dataLines = lines.slice(1);

  return dataLines.map((line, index) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current.trim());

    if (values.length < 8) {
      throw new Error(`Baris ${index + 2} tidak memiliki kolom yang cukup`);
    }

    return {
      id: values[0] ? Number(values[0]) : undefined,
      type: values[1] || "",
      category: values[2] || "",
      description: values[3] || "",
      amount: values[4] ? Number(values[4]) : 0,
      proofImage: values[5] || "",
      extraNote: values[6] || "",
      createdAt: values[7] || "",
    };
  });
};

export const downloadCSV = (
  filename: string,
  headers: string[],
  data: (string | number)[][],
) => {
  const escapeCSV = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const rows = [headers, ...data];

  const csvContent = rows
    .map((row) => row.map((cell) => escapeCSV(String(cell))).join(","))
    .join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

import { FinanceData } from "@/features/finance/types";
import { Item, ItemStocksSummary } from "@/features/items/types";
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

const CSV_PREAMBLE = "\ufeffsep=,\r\n";

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
  ].join("\r\n");

  const blob = new Blob([CSV_PREAMBLE + csvContent], {
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
  ].join("\r\n");

  const blob = new Blob([CSV_PREAMBLE + csvContent], {
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

const parseNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// RFC 4180 style field parser: commas inside quotes are literal, `""` inside a
// quoted field is one literal quote, and a quote that is not at a field
// boundary is kept as-is.
const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  let atFieldStart = true;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"' && atFieldStart) {
      inQuotes = true;
      atFieldStart = false;
    } else if (char === ",") {
      values.push(current.trim());
      current = "";
      atFieldStart = true;
    } else {
      current += char;
      if (char.trim() !== "") atFieldStart = false;
    }
  }

  values.push(current.trim());
  return values;
};

const toDataLines = (csvText: string): string[] => {
  const lines = csvText
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .filter((line, index) => {
      if (index !== 0) return true;
      return !line.trim().toLowerCase().startsWith("sep=");
    });

  if (lines.length < 2) {
    throw new Error(
      "File CSV harus memiliki header dan minimal satu baris data",
    );
  }

  return lines.slice(1);
};

export const parseCSV = (csvText: string): Item[] => {
  return toDataLines(csvText).map((line, index) => {
    const values = parseCSVLine(line);

    if (values.length < 5) {
      throw new Error(`Baris ${index + 2} tidak memiliki kolom yang cukup`);
    }

    return {
      id: values[0],
      name: values[1],
      category: values[2],
      stock: parseNumber(values[3]),
      measureUnit: values[4],
      unitPrice: parseNumber(values[5]),
    };
  });
};

export const parseFinanceCSV = (csvText: string): FinanceData[] => {
  return toDataLines(csvText).map((line, index) => {
    const values = parseCSVLine(line);

    if (values.length < 8) {
      throw new Error(`Baris ${index + 2} tidak memiliki kolom yang cukup`);
    }

    const rawId = Number(values[0]);

    return {
      id: values[0] && Number.isFinite(rawId) ? rawId : undefined,
      type: (values[1] || "") as FinanceData["type"],
      category: values[2] || "",
      description: values[3] || "",
      amount: parseNumber(values[4]),
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
    .join("\r\n");

  const blob = new Blob([CSV_PREAMBLE + csvContent], {
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

const escOpname = (v: string | number | null | undefined) => {
  const s = String(v ?? "");
  return `"${s.replace(/"/g, '""')}"`;
};

export const exportOpnameToCSV = (
  items: ItemStocksSummary[],
  date: string,
  filename = "stok-opname",
) => {
  const headers = [
    "TANGGAL",
    "NO",
    "NO INVOICE",
    "NAMA BARANG",
    "QTY",
    "SATUAN",
    "HARGA BELI",
    "HARGA JUAL",
    "TOTAL HARGA BELI",
    "TOTAL HARGA JUAL",
  ];

  let totalBeli = 0;
  let totalJual = 0;

  const rows = items.map((s, i) => {
    const qty = s.currentStock ?? 0;
    const totalHargaBeli = s.stockValue ?? 0;
    const totalHargaJual = (s.sellPrice ?? 0) * qty;

    totalBeli += totalHargaBeli;
    totalJual += totalHargaJual;

    return [
      escOpname(date),
      escOpname(i + 1),
      escOpname(s.itemId),
      escOpname(s.name),
      escOpname(qty),
      escOpname(s.measureUnit),
      escOpname(s.buyPrice ?? 0),
      escOpname(s.sellPrice ?? 0),
      escOpname(totalHargaBeli),
      escOpname(totalHargaJual),
    ].join(",");
  });

  const footerRow = [
    escOpname(""),
    escOpname(""),
    escOpname(""),
    escOpname(""),
    escOpname(""),
    escOpname(""),
    escOpname(""),
    escOpname("TOTAL"),
    escOpname(totalBeli),
    escOpname(totalJual),
  ].join(",");

  const csvContent = [
    headers.map(escOpname).join(","),
    ...rows,
    footerRow,
  ].join("\r\n");

  const blob = new Blob([CSV_PREAMBLE + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${dayjs().format("DD-MM-YYYY-HH-mm-ss")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

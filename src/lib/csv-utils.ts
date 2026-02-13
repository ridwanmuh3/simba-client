import { FinanceData } from "@/types/finance";
import { Item } from "@/types/item";
import dayjs from "dayjs";

const itemHeaders = [
  "Nama",
  "Kategori",
  "Stok",
  "Satuan Perhitungan",
  "Satuan Harga",
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
};

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

export const exportFinanceToCSV = (
  items: FinanceData[],
  filename: string = "finance-data",
) => {
  const csvContent = [
    financeHeaders.join(","),
    ...items.map((item) =>
      [
        item.id ?? "",
        `"${item.type ?? ""}"`,
        `"${item.category ?? ""}"`,
        `"${item.description ?? ""}"`,
        item.amount ?? 0,
        `"${item.proofImage ?? ""}"`,
        `"${item.extraNote ?? ""}"`,
        `"${item.createdAt ?? ""}"`,
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
      stock: parseInt(values[3]) || 0,
      measureUnit: values[4],
      unitPrice: parseInt(values[5]) || 0,
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

export const downloadCSVTemplate = () => {
  const exampleRow = ["Beras", "Karbohidrat", "100", "kg", "14000"];

  const csvContent = [itemHeaders.join(","), exampleRow.join(",")].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", "template-bahan-mbg.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

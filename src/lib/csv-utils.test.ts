import { describe, expect, test } from "bun:test";
import { parseCSV, parseFinanceCSV } from "./csv-utils";

const itemHeader =
  "ID,Nama,Kategori,Stok,Satuan Perhitungan,Satuan Harga,Tanggal Penambahan";

describe("parseCSV", () => {
  test("parses a plain row", () => {
    const rows = parseCSV(`${itemHeader}\r\n1,Beras,Karbo,10,kg,12000,2026-01-01`);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "1",
      name: "Beras",
      category: "Karbo",
      stock: 10,
      measureUnit: "kg",
      unitPrice: 12000,
    });
  });

  test("accepts LF line endings and skips blank lines", () => {
    const rows = parseCSV(
      `${itemHeader}\n1,Beras,Karbo,10,kg,12000,2026-01-01\n\n`,
    );
    expect(rows).toHaveLength(1);
  });

  test("strips the excel sep= preamble and BOM", () => {
    const rows = parseCSV(
      `\uFEFFsep=,\r\n${itemHeader}\r\n1,Beras,Karbo,10,kg,12000,2026-01-01`,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Beras");
  });

  test("keeps commas inside quoted fields", () => {
    const rows = parseCSV(
      `${itemHeader}\r\n1,"Beras, Premium",Karbo,10,kg,12000,2026-01-01`,
    );
    expect(rows[0].name).toBe("Beras, Premium");
  });

  test("decodes escaped quotes inside quoted fields", () => {
    const rows = parseCSV(
      `${itemHeader}\r\n1,"Beras ""Super""",Karbo,10,kg,12000,2026-01-01`,
    );
    expect(rows[0].name).toBe('Beras "Super"');
  });

  test("keeps plain quotes that are not field delimiters", () => {
    const rows = parseCSV(
      `${itemHeader}\r\n1,Beras 5" premium,Karbo,10,kg,12000,2026-01-01`,
    );
    expect(rows[0].name).toBe('Beras 5" premium');
  });

  test("parses numeric fields safely", () => {
    const rows = parseCSV(
      `${itemHeader}\r\n1,Beras,Karbo,abc,kg,not-a-price,2026-01-01`,
    );
    expect(rows[0].stock).toBe(0);
    expect(rows[0].unitPrice).toBe(0);
  });

  test("throws when only a header is present", () => {
    expect(() => parseCSV(itemHeader)).toThrow();
  });

  test("throws when a row has too few columns", () => {
    expect(() => parseCSV(`${itemHeader}\r\n1,Beras,Karbo,10`)).toThrow();
  });

  test("ignores a preamble-only file", () => {
    expect(() => parseCSV("\uFEFFsep=,\r\n")).toThrow();
  });
});

const financeHeader =
  "ID,Tipe,Kategori,Deskripsi,Jumlah Anggaran,Link Foto Bukti,Catatan Tambahan,Tanggal Ditambahkan";

describe("parseFinanceCSV", () => {
  test("parses a plain row", () => {
    const rows = parseFinanceCSV(
      `${financeHeader}\r\n1,PENGELUARAN,Belanja,Beras,50000,,,2026-01-01`,
    );
    expect(rows[0]).toMatchObject({
      id: 1,
      type: "PENGELUARAN",
      category: "Belanja",
      description: "Beras",
      amount: 50000,
    });
  });

  test("decodes escaped quotes inside quoted fields", () => {
    const rows = parseFinanceCSV(
      `${financeHeader}\r\n1,PENGELUARAN,Belanja,"Beras ""Premium""",50000,,,2026-01-01`,
    );
    expect(rows[0].description).toBe('Beras "Premium"');
  });

  test("leaves id undefined when the column is empty", () => {
    const rows = parseFinanceCSV(
      `${financeHeader}\r\n,PENGELUARAN,Belanja,Beras,50000,,,2026-01-01`,
    );
    expect(rows[0].id).toBeUndefined();
  });	test("leaves id undefined for a non-numeric value", () => {
    const rows = parseFinanceCSV(
      `${financeHeader}\r\nnot-a-number,PENGELUARAN,Belanja,Beras,50000,,,2026-01-01`,
    );
    expect(rows[0].id).toBeUndefined();
  });

  test("falls back to 0 for an unparsable amount", () => {
    const rows = parseFinanceCSV(
      `${financeHeader}\r\n1,PENGELUARAN,Belanja,Beras,nope,,,2026-01-01`,
    );
    expect(rows[0].amount).toBe(0);
  });

  test("throws when a row has too few columns", () => {
    expect(() =>
      parseFinanceCSV(`${financeHeader}\r\n1,PENGELUARAN,Belanja`),
    ).toThrow();
  });
});

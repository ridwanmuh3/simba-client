import z from "zod";

export const masterItemSchema = z.object({
  name: z
    .string()
    .min(1, "Nama barang tidak boleh kosong")
    .max(90, "Nama barang maksimal 90 karakter")
    .regex(
      /^[ -~]+$/,
      "Nama hanya boleh berisi karakter standar (huruf, angka, spasi, simbol unit)",
    ),
  category: z
    .string()
    .min(1, "Kategori harus dipilih")
    .max(50, "Kategori maksimal 50 karakter"),
  stock: z.coerce.number().gt(0, "Stok harus lebih dari 0"),
  initialStock: z.coerce.number().gte(0, "Stok awal tidak boleh negatif").optional(),
  measureUnit: z
    .string()
    .min(1, "Barang harus memiliki satuan perhitungan")
    .max(30, "Satuan perhitungan maksimal 30 karakter"),
  pricePerUnit: z.coerce.number().gt(0, "Harga harus lebih dari 0"),
  customCategory: z.string().min(0, "Kategori harus diisi").optional(),
  customMeasureUnit: z.string().min(0, "Satuan perhitungan harus diisi").optional(),
  dateAdded: z.date(),
});

export const updateItemStockSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  itemMeasureUnit: z.string(),
  itemUnitPrice: z.coerce.number().min(1, "harga minimal 1"),
  amount: z.coerce.number().gt(0, "stok harus lebih dari 0"),
  supplier: z.coerce.string().max(100, "supplier maksimal 100 karakter").optional(),
});

export type MasterItemFormInputs = z.infer<typeof masterItemSchema>;
export type UpdateItemStockFormInputs = z.infer<typeof updateItemStockSchema>;

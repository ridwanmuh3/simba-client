import z from "zod";

export const masterItemSchema = z.object({
  name: z
    .string()
    .min(1, "Nama barang tidak boleh kosong")
    .regex(
      /^[ -~]+$/,
      "Nama hanya boleh berisi karakter standar (huruf, angka, spasi, simbol unit)",
    ),
  category: z.string().min(1, "Kategori harus dipilih"),
  stock: z.coerce.number().gt(0, "Stok harus lebih dari 0"),
  initialStock: z.coerce.number().gte(0, "Stok awal tidak boleh negatif").optional(),
  measureUnit: z.string().min(1, "Barang harus memiliki satuan perhitungan"),
  pricePerUnit: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  customCategory: z.string().min(0, "Kategori harus diisi").optional(),
  customMeasureUnit: z
    .string()
    .min(0, "Satuan perhitungan harus diisi")
    .optional(),
  dateAdded: z.date(),
});

export type MasterItemFormInputs = z.infer<typeof masterItemSchema>;

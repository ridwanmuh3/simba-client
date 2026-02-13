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
  stock: z.coerce.number().min(1, "Stok minimal harus 1"),
  measureUnit: z.string().min(1, "Barang harus memiliki satuan perhitungan"),
  pricePerUnit: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  customCategory: z.string().min(1, "Kategori harus diisi").optional(),
  customMeasureUnit: z
    .string()
    .min(1, "Satuan perhitungan harus diisi")
    .optional(),
});

export type MasterItemFormInputs = z.infer<typeof masterItemSchema>;

import z from "zod";

export const addMasterItemSchema = z.object({
  name: z
    .string()
    .min(1, "Nama barang tidak boleh kosong")
    .regex(
      /^[ -~]+$/,
      "Nama hanya boleh berisi karakter standar (huruf, angka, spasi, simbol unit)",
    ),
  category: z.string().min(1, "Kategori harus dipilih"),
  stock: z.number().min(1, "Stok minimal harus 1"),
  measureUnit: z.string().min(1, "Barang harus memiliki satuan perhitungan"),
  pricePerUnit: z.number().min(0, "Harga tidak boleh negatif"),
});

export type AddMasterItemFormInputs = z.infer<typeof addMasterItemSchema>;

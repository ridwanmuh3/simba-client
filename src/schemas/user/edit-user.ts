import z from "zod";

export const editUserSchema = z.object({
  fullname: z
    .string()
    .min(2, "Panjang nama lengkap minimal 2 karakter")
    .max(50, "Nama lengkap terlalu panjang")
    .refine((val) => /^[a-zA-Z ]+$/.test(val), "Nama lengkap hanya boleh huruf dan spasi"),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length >= 4 && val.length <= 30 && /^[\x20-\x7E]+$/.test(val)),
      "Password minimal 4 karakter (atau kosongkan jika tidak ingin mengubah)",
    ),
});

export type EditUserFormInputs = z.infer<typeof editUserSchema>;

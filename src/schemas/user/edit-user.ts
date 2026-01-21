import z from "zod";

export const editUserSchema = z.object({
  fullname: z
    .string()
    .min(2, "Panjang nama lengkap minimal 2 karakter")
    .max(50, "Nama lengkap terlalu panjang")
    .refine((val) => /^[a-zA-Z ]/.test(val)),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[\x20-\x7E]{4,30}$/,
      "Password minimal 8 karakter, mengandung huruf besar, kecil, angka, dan simbol.",
    ),
});

export type EditUserFormInputs = z.infer<typeof editUserSchema>;

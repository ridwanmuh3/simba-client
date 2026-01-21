import z from "zod";

export const createUserSchema = z.object({
  username: z
    .string()
    .min(5, "Panjang username minimal 5 karakter")
    .max(30, "Username terlalu panjang")
    .refine(
      (val) => /^[a-zA-Z0-9]+$/.test(val),
      "Username hanya boleh huruf dan angka",
    ),
  fullname: z
    .string()
    .min(2, "Panjang nama lengkap minimal 2 karakter")
    .max(50, "Nama lengkap terlalu panjang")
    .refine((val) => /^[a-zA-Z ]/.test(val)),
  role: z.enum(["Admin"]),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[\x20-\x7E]{4,30}$/,
      "Password harus 8 karakter, mengandung huruf besar, kecil, angka, dan simbol.",
    ),
});

export type CreateUserFormInputs = z.infer<typeof createUserSchema>;

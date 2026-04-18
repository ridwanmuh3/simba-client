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
    .refine((val) => /^[a-zA-Z ]+$/.test(val), "Nama lengkap hanya boleh huruf dan spasi"),
  role: z.enum(["Admin", "Super Admin"], {
    errorMap: () => ({ message: "Role harus dipilih" }),
  }),
  password: z
    .string()
    .min(4, "Password minimal 4 karakter")
    .max(30, "Password maksimal 30 karakter")
    .refine(
      (val) => /^[\x20-\x7E]+$/.test(val),
      "Password hanya boleh karakter ASCII",
    ),
});

export type CreateUserFormInputs = z.infer<typeof createUserSchema>;

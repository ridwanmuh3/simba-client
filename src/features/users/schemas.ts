import z from "zod";

const strongPasswordMessage =
  "Password minimal 8 karakter, maksimal 30 karakter, wajib memiliki 1 huruf besar, 1 angka, dan 1 simbol";

const strongPasswordRegex =
  /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])[\x20-\x7E]{8,30}$/;

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
    .refine(
      (val) => /^[a-zA-Z ]+$/.test(val),
      "Nama lengkap hanya boleh huruf dan spasi",
    ),
  role: z.enum(["Admin", "Super Admin"], {
    errorMap: () => ({ message: "Role harus dipilih" }),
  }),
  password: z
    .string()
    .refine((val) => strongPasswordRegex.test(val), strongPasswordMessage),
});

export const editUserSchema = z.object({
  fullname: z
    .string()
    .min(2, "Panjang nama lengkap minimal 2 karakter")
    .max(50, "Nama lengkap terlalu panjang")
    .refine(
      (val) => /^[a-zA-Z ]+$/.test(val),
      "Nama lengkap hanya boleh huruf dan spasi",
    ),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || strongPasswordRegex.test(val),
      `${strongPasswordMessage} (atau kosongkan jika tidak ingin mengubah)`,
    ),
});

export type CreateUserFormInputs = z.infer<typeof createUserSchema>;
export type EditUserFormInputs = z.infer<typeof editUserSchema>;

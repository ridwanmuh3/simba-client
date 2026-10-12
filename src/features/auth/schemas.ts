import z from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(5, "Panjang username minimal 5 karakter")
    .max(30, "Username terlalu panjang")
    .regex(/^[a-zA-Z0-9]+$/, "Username hanya boleh huruf dan angka"),
  password: z
    .string()
    .min(4, "Password minimal 4 karakter")
    .max(30, "Password terlalu panjang"),
  rememberMe: z.boolean().default(false).optional(),
});

export type LoginFormInputs = z.infer<typeof loginSchema>;

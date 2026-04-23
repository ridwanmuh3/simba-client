import z from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username wajib diisi")
    .max(30, "Username terlalu panjang"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .max(30, "Password terlalu panjang"),
  rememberMe: z.boolean().default(false).optional(),
});

export type LoginFormInputs = z.infer<typeof loginSchema>;

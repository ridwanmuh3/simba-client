import { z } from "zod";

export const createDapurSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  description: z.string().max(255, "Deskripsi maksimal 255 karakter").optional(),
});

export const editDapurSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  description: z.string().max(255, "Deskripsi maksimal 255 karakter").optional(),
  isActive: z.boolean(),
});

export type CreateDapurFormInputs = z.infer<typeof createDapurSchema>;
export type EditDapurFormInputs = z.infer<typeof editDapurSchema>;

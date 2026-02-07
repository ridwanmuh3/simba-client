import z from "zod";

export const updateItemStockSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  itemMeasureUnit: z.string(),
  itemUnitPrice: z.coerce.number().min(1, "harga satuan minimal 1"),
  amount: z.coerce.number().min(1, "minimal stok harus 1"),
  supplier: z.coerce.string().optional(),
});

export type UpdateItemStockFormInputs = z.infer<typeof updateItemStockSchema>;

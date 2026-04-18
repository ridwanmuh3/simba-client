import z from "zod";

export const updateItemStockSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  itemMeasureUnit: z.string(),
  itemUnitPrice: z.coerce.number().min(0, "harga tidak boleh negative"),
  amount: z.coerce.number().min(0, "stok harus lebih dari 0"),
  supplier: z.coerce.string().optional(),
});

export type UpdateItemStockFormInputs = z.infer<typeof updateItemStockSchema>;

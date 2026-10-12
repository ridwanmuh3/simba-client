import { describe, expect, test } from "bun:test";
import { masterItemSchema, updateItemStockSchema } from "./schemas";

const validItem = {
  name: "Beras",
  category: "Karbo",
  stock: 10,
  measureUnit: "kg",
  pricePerUnit: 12000,
  dateAdded: new Date("2026-01-01"),
};

describe("masterItemSchema", () => {
  test("accepts a valid item", () => {
    expect(masterItemSchema.safeParse(validItem).success).toBe(true);
  });

  test("rejects a name longer than 90 characters (server max=90)", () => {
    const result = masterItemSchema.safeParse({
      ...validItem,
      name: "a".repeat(91),
    });
    expect(result.success).toBe(false);
  });

  test("rejects a category longer than 50 characters (server max=50)", () => {
    const result = masterItemSchema.safeParse({
      ...validItem,
      category: "a".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  test("rejects a measure unit longer than 30 characters (server max=30)", () => {
    const result = masterItemSchema.safeParse({
      ...validItem,
      measureUnit: "a".repeat(31),
    });
    expect(result.success).toBe(false);
  });

  test("rejects a zero price (server gt=0)", () => {
    const result = masterItemSchema.safeParse({ ...validItem, pricePerUnit: 0 });
    expect(result.success).toBe(false);
  });

  test("rejects a non-positive stock (server gt=0)", () => {
    expect(masterItemSchema.safeParse({ ...validItem, stock: 0 }).success).toBe(
      false,
    );
  });
});

const validStockUpdate = {
  itemId: "abc",
  itemName: "Beras",
  itemMeasureUnit: "kg",
  itemUnitPrice: 12000,
  amount: 5,
};

describe("updateItemStockSchema", () => {
  test("accepts a valid stock update", () => {
    expect(updateItemStockSchema.safeParse(validStockUpdate).success).toBe(
      true,
    );
  });

  test("rejects a zero amount (server gt=0)", () => {
    const result = updateItemStockSchema.safeParse({
      ...validStockUpdate,
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  test("rejects a zero unit price (server gte=1)", () => {
    const result = updateItemStockSchema.safeParse({
      ...validStockUpdate,
      itemUnitPrice: 0,
    });
    expect(result.success).toBe(false);
  });

  test("rejects a supplier longer than 100 characters (server max=100)", () => {
    const result = updateItemStockSchema.safeParse({
      ...validStockUpdate,
      supplier: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

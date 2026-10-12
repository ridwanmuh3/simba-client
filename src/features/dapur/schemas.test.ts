import { describe, expect, test } from "bun:test";
import { createDapurSchema, editDapurSchema } from "./schemas";

describe("createDapurSchema", () => {
  test("accepts a valid payload", () => {
    expect(
      createDapurSchema.safeParse({ name: "Dapur 1", description: "utama" })
        .success,
    ).toBe(true);
  });

  test("rejects a name shorter than 2 characters (server min=2)", () => {
    expect(createDapurSchema.safeParse({ name: "a" }).success).toBe(false);
  });

  test("rejects a name longer than 100 characters (server max=100)", () => {
    expect(
      createDapurSchema.safeParse({ name: "a".repeat(101) }).success,
    ).toBe(false);
  });

  test("rejects a description longer than 255 characters (server max=255)", () => {
    expect(
      createDapurSchema.safeParse({
        name: "Dapur 1",
        description: "a".repeat(256),
      }).success,
    ).toBe(false);
  });
});

describe("editDapurSchema", () => {
  test("accepts a valid payload", () => {
    expect(
      editDapurSchema.safeParse({ name: "Dapur 1", isActive: true }).success,
    ).toBe(true);
  });

  test("rejects a missing isActive flag", () => {
    expect(editDapurSchema.safeParse({ name: "Dapur 1" }).success).toBe(false);
  });
});

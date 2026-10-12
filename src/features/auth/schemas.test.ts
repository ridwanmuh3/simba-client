import { describe, expect, test } from "bun:test";
import { loginSchema } from "./schemas";

describe("loginSchema", () => {
  test("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      username: "admintest01",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  test("rejects a username shorter than 5 characters (server min=5)", () => {
    const result = loginSchema.safeParse({
      username: "adm",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  test("rejects a username with non-alphanumeric characters (server alphanum)", () => {
    const result = loginSchema.safeParse({
      username: "admin_test",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  test("rejects a password shorter than 4 characters (server min=4)", () => {
    const result = loginSchema.safeParse({
      username: "admintest01",
      password: "abc",
    });
    expect(result.success).toBe(false);
  });

  test("rejects a username longer than 30 characters (server max=30)", () => {
    const result = loginSchema.safeParse({
      username: "a".repeat(31),
      password: "secret",
    });
    expect(result.success).toBe(false);
  });
});

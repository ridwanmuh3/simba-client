import { describe, expect, test } from "bun:test";
import { createUserSchema, editUserSchema } from "./schemas";

const validUser = {
  username: "admintest01",
  fullname: "Admin Test",
  role: "Admin" as const,
  password: "Admintest1!",
};

describe("createUserSchema", () => {
  test("accepts a valid user", () => {
    expect(createUserSchema.safeParse(validUser).success).toBe(true);
  });

  test("rejects a username shorter than 5 characters (server min=5)", () => {
    expect(
      createUserSchema.safeParse({ ...validUser, username: "adm" }).success,
    ).toBe(false);
  });

  test("rejects a username longer than 30 characters (server max=30)", () => {
    expect(
      createUserSchema.safeParse({ ...validUser, username: "a".repeat(31) })
        .success,
    ).toBe(false);
  });

  test("rejects a non-alphanumeric username (server alphanum)", () => {
    expect(
      createUserSchema.safeParse({ ...validUser, username: "admin_test" })
        .success,
    ).toBe(false);
  });

  test("rejects a weak password (server strongpassword)", () => {
    expect(
      createUserSchema.safeParse({ ...validUser, password: "weakpass" })
        .success,
    ).toBe(false);
  });
});

describe("editUserSchema", () => {
  test("accepts a valid edit", () => {
    expect(
      editUserSchema.safeParse({ fullname: "Admin Test", password: "Newpass1!" })
        .success,
    ).toBe(true);
  });

  test("accepts an omitted password", () => {
    expect(
      editUserSchema.safeParse({ fullname: "Admin Test", password: "" }).success,
    ).toBe(true);
  });

  test("rejects a weak replacement password", () => {
    expect(
      editUserSchema.safeParse({ fullname: "Admin Test", password: "weakpass" })
        .success,
    ).toBe(false);
  });
});

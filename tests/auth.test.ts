import { generateSync } from "otplib";
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/passwords";
import { generateTotpSecret, verifyTotp } from "@/lib/auth/totp";

describe("auth helpers", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("verifies TOTP tokens", () => {
    const secret = generateTotpSecret();
    const token = generateSync({ secret });
    expect(verifyTotp(secret, token)).toBe(true);
    expect(verifyTotp(secret, "000000")).toBe(false);
  });
});

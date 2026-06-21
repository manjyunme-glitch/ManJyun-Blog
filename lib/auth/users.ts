import { getDb } from "@/lib/db/client";
import type { UserRow } from "@/lib/db/types";
import { hashPassword } from "@/lib/auth/passwords";
import { generateTotpSecret, makeTotpQr } from "@/lib/auth/totp";
import { newId, nowIso } from "@/lib/utils";

export function isInstalled() {
  const row = getDb().prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number };
  return row.count > 0;
}

export function getUserByEmail(email: string) {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as UserRow | undefined;
}

export function getUserById(id: string) {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
}

export function getFirstAdmin() {
  return getDb().prepare("SELECT * FROM users ORDER BY created_at ASC LIMIT 1").get() as UserRow | undefined;
}

export function getTotpSecret(userId: string) {
  return getDb()
    .prepare("SELECT secret FROM totp_secrets WHERE user_id = ? AND enabled = 1")
    .get(userId) as { secret: string } | undefined;
}

export async function createInitialAdmin(input: { name: string; email: string; password: string }) {
  if (isInstalled()) {
    throw new Error("站点已经完成初始化");
  }
  const id = newId("user");
  const now = nowIso();
  const passwordHash = await hashPassword(input.password);
  const secret = generateTotpSecret();
  const db = getDb();

  const write = db.transaction(() => {
    db.prepare(
      "INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, 'admin', ?, ?)"
    ).run(id, input.name.trim(), input.email.toLowerCase().trim(), passwordHash, now, now);
    db.prepare("INSERT INTO totp_secrets (user_id, secret, enabled, created_at) VALUES (?, ?, 1, ?)").run(
      id,
      secret,
      now
    );
  });
  write();

  return {
    user: getUserById(id)!,
    secret,
    ...(await makeTotpQr(input.email, secret))
  };
}


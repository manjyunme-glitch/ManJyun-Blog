import { cookies } from "next/headers";
import { getDb } from "@/lib/db/client";
import type { UserRow } from "@/lib/db/types";
import { newId, nowIso, randomToken, sha256 } from "@/lib/utils";

export const sessionCookieName = "mjb_session";
const maxAgeSeconds = 60 * 60 * 24 * 30;

export async function createSession(userId: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000).toISOString();
  getDb()
    .prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(newId("sess"), userId, sha256(token), expiresAt, nowIso());

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSeconds,
    path: "/"
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT users.* FROM sessions
       INNER JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ?`
    )
    .get(sha256(token), nowIso()) as UserRow | undefined;
  return row || null;
}

export async function clearCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (token) {
    getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
  }
  cookieStore.delete(sessionCookieName);
}

export function pruneExpiredSessions() {
  getDb().prepare("DELETE FROM sessions WHERE expires_at <= ?").run(nowIso());
}


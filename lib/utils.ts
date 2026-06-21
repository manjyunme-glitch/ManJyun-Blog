import crypto from "node:crypto";

export function nowIso() {
  return new Date().toISOString();
}

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function randomToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function asBool(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true";
}


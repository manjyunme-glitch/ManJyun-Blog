import fs from "node:fs/promises";
import path from "node:path";
import { getDb } from "@/lib/db/client";
import { getUploadDir } from "@/lib/db/paths";
import type { MediaAssetRow } from "@/lib/db/types";
import { newId, nowIso } from "@/lib/utils";

const allowed = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "video/mp4",
  "application/pdf"
]);

export function listMediaAssets() {
  return getDb()
    .prepare("SELECT * FROM media_assets ORDER BY created_at DESC")
    .all() as MediaAssetRow[];
}

export async function saveUploadedFile(file: File, alt = "") {
  if (!allowed.has(file.type)) {
    throw new Error(`不支持的文件类型：${file.type || "unknown"}`);
  }
  const id = newId("media");
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const ext = path.extname(file.name) || mimeToExt(file.type);
  const safeBase = file.name
    .replace(ext, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  const filename = `${safeBase || "upload"}-${id}${ext}`;
  const dir = path.join(getUploadDir(), yyyy, mm);
  await fs.mkdir(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  const diskPath = path.join(dir, filename);
  await fs.writeFile(diskPath, bytes);
  const url = `/media/${yyyy}/${mm}/${filename}`;

  getDb()
    .prepare(
      `INSERT INTO media_assets (id, filename, original_name, mime_type, size, url, alt, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, filename, file.name, file.type, bytes.byteLength, url, alt || null, nowIso());

  return getDb().prepare("SELECT * FROM media_assets WHERE id = ?").get(id) as MediaAssetRow;
}

function mimeToExt(mime: string) {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  if (mime === "image/svg+xml") return ".svg";
  if (mime === "audio/mpeg" || mime === "audio/mp3") return ".mp3";
  if (mime === "audio/wav") return ".wav";
  if (mime === "audio/ogg") return ".ogg";
  if (mime === "video/mp4") return ".mp4";
  if (mime === "application/pdf") return ".pdf";
  return "";
}


import fs from "node:fs";
import path from "node:path";

export function getDataDir() {
  return process.env.DATA_DIR || path.join(process.cwd(), "data");
}

export function getUploadDir() {
  return path.join(getDataDir(), "uploads");
}

export function getDatabasePath() {
  return path.join(getDataDir(), "blog.sqlite");
}

export function ensureRuntimeDirs() {
  fs.mkdirSync(getDataDir(), { recursive: true });
  fs.mkdirSync(getUploadDir(), { recursive: true });
}

export function resolveUploadPath(publicPath: string) {
  const uploads = getUploadDir();
  const cleaned = publicPath.replace(/^\/?media\/?/, "").replace(/^\/+/, "");
  const resolved = path.resolve(uploads, cleaned);
  if (!resolved.startsWith(path.resolve(uploads))) {
    throw new Error("Invalid media path");
  }
  return resolved;
}


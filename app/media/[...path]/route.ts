import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { resolveUploadPath } from "@/lib/db/paths";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  const { path: parts } = await params;
  try {
    const diskPath = resolveUploadPath(`/media/${parts.join("/")}`);
    const file = await fs.readFile(diskPath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "content-type": contentType(diskPath),
        "cache-control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

function contentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".wav") return "audio/wav";
  if (ext === ".ogg") return "audio/ogg";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".pdf") return "application/pdf";
  return "application/octet-stream";
}


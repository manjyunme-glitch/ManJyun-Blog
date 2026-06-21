import { NextResponse } from "next/server";
import { requireApiAdmin, jsonError } from "@/lib/admin/api";
import { listMediaAssets, saveUploadedFile } from "@/lib/admin/media";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;
  return NextResponse.json({ ok: true, media: listMediaAssets() });
}

export async function POST(request: Request) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const alt = String(formData.get("alt") || "");
    if (!(file instanceof File)) {
      return jsonError("请选择文件");
    }
    const media = await saveUploadedFile(file, alt);
    return NextResponse.json({ ok: true, media });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "上传失败");
  }
}


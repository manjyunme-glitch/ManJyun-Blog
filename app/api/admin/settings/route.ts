import { NextResponse } from "next/server";
import { requireApiAdmin, jsonError } from "@/lib/admin/api";
import { getSettings, setSettings } from "@/lib/settings";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;
  return NextResponse.json({ ok: true, settings: getSettings() });
}

export async function PUT(request: Request) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;
  try {
    setSettings(await request.json());
    return NextResponse.json({ ok: true, settings: getSettings() });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "保存设置失败");
  }
}


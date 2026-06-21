import { NextResponse } from "next/server";
import { requireApiAdmin, jsonError } from "@/lib/admin/api";
import { getSettings } from "@/lib/settings";
import { listThemes, setActiveTheme } from "@/lib/themes/registry";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;
  return NextResponse.json({ ok: true, activeTheme: getSettings().activeTheme, themes: listThemes() });
}

export async function PUT(request: Request) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;
  try {
    const { themeId } = await request.json();
    setActiveTheme(themeId);
    return NextResponse.json({ ok: true, activeTheme: getSettings().activeTheme, themes: listThemes() });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "切换主题失败");
  }
}


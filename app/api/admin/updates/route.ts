import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/admin/api";
import { checkGithubUpdates } from "@/lib/admin/updates";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;
  return NextResponse.json({ ok: true, update: await checkGithubUpdates() });
}


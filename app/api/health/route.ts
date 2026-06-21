import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { isInstalled } from "@/lib/auth/users";

export const runtime = "nodejs";

export async function GET() {
  getDb().prepare("SELECT 1").get();
  return NextResponse.json({
    ok: true,
    installed: isInstalled(),
    checkedAt: new Date().toISOString()
  });
}


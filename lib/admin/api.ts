import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isInstalled } from "@/lib/auth/users";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function requireApiAdmin() {
  if (!isInstalled()) {
    return { user: null, response: jsonError("站点尚未初始化", 401) };
  }
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: jsonError("需要登录", 401) };
  }
  return { user, response: null };
}


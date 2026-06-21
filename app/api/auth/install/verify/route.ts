import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth/session";
import { verifyTotp } from "@/lib/auth/totp";
import { getFirstAdmin, getTotpSecret } from "@/lib/auth/users";
import { jsonError } from "@/lib/admin/api";

export const runtime = "nodejs";

const schema = z.object({
  code: z.string().min(6)
});

export async function POST(request: Request) {
  const input = schema.parse(await request.json());
  const user = getFirstAdmin();
  if (!user) return jsonError("站点尚未初始化", 404);
  const totp = getTotpSecret(user.id);
  if (!totp || !verifyTotp(totp.secret, input.code)) {
    return jsonError("验证码不正确", 401);
  }
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}


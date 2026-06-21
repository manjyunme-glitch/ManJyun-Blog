import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/passwords";
import { verifyTotp } from "@/lib/auth/totp";
import { getTotpSecret, getUserByEmail } from "@/lib/auth/users";
import { jsonError } from "@/lib/admin/api";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  code: z.string().min(6)
});

export async function POST(request: Request) {
  const input = schema.parse(await request.json());
  const user = getUserByEmail(input.email);
  if (!user || !(await verifyPassword(input.password, user.password_hash))) {
    return jsonError("邮箱或密码不正确", 401);
  }
  const totp = getTotpSecret(user.id);
  if (!totp || !verifyTotp(totp.secret, input.code)) {
    return jsonError("两步验证码不正确", 401);
  }
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}


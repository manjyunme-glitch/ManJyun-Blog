import { NextResponse } from "next/server";
import { z } from "zod";
import { createInitialAdmin } from "@/lib/auth/users";
import { jsonError } from "@/lib/admin/api";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(1, "请输入名称"),
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(10, "密码至少 10 位")
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const result = await createInitialAdmin(input);
    return NextResponse.json({
      ok: true,
      user: { id: result.user.id, email: result.user.email, name: result.user.name },
      secret: result.secret,
      otpauth: result.otpauth,
      qrDataUrl: result.qrDataUrl
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "初始化失败");
  }
}


import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAdmin, jsonError } from "@/lib/admin/api";
import { listAdminPosts, savePost } from "@/lib/content/posts";

export const runtime = "nodejs";

const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  status: z.enum(["draft", "published", "scheduled"]),
  excerpt: z.string().optional(),
  content: z.string().default(""),
  coverImage: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  featured: z.boolean().optional(),
  publishedAt: z.string().nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
  tags: z.array(z.string()).optional()
});

export async function GET() {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;
  return NextResponse.json({ ok: true, posts: listAdminPosts() });
}

export async function POST(request: Request) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;
  try {
    const input = postSchema.parse(await request.json());
    const post = savePost(input);
    return NextResponse.json({ ok: true, post });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "保存文章失败");
  }
}


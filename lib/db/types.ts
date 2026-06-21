export type PostStatus = "draft" | "published" | "scheduled";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "admin";
  created_at: string;
  updated_at: string;
};

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  featured: 0 | 1;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TagRow = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  created_at: string;
};

export type MediaAssetRow = {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  alt: string | null;
  created_at: string;
};


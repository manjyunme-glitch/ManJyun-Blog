import Database from "better-sqlite3";
import { ensureRuntimeDirs, getDatabasePath } from "@/lib/db/paths";

type GlobalWithDb = typeof globalThis & {
  __manjyunDb?: Database.Database;
};

const schema = `
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS totp_secrets (
  user_id TEXT PRIMARY KEY,
  secret TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'scheduled')),
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  seo_title TEXT,
  seo_description TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  scheduled_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL UNIQUE,
  alt TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_status_dates ON posts(status, published_at, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON posts(updated_at);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media_assets(created_at);
`;

export function getDb() {
  ensureRuntimeDirs();
  const globalDb = globalThis as GlobalWithDb;
  if (!globalDb.__manjyunDb) {
    const db = new Database(getDatabasePath());
    db.pragma("foreign_keys = ON");
    db.exec(schema);
    globalDb.__manjyunDb = db;
  }
  return globalDb.__manjyunDb;
}

export function resetDbForTests() {
  const globalDb = globalThis as GlobalWithDb;
  globalDb.__manjyunDb?.close();
  globalDb.__manjyunDb = undefined;
}


import { getDb } from "@/lib/db/client";
import { nowIso } from "@/lib/utils";

export type SiteSettings = {
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  ownerName: string;
  ownerBio: string;
  activeTheme: string;
};

export const defaultSettings: SiteSettings = {
  siteTitle: "ManJyun Blog",
  siteDescription: "从存几部电影开始，到在家里搭起一整套网络基础设施。",
  siteUrl: "",
  ownerName: "ManJyun",
  ownerBio:
    "一个从「只想存几部电影」到「在家里搭了一整套网络基础设施」的折腾爱好者。没有计算机科学学位，也没有在科技公司上过班，靠遇到问题、搜索、看教程、动手、踩坑和再解决，把每一步写下来。",
  activeTheme: "workbench"
};

export function getSettings(): SiteSettings {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings").all() as Array<{
    key: keyof SiteSettings;
    value: string;
  }>;
  const merged = { ...defaultSettings };
  for (const row of rows) {
    if (row.key in merged) {
      merged[row.key] = row.value;
    }
  }
  return merged;
}

export function setSettings(input: Partial<SiteSettings>) {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
  );
  const write = db.transaction((values: Partial<SiteSettings>) => {
    for (const [key, value] of Object.entries(values)) {
      if (key in defaultSettings && typeof value === "string") {
        stmt.run(key, value, nowIso());
      }
    }
  });
  write(input);
}


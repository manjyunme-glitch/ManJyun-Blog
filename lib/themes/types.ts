import type { ComponentType, ReactNode } from "react";
import type { Post } from "@/lib/content/posts";
import type { SiteSettings } from "@/lib/settings";

export type ThemeTokens = {
  background: string;
  foreground: string;
  muted: string;
  surface: string;
  border: string;
  accent: string;
  accentSoft: string;
  codeBg: string;
  fontSans: string;
  fontSerif: string;
  fontMono: string;
};

export type ThemeConfig = {
  id: string;
  name: string;
  description: string;
  version: string;
  tokens: ThemeTokens;
  supportedCards: string[];
};

export type ThemePublicProps = {
  settings: SiteSettings;
  children: ReactNode;
};

export type ThemePostCardProps = {
  post: Post;
  compact?: boolean;
};

export type BlogTheme = {
  config: ThemeConfig;
  PublicShell: ComponentType<ThemePublicProps>;
  PostCard: ComponentType<ThemePostCardProps>;
};


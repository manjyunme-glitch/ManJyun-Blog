import type { Metadata } from "next";
import "@/app/globals.css";
import "highlight.js/styles/github-dark.css";
import { getSettings } from "@/lib/settings";
import { getActiveTheme, tokensToCssVars } from "@/lib/themes/registry";

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings();
  return {
    title: {
      default: settings.siteTitle,
      template: `%s | ${settings.siteTitle}`
    },
    description: settings.siteDescription,
    metadataBase: settings.siteUrl ? new URL(settings.siteUrl) : undefined
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = getSettings();
  const theme = getActiveTheme();
  const Shell = theme.PublicShell;

  return (
    <html lang="zh-CN">
      <body style={tokensToCssVars(theme.config.tokens)}>
        <Shell settings={settings}>{children}</Shell>
      </body>
    </html>
  );
}


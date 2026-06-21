"use client";

import { useState } from "react";
import type { ThemeConfig } from "@/lib/themes/types";

export function ThemeManager({ themes, activeTheme }: { themes: ThemeConfig[]; activeTheme: string }) {
  const [active, setActive] = useState(activeTheme);
  const [message, setMessage] = useState("");

  async function activate(themeId: string) {
    const response = await fetch("/api/admin/themes", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ themeId })
    });
    if (response.ok) {
      setActive(themeId);
      setMessage("主题已切换");
    } else {
      setMessage("主题切换失败");
    }
  }

  return (
    <section className="theme-grid">
      {themes.map((theme) => (
        <article key={theme.id} className={theme.id === active ? "theme-card active" : "theme-card"}>
          <span>{theme.id === active ? "当前主题" : "可用主题"}</span>
          <h2>{theme.name}</h2>
          <p>{theme.description}</p>
          <div className="theme-swatches">
            {["background", "surface", "foreground", "accent", "accentSoft"].map((key) => (
              <i key={key} style={{ background: theme.tokens[key as keyof typeof theme.tokens] }} />
            ))}
          </div>
          <small>支持卡片：{theme.supportedCards.join(", ")}</small>
          <button disabled={theme.id === active} onClick={() => activate(theme.id)}>
            {theme.id === active ? "已启用" : "启用"}
          </button>
        </article>
      ))}
      {message ? <p className="form-message">{message}</p> : null}
    </section>
  );
}


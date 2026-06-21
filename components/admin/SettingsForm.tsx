"use client";

import { FormEvent, useState } from "react";
import type { SiteSettings } from "@/lib/settings";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [message, setMessage] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        siteTitle: form.get("siteTitle"),
        siteDescription: form.get("siteDescription"),
        siteUrl: form.get("siteUrl"),
        ownerName: form.get("ownerName"),
        ownerBio: form.get("ownerBio")
      })
    });
    setMessage(response.ok ? "已保存" : "保存失败");
  }

  return (
    <form className="settings-form" onSubmit={save}>
      <label>
        站点标题
        <input name="siteTitle" defaultValue={settings.siteTitle} />
      </label>
      <label>
        站点描述
        <textarea name="siteDescription" defaultValue={settings.siteDescription} />
      </label>
      <label>
        站点公开地址
        <input name="siteUrl" defaultValue={settings.siteUrl} placeholder="https://blog.example.com" />
      </label>
      <label>
        作者名
        <input name="ownerName" defaultValue={settings.ownerName} />
      </label>
      <label>
        关于我
        <textarea name="ownerBio" defaultValue={settings.ownerBio} />
      </label>
      <button>保存设置</button>
      {message ? <p className="form-message">{message}</p> : null}
    </form>
  );
}


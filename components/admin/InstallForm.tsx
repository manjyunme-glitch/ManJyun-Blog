"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type InstallResult = {
  qrDataUrl: string;
  secret: string;
};

export function InstallForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<InstallResult | null>(null);

  async function install(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/install", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password")
      })
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(data.message || "初始化失败");
      return;
    }
    setResult({ qrDataUrl: data.qrDataUrl, secret: data.secret });
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/install/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: form.get("code") })
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(data.message || "验证码错误");
      return;
    }
    router.push("/admin/posts");
    router.refresh();
  }

  if (result) {
    return (
      <form className="auth-card" onSubmit={verify}>
        <h1>绑定两步验证</h1>
        <p>用 1Password、Microsoft Authenticator、Aegis 等应用扫描二维码，然后输入 6 位验证码。</p>
        <img className="totp-qr" src={result.qrDataUrl} alt="TOTP QR code" />
        <label>
          手动密钥
          <input readOnly value={result.secret} />
        </label>
        <label>
          验证码
          <input name="code" inputMode="numeric" autoComplete="one-time-code" required />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button disabled={pending}>{pending ? "验证中..." : "完成安装"}</button>
      </form>
    );
  }

  return (
    <form className="auth-card" onSubmit={install}>
      <h1>初始化 ManJyun Blog</h1>
      <p>创建唯一管理员。之后后台登录必须使用密码和 TOTP 两步验证码。</p>
      <label>
        名称
        <input name="name" defaultValue="ManJyun" required />
      </label>
      <label>
        邮箱
        <input name="email" type="email" required />
      </label>
      <label>
        密码
        <input name="password" type="password" minLength={10} required />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button disabled={pending}>{pending ? "创建中..." : "创建管理员"}</button>
    </form>
  );
}


"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        code: form.get("code")
      })
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(data.message || "登录失败");
      return;
    }
    router.push("/admin/posts");
    router.refresh();
  }

  return (
    <form className="auth-card" onSubmit={login}>
      <h1>后台登录</h1>
      <label>
        邮箱
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        密码
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <label>
        两步验证码
        <input name="code" inputMode="numeric" autoComplete="one-time-code" required />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button disabled={pending}>{pending ? "登录中..." : "登录"}</button>
    </form>
  );
}


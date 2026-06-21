import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getCurrentUser } from "@/lib/auth/session";
import { isInstalled } from "@/lib/auth/users";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!isInstalled()) redirect("/admin/install");
  const user = await getCurrentUser();
  if (user) redirect("/admin/posts");
  return (
    <div className="auth-wrap">
      <LoginForm />
    </div>
  );
}


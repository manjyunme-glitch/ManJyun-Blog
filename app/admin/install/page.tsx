import { redirect } from "next/navigation";
import { InstallForm } from "@/components/admin/InstallForm";
import { getCurrentUser } from "@/lib/auth/session";
import { isInstalled } from "@/lib/auth/users";

export const dynamic = "force-dynamic";

export default async function InstallPage() {
  if (isInstalled()) {
    const user = await getCurrentUser();
    redirect(user ? "/admin/posts" : "/admin/login");
  }
  return (
    <div className="auth-wrap">
      <InstallForm />
    </div>
  );
}


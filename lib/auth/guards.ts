import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isInstalled } from "@/lib/auth/users";

export async function requireAdmin() {
  if (!isInstalled()) {
    redirect("/admin/install");
  }
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

export async function adminHomeRedirect() {
  if (!isInstalled()) {
    redirect("/admin/install");
  }
  const user = await getCurrentUser();
  redirect(user ? "/admin/posts" : "/admin/login");
}


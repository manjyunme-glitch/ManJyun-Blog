import { adminHomeRedirect } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  await adminHomeRedirect();
}


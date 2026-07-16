import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</div>;
}

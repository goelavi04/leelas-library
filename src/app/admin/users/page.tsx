import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { requireAdmin } from "@/lib/auth";
import { setUserRole } from "@/app/admin/users/actions";
import { BackButton } from "@/components/back-button";
import { ExportPdfButton } from "@/components/export-pdf-button";

export const metadata = { title: "Admin Accounts" };

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <BackButton fallbackHref="/admin" />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Admin Accounts</h1>
          <p className="mt-2 text-ink-soft">{users?.length ?? 0} people who can access this dashboard</p>
        </div>
        <ExportPdfButton
          title="Admin Accounts"
          columns={["Name", "Email", "Role", "Joined"]}
          rows={(users ?? []).map((user) => [
            user.full_name ?? "—",
            user.email ?? "—",
            user.role,
            format(new Date(user.created_at), "MMM d, yyyy"),
          ])}
          filename="admin-accounts.pdf"
        />
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-line shadow-card">
        <table className="w-full min-w-[650px] text-left text-[14.5px]">
          <thead className="bg-paper-dim text-ink-faint">
            <tr>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Email</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Role</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Joined</th>
              <th className="px-4 py-3 text-right text-[11.5px] font-bold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((user) => {
              const isSelf = user.id === session.userId;
              const toggleRole = user.role === "admin" ? "user" : "admin";
              const bound = setUserRole.bind(null, user.id, toggleRole);
              return (
                <tr key={user.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-ink">
                    {user.full_name ?? "—"}
                    {isSelf && <span className="ml-1.5 text-[12.5px] font-normal text-ink-faint">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{user.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12.5px] font-semibold capitalize ${
                        user.role === "admin" ? "bg-accent-soft text-accent" : "bg-paper-dim text-ink-soft"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{format(new Date(user.created_at), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span className="block text-right text-[13px] text-ink-faint">—</span>
                    ) : (
                      <form action={bound} className="flex justify-end">
                        <button
                          type="submit"
                          className="focus-ring rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-accent hover:bg-accent-soft"
                        >
                          {user.role === "admin" ? "Remove admin" : "Make admin"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {(users ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-soft">
                  No admin accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

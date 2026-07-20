import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-ink">Users</h1>
      <p className="mt-2 text-ink-soft">{users?.length ?? 0} people with an account</p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-line shadow-card">
        <table className="w-full min-w-[600px] text-left text-[14.5px]">
          <thead className="bg-paper-dim text-ink-faint">
            <tr>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Email</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Role</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((user) => (
              <tr key={user.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium text-ink">{user.full_name ?? "—"}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

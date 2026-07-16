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
      <h1 className="font-serif text-4xl font-semibold text-green-deep">Users</h1>
      <p className="mt-2 text-ink-soft">{users?.length ?? 0} people with an account</p>

      <div className="mt-8 overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[600px] text-left text-[15px]">
          <thead className="bg-paper-dim text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((user) => (
              <tr key={user.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium text-ink">{user.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{user.email ?? "—"}</td>
                <td className="px-4 py-3 capitalize text-ink-soft">{user.role}</td>
                <td className="px-4 py-3 text-ink-soft">{format(new Date(user.created_at), "MMM d, yyyy")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

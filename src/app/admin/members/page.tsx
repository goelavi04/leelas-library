import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { BackButton } from "@/components/back-button";
import { ExportPdfButton } from "@/components/export-pdf-button";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";

export const metadata = { title: "Members" };

export default async function AdminMembersPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <BackButton fallbackHref="/admin" />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Members</h1>
          <p className="mt-2 text-ink-soft">{members?.length ?? 0} people who can borrow books</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportPdfButton
            title="Members"
            columns={["Name", "Email", "Phone", "Joined"]}
            rows={(members ?? []).map((member) => [
              member.full_name,
              member.email ?? "—",
              member.phone ?? "—",
              format(new Date(member.created_at), "MMM d, yyyy"),
            ])}
            filename="members.pdf"
          />
          <Link
            href="/admin/members/new"
            className="focus-ring flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-[14.5px] font-semibold text-white shadow-card hover:bg-accent-hover"
          >
            <PlusIcon className="h-4 w-4" />
            Add Member
          </Link>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-line shadow-card">
        <table className="w-full min-w-[650px] text-left text-[14.5px]">
          <thead className="bg-paper-dim text-ink-faint">
            <tr>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Email</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Phone</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Joined</th>
              <th className="px-4 py-3 text-right text-[11.5px] font-bold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(members ?? []).map((member) => (
              <tr key={member.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium text-ink">{member.full_name}</td>
                <td className="px-4 py-3 text-ink-soft">{member.email ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{member.phone ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{format(new Date(member.created_at), "MMM d, yyyy")}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/admin/members/${member.id}/edit`}
                      aria-label={`Edit ${member.full_name}`}
                      className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-paper-dim hover:text-ink"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/members/${member.id}/delete`}
                      aria-label={`Delete ${member.full_name}`}
                      className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-critical-soft hover:text-critical"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {(members ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-soft">
                  No members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

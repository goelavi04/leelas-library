import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { confirmDeleteMember } from "@/app/admin/members/actions";
import { DeleteMemberConfirm } from "@/components/delete-member-confirm";
import { BackButton } from "@/components/back-button";

export const metadata = { title: "Delete Member" };

export default async function DeleteMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: member } = await supabase.from("members").select("id, full_name").eq("id", id).single();

  if (!member) notFound();

  const boundDelete = confirmDeleteMember.bind(null, member.id);

  return (
    <div>
      <BackButton fallbackHref="/admin/members" />
      <div className="mt-3">
        <DeleteMemberConfirm memberName={member.full_name} action={boundDelete} />
      </div>
    </div>
  );
}

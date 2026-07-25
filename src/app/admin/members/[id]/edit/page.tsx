import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemberForm } from "@/components/member-form";
import { updateMember } from "@/app/admin/members/actions";
import { BackButton } from "@/components/back-button";

export const metadata = { title: "Edit Member" };

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: member } = await supabase.from("members").select("*").eq("id", id).single();

  if (!member) notFound();

  const boundUpdate = updateMember.bind(null, member.id);

  return (
    <div className="max-w-2xl">
      <BackButton fallbackHref="/admin/members" label="Back to Members" />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">Edit {member.full_name}</h1>

      <div className="mt-8">
        <MemberForm
          action={boundUpdate}
          submitLabel="Save changes"
          savingLabel="Saving…"
          initialValues={{
            fullName: member.full_name,
            email: member.email,
            phone: member.phone,
            notes: member.notes,
          }}
        />
      </div>
    </div>
  );
}

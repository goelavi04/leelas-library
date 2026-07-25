import { MemberForm } from "@/components/member-form";
import { createMember } from "@/app/admin/members/actions";
import { BackButton } from "@/components/back-button";

export const metadata = { title: "Add Member" };

export default function NewMemberPage() {
  return (
    <div className="max-w-2xl">
      <BackButton fallbackHref="/admin/members" label="Back to Members" />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">Add Member</h1>

      <div className="mt-8">
        <MemberForm action={createMember} submitLabel="Add member" savingLabel="Adding…" />
      </div>
    </div>
  );
}

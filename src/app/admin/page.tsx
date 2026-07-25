import { AdminHubCard } from "@/components/admin-hub-card";
import { BookIcon, ClockIcon, TrendingUpIcon, UploadIcon, UsersIcon } from "@/components/icons";
import { BackButton } from "@/components/back-button";

export const metadata = { title: "Admin" };

export default function AdminHubPage() {
  return (
    <div>
      <BackButton fallbackHref="/" />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Admin</h1>
      <p className="mt-2 text-ink-soft">Everything you need to run the library.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminHubCard
          icon={BookIcon}
          href="/admin/books"
          title="Manage Books"
          description="Add, edit, or remove books from the catalog."
        />
        <AdminHubCard
          icon={ClockIcon}
          href="/admin/loans"
          title="Borrow & Return"
          description="Check out books, mark returns, and see what's overdue."
        />
        <AdminHubCard
          icon={UploadIcon}
          href="/admin/import"
          title="Import Books"
          description="Add many books at once from a spreadsheet or PDF list."
        />
        <AdminHubCard
          icon={TrendingUpIcon}
          href="/admin/suggestions"
          title="Suggested Acquisitions"
          description="See what people are searching for and what's in high demand."
        />
        <AdminHubCard
          icon={UsersIcon}
          href="/admin/members"
          title="Members"
          description="Add and manage the people who can borrow books."
        />
        <AdminHubCard
          icon={UsersIcon}
          href="/admin/users"
          title="Admin Accounts"
          description="See who can access this dashboard."
        />
      </div>
    </div>
  );
}

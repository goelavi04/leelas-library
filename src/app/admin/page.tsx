import { AdminHubCard } from "@/components/admin-hub-card";

export const metadata = { title: "Admin" };

export default function AdminHubPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold text-green-deep">Admin</h1>
      <p className="mt-2 text-ink-soft">Everything you need to run the library.</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <AdminHubCard
          href="/admin/books"
          title="Manage Books"
          description="Add, edit, or remove books from the catalog."
        />
        <AdminHubCard
          href="/admin/loans"
          title="Borrow & Return"
          description="Check out books, mark returns, and see what's overdue."
        />
        <AdminHubCard
          href="/admin/import"
          title="Import Books"
          description="Add many books at once from a spreadsheet or PDF list."
        />
        <AdminHubCard
          href="/admin/suggestions"
          title="Suggested Acquisitions"
          description="See what people are searching for and what's in high demand."
        />
        <AdminHubCard
          href="/admin/users"
          title="Users"
          description="View everyone with an account."
        />
      </div>
    </div>
  );
}

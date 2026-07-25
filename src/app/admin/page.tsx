import { AdminHubCard, AdminHubHero } from "@/components/admin-hub-card";
import {
  BookIcon,
  ClockIcon,
  ScanIcon,
  ShieldIcon,
  TrendingUpIcon,
  UploadIcon,
  UsersIcon,
} from "@/components/icons";
import { BackButton } from "@/components/back-button";

export const metadata = { title: "Admin" };

export default function AdminHubPage() {
  return (
    <div>
      <BackButton fallbackHref="/" />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Admin</h1>
      <p className="mt-2 text-ink-soft">Everything you need to run the library.</p>

      <div className="mt-8">
        <AdminHubHero
          icon={ScanIcon}
          href="/admin/books/new?scan=1"
          title="Scan a barcode"
          description="Point your camera at the barcode on the back of a book — title, author, and cover fill in automatically."
        />
      </div>

      <div className="mt-10">
        <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-ink-faint">Books &amp; Borrowing</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminHubCard
            icon={BookIcon}
            href="/admin/books"
            title="Manage Books"
            description="Add, edit, or remove books from the catalog."
            accent="accent"
          />
          <AdminHubCard
            icon={ClockIcon}
            href="/admin/loans"
            title="Borrow & Return"
            description="Check out books, mark returns, and see what's overdue."
            accent="gold"
          />
          <AdminHubCard
            icon={UploadIcon}
            href="/admin/import"
            title="Import Books"
            description="Add many books at once from a spreadsheet or PDF list."
            accent="good"
          />
          <AdminHubCard
            icon={TrendingUpIcon}
            href="/admin/suggestions"
            title="Suggested Acquisitions"
            description="See what people are searching for and what's in high demand."
            accent="critical"
          />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-ink-faint">People &amp; Access</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminHubCard
            icon={UsersIcon}
            href="/admin/members"
            title="Members"
            description="Add and manage the people who can borrow books."
            accent="accent"
          />
          <AdminHubCard
            icon={ShieldIcon}
            href="/admin/users"
            title="Admin Accounts"
            description="Manage who can access this dashboard."
            accent="gold"
          />
        </div>
      </div>
    </div>
  );
}

import type { BookStatus } from "@/lib/supabase/types";

export function StatusBadge({ status }: { status: BookStatus }) {
  const isAvailable = status === "available";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
        isAvailable
          ? "bg-green-deep/10 text-green-deep"
          : "bg-terracotta/10 text-terracotta"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isAvailable ? "bg-green-deep" : "bg-terracotta"
        }`}
      />
      {isAvailable ? "Available" : "Checked out"}
    </span>
  );
}

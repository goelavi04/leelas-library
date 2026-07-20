import type { BookStatus } from "@/lib/supabase/types";
import { ClockIcon, TrendingUpIcon } from "@/components/icons";

export function StatusBadge({ status }: { status: BookStatus }) {
  const isAvailable = status === "available";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold ${
        isAvailable ? "bg-good-soft text-good" : "bg-critical-soft text-critical"
      }`}
    >
      {isAvailable ? <TrendingUpIcon className="h-3 w-3" /> : <ClockIcon className="h-3 w-3" />}
      {isAvailable ? "Available" : "Checked out"}
    </span>
  );
}

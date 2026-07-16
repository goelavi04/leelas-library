import Link from "next/link";

export function AdminHubCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="focus-ring flex flex-col gap-2 rounded-lg border border-line bg-white/60 p-6 transition hover:border-brass hover:shadow-sm"
    >
      <h2 className="font-serif text-xl font-semibold text-green-deep">{title}</h2>
      <p className="text-[15px] text-ink-soft">{description}</p>
    </Link>
  );
}

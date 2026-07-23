"use client";

import { useState } from "react";
import { FileTextIcon } from "@/components/icons";

export function ExportPdfButton({
  title,
  subtitle,
  columns,
  rows,
  filename,
  className,
}: {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: (string | number)[][];
  filename: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(title, 14, 18);

      if (subtitle) {
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(subtitle, 14, 25);
      }

      autoTable(doc, {
        startY: subtitle ? 30 : 24,
        head: [columns],
        body: rows,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [51, 41, 33], textColor: 255 },
        alternateRowStyles: { fillColor: [246, 243, 238] },
      });

      doc.save(filename);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading || rows.length === 0}
      className={
        className ??
        "focus-ring flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-[13.5px] font-semibold text-ink-soft hover:bg-paper-dim disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      <FileTextIcon className="h-4 w-4" />
      {loading ? "Preparing…" : "Export PDF"}
    </button>
  );
}

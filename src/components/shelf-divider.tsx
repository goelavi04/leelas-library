const SPINE_HEIGHTS = [14, 20, 16, 22, 12, 18, 15, 21, 13, 19, 16, 22, 14, 17, 20, 12, 18, 15, 21, 13];
const SPINE_COLORS = [
  "var(--green-deep)",
  "var(--brass)",
  "var(--terracotta)",
  "var(--ink-soft)",
  "var(--brass-light)",
];

export function ShelfDivider() {
  return (
    <div className="shelf-divider" aria-hidden="true">
      {SPINE_HEIGHTS.map((h, i) => (
        <span
          key={i}
          style={{
            height: `${h}px`,
            background: SPINE_COLORS[i % SPINE_COLORS.length],
          }}
        />
      ))}
    </div>
  );
}

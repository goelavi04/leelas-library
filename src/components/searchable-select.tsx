"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { inputClass } from "@/components/auth-card";
import { SearchIcon } from "@/components/icons";

export interface SearchableOption {
  id: string;
  label: string;
  sublabel?: string;
}

/**
 * A plain <select> becomes unusable once there are more than a couple dozen
 * options — scrolling a giant native dropdown to find one book (or member)
 * doesn't scale. This filters as you type instead, while still submitting
 * a single hidden field, so server actions reading formData.get(name) don't
 * need to change at all.
 */
export function SearchableSelect({
  name,
  options,
  placeholder,
  emptyMessage,
  required,
}: {
  name: string;
  options: SearchableOption[];
  placeholder: string;
  emptyMessage?: ReactNode;
  required?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter(
      (option) => option.label.toLowerCase().includes(term) || option.sublabel?.toLowerCase().includes(term)
    );
  }, [query, options]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function selectOption(option: SearchableOption) {
    setSelectedId(option.id);
    setQuery(option.sublabel ? `${option.label} (${option.sublabel})` : option.label);
    setOpen(false);
  }

  function handleChange(value: string) {
    setQuery(value);
    setSelectedId("");
    setOpen(true);
    setActiveIndex(0);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) selectOption(option);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  if (options.length === 0 && emptyMessage) {
    return <p className="text-[14px] text-ink-soft">{emptyMessage}</p>;
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selectedId} required={required} />
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={`${inputClass} pl-10`}
        />
      </div>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-lg border border-line bg-paper py-1.5 shadow-md"
        >
          {filtered.length === 0 ? (
            <li className="px-3.5 py-2.5 text-[14px] text-ink-soft">No matches.</li>
          ) : (
            filtered.map((option, index) => (
              <li key={option.id} role="option" aria-selected={option.id === selectedId}>
                <button
                  type="button"
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full flex-col px-3.5 py-2.5 text-left text-[14.5px] ${
                    index === activeIndex ? "bg-accent-soft text-accent" : "text-ink"
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                  {option.sublabel && <span className="text-[13px] text-ink-soft">{option.sublabel}</span>}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

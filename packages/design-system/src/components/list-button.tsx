import { Check, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { GameList } from "../types";
import { Button } from "./button";

const LISTS: { id: GameList; label: string }[] = [
  { id: "playing", label: "Gram" },
  { id: "wishlist", label: "Chcę zagrać" },
  { id: "done", label: "Ukończone" },
  { id: "dropped", label: "Porzucone" },
];

type ListButtonProps = { value?: GameList | null; onChange?: (value: GameList | null) => void };

export function ListButton({ value = null, onChange }: ListButtonProps) {
  const [selected, setSelected] = useState(value);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const current = LISTS.find((list) => list.id === selected);
  const pick = (id: GameList) => {
    const next = id === selected ? null : id;
    setSelected(next);
    setOpen(false);
    onChange?.(next);
  };

  return (
    <div ref={root} className="relative inline-block">
      <Button size="sm" variant={current ? "outline" : "secondary"} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        {current ? <Check aria-hidden className="size-4" /> : <Plus aria-hidden className="size-4" />}
        {current ? current.label : "Dodaj do listy"}
      </Button>
      {open && (
        <div role="menu" className="absolute top-[calc(100%+8px)] left-0 z-30 min-w-52 rounded-md bg-popover p-1.5 text-popover-foreground shadow-pop ring-1 ring-border">
          {LISTS.map((list) => (
            <button
              key={list.id}
              type="button"
              role="menuitemradio"
              aria-checked={list.id === selected}
              onClick={() => pick(list.id)}
              className="flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-medium hover:bg-accent focus-visible:bg-accent"
            >
              {list.label}
              {list.id === selected && <Check aria-hidden className="size-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

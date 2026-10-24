import { Search, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, type FormEvent } from "react";
import type { Game } from "../types";
import { GameCover } from "./game-cover";

export type StaggeredMenuLink = { id: string; label: string; badge?: number };

type StaggeredMenuProps = {
  open: boolean;
  onClose: () => void;
  links: StaggeredMenuLink[];
  active: string;
  onNavigate: (id: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  onSubmitSearch: () => void;
  suggestions: Game[];
  onPick: (id: number) => void;
  shortcuts: { label: string; onClick: () => void }[];
};

const SLIDE = { duration: 0.65, ease: [0.7, 0, 0.2, 1] } as const;
const LAYERS = [
  { className: "bg-[#8b5cf6]", delay: 0 },
  { className: "bg-primary", delay: 0.08 },
] as const;

const list: Variants = { open: { transition: { delayChildren: 0.32, staggerChildren: 0.08 } }, closed: {} };
const item: Variants = {
  open: { y: 0, rotate: 0, transition: { duration: 0.9, ease: [0.2, 0.9, 0.2, 1] } },
  closed: { y: "110%", rotate: 8 },
};
const shortcut: Variants = { open: { opacity: 1, y: 0, transition: { duration: 0.5 } }, closed: { opacity: 0, y: 12 } };

export function StaggeredMenu({ open, onClose, links, active, onNavigate, query, onQueryChange, onSubmitSearch, suggestions, onPick, shortcuts }: StaggeredMenuProps) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSubmitSearch();
  };

  const slide = (delay: number) => ({ initial: { x: "102%" }, animate: { x: 0 }, exit: { x: "102%" }, transition: reduced ? { duration: 0 } : { ...SLIDE, delay } });

  return (
    <AnimatePresence>
      {open && (
        <div className="pointer-events-auto fixed inset-0 z-[55] sm:hidden">
          {LAYERS.map((layer) => (
            <motion.i key={layer.className} aria-hidden {...slide(layer.delay)} className={`fixed inset-y-0 right-0 w-[min(100vw,420px)] ${layer.className}`} />
          ))}
          <motion.aside aria-label="Menu" {...slide(0.16)} className="fixed inset-y-0 right-0 flex w-[min(100vw,420px)] flex-col overflow-y-auto bg-background px-7 pt-24 pb-8">
            <button type="button" onClick={onClose} aria-label="Zamknij menu" className="fixed top-7 right-7 z-[3] inline-flex h-11 items-center gap-1.5 rounded-full bg-secondary pr-2 pl-4 text-sm font-bold">
              Zamknij
              <X aria-hidden className="size-5" />
            </button>

            <form onSubmit={submit} role="search" className="flex h-12 items-center gap-2 rounded-full bg-secondary pr-2 pl-4 focus-within:shadow-[inset_0_0_0_1.5px_var(--primary)]">
              <Search aria-hidden className="size-[18px] shrink-0 text-muted-foreground" />
              <input
                type="search"
                value={query}
                enterKeyHint="search"
                autoComplete="off"
                placeholder="Szukaj gier…"
                aria-label="Szukaj gier"
                onChange={(e) => onQueryChange(e.target.value)}
                className="h-full min-w-0 flex-1 appearance-none bg-transparent text-base font-medium outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button type="button" aria-label="Wyczyść wyszukiwanie" onClick={() => onQueryChange("")} className="grid size-8 place-items-center rounded-full hover:bg-accent">
                  <X aria-hidden className="size-4" />
                </button>
              )}
            </form>

            {query.trim().length > 1 ? (
              <div className="mt-4 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold tracking-wider text-primary uppercase">Propozycje</span>
                  <button type="button" onClick={submit} className="text-[13px] leading-[18px] font-bold text-primary">
                    Wszystkie wyniki ↵
                  </button>
                </div>
                {suggestions.length === 0 && <p className="py-2 text-sm text-muted-foreground">Brak gier pasujących do wyszukiwania.</p>}
                {suggestions.slice(0, 4).map((game) => (
                  <button key={game.id} type="button" onClick={() => onPick(game.id)} className="flex items-center gap-3 rounded-md py-1.5 text-left hover:bg-accent">
                    <GameCover thumb title={game.title} cover={game.cover} />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[15px] leading-[22px] font-semibold">{game.title}</span>
                      <span className="truncate text-[13px] leading-[18px] text-muted-foreground">{game.genres.slice(0, 2).join(", ")}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <motion.ul initial="closed" animate="open" variants={reduced ? undefined : list} className="mt-8 flex list-none flex-col gap-1.5 p-0">
                {links.map((link, i) => (
                  <li key={link.id} className="overflow-hidden">
                    <motion.button
                      type="button"
                      variants={reduced ? undefined : item}
                      aria-current={link.id === active ? "page" : undefined}
                      onClick={() => onNavigate(link.id)}
                      style={{ transformOrigin: "0 100%" }}
                      className={`flex items-start gap-2.5 font-display text-[clamp(38px,11vw,52px)] leading-[1.08] font-extrabold tracking-[-0.03em] uppercase transition-colors ${link.id === active ? "text-primary" : "hover:text-primary"}`}
                    >
                      {link.label}
                      <span aria-hidden className="mt-2 font-sans text-sm leading-none font-bold tracking-normal text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {link.badge ? <span aria-label={`${link.badge} nowych`} className="self-center rounded-full bg-primary px-[7px] font-display text-[13px] leading-6 font-extrabold tracking-normal text-primary-foreground">{link.badge}</span> : null}
                    </motion.button>
                  </li>
                ))}
              </motion.ul>
            )}

            <div className="mt-auto flex flex-col gap-3 pt-8">
              <span className="text-xs leading-4 font-bold tracking-wider text-primary uppercase">Na skróty</span>
              <motion.div initial="closed" animate="open" variants={reduced ? undefined : { open: { transition: { delayChildren: 0.75, staggerChildren: 0.06 } }, closed: {} }} className="flex flex-wrap gap-x-5 gap-y-1.5">
                {shortcuts.map((entry) => (
                  <motion.button key={entry.label} type="button" variants={reduced ? undefined : shortcut} onClick={entry.onClick} className="text-base leading-6 font-semibold hover:text-primary">
                    {entry.label}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

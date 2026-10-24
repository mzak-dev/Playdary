import { Search, X } from "lucide-react";
import { useEffect, type FormEvent } from "react";
import { cn } from "../lib/cn";
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

const EASE = "ease-[cubic-bezier(0.7,0,0.2,1)]";
const SLIDE = `transition-transform duration-[650ms] ${EASE}`;
const LAYER = `fixed inset-y-0 right-0 w-[min(100vw,420px)] ${SLIDE}`;

export function StaggeredMenu({ open, onClose, links, active, onNavigate, query, onQueryChange, onSubmitSearch, suggestions, onPick, shortcuts }: StaggeredMenuProps) {
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

  return (
    <div aria-hidden={!open} inert={!open} className={cn("fixed inset-0 z-[55] sm:hidden", open ? "visible" : "pointer-events-none invisible transition-[visibility] delay-[900ms]")}>
      <div aria-hidden className="pointer-events-none">
        <i className={cn(LAYER, "bg-[#8b5cf6] delay-[120ms]", open ? "translate-x-0 delay-0" : "translate-x-[102%]")} />
        <i className={cn(LAYER, "bg-primary delay-[60ms]", open ? "translate-x-0 delay-[80ms]" : "translate-x-[102%]")} />
      </div>
      <aside aria-label="Menu" className={cn(LAYER, "flex flex-col overflow-y-auto bg-background px-7 pt-24 pb-8 motion-reduce:transition-none", open ? "translate-x-0 delay-[160ms]" : "translate-x-[102%]")}>
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
          <ul className="mt-8 flex list-none flex-col gap-1.5 p-0">
            {links.map((link, i) => (
              <li key={link.id} className="overflow-hidden">
                <button
                  type="button"
                  aria-current={link.id === active ? "page" : undefined}
                  onClick={() => onNavigate(link.id)}
                  style={{ transitionDelay: open ? `${320 + i * 80}ms` : "0ms" }}
                  className={cn(
                    "flex origin-bottom-left items-start gap-2.5 font-display text-[clamp(38px,11vw,52px)] leading-[1.08] font-extrabold tracking-[-0.03em] uppercase transition-[transform,color] duration-[900ms] ease-[cubic-bezier(0.2,0.9,0.2,1)] motion-reduce:transition-none",
                    open ? "translate-y-0 rotate-0" : "translate-y-[110%] rotate-[8deg]",
                    link.id === active ? "text-primary" : "hover:text-primary",
                  )}
                >
                  {link.label}
                  <span aria-hidden className="mt-2 font-sans text-sm leading-none font-bold tracking-normal text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {link.badge ? <span aria-label={`${link.badge} nowych`} className="self-center rounded-full bg-primary px-[7px] font-display text-[13px] leading-6 font-extrabold tracking-normal text-primary-foreground">{link.badge}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-8">
          <span className="text-xs leading-4 font-bold tracking-wider text-primary uppercase">Na skróty</span>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            {shortcuts.map((shortcut, i) => (
              <button
                key={shortcut.label}
                type="button"
                onClick={shortcut.onClick}
                style={{ transitionDelay: open ? `${750 + i * 60}ms` : "0ms" }}
                className={cn("text-base leading-6 font-semibold transition-[opacity,transform] duration-500 hover:text-primary motion-reduce:transition-none", open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")}
              >
                {shortcut.label}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

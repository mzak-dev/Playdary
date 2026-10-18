import { Bell, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import type { Game } from "../types";
import { GameCover } from "./game-cover";

type NavLink = { id: string; label: string; short: string };

type NavBarProps = {
  user: string;
  links: NavLink[];
  active: string;
  onNavigate: (id: string) => void;
  suggestions: Game[];
  onSearch: (query: string) => void;
  onPick: (id: number) => void;
  onSignOut: () => void;
};

function useHiddenOnScrollDown() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 80);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return hidden;
}

export function NavBar({ user, links, active, onNavigate, suggestions, onSearch, onPick, onSignOut }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const hidden = useHiddenOnScrollDown() && !searchOpen;
  const activeIndex = Math.max(0, links.findIndex((link) => link.id === active));

  useEffect(() => {
    if (searchOpen) input.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !menu.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menuOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    onSearch("");
  };

  return (
    <div className={cn("pointer-events-none sticky top-0 z-50 flex justify-center px-4 pt-3 transition duration-500 sm:px-8", hidden && "-translate-y-[90px] opacity-0")}>
      <nav aria-label="Główna" className="pointer-events-auto relative flex max-w-full items-center gap-2 rounded-full bg-secondary py-2 pr-2 pl-[18px] shadow-pop">
        <div className="mr-4 flex items-center gap-2.5 font-display text-[15px] leading-none font-extrabold tracking-[0.06em] uppercase">
          <span aria-hidden className="grid size-7 place-items-center rounded-full bg-foreground text-[13px] tracking-normal text-background">P</span>
          <span className="hidden sm:inline">Playdary</span>
        </div>

        <div className={cn("relative grid overflow-hidden rounded-full transition-[width,opacity] duration-[400ms]", searchOpen ? "invisible w-0 opacity-0" : "w-[150px] sm:w-60")} style={{ gridTemplateColumns: `repeat(${links.length}, 1fr)` }}>
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 rounded-full bg-accent transition-transform duration-[450ms] ease-[cubic-bezier(0.3,1.25,0.5,1)]"
            style={{ width: `${100 / links.length}%`, transform: `translateX(${activeIndex * 100}%)` }}
          />
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              aria-current={link.id === active ? "page" : undefined}
              onClick={() => onNavigate(link.id)}
              className={cn("relative z-[1] h-10 px-3 text-sm font-semibold whitespace-nowrap transition-colors hover:text-foreground", link.id === active ? "text-foreground" : "text-muted-foreground")}
            >
              <span className="hidden sm:inline">{link.label}</span>
              <span className="sm:hidden">{link.short}</span>
            </button>
          ))}
        </div>

        <div className="relative flex">
          <div className={cn("flex h-10 items-center overflow-hidden rounded-full transition-[width,background] duration-[450ms]", searchOpen ? "w-[min(320px,calc(100vw-190px))] bg-background focus-within:shadow-[inset_0_0_0_1.5px_var(--primary)]" : "w-10")}>
            <button type="button" aria-label="Szukaj gier" aria-expanded={searchOpen} onClick={() => setSearchOpen(true)} className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-accent">
              <Search aria-hidden className="size-5" />
            </button>
            {searchOpen && (
              <>
                <input
                  ref={input}
                  value={query}
                  autoComplete="off"
                  placeholder="Szukaj gier…"
                  aria-label="Szukaj gier"
                  onChange={(e) => {
                    setQuery(e.target.value);
                    onSearch(e.target.value);
                  }}
                  onKeyDown={(e) => e.key === "Escape" && closeSearch()}
                  className="h-10 min-w-0 flex-1 bg-transparent px-1 text-sm font-medium outline-none placeholder:text-muted-foreground"
                />
                <button type="button" aria-label="Zamknij wyszukiwarkę" onClick={closeSearch} className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-accent">
                  <X aria-hidden className="size-[18px]" />
                </button>
              </>
            )}
          </div>
          {searchOpen && query.trim() && (
            <div aria-label="Podpowiedzi" className="absolute top-[calc(100%+16px)] left-0 w-[360px] max-w-[calc(100vw-48px)] rounded-md bg-popover p-1.5 text-popover-foreground shadow-pop ring-1 ring-border">
              {suggestions.length === 0 && <p className="p-3 text-[13px] leading-[18px] text-muted-foreground">Brak gier pasujących do wyszukiwania.</p>}
              {suggestions.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => {
                    onPick(game.id);
                    closeSearch();
                  }}
                  className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left hover:bg-accent focus-visible:bg-accent"
                >
                  <GameCover thumb title={game.title} cover={game.cover} />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[15px] leading-[22px] font-semibold">{game.title}</span>
                    <span className="text-[13px] leading-[18px] text-muted-foreground">{game.genres.slice(0, 2).join(", ")}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" aria-label="Powiadomienia (nowe)" className="relative grid size-10 place-items-center rounded-full hover:bg-accent">
          <Bell aria-hidden className="size-5" />
          <span className="absolute top-[7px] right-[7px] size-2.5 rounded-full bg-primary ring-2 ring-secondary" />
        </button>
        <div ref={menu} className="relative">
          <button
            type="button"
            aria-label={`Profil: ${user}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="grid size-10 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground uppercase"
          >
            {user.charAt(0)}
          </button>
          {menuOpen && (
            <div role="menu" className="absolute top-[calc(100%+16px)] right-0 min-w-48 rounded-md bg-popover p-1.5 text-popover-foreground shadow-pop ring-1 ring-border">
              <p className="px-3 pt-2 pb-1 text-[13px] leading-[18px] text-muted-foreground">Zalogowano jako {user}</p>
              <button type="button" role="menuitem" onClick={onSignOut} className="w-full rounded-[10px] px-3 py-2.5 text-left text-sm font-medium hover:bg-accent focus-visible:bg-accent">
                Wyloguj się
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

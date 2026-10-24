import { Footer, NavBar } from "@playdary/design-system";
import type { Session } from "@supabase/supabase-js";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { AiChat } from "./ai-chat";
import { useServerEmbeddings } from "../lib/embed-settings";
import { useFriendRequests } from "../lib/friends";
import { useSearch } from "../lib/games";
import { useUsername } from "../lib/profile";
import { supabase } from "../lib/supabase";
import { useDebounced } from "../lib/use-debounced";

const NAV_LINKS = [
  { id: "home", label: "Strona główna", short: "Główna" },
  { id: "lists", label: "Moje listy", short: "Listy" },
  { id: "friends", label: "Znajomi", short: "Znajomi" },
];

const NAV_PATHS: Record<string, "/" | "/lists" | "/friends"> = { home: "/", lists: "/lists", friends: "/friends" };

type AppShellProps = { session: Session; active?: string; children: ReactNode };

export function AppShell({ session, active = "home", children }: AppShellProps) {
  const navigate = useNavigate();
  const locationKey = useRouterState({ select: (state) => state.resolvedLocation?.href ?? "" });
  const user = useUsername(session);
  const [serverEmbeddings, setServerEmbeddings] = useServerEmbeddings();
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const debounced = useDebounced(trimmed);
  const search = useSearch(debounced);
  const incoming = (useFriendRequests().data ?? []).filter((request) => request.direction === "incoming").length;
  const links = NAV_LINKS.map((link) => (link.id === "friends" ? { ...link, badge: incoming } : link));

  const signOut = async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/login" });
  };

  return (
    <div className="mx-auto max-w-[1344px]">
      <NavBar
        user={user}
        links={links}
        active={active}
        onNavigate={(id) => navigate({ to: NAV_PATHS[id] ?? "/" })}
        suggestions={trimmed.length > 1 ? (search.data ?? []) : []}
        searching={search.isFetching || trimmed !== debounced}
        onSearch={setQuery}
        onPick={(id) => navigate({ to: "/games/$gameId", params: { gameId: String(id) } })}
        locationKey={locationKey}
        onSubmitSearch={(q) => navigate({ to: "/search", search: { q } })}
        serverEmbeddings={serverEmbeddings}
        onServerEmbeddingsChange={setServerEmbeddings}
        onOpenProfile={() => navigate({ to: "/profile" })}
        onSignOut={signOut}
      />
      {children}
      <Footer />
      <AiChat />
    </div>
  );
}

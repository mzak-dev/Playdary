import { NavBar } from "@playdary/design-system";
import type { Session } from "@supabase/supabase-js";
import { useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { AiChat } from "./ai-chat";
import { useServerEmbeddings } from "../lib/embed-settings";
import { useSearch } from "../lib/games";
import { useUsername } from "../lib/profile";
import { supabase } from "../lib/supabase";
import { useDebounced } from "../lib/use-debounced";

const NAV_LINKS = [
  { id: "home", label: "Strona główna", short: "Główna" },
  { id: "lists", label: "Moje listy", short: "Listy" },
];

type AppShellProps = { session: Session; active?: string; children: ReactNode };

export function AppShell({ session, active = "home", children }: AppShellProps) {
  const navigate = useNavigate();
  const user = useUsername(session);
  const [serverEmbeddings, setServerEmbeddings] = useServerEmbeddings();
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const debounced = useDebounced(trimmed);
  const search = useSearch(debounced);

  const signOut = async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/login" });
  };

  return (
    <div className="mx-auto max-w-[1344px]">
      <NavBar
        user={user}
        links={NAV_LINKS}
        active={active}
        onNavigate={(id) => navigate({ to: id === "lists" ? "/lists" : "/" })}
        suggestions={trimmed.length > 1 ? (search.data ?? []) : []}
        searching={search.isFetching || trimmed !== debounced}
        onSearch={setQuery}
        onPick={(id) => navigate({ to: "/games/$gameId", params: { gameId: String(id) } })}
        serverEmbeddings={serverEmbeddings}
        onServerEmbeddingsChange={setServerEmbeddings}
        onSignOut={signOut}
      />
      {children}
      <AiChat />
    </div>
  );
}

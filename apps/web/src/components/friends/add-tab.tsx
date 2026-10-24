import { Button, Skeleton, TextField, UserRow } from "@playdary/design-system";
import { useState } from "react";
import { mutualLabel, useSearchUsers, useProfile } from "@playdary/core";
import { useDebounced } from "../../lib/use-debounced";
import { Panel, SectionHeading } from "../panel";
import { UserActions } from "../user-actions";

export const inviteLink = (username: string) => `${window.location.origin}${import.meta.env.BASE_URL}u/${encodeURIComponent(username)}`;

export function AddTab({ userId }: { userId: string }) {
  const profile = useProfile(userId);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const trimmed = query.trim();
  const debounced = useDebounced(trimmed);
  const results = useSearchUsers(debounced);
  const link = profile.data ? inviteLink(profile.data.username) : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="flex min-w-0 flex-col gap-3.5">
        <SectionHeading>Znajdź po nazwie użytkownika</SectionHeading>
        <TextField label="Nazwa użytkownika" type="search" autoComplete="off" placeholder="Wpisz nazwę, np. mateo" value={query} onChange={(e) => setQuery(e.target.value)} />
        {trimmed.length < 2 && <p className="text-muted-foreground">Wpisz co najmniej dwa znaki, żeby wyszukać.</p>}
        {trimmed.length >= 2 && (results.isFetching || trimmed !== debounced) && !results.data && <Skeleton aria-hidden className="h-16 rounded-lg" />}
        {results.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wyszukać: {results.error.message}</p>}
        {trimmed === debounced && results.data?.length === 0 && <p className="text-muted-foreground">Nie znaleziono nikogo o takiej nazwie.</p>}
        {results.data?.map((user) => (
          <UserRow key={user.id} name={user.username} subtitle={user.mutual > 0 ? mutualLabel(user.mutual) : undefined} actions={<UserActions userId={userId} user={user} />} />
        ))}
      </section>

      <aside>
        <Panel title="Twój link zaproszenia">
          <p className="text-sm leading-[21px] text-muted-foreground">Wyślij link znajomemu. Po otwarciu zobaczy Twój profil i będzie mógł Cię dodać.</p>
          <p className="rounded-md bg-background px-4 py-3 font-mono text-[13px] leading-5 break-all">{link || "…"}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Button size="sm" onClick={copy} disabled={!link}>
              Kopiuj link
            </Button>
            {copied && <span role="status" className="text-[13px] leading-[18px] font-semibold text-success">Skopiowano</span>}
          </div>
        </Panel>
      </aside>
    </div>
  );
}

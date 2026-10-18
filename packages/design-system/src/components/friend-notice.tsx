import { Eye, Star } from "lucide-react";
import type { Friend } from "../types";

const people = (n: number) => (n === 1 ? "osoba" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "osoby" : "osób");

export function FriendNotice({ kind, users }: Friend) {
  const [first] = users;
  if (!first) return null;
  const rest = users.length - 1;
  const Icon = kind === "rated" ? Star : Eye;

  const text =
    kind === "rated" ? (
      rest > 0 ? (
        <>
          <strong className="font-bold text-foreground">{first.name}</strong> i jeszcze {rest} {people(rest)} też ocenili tę grę
        </>
      ) : (
        <>
          <strong className="font-bold text-foreground">{first.name}</strong> też ocenił(a) tę grę
          {first.score ? <>: <strong className="font-bold text-foreground">{first.score}/10</strong></> : null}
        </>
      )
    ) : rest > 0 ? (
      <>
        <strong className="font-bold text-foreground">{first.name}</strong> i jeszcze {rest} {people(rest)} też obserwują tę grę
      </>
    ) : (
      <>
        <strong className="font-bold text-foreground">{first.name}</strong> też obserwuje tę grę
      </>
    );

  return (
    <p className="flex items-center gap-2.5 rounded-full bg-secondary py-1.5 pr-3.5 pl-1.5 text-[13px] leading-[18px] font-medium text-muted-foreground">
      <span aria-hidden className="flex shrink-0">
        {users.slice(0, 3).map((user) => (
          <span key={user.name} className="-ml-2 grid size-[26px] place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground uppercase ring-2 ring-secondary first:ml-0">
            {user.name.charAt(0)}
          </span>
        ))}
      </span>
      <Icon aria-hidden className="size-4 shrink-0 text-primary" />
      <span>{text}</span>
    </p>
  );
}

import { cn } from "../lib/cn";
import type { ActivityKind } from "../types";
import { Avatar } from "./avatar";
import { CountUp } from "./count-up";
import { GameCover } from "./game-cover";

type ActivityItemProps = {
  name: string;
  when: string;
  kind: ActivityKind;
  score?: number | null;
  game: { title: string; cover: string | null };
  onOpen?: () => void;
};

const KINDS: Record<ActivityKind, { label: string; style: string }> = {
  rated: { label: "Ocena", style: "bg-rating/15 text-rating" },
  done: { label: "Ukończono", style: "bg-success/15 text-success" },
  follow: { label: "Obserwuje", style: "bg-primary/15 text-primary" },
  wish: { label: "Chce zagrać", style: "bg-primary/15 text-primary" },
};

export function ActivityItem({ name, when, kind, score, game, onOpen }: ActivityItemProps) {
  const { label, style } = KINDS[kind];

  return (
    <button type="button" onClick={onOpen} aria-label={`${name}: ${label} ${game.title}`} className="flex w-full items-center gap-3.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-secondary focus-visible:bg-secondary">
      <Avatar name={name} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <strong className="text-[15px] leading-[22px] font-bold">{name}</strong>
          <span className="text-[13px] leading-[18px] text-muted-foreground">{when}</span>
        </span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-5">
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs leading-[18px] font-semibold", style)}>{kind === "rated" && score ? <>Ocena <CountUp to={score} />/10</> : label}</span>
          <span className="font-medium">{game.title}</span>
        </span>
      </span>
      <GameCover thumb title={game.title} cover={game.cover} />
    </button>
  );
}

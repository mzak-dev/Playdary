import { Button, Countdown, ScoreBadge } from "@playdary/design-system";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Playdary</h1>
      <div className="flex items-center gap-4">
        <ScoreBadge value={87} />
        <Button>Obserwuj</Button>
        <Button variant="secondary">Dodaj do listy</Button>
      </div>
      <Countdown to={Date.now() + 42 * 86_400_000} />
    </main>
  );
}

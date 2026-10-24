import { RatedGameRow, Skeleton } from "@playdary/design-system";
import { useNavigate } from "@tanstack/react-router";
import { useSetList, useUserLists, useRatedGames } from "@playdary/core";

export function Ratings({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const rated = useRatedGames(userId);
  const lists = useUserLists(userId);
  const setList = useSetList(userId);

  return (
    <div className="flex flex-col gap-3">
      {rated.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać ocen: {rated.error.message}</p>}
      {rated.isPending && [0, 1].map((i) => <Skeleton key={i} aria-hidden className="h-[84px] rounded-lg" />)}
      {rated.data?.length === 0 && <p className="text-muted-foreground">Nie oceniono jeszcze żadnej gry. Oceń grę na jej stronie.</p>}
      {rated.data?.map(({ game, score }) => (
        <RatedGameRow
          key={game.id}
          game={game}
          score={score}
          list={lists.data?.[game.id] ?? null}
          onListChange={(list) => setList.mutate({ gameId: game.id, list })}
          onOpen={() => navigate({ to: "/games/$gameId", params: { gameId: String(game.id) } })}
        />
      ))}
    </div>
  );
}

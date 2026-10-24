import { useRatedGames, useSetList, useUserLists } from "@playdary/core";
import { RatedGameRow, Skeleton } from "@playdary/design-system-native";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { ErrorText, Muted } from "../panel";

export function Ratings({ userId }: { userId: string }) {
  const router = useRouter();
  const rated = useRatedGames(userId);
  const lists = useUserLists(userId);
  const setList = useSetList(userId);

  return (
    <View className="gap-3">
      {rated.error && <ErrorText>Nie udało się wczytać ocen: {rated.error.message}</ErrorText>}
      {rated.isPending && [0, 1].map((i) => <Skeleton key={i} className="h-[84px] rounded-lg" />)}
      {rated.data?.length === 0 && <Muted>Nie oceniono jeszcze żadnej gry. Oceń grę na jej stronie.</Muted>}
      {rated.data?.map(({ game, score }) => (
        <RatedGameRow key={game.id} game={game} score={score} list={lists.data?.[game.id] ?? null} onListChange={(list) => setList.mutate({ gameId: game.id, list })} onOpen={() => router.push(`/games/${game.id}`)} />
      ))}
    </View>
  );
}

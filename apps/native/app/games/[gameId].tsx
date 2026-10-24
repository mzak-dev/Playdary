import {
  igdbImage,
  tr,
  useFollows,
  useFriends,
  useGame,
  useMyRating,
  useSetList,
  useSetRating,
  useSimilar,
  useToggleFollow,
  useUserLists,
  type GameDetail,
} from "@playdary/core";
import { Button, Countdown, FriendNotice, Gallery, GameCover, GameRow, ListButton, Rating, ScoreBadge, Skeleton, StatTile, Tag, useTokenColor, type Slide } from "@playdary/design-system-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Check, Eye, Sparkles } from "lucide-react-native";
import { useRef, type ComponentRef } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AgeRatings, Label, Languages, Links, Multiplayer, PcRequirements, Related, Releases, SectionTitle, TimeToBeat } from "../../components/game-sections";
import { gamePrompt } from "../../components/chat/text";
import { useRequiredSession } from "../../lib/session";

const buildSlides = ({ game, screenshots, videos }: GameDetail): Slide[] => {
  const poster = igdbImage(screenshots[0] ?? game.cover ?? "", "t_720p");
  const trailer: Slide[] = videos[0] ? [{ kind: "video", poster, videoId: videos[0], alt: `Zwiastun: ${game.title}` }] : [];
  const images: Slide[] = screenshots.map((id, i) => ({ kind: "image", src: igdbImage(id, "t_1080p"), alt: `${game.title}: zrzut ${i + 1}` }));
  return [...trailer, ...images];
};

const formatDate = (timestamp: number | null) =>
  timestamp ? new Date(timestamp).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" }) : "TBA";

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between gap-6 border-b border-border py-3">
    <Text className="font-sans-medium text-[13px] leading-[22px] text-muted-foreground">{label}</Text>
    <Text className="min-w-0 flex-1 text-right font-sans-semibold text-[15px] leading-[22px] text-foreground">{value}</Text>
  </View>
);

function PageSkeleton() {
  return (
    <View accessibilityElementsHidden className="gap-6">
      <Skeleton className="aspect-[16/10] w-full rounded-xl" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-16 w-full" />
    </View>
  );
}

export default function GamePage() {
  const session = useRequiredSession();
  const { gameId: param } = useLocalSearchParams<{ gameId: string }>();
  const gameId = Number(param);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const foreground = useTokenColor("foreground");
  const onPrimary = useTokenColor("primaryForeground");
  const userId = session.user.id;

  const detail = useGame(gameId);
  const similar = useSimilar(gameId);
  const follows = useFollows(userId);
  const toggleFollow = useToggleFollow(userId);
  const lists = useUserLists(userId);
  const setList = useSetList(userId);
  const rating = useMyRating(userId, gameId);
  const setRating = useSetRating(userId, gameId);
  const friends = useFriends([gameId]).data?.[gameId];

  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const anchors = useRef<Record<string, number>>({});
  const anchor = (label: string) => ({ onLayout: (event: { nativeEvent: { layout: { y: number } } }) => void (anchors.current[label] = event.nativeEvent.layout.y) });
  const jumpTo = (label: string) => scroll.current?.scrollTo({ y: Math.max(0, (anchors.current[label] ?? 0) - 12), animated: true });

  const open = (id: number) => router.push(`/games/${id}`);
  const data = detail.data;
  const details = data?.details ?? null;
  const following = follows.data?.has(gameId) ?? false;
  const sections = ["O grze", "Informacje", "Klasyfikacja wiekowa", ...(details?.releases.length ? ["Premiery"] : []), ...(details?.multiplayer.length ? ["Wieloosobowa"] : []), ...(details?.languages.length ? ["Języki"] : []), ...(details ? ["Powiązane"] : []), "Podobne gry"];

  return (
    <ScrollView ref={scroll} className="flex-1 bg-background" contentContainerClassName="gap-10 px-4 pb-20" contentContainerStyle={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row">
        <Button variant="ghost" size="sm" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}>
          <ArrowLeft color={foreground} size={16} />
          Wróć
        </Button>
      </View>

      {detail.isPending && <PageSkeleton />}
      {detail.error && <Text accessibilityRole="alert" className="font-sans-medium text-sm text-destructive">Nie udało się wczytać gry: {detail.error.message}</Text>}
      {detail.data === null && <Text className="font-sans text-sm text-muted-foreground">Nie znaleziono tej gry.</Text>}

      {data && (
        <>
          <View className="gap-6">
            {buildSlides(data).length > 0 ? <Gallery slides={buildSlides(data)} /> : <GameCover title={data.game.title} cover={data.game.cover} className="rounded-xl" />}

            <View className="gap-2">
              <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">{data.game.platforms.join(" · ")}</Text>
              <Text accessibilityRole="header" className="font-display-extrabold text-[34px] leading-[38px] tracking-tight text-foreground">
                {data.game.title}
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {data.game.genres.map((genre) => (
                  <Tag key={genre}>{genre}</Tag>
                ))}
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <ScoreBadge value={data.game.score} />
              <Text className="min-w-0 flex-1 font-sans-medium text-[13px] leading-[18px] text-muted-foreground">
                {data.game.score === null ? "Brak oceny w IGDB" : `Ocena IGDB na podstawie ${data.ratingCount?.toLocaleString("pl-PL") ?? 0} głosów`}
              </Text>
            </View>

            <View className="flex-row gap-2">
              <StatTile value={data.game.score === null ? "–" : String(data.game.score)} label="Ocena IGDB" />
              <StatTile value={(data.ratingCount ?? 0).toLocaleString("pl-PL")} label="Głosów" />
              <StatTile value={data.game.hypes.toLocaleString("pl-PL")} label="Obserwujących" />
            </View>

            <Countdown to={data.game.releaseDate} />

            <View className="flex-row flex-wrap items-center gap-2">
              <Button variant={following ? "outline" : "primary"} accessibilityState={{ selected: following }} onPress={() => toggleFollow.mutate({ gameId, follow: !following })}>
                {following ? <Check color={foreground} size={18} /> : <Eye color={onPrimary} size={18} />}
                {following ? "Obserwujesz" : "Obserwuj"}
              </Button>
              <ListButton size="md" value={lists.data?.[gameId] ?? null} onChange={(list) => setList.mutate({ gameId, list })} />
              <Button variant="secondary" onPress={() => router.push({ pathname: "/chat", params: { prompt: gamePrompt(data.game.title) } })}>
                <Sparkles color={foreground} size={18} />
                Zapytaj o tę grę
              </Button>
            </View>

            {details && <TimeToBeat data={details.timeToBeat} />}

            <View className="gap-1">
              <Label>Twoja ocena</Label>
              <Rating value={rating.data ?? 0} onChange={(score) => setRating.mutate(score)} disabled={rating.isPending} />
            </View>

            {friends && <FriendNotice {...friends} />}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 grow-0" contentContainerClassName="gap-2 px-4">
            {sections.map((label) => (
              <Pressable key={label} accessibilityRole="button" onPress={() => jumpTo(label)} className="h-8 justify-center rounded-full border border-border px-3.5 active:opacity-80">
                <Text className="font-sans-semibold text-[13px] text-foreground">{label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View className="gap-3" {...anchor("O grze")}>
            <SectionTitle large>O grze</SectionTitle>
            <Text className="font-sans text-[15px] leading-[22px] text-foreground">{data.summary ?? "Brak opisu w IGDB."}</Text>
            {data.storyline && (
              <View className="gap-1.5">
                <Label>Fabuła</Label>
                <Text className="font-sans text-[15px] leading-[22px] text-foreground">{data.storyline}</Text>
              </View>
            )}
          </View>

          <View {...anchor("Informacje")}>
            <Text accessibilityRole="header" className="mb-2 font-display text-xl leading-[26px] text-foreground">
              Informacje
            </Text>
            <InfoRow label="Data premiery" value={formatDate(data.game.releaseDate)} />
            <InfoRow label="Platformy" value={data.game.platforms.join(", ") || "–"} />
            <InfoRow label="Gatunki" value={data.game.genres.join(", ") || "–"} />
            {details && (
              <>
                <InfoRow label="Deweloper" value={details.developers.join(", ") || "–"} />
                <InfoRow label="Wydawca" value={details.publishers.join(", ") || "–"} />
                <InfoRow label="Tryby gry" value={details.modes.map(tr).join(", ") || "–"} />
                <InfoRow label="Perspektywa" value={details.perspectives.map(tr).join(", ") || "–"} />
                <InfoRow label="Typ" value={details.gameType ? tr(details.gameType) : "–"} />
              </>
            )}
          </View>

          {details && (
            <>
              <View className="gap-10">
                <View {...anchor("Klasyfikacja wiekowa")}>
                  <AgeRatings items={details.ageRatings} />
                </View>
                <Links items={details.websites} />
                <View {...anchor("Premiery")}>
                  <Releases items={details.releases} />
                </View>
                <View {...anchor("Wieloosobowa")}>
                  <Multiplayer items={details.multiplayer} />
                </View>
                <View {...anchor("Języki")}>
                  <Languages items={details.languages} />
                </View>
                <PcRequirements steamId={details.steamId} />
                <View {...anchor("Powiązane")}>
                  <Related related={details.related} onOpen={open} />
                </View>
              </View>
            </>
          )}

          <View className="gap-4" {...anchor("Podobne gry")}>
            <SectionTitle large>Podobne gry</SectionTitle>
            <View className="-mx-4 gap-1">
              {similar.isPending &&
                [0, 1, 2].map((i) => (
                  <View key={i} accessibilityElementsHidden className="flex-row items-center gap-4 px-4 py-3">
                    <Skeleton className="h-[60px] w-[88px] shrink-0" />
                    <View className="flex-1 gap-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3.5 w-1/4" />
                    </View>
                  </View>
                ))}
              {similar.data?.map((game) => (
                <GameRow key={game.id} game={game} list={lists.data?.[game.id] ?? null} onListChange={(list) => setList.mutate({ gameId: game.id, list })} onOpen={() => open(game.id)} />
              ))}
              {similar.data?.length === 0 && <Text className="px-4 font-sans text-sm text-muted-foreground">Brak podobnych gier. Ta gra nie ma jeszcze wektora znaczeniowego.</Text>}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

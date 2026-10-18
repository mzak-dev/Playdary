import { Button, Countdown, FriendNotice, Gallery, GameCover, GameRow, LineSidebar, ListButton, Rating, ScoreBadge, Skeleton, StatTile, Tag, type Slide } from "@playdary/design-system";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Check, Eye } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { AgeRatings, Languages, Links, Multiplayer, PcRequirements, Related, Releases, TimeToBeat } from "../components/game-sections";
import { tr } from "../lib/labels";
import { requireSession } from "../lib/auth";
import { useFollows, useFriends, useGame, useSimilar, useToggleFollow, type GameDetail } from "../lib/games";
import { useMyRating, useSetList, useSetRating, useUserLists } from "../lib/library";

export const Route = createFileRoute("/games/$gameId")({
  beforeLoad: async () => ({ session: await requireSession() }),
  component: GamePage,
});

const igdbImage = (id: string, size: string) => `https://images.igdb.com/igdb/image/upload/${size}/${id}.jpg`;

const buildSlides = ({ game, screenshots, videos }: GameDetail): Slide[] => {
  const poster = igdbImage(screenshots[0] ?? game.cover ?? "", "t_720p");
  const trailer: Slide[] = videos[0] ? [{ kind: "video", poster, videoId: videos[0], alt: `Zwiastun: ${game.title}` }] : [];
  const images: Slide[] = screenshots.map((id, i) => ({ kind: "image", src: igdbImage(id, "t_1080p"), alt: `${game.title}: zrzut ${i + 1}` }));
  return [...trailer, ...images];
};

const formatDate = (timestamp: number | null) =>
  timestamp ? new Date(timestamp).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" }) : "TBA";

const Label = ({ children }: { children: string }) => <span className="text-[13px] leading-4 font-semibold tracking-[0.02em] text-muted-foreground">{children}</span>;

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-6 border-b border-border py-3">
    <span className="text-[13px] leading-[22px] font-medium text-muted-foreground">{label}</span>
    <span className="text-right text-[15px] leading-[22px] font-semibold">{value}</span>
  </div>
);

function PageSkeleton() {
  return (
    <div aria-hidden className="flex flex-wrap items-start gap-12 px-4 pt-2 sm:px-8">
      <Skeleton className="aspect-[16/10] w-full max-w-[640px] flex-[1_1_440px] rounded-xl" />
      <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-10 w-2/3 rounded-full" />
      </div>
    </div>
  );
}

function GamePage() {
  const { session } = Route.useRouteContext();
  const gameId = Number(Route.useParams().gameId);
  const router = useRouter();
  const navigate = useNavigate();
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

  const open = (id: number) => navigate({ to: "/games/$gameId", params: { gameId: String(id) } });
  const data = detail.data;
  const details = data?.details ?? null;
  const sections = [
    "O grze",
    "Informacje",
    ...(details ? ["Klasyfikacja wiekowa"] : []),
    ...(details?.releases.length ? ["Premiery"] : []),
    ...(details?.multiplayer.length ? ["Wieloosobowa"] : []),
    ...(details?.languages.length ? ["Języki"] : []),
    ...(details ? ["Powiązane"] : []),
    "Podobne gry",
  ];
  const jumpTo = (_index: number, label: string) =>
    [...document.querySelectorAll("h2")].find((heading) => heading.textContent?.startsWith(label))?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <AppShell session={session} active="">
      <div className="flex flex-col gap-10 px-4 pt-2 pb-20 sm:px-8">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.history.back()}>
            <ArrowLeft aria-hidden className="size-4" />
            Wróć
          </Button>
        </div>

        {detail.isPending && <PageSkeleton />}
        {detail.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać gry: {detail.error.message}</p>}
        {detail.data === null && <p className="text-sm text-muted-foreground">Nie znaleziono tej gry.</p>}

        {data && (
          <>
            <div className="fixed top-1/2 left-4 z-40 hidden -translate-y-1/2 min-[1800px]:block">
              <LineSidebar
                items={sections}
                accentColor="var(--primary)"
                textColor="var(--muted-foreground)"
                markerColor="var(--input)"
                showIndex={false}
                falloff="sharp"
                markerLength={40}
                tickScale={0.5}
                itemGap={14}
                fontSize={0.9}
                onItemClick={jumpTo}
              />
            </div>
            <div className="flex flex-wrap items-start gap-12">
              <div className="min-w-0 max-w-[640px] flex-[1_1_440px]">
                {buildSlides(data).length > 0 ? <Gallery slides={buildSlides(data)} /> : <GameCover title={data.game.title} cover={data.game.cover} className="rounded-xl" />}
              </div>

              <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] leading-[18px] text-muted-foreground">{data.game.platforms.join(" · ")}</span>
                  <h1 className="font-display text-[clamp(30px,8vw,40px)] leading-[1.1] font-extrabold tracking-tight">{data.game.title}</h1>
                  <div className="flex flex-wrap gap-1.5">
                    {data.game.genres.map((genre) => (
                      <Tag key={genre}>{genre}</Tag>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ScoreBadge value={data.game.score} />
                  <span className="text-[13px] leading-[18px] font-medium text-muted-foreground">
                    {data.game.score === null ? "Brak oceny w IGDB" : `Ocena IGDB na podstawie ${data.ratingCount?.toLocaleString("pl-PL") ?? 0} głosów`}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <StatTile value={data.game.score === null ? "–" : String(data.game.score)} label="Ocena IGDB" />
                  <StatTile value={(data.ratingCount ?? 0).toLocaleString("pl-PL")} label="Głosów" />
                  <StatTile value={data.game.hypes.toLocaleString("pl-PL")} label="Obserwujących" />
                </div>

                <Countdown to={data.game.releaseDate} />

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={follows.data?.has(gameId) ? "outline" : "primary"}
                    aria-pressed={follows.data?.has(gameId) ?? false}
                    onClick={() => toggleFollow.mutate({ gameId, follow: !follows.data?.has(gameId) })}
                  >
                    {follows.data?.has(gameId) ? <Check aria-hidden className="size-[18px]" /> : <Eye aria-hidden className="size-[18px]" />}
                    {follows.data?.has(gameId) ? "Obserwujesz" : "Obserwuj"}
                  </Button>
                  <ListButton size="md" value={lists.data?.[gameId] ?? null} onChange={(list) => setList.mutate({ gameId, list })} />
                </div>

                {details && <TimeToBeat data={details.timeToBeat} />}

                <div className="flex flex-col gap-1">
                  <Label>Twoja ocena</Label>
                  <Rating value={rating.data ?? 0} onChange={(score) => setRating.mutate(score)} disabled={rating.isPending} />
                </div>

                {friends && <FriendNotice {...friends} />}
              </div>
            </div>

            <div className="flex flex-wrap gap-12">
              <section className="flex max-w-[640px] flex-[2_1_420px] flex-col gap-3">
                <h2 className="font-display text-[28px] leading-[34px] font-bold tracking-tight">O grze</h2>
                <p className="text-[15px] leading-[22px]">{data.summary ?? "Brak opisu w IGDB."}</p>
                {data.storyline && (
                  <div className="flex flex-col gap-1.5">
                    <Label>Fabuła</Label>
                    <p className="text-[15px] leading-[22px]">{data.storyline}</p>
                  </div>
                )}
              </section>
              <section className="flex max-w-[420px] flex-[1_1_320px] flex-col">
                <h2 className="mb-2 font-display text-xl leading-[26px] font-bold">Informacje</h2>
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
              </section>
            </div>

            {details && (
              <>
                <div className="flex flex-wrap gap-12">
                  <AgeRatings items={details.ageRatings} />
                  <Links items={details.websites} />
                </div>
                <Releases items={details.releases} />
                <Multiplayer items={details.multiplayer} />
                <Languages items={details.languages} />
                <div className="flex flex-wrap gap-12">
                  <PcRequirements steamId={details.steamId} />
                </div>
                <Related related={details.related} onOpen={open} />
              </>
            )}

            <section className="flex flex-col gap-4">
              <h2 className="font-display text-[28px] leading-[34px] font-bold tracking-tight">Podobne gry</h2>
              <div className="flex flex-col gap-1">
                {similar.isPending &&
                  [0, 1, 2].map((i) => (
                    <div key={i} aria-hidden className="flex items-center gap-4 px-4 py-3">
                      <Skeleton className="h-[60px] w-[88px] shrink-0" />
                      <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3.5 w-1/4" />
                      </div>
                    </div>
                  ))}
                {similar.data?.map((game) => (
                  <GameRow key={game.id} game={game} list={lists.data?.[game.id] ?? null} onListChange={(list) => setList.mutate({ gameId: game.id, list })} onOpen={() => open(game.id)} />
                ))}
                {similar.data?.length === 0 && <p className="text-sm text-muted-foreground">Brak podobnych gier. Ta gra nie ma jeszcze wektora znaczeniowego.</p>}
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

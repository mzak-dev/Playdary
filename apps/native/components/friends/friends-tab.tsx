import { relativeTime, useFriendAction, useFriendCards, useFriendDetail, type FriendCard } from "@playdary/core";
import { ActivityItem, Avatar, Button, MatchMeter, MatchRing, Skeleton, StatTile, Switch, TextField } from "@playdary/design-system-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { cn } from "@playdary/design-system-native";
import { ErrorText, Muted, Panel } from "../panel";

const sinceLabel = (since: number) => new Date(since).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
const statusLabel = (card: FriendCard) => (card.playing ? `Gra w ${card.playing.name}` : `Znajomi od ${sinceLabel(card.since)}`);

export function FriendsTab({ userId }: { userId: string }) {
  const cards = useFriendCards();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = cards.data?.find((card) => card.id === selectedId);

  if (selected) return <FriendDetail userId={userId} card={selected} onBack={() => setSelectedId(null)} />;

  const needle = query.trim().toLowerCase();
  const visible = (cards.data ?? []).filter((card) => card.username.toLowerCase().includes(needle));

  return (
    <View className="gap-6">
      <TextField label="Szukaj wśród znajomych" autoCapitalize="none" autoCorrect={false} placeholder="Nazwa użytkownika" value={query} onChangeText={setQuery} />
      {cards.error && <ErrorText>Nie udało się wczytać znajomych: {cards.error.message}</ErrorText>}
      {cards.isPending && (
        <View accessibilityElementsHidden className="gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[156px] rounded-lg" />
          ))}
        </View>
      )}
      {cards.data && visible.length === 0 && <Muted>{cards.data.length === 0 ? "Nie masz jeszcze znajomych. Dodaj kogoś w zakładce Dodaj." : "Brak znajomych pasujących do wyszukiwania."}</Muted>}
      <View className="gap-4">
        {visible.map((card) => (
          <Pressable key={card.id} accessibilityRole="button" accessibilityLabel={`Profil znajomego: ${card.username}`} onPress={() => setSelectedId(card.id)} className="gap-4 rounded-lg bg-secondary p-5 active:opacity-80">
            <View className="flex-row items-center gap-3.5">
              <Avatar name={card.username} status={card.playing ? "playing" : undefined} />
              <View className="min-w-0 flex-1">
                <Text numberOfLines={1} className="font-sans-bold text-base leading-[22px] text-foreground">
                  {card.username}
                </Text>
                <Text numberOfLines={1} className={cn("text-[13px] leading-[18px]", card.playing ? "font-sans-medium text-success" : "font-sans text-muted-foreground")}>
                  {statusLabel(card)}
                </Text>
              </View>
            </View>
            <MatchMeter value={card.match} />
            <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">{card.done === null ? "Lista ukryta" : `${card.done} ukończonych · ${card.rated ?? 0} ocen`}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

type DetailProps = { userId: string; card: FriendCard; onBack: () => void };

function FriendDetail({ userId, card, onBack }: DetailProps) {
  const router = useRouter();
  const detail = useFriendDetail(card.id);
  const action = useFriendAction(userId);
  const [confirming, setConfirming] = useState(false);
  const openGame = (gameId: number) => router.push(`/games/${gameId}`);
  const remove = () => action.mutate({ kind: "end", otherId: card.id }, { onSuccess: onBack });

  return (
    <View className="gap-8">
      <View className="flex-row">
        <Button variant="ghost" size="sm" onPress={onBack}>
          ← Wszyscy znajomi
        </Button>
      </View>
      <View className="flex-row flex-wrap items-center gap-x-7 gap-y-5">
        <Avatar name={card.username} size="lg" status={card.playing ? "playing" : undefined} />
        <View className="min-w-0 flex-1 gap-1">
          <Text accessibilityRole="header" className="font-display-extrabold text-[30px] leading-[36px] tracking-tight text-foreground">
            {card.username}
          </Text>
          <Text className="font-sans-medium text-[15px] leading-[22px] text-foreground">{statusLabel(card)}</Text>
          <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">Znajomi od {sinceLabel(card.since)}</Text>
        </View>
      </View>
      <View className="items-center">
        <MatchRing value={card.match} />
      </View>
      {card.done === null && <Muted>{card.username} ukrywa swoje listy i oceny.</Muted>}
      <View className="flex-row gap-3">
        <StatTile value={String(card.done ?? "–")} label="Ukończone" />
        <StatTile value={String(card.rated ?? "–")} label="Ocenione" />
        <StatTile value={String(detail.data?.common.length ?? "–")} label="Wspólne gry" />
      </View>

      <View className="gap-3">
        <Text accessibilityRole="header" className="font-display text-xl leading-[26px] text-foreground">
          Ostatnia aktywność
        </Text>
        {detail.error && <ErrorText>Nie udało się wczytać aktywności: {detail.error.message}</ErrorText>}
        {detail.data?.events.length === 0 && <Muted>Brak aktywności do pokazania.</Muted>}
        <View className="-mx-1 gap-0.5">
          {detail.data?.events.map((event) => (
            <ActivityItem key={`${event.kind}-${event.gameId}`} name={event.username} when={relativeTime(event.createdAt)} kind={event.kind} score={event.score} game={{ title: event.gameName, cover: event.cover }} onOpen={() => openGame(event.gameId)} />
          ))}
        </View>
      </View>

      <Panel title="Wspólne gry">
        {detail.data?.common.length === 0 && <Muted>Jeszcze nie macie wspólnych gier na listach.</Muted>}
        <View className="flex-row flex-wrap gap-2">
          {detail.data?.common.map((game) => (
            <Pressable key={game.id} accessibilityRole="button" onPress={() => openGame(game.id)} className="rounded-full bg-accent px-4 py-1.5 active:opacity-80">
              <Text className="font-sans-semibold text-[13px] leading-[18px] text-foreground">{game.name}</Text>
            </Pressable>
          ))}
        </View>
      </Panel>

      <Panel title="Opcje">
        <View className="flex-row items-center justify-between gap-4">
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="font-sans-semibold text-[15px] leading-[22px] text-foreground">Wycisz aktywność</Text>
            <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">Ukryj tę osobę w kanale aktywności.</Text>
          </View>
          <Switch label="Wycisz aktywność" checked={card.muted} onChange={(checked) => action.mutate({ kind: checked ? "mute" : "unmute", otherId: card.id })} />
        </View>
        {confirming ? (
          <View className="gap-3">
            <Muted>Na pewno usunąć {card.username}? Przestaniecie widzieć swoje listy i oceny.</Muted>
            <View className="flex-row gap-2">
              <Button size="sm" onPress={remove} disabled={action.isPending}>
                Tak, usuń
              </Button>
              <Button variant="ghost" size="sm" onPress={() => setConfirming(false)}>
                Anuluj
              </Button>
            </View>
          </View>
        ) : (
          <View className="flex-row">
            <Button variant="outline" onPress={() => setConfirming(true)}>
              Usuń ze znajomych
            </Button>
          </View>
        )}
        {action.error && <ErrorText>{action.error.message}</ErrorText>}
      </Panel>
    </View>
  );
}

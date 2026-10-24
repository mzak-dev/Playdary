import { PRIVACY, relativeTime, useFriendActivity, useFriendCards, useProfile, type FriendEvent } from "@playdary/core";
import { ActivityItem, Avatar, Button, SegmentedControl, Skeleton } from "@playdary/design-system-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ErrorText, Muted, Panel, SectionHeading } from "../panel";

const FILTERS = ["Wszystko", "Oceny", "Ukończone", "Obserwowane"] as const;

const MATCHES: Record<(typeof FILTERS)[number], (event: FriendEvent) => boolean> = {
  Wszystko: () => true,
  Oceny: (event) => event.kind === "rated",
  Ukończone: (event) => event.kind === "done",
  Obserwowane: (event) => event.kind === "follow" || event.kind === "wish",
};

const privacyLabel = (value: string | undefined) => Object.keys(PRIVACY).find((label) => PRIVACY[label] === value) ?? "Znajomi";

export function ActivityTab({ userId, onSettings }: { userId: string; onSettings: () => void }) {
  const router = useRouter();
  const activity = useFriendActivity();
  const cards = useFriendCards();
  const profile = useProfile(userId);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Wszystko");
  const events = (activity.data ?? []).filter(MATCHES[filter]);
  const playing = (cards.data ?? []).filter((card) => card.playing);
  const openGame = (gameId: number) => router.push(`/games/${gameId}`);

  return (
    <View className="gap-8">
      <View className="gap-4">
        <SectionHeading>Aktywność znajomych</SectionHeading>
        <SegmentedControl label="Filtr aktywności" items={FILTERS} value={filter} onChange={setFilter} />
        {activity.error && <ErrorText>Nie udało się wczytać aktywności: {activity.error.message}</ErrorText>}
        {activity.isPending && (
          <View accessibilityElementsHidden className="gap-1">
            {[0, 1, 2].map((i) => (
              <View key={i} className="flex-row items-center gap-4 px-3 py-2.5">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-[60px] w-[88px]" />
              </View>
            ))}
          </View>
        )}
        {activity.data && events.length === 0 && <Muted>Brak aktywności w tej kategorii. Gdy znajomi coś ocenią, ukończą lub zaczną obserwować, zobaczysz to tutaj.</Muted>}
        <View className="-mx-1 gap-0.5">
          {events.map((event) => (
            <ActivityItem
              key={`${event.friendId}-${event.kind}-${event.gameId}`}
              name={event.username}
              when={relativeTime(event.createdAt)}
              kind={event.kind}
              score={event.score}
              game={{ title: event.gameName, cover: event.cover }}
              onOpen={() => openGame(event.gameId)}
            />
          ))}
        </View>
      </View>

      <Panel title="Teraz grają">
        {playing.length === 0 && <Muted>Nikt ze znajomych teraz nie gra.</Muted>}
        <View className="gap-3.5">
          {playing.map((card) => (
            <Pressable key={card.id} accessibilityRole="button" onPress={() => card.playing && openGame(card.playing.id)} className="flex-row items-center gap-3 active:opacity-80">
              <Avatar name={card.username} status="playing" />
              <View className="min-w-0 flex-1">
                <Text numberOfLines={1} className="font-sans-semibold text-[15px] leading-[22px] text-foreground">
                  {card.username}
                </Text>
                <Text numberOfLines={1} className="font-sans text-[13px] leading-[18px] text-muted-foreground">
                  {card.playing?.name}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </Panel>

      <Panel title="Prywatność">
        <Muted>
          Twoje listy i oceny widzą: <Text className="font-sans-bold text-foreground">{privacyLabel(profile.data?.privacy)}</Text>. Znajomi dowiadują się, gdy coś ocenisz lub ukończysz.
        </Muted>
        <View className="flex-row">
          <Button variant="outline" size="sm" onPress={onSettings}>
            Zmień w ustawieniach
          </Button>
        </View>
      </Panel>
    </View>
  );
}

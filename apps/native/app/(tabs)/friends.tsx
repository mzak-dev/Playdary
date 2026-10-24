import { friendsCount, useFriendCards, useFriendRequests, useProfileStats } from "@playdary/core";
import { Avatar, SegmentedControl, Tag } from "@playdary/design-system-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { ActivityTab } from "../../components/friends/activity-tab";
import { AddTab } from "../../components/friends/add-tab";
import { FriendsTab } from "../../components/friends/friends-tab";
import { RequestsTab } from "../../components/friends/requests-tab";
import { TabScreen } from "../../components/tab-screen";
import { useRequiredSession } from "../../lib/session";

const TABS = ["Aktywność", "Znajomi", "Zaproszenia", "Dodaj"] as const;
type Tab = (typeof TABS)[number];

export default function Friends() {
  const session = useRequiredSession();
  const router = useRouter();
  const userId = session.user.id;
  const [tab, setTab] = useState<Tab>("Aktywność");
  const stats = useProfileStats(userId);
  const cards = useFriendCards().data ?? [];
  const playingNow = cards.filter((card) => card.playing);
  const incoming = (useFriendRequests().data ?? []).filter((request) => request.direction === "incoming").length;
  const tabLabel = (item: Tab) => (item === "Zaproszenia" && incoming > 0 ? `Zaproszenia · ${incoming}` : item);
  const labels = TABS.map(tabLabel);

  return (
    <TabScreen
      title="Znajomi"
      hero={
        <>
          {cards.length > 0 && (
            <View className="flex-row">
              {cards.slice(0, 5).map((card, i) => (
                <Avatar key={card.id} name={card.username} status={card.playing ? "playing" : undefined} className={i > 0 ? "-ml-2" : ""} />
              ))}
            </View>
          )}
          <View className="flex-row flex-wrap items-center gap-2">
            {stats.data && <Tag>{friendsCount(stats.data.friends)}</Tag>}
            <Tag>{`Zaproszenia · ${incoming}`}</Tag>
            <View className="flex-row items-center gap-2">
              <View className={`size-2 rounded-full ${playingNow.length ? "bg-success" : "bg-muted-foreground"}`} />
              <Text className="font-sans-medium text-sm text-muted-foreground">{playingNow.length ? `${playingNow.length} gra teraz` : "Nikt teraz nie gra"}</Text>
            </View>
          </View>
          <SegmentedControl label="Sekcje znajomych" items={labels} value={tabLabel(tab)} onChange={(label) => setTab(TABS[labels.indexOf(label)] ?? "Aktywność")} />
        </>
      }
    >
      {tab === "Aktywność" && <ActivityTab userId={userId} onSettings={() => router.navigate("/profile")} />}
      {tab === "Znajomi" && <FriendsTab userId={userId} />}
      {tab === "Zaproszenia" && <RequestsTab userId={userId} />}
      {tab === "Dodaj" && <AddTab userId={userId} />}
    </TabScreen>
  );
}

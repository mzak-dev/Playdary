import { useProfile, useProfileStats } from "@playdary/core";
import { Avatar, Button, SegmentedControl } from "@playdary/design-system-native";
import { useState } from "react";
import { Share, Text, View } from "react-native";
import { ErrorText } from "../../components/panel";
import { Overview } from "../../components/profile/overview";
import { Ratings } from "../../components/profile/ratings";
import { Settings } from "../../components/profile/settings";
import { TabScreen } from "../../components/tab-screen";
import { inviteLink } from "../../lib/invite";
import { useRequiredSession } from "../../lib/session";

const SECTIONS = ["Przegląd", "Oceny", "Ustawienia"] as const;

export default function Profile() {
  const session = useRequiredSession();
  const userId = session.user.id;
  const profile = useProfile(userId);
  const stats = useProfileStats(userId);
  const [section, setSection] = useState<(typeof SECTIONS)[number]>("Przegląd");
  const username = profile.data?.username ?? session.user.email?.split("@")[0] ?? "";

  const statItems = [
    { label: "Obserwowane", value: stats.data?.follows },
    { label: "Ocenione", value: stats.data?.rated },
    { label: "Na listach", value: stats.data?.listed },
    { label: "Znajomi", value: stats.data?.friends },
  ];

  return (
    <TabScreen
      title="Profil"
      hero={
        <>
          <View className="flex-row items-center gap-5">
            <Avatar name={username || "?"} size="lg" />
            <View className="min-w-0 flex-1 gap-1">
              <Text numberOfLines={1} className="font-display-extrabold text-[30px] leading-[34px] tracking-tight text-foreground">
                {username}
              </Text>
              <Text className="font-sans text-sm leading-5 text-muted-foreground">@{username}</Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-x-8 gap-y-3">
            {statItems.map((item) => (
              <View key={item.label} className="gap-0.5">
                <Text className="font-display text-[26px] leading-[28px] text-foreground">{item.value ?? "–"}</Text>
                <Text className="font-sans-medium text-xs leading-4 text-muted-foreground">{item.label}</Text>
              </View>
            ))}
          </View>
          <View className="flex-row flex-wrap items-center gap-3">
            <Button onPress={() => setSection("Ustawienia")}>Edytuj profil</Button>
            <Button variant="secondary" onPress={() => void Share.share({ message: inviteLink(username) })}>
              Udostępnij
            </Button>
          </View>
        </>
      }
    >
      <SegmentedControl label="Sekcje profilu" items={SECTIONS} value={section} onChange={setSection} />
      {profile.error && <ErrorText>Nie udało się wczytać profilu: {profile.error.message}</ErrorText>}
      {section === "Przegląd" && <Overview userId={userId} onShowRatings={() => setSection("Oceny")} />}
      {section === "Oceny" && <Ratings userId={userId} />}
      {section === "Ustawienia" && profile.data && <Settings session={session} userId={userId} username={profile.data.username} />}
    </TabScreen>
  );
}

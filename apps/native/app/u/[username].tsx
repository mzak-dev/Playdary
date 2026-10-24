import { mutualLabel, useProfile, useSearchUsers } from "@playdary/core";
import { Avatar, Button, PageHero, Skeleton, useTokenColor } from "@playdary/design-system-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorText, Muted } from "../../components/panel";
import { UserActions } from "../../components/user-actions";
import { useRequiredSession } from "../../lib/session";

export default function UserInvite() {
  const session = useRequiredSession();
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const foreground = useTokenColor("foreground");
  const own = useProfile(session.user.id);
  const results = useSearchUsers(username);
  const found = results.data?.find((user) => user.username.toLowerCase() === username.toLowerCase());
  const isSelf = own.data?.username.toLowerCase() === username.toLowerCase();
  const loading = own.isPending || results.isPending;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row px-4">
        <Button variant="ghost" size="sm" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}>
          <ArrowLeft color={foreground} size={16} />
          Wróć
        </Button>
      </View>
      <PageHero>
        <View className="flex-row items-center gap-6">
          <Avatar name={username} size="lg" />
          <View className="min-w-0 flex-1 gap-3">
            <Text numberOfLines={1} className="font-display-extrabold text-[30px] leading-[34px] tracking-tight text-foreground">
              {username}
            </Text>
            {loading && <Skeleton className="h-10 w-40" />}
            {!loading && isSelf && (
              <View className="flex-row">
                <Button variant="secondary" onPress={() => router.navigate("/profile")}>
                  To Twój profil
                </Button>
              </View>
            )}
            {!loading && !isSelf && found && (
              <View className="flex-row flex-wrap items-center gap-3">
                <UserActions userId={session.user.id} user={found} />
                {found.mutual > 0 && <Text className="font-sans text-sm text-muted-foreground">{mutualLabel(found.mutual)}</Text>}
              </View>
            )}
            {!loading && !isSelf && !found && <Muted>Nie znaleziono użytkownika o tej nazwie.</Muted>}
            {results.error && <ErrorText>Nie udało się wczytać użytkownika: {results.error.message}</ErrorText>}
          </View>
        </View>
      </PageHero>
    </ScrollView>
  );
}

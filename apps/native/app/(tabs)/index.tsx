import { useUsername } from "@playdary/core";
import { Text } from "react-native";
import { Screen } from "../../components/screen";
import { useRequiredSession } from "../../lib/session";

export default function Home() {
  const username = useUsername(useRequiredSession());
  return (
    <Screen title="Start">
      <Text className="font-sans text-base text-muted-foreground">Cześć, {username}.</Text>
    </Screen>
  );
}

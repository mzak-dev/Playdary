import { THEMES } from "@playdary/core";
import { Button, SegmentedControl } from "@playdary/design-system-native";
import { Screen } from "../../components/screen";
import { signOut } from "../../lib/auth";
import { setTheme, useTheme } from "../../lib/settings";

export default function Profile() {
  const theme = useTheme();
  return (
    <Screen title="Profil">
      <SegmentedControl label="Motyw" items={THEMES} value={theme} onChange={setTheme} />
      <Button variant="outline" onPress={() => void signOut()}>
        Wyloguj się
      </Button>
    </Screen>
  );
}

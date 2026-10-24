import type { Friend } from "@playdary/core";
import { Eye, Star } from "lucide-react-native";
import { Text, View } from "react-native";
import { pluralPeople } from "../lib/format";
import { useTokenColor } from "../lib/use-token-color";
import { Avatar } from "./avatar";

const B = ({ children }: { children: string }) => <Text className="font-sans-bold text-foreground">{children}</Text>;

export function FriendNotice({ kind, users }: Friend) {
  const primary = useTokenColor("primary");
  const [first] = users;
  if (!first) return null;
  const rest = users.length - 1;
  const Icon = kind === "rated" ? Star : Eye;

  const text =
    kind === "rated" ? (
      rest > 0 ? (
        <>
          <B>{first.name}</B> i jeszcze {rest} {pluralPeople(rest)} też ocenili tę grę
        </>
      ) : (
        <>
          <B>{first.name}</B> też ocenił(a) tę grę{first.score ? ": " : ""}
          {first.score ? <B>{`${first.score}/10`}</B> : null}
        </>
      )
    ) : rest > 0 ? (
      <>
        <B>{first.name}</B> i jeszcze {rest} {pluralPeople(rest)} też obserwują tę grę
      </>
    ) : (
      <>
        <B>{first.name}</B> też obserwuje tę grę
      </>
    );

  return (
    <View className="flex-row items-center gap-2.5 self-start rounded-full bg-secondary py-1.5 pr-3.5 pl-1.5">
      <View accessibilityElementsHidden className="flex-row">
        {users.slice(0, 3).map((user, i) => (
          <Avatar key={user.name} name={user.name} size="sm" className={i > 0 ? "-ml-2 rounded-full border-2 border-secondary" : ""} />
        ))}
      </View>
      <Icon color={primary} size={16} />
      <Text className="shrink font-sans-medium text-[13px] leading-[18px] text-muted-foreground">{text}</Text>
    </View>
  );
}

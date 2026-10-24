import { useFriendAction, type FoundUser } from "@playdary/core";
import { Button, Tag } from "@playdary/design-system-native";

export function UserActions({ userId, user }: { userId: string; user: FoundUser }) {
  const action = useFriendAction(userId);

  if (user.relation === "friend") return <Tag>Znajomy</Tag>;
  if (user.relation === "outgoing") return <Tag>Wysłano</Tag>;

  return (
    <Button size="sm" disabled={action.isPending} onPress={() => action.mutate({ kind: user.relation === "incoming" ? "accept" : "send", otherId: user.id })}>
      {user.relation === "incoming" ? "Akceptuj" : "Dodaj"}
    </Button>
  );
}

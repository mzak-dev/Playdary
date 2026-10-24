import { mutualLabel, relativeTime, useFriendAction, useFriendRequests, type FriendRequest } from "@playdary/core";
import { Button, Skeleton, UserRow } from "@playdary/design-system-native";
import { View } from "react-native";
import { ErrorText, Muted, SectionHeading } from "../panel";

const subtitle = (request: FriendRequest) => (request.mutual > 0 ? mutualLabel(request.mutual) : relativeTime(request.createdAt));

export function RequestsTab({ userId }: { userId: string }) {
  const requests = useFriendRequests();
  const action = useFriendAction(userId);
  const incoming = (requests.data ?? []).filter((request) => request.direction === "incoming");
  const outgoing = (requests.data ?? []).filter((request) => request.direction === "outgoing");

  return (
    <View className="gap-10">
      {requests.error && <ErrorText>Nie udało się wczytać zaproszeń: {requests.error.message}</ErrorText>}
      {action.error && <ErrorText>{action.error.message}</ErrorText>}
      {requests.isPending && <Skeleton className="h-16 rounded-lg" />}

      <View className="gap-3.5">
        <SectionHeading>Otrzymane</SectionHeading>
        {requests.data && incoming.length === 0 && <Muted>Brak nowych zaproszeń. Gdy ktoś Cię zaprosi, pojawi się tutaj.</Muted>}
        {incoming.map((request) => (
          <UserRow
            key={request.id}
            name={request.username}
            subtitle={subtitle(request)}
            actions={
              <>
                <Button size="sm" disabled={action.isPending} onPress={() => action.mutate({ kind: "accept", otherId: request.id })}>
                  Akceptuj
                </Button>
                <Button variant="ghost" size="sm" disabled={action.isPending} onPress={() => action.mutate({ kind: "end", otherId: request.id })}>
                  Odrzuć
                </Button>
              </>
            }
          />
        ))}
      </View>

      <View className="gap-3.5">
        <SectionHeading>Wysłane</SectionHeading>
        {requests.data && outgoing.length === 0 && <Muted>Nie masz oczekujących zaproszeń. Znajdź kogoś w zakładce Dodaj.</Muted>}
        {outgoing.map((request) => (
          <UserRow
            key={request.id}
            name={request.username}
            subtitle={request.mutual > 0 ? mutualLabel(request.mutual) : "Oczekuje na odpowiedź"}
            actions={
              <Button variant="ghost" size="sm" disabled={action.isPending} onPress={() => action.mutate({ kind: "end", otherId: request.id })}>
                Cofnij
              </Button>
            }
          />
        ))}
      </View>
    </View>
  );
}

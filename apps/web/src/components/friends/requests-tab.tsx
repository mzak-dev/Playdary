import { Button, Skeleton, UserRow } from "@playdary/design-system";
import { mutualLabel, relativeTime, useFriendAction, useFriendRequests, type FriendRequest } from "@playdary/core";
import { SectionHeading } from "../panel";

const subtitle = (request: FriendRequest) => (request.mutual > 0 ? mutualLabel(request.mutual) : relativeTime(request.createdAt));

export function RequestsTab({ userId }: { userId: string }) {
  const requests = useFriendRequests();
  const action = useFriendAction(userId);
  const incoming = (requests.data ?? []).filter((request) => request.direction === "incoming");
  const outgoing = (requests.data ?? []).filter((request) => request.direction === "outgoing");

  return (
    <div className="flex max-w-[720px] flex-col gap-10">
      {requests.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać zaproszeń: {requests.error.message}</p>}
      {action.error && <p role="alert" className="text-sm font-medium text-destructive">{action.error.message}</p>}
      {requests.isPending && <Skeleton aria-hidden className="h-16 rounded-lg" />}

      <section className="flex flex-col gap-3.5">
        <SectionHeading>Otrzymane</SectionHeading>
        {requests.data && incoming.length === 0 && <p className="text-muted-foreground">Brak nowych zaproszeń. Gdy ktoś Cię zaprosi, pojawi się tutaj.</p>}
        {incoming.map((request) => (
          <UserRow
            key={request.id}
            name={request.username}
            subtitle={subtitle(request)}
            actions={
              <>
                <Button size="sm" disabled={action.isPending} onClick={() => action.mutate({ kind: "accept", otherId: request.id })}>
                  Akceptuj
                </Button>
                <Button variant="ghost" size="sm" disabled={action.isPending} onClick={() => action.mutate({ kind: "end", otherId: request.id })}>
                  Odrzuć
                </Button>
              </>
            }
          />
        ))}
      </section>

      <section className="flex flex-col gap-3.5">
        <SectionHeading>Wysłane</SectionHeading>
        {requests.data && outgoing.length === 0 && <p className="text-muted-foreground">Nie masz oczekujących zaproszeń. Znajdź kogoś w zakładce Dodaj.</p>}
        {outgoing.map((request) => (
          <UserRow
            key={request.id}
            name={request.username}
            subtitle={request.mutual > 0 ? mutualLabel(request.mutual) : "Oczekuje na odpowiedź"}
            actions={
              <Button variant="ghost" size="sm" disabled={action.isPending} onClick={() => action.mutate({ kind: "end", otherId: request.id })}>
                Cofnij
              </Button>
            }
          />
        ))}
      </section>
    </div>
  );
}

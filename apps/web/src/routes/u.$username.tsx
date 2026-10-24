import { Avatar, Button, PageHero, Skeleton } from "@playdary/design-system";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "../components/app-shell";
import { UserActions } from "../components/user-actions";
import { requireSession } from "../lib/auth";
import { mutualLabel, useSearchUsers, useProfile } from "@playdary/core";

export const Route = createFileRoute("/u/$username")({
  beforeLoad: async () => ({ session: await requireSession() }),
  component: UserInvite,
});

function UserInvite() {
  const { session } = Route.useRouteContext();
  const { username } = Route.useParams();
  const navigate = useNavigate();
  const own = useProfile(session.user.id);
  const results = useSearchUsers(username);
  const found = results.data?.find((user) => user.username.toLowerCase() === username.toLowerCase());
  const isSelf = own.data?.username.toLowerCase() === username.toLowerCase();
  const loading = own.isPending || results.isPending;

  return (
    <AppShell session={session} active="friends">
      <PageHero className="pb-[104px]" contentClassName="flex-row flex-wrap items-center gap-x-7 gap-y-5">
        <Avatar name={username} size="lg" />
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-[clamp(30px,8vw,40px)] leading-[1.1] font-extrabold tracking-tight">{username}</h1>
          {loading && <Skeleton aria-hidden className="h-10 w-40" />}
          {!loading && isSelf && (
            <div>
              <Button variant="secondary" onClick={() => navigate({ to: "/profile" })}>
                To Twój profil
              </Button>
            </div>
          )}
          {!loading && !isSelf && found && (
            <div className="flex flex-wrap items-center gap-3">
              <UserActions userId={session.user.id} user={found} />
              {found.mutual > 0 && <span className="text-sm text-muted-foreground">{mutualLabel(found.mutual)}</span>}
            </div>
          )}
          {!loading && !isSelf && !found && <p role="status" className="text-muted-foreground">Nie znaleziono użytkownika o tej nazwie.</p>}
          {results.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać użytkownika: {results.error.message}</p>}
        </div>
      </PageHero>
    </AppShell>
  );
}

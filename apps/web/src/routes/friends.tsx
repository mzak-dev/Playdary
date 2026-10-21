import { PageHero, SegmentedControl, Tag } from "@playdary/design-system";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "../components/app-shell";
import { ActivityTab } from "../components/friends/activity-tab";
import { AddTab } from "../components/friends/add-tab";
import { FriendsTab } from "../components/friends/friends-tab";
import { RequestsTab } from "../components/friends/requests-tab";
import { requireSession } from "../lib/auth";
import { friendsCount, useFriendRequests } from "../lib/friends";
import { useProfileStats } from "../lib/profile";

const TABS = ["Aktywność", "Znajomi", "Zaproszenia", "Dodaj"] as const;
type Tab = (typeof TABS)[number];

export const Route = createFileRoute("/friends")({
  beforeLoad: async () => ({ session: await requireSession() }),
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => ({ tab: TABS.find((tab) => tab === search.tab) }),
  component: Friends,
});

function Friends() {
  const { session } = Route.useRouteContext();
  const { tab = "Aktywność" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const userId = session.user.id;
  const stats = useProfileStats(userId);
  const incoming = (useFriendRequests().data ?? []).filter((request) => request.direction === "incoming").length;
  const tabLabel = (item: Tab) => (item === "Zaproszenia" && incoming > 0 ? `Zaproszenia · ${incoming}` : item);
  const labels = TABS.map(tabLabel);

  return (
    <AppShell session={session} active="friends">
      <PageHero className="pb-[104px]">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <h1 className="font-display text-[clamp(32px,8vw,48px)] leading-[1.05] font-extrabold tracking-tight">Znajomi</h1>
          <div className="flex flex-wrap gap-2">
            {stats.data && <Tag>{friendsCount(stats.data.friends)}</Tag>}
            <Tag>Zaproszenia · {incoming}</Tag>
          </div>
        </div>
        <div>
          <SegmentedControl
            label="Sekcje znajomych"
            items={labels}
            value={tabLabel(tab)}
            onChange={(label) => navigate({ search: { tab: TABS[labels.indexOf(label)] } })}
          />
        </div>
      </PageHero>

      <div className="relative z-[3] -mt-[72px] min-h-[55vh] rounded-t-xl border border-b-0 border-white/5 bg-card/90 px-4 pt-10 pb-18 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-24px_60px_rgba(0,0,0,0.35)] sm:bg-card/70 sm:px-8 sm:backdrop-blur-xl">
        {tab === "Aktywność" && <ActivityTab userId={userId} />}
        {tab === "Znajomi" && <FriendsTab userId={userId} />}
        {tab === "Zaproszenia" && <RequestsTab userId={userId} />}
        {tab === "Dodaj" && <AddTab userId={userId} />}
      </div>
    </AppShell>
  );
}

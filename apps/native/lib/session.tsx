import type { Session } from "@playdary/core";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";

type SessionState = Session | null | undefined;

const SessionContext = createContext<SessionState>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const [session, setSession] = useState<SessionState>(undefined);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "SIGNED_OUT") client.clear();
      setSession(next);
    });
    return () => data.subscription.unsubscribe();
  }, [client]);

  return <SessionContext value={session}>{children}</SessionContext>;
}

export const useSession = () => useContext(SessionContext);

export function useRequiredSession() {
  const session = useSession();
  if (!session) throw new Error("useRequiredSession needs a signed-in user");
  return session;
}

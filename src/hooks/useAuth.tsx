import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Module-level shared state — prevents each useAuth() instance from creating
// its own listener and firing duplicate queries on page load.
let sharedSession: Session | null = null;
let sharedUser: User | null = null;
let initialized = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

const initAuth = (queryClient: ReturnType<typeof useQueryClient>) => {
  if (initialized) return;
  initialized = true;

  supabase.auth.onAuthStateChange((_event, session) => {
    sharedSession = session;
    sharedUser = session?.user ?? null;
    notify();
    // Invalidate role cache on auth change
    queryClient.invalidateQueries({ queryKey: ["user-role"] });
  });

  supabase.auth.getSession().then(({ data: { session } }) => {
    sharedSession = session;
    sharedUser = session?.user ?? null;
    notify();
  });
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [, setTick] = useState(0);

  useEffect(() => {
    initAuth(queryClient);
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [queryClient]);

  // Single shared role query (deduped across all useAuth callers)
  const { data: isAdmin = false, isLoading: roleLoading } = useQuery({
    queryKey: ["user-role", sharedUser?.id],
    queryFn: async () => {
      if (!sharedUser) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sharedUser.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
    enabled: !!sharedUser,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: sharedUser,
    session: sharedSession,
    isAdmin,
    loading: !initialized || roleLoading,
  };
};

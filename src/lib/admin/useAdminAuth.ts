import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AdminAuthState = {
  loading: boolean;
  user: User | null;
  isAdmin: boolean;
};

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({ loading: true, user: null, isAdmin: false });

  useEffect(() => {
    let mounted = true;

    async function check(user: User | null) {
      if (!user) {
        if (mounted) setState({ loading: false, user: null, isAdmin: false });
        return;
      }

      const roleResult = await withTimeout(
        supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
        7000,
      );
      if (!mounted) return;

      setState({
        loading: false,
        user,
        isAdmin: Boolean(roleResult?.data),
      });
    }

    async function initialize() {
      const result = await withTimeout(supabase.auth.getSession(), 7000);
      if (!mounted) return;
      await check(result?.data.session?.user ?? null);
    }

    initialize();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      check(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

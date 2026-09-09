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
  const [state, setState] = useState<AdminAuthState>({
    loading: true,
    user: null,
    isAdmin: false,
  });

  useEffect(() => {
    let mounted = true;

    async function check() {
      // getUser validates the access token with Supabase Auth instead of trusting
      // user data read only from browser storage.
      const userResult = await withTimeout(supabase.auth.getUser(), 7000);
      if (!mounted) return;

      const user = userResult?.data.user ?? null;
      if (!user || userResult?.error) {
        setState({ loading: false, user: null, isAdmin: false });
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
        isAdmin: !roleResult?.error && Boolean(roleResult?.data),
      });
    }

    void check();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void check();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

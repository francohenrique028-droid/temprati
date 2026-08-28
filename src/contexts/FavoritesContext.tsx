import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Ctx = { ids: Set<string>; toggle: (id: string) => void; has: (id: string) => boolean };
const FavCtx = createContext<Ctx | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  }, []);
  const has = useCallback((id: string) => ids.has(id), [ids]);
  return <FavCtx.Provider value={{ ids, toggle, has }}>{children}</FavCtx.Provider>;
}
export const useFavorites = () => {
  const v = useContext(FavCtx);
  if (!v) throw new Error("useFavorites must be used inside FavoritesProvider");
  return v;
};

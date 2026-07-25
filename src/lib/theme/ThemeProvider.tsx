import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { defaultTheme, type ThemeConfig } from "./types";

type Ctx = { theme: ThemeConfig; isEditorPreview: boolean };
const ThemeCtx = createContext<Ctx>({ theme: defaultTheme, isEditorPreview: false });

function deepMerge<T>(base: T, patch: any): T {
  if (patch === null || patch === undefined) return base;
  if (typeof base !== "object" || Array.isArray(base)) return patch ?? base;
  const out: any = { ...base };
  for (const k of Object.keys(patch)) {
    out[k] = deepMerge((base as any)[k], patch[k]);
  }
  return out;
}

function applyCssVars(theme: ThemeConfig) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const c = {
    ...theme.colors,
    primary: theme.colors.primary.toLowerCase() === "#ec4899" ? "hsl(28 67% 80%)" : theme.colors.primary,
    primaryForeground: theme.colors.primary.toLowerCase() === "#ec4899" ? "#1F1F1F" : theme.colors.primaryForeground,
    secondary: theme.colors.secondary.toLowerCase() === "#fff0f6" ? "hsl(28 67% 96%)" : theme.colors.secondary,
  };
  root.style.setProperty("--background", c.background);
  root.style.setProperty("--foreground", c.foreground);
  root.style.setProperty("--card", c.background);
  root.style.setProperty("--card-foreground", c.foreground);
  root.style.setProperty("--primary", c.primary);
  root.style.setProperty("--primary-foreground", c.primaryForeground);
  root.style.setProperty("--secondary", c.secondary);
  root.style.setProperty("--muted", c.muted);
  root.style.setProperty("--muted-foreground", c.mutedForeground);
  root.style.setProperty("--border", c.border);
  root.style.setProperty("--input", c.border);
  root.style.setProperty("--ring", c.primary);
  root.style.setProperty("--tp-footer-bg", c.footerBg);
  root.style.setProperty("--tp-footer-text", c.footerText);
  root.style.setProperty("--tp-font-family", `"${theme.typography.fontFamily}", ui-sans-serif, system-ui, sans-serif`);
  root.style.setProperty("--tp-base-size", `${theme.typography.baseSize}px`);
  document.body.style.fontFamily = `"${theme.typography.fontFamily}", ui-sans-serif, system-ui, sans-serif`;
  document.body.style.fontSize = `${theme.typography.baseSize}px`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("theme_settings")
        .select("config")
        .eq("singleton", true)
        .maybeSingle();
      if (cancelled) return;
      if (data?.config) setTheme(deepMerge(defaultTheme, data.config));
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { applyCssVars(theme); }, [theme]);

  return <ThemeCtx.Provider value={{ theme, isEditorPreview: false }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() { return useContext(ThemeCtx); }

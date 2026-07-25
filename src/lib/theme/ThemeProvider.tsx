import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { defaultTheme, THEME_MESSAGE, THEME_READY, THEME_SELECT, type ThemeConfig } from "./types";

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
  const c = theme.colors;
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
  const isEditorPreview = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      const inIframe = window.self !== window.top;
      const flagged = new URLSearchParams(window.location.search).get("editor") === "1";
      return inIframe || flagged;
    } catch { return true; }
  }, []);

  // Load from DB
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

  // Apply CSS vars on change
  useEffect(() => { applyCssVars(theme); }, [theme]);

  // Listen to editor postMessage + enable click-to-select overlay
  useEffect(() => {
    if (!isEditorPreview) return;
    const onMsg = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === THEME_MESSAGE && e.data.theme) {
        setTheme(deepMerge(defaultTheme, e.data.theme));
      }
    };
    window.addEventListener("message", onMsg);

    // Inject hover/selected outline styles
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-editor-styles", "true");
    styleEl.textContent = `
      [data-editor-block] { position: relative; cursor: pointer; }
      [data-editor-block]:hover { outline: 2px dashed #3b82f6; outline-offset: -2px; }
      [data-editor-block][data-editor-selected="true"] { outline: 2px solid #2563eb; outline-offset: -2px; }
      [data-editor-block][data-editor-selected="true"]::before {
        content: attr(data-editor-label);
        position: absolute; top: 0; left: 0; z-index: 9999;
        background: #2563eb; color: #fff; font: 500 10px/1 ui-sans-serif, system-ui, sans-serif;
        padding: 4px 8px; border-radius: 0 0 6px 0; letter-spacing: .04em; text-transform: uppercase;
      }
    `;
    document.head.appendChild(styleEl);

    const onClick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      const block = target?.closest?.("[data-editor-block]") as HTMLElement | null;
      if (!block) return;
      const key = block.getAttribute("data-editor-block");
      if (!key) return;
      ev.preventDefault();
      ev.stopPropagation();
      document.querySelectorAll('[data-editor-block][data-editor-selected="true"]').forEach((el) => {
        el.removeAttribute("data-editor-selected");
      });
      block.setAttribute("data-editor-selected", "true");
      block.setAttribute("data-editor-label", key);
      try { window.parent?.postMessage({ type: THEME_SELECT, key }, "*"); } catch {}
    };
    document.addEventListener("click", onClick, true);

    // Announce ready
    try { window.parent?.postMessage({ type: THEME_READY }, "*"); } catch {}

    return () => {
      window.removeEventListener("message", onMsg);
      document.removeEventListener("click", onClick, true);
      styleEl.remove();
    };
  }, [isEditorPreview]);

  return <ThemeCtx.Provider value={{ theme, isEditorPreview }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() { return useContext(ThemeCtx); }

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { defaultTheme, type ThemeConfig } from "./types";

type Ctx = { theme: ThemeConfig; isEditorPreview: boolean };
const ThemeCtx = createContext<Ctx>({ theme: defaultTheme, isEditorPreview: false });
const THEME_CACHE_KEY = "temprati:theme:cache:v1";
const THEME_CACHE_EVENT = "temprati:theme:cache-updated";

function deepMerge<T>(base: T, patch: unknown): T {
  if (patch === null || patch === undefined) return base;
  if (typeof base !== "object" || Array.isArray(base)) return (patch as T) ?? base;
  const out = { ...base } as Record<string, unknown>;
  for (const k of Object.keys(patch as Record<string, unknown>)) {
    out[k] = deepMerge((base as Record<string, unknown>)[k], (patch as Record<string, unknown>)[k]);
  }
  return out as T;
}

function readCachedTheme(): ThemeConfig {
  if (typeof window === "undefined") return defaultTheme;
  try {
    const raw = window.localStorage.getItem(THEME_CACHE_KEY);
    if (!raw) return defaultTheme;
    return deepMerge(defaultTheme, JSON.parse(raw));
  } catch {
    return defaultTheme;
  }
}

function cacheTheme(theme: ThemeConfig) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(theme));
    window.dispatchEvent(new CustomEvent(THEME_CACHE_EVENT));
  } catch {
    // Ignore cache failures; the database remains the source of truth.
  }
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
  root.style.setProperty(
    "--tp-font-family",
    `"${theme.typography.fontFamily}", ui-sans-serif, system-ui, sans-serif`,
  );
  root.style.setProperty("--tp-base-size", `${theme.typography.baseSize}px`);
  document.body.style.fontFamily = `"${theme.typography.fontFamily}", ui-sans-serif, system-ui, sans-serif`;
  document.body.style.fontSize = `${theme.typography.baseSize}px`;
}

function createSkuCandidate() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    return `TP-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
  }

  return `TP-${Date.now().toString(16).slice(-6).toUpperCase()}${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")
    .toUpperCase()}`;
}

async function createUniqueSku() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = createSkuCandidate();
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .eq("sku", candidate)
      .limit(1);

    if (!error && (!data || data.length === 0)) return candidate;
    if (error) return candidate;
  }

  return createSkuCandidate();
}

function setReactInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function installProductSkuAutofill() {
  if (typeof window === "undefined" || typeof document === "undefined") return () => undefined;
  if (!window.location.pathname.startsWith("/admin/produtos/novo")) return () => undefined;

  let generating = false;

  const fillSku = async () => {
    if (generating) return;
    const skuInput = document.querySelector<HTMLInputElement>('input[placeholder="Ex: VEST-MIDI-01"]');
    if (!skuInput || skuInput.value.trim()) return;

    generating = true;
    try {
      const sku = await createUniqueSku();
      const currentInput = document.querySelector<HTMLInputElement>('input[placeholder="Ex: VEST-MIDI-01"]');
      const nameInput = document.querySelector<HTMLInputElement>('input[placeholder="Ex: Vestido Midi Evasê em Crepe"]');
      if (currentInput && nameInput?.value.trim() && !currentInput.value.trim()) {
        setReactInputValue(currentInput, sku);
      }
    } finally {
      generating = false;
    }
  };

  const handleInput = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.placeholder !== "Ex: Vestido Midi Evasê em Crepe") return;
    if (!target.value.trim()) return;
    void fillSku();
  };

  document.addEventListener("input", handleInput, true);

  const observer = new MutationObserver(() => {
    if (document.querySelector<HTMLInputElement>('input[placeholder="Ex: Vestido Midi Evasê em Crepe"]')?.value.trim()) {
      void fillSku();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    document.removeEventListener("input", handleInput, true);
    observer.disconnect();
  };
}

async function installProductCategoryCleanup() {
  if (typeof window === "undefined" || typeof document === "undefined") return () => undefined;
  if (!window.location.pathname.startsWith("/admin/produtos/novo")) return () => undefined;

  let categoryNames: string[] = [];
  let categoriesLoaded = false;

  const loadCategories = async () => {
    if (categoriesLoaded) return;
    const { data, error } = await (supabase as any)
      .from("categories")
      .select("name")
      .eq("status", "active")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    categoryNames = error
      ? []
      : (data ?? [])
          .map((row: { name?: unknown }) => String(row.name ?? "").trim())
          .filter(Boolean);
    categoriesLoaded = true;
  };

  const cleanCategorySelect = async () => {
    const select = Array.from(document.querySelectorAll<HTMLSelectElement>("select")).find((candidate) =>
      Array.from(candidate.options).some(
        (option) => option.value === "" && option.textContent?.trim() === "Selecionar categoria",
      ),
    );
    if (!select) return;

    await loadCategories();

    const current = select.value;
    while (select.options.length > 1) select.remove(1);

    for (const name of categoryNames) {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    }

    select.value = categoryNames.includes(current) ? current : "";
  };

  const observer = new MutationObserver(() => {
    void cleanCategorySelect();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  await cleanCategorySelect();

  return () => observer.disconnect();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(() => readCachedTheme());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from("theme_settings")
          .select("config")
          .eq("singleton", true)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          console.warn("[Theme] Usando tema armazenado localmente:", error.message);
          return;
        }
        if (data?.config) {
          const nextTheme = deepMerge(defaultTheme, data.config);
          setTheme(nextTheme);
          cacheTheme(nextTheme);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("[Theme] Usando tema armazenado localmente porque o Supabase ainda não respondeu.", error);
        }
      }
    })();

    const onCacheUpdated = () => {
      setTheme(readCachedTheme());
    };
    window.addEventListener(THEME_CACHE_EVENT, onCacheUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener(THEME_CACHE_EVENT, onCacheUpdated);
    };
  }, []);

  useEffect(() => {
    applyCssVars(theme);
  }, [theme]);

  useEffect(() => installProductSkuAutofill(), []);
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    void installProductCategoryCleanup().then((fn) => {
      cleanup = fn;
    });
    return () => cleanup?.();
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, isEditorPreview: false }}>{children}</ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}

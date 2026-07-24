import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <SiteLayout>
      <div className="container-x py-40 text-center">
        <h1 className="text-7xl font-light tracking-tight">404</h1>
        <p className="mt-4 text-muted-foreground">Página não encontrada.</p>
        <a href="/" className="mt-8 inline-block rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-[#333]">Voltar para a loja</a>
      </div>
    </SiteLayout>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-medium">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente novamente em instantes.</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-[#333]">Tentar de novo</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "#temprati — moda feminina premium" },
      { name: "description", content: "roupas, calçados e acessórios femininos com design atemporal, tecidos nobres e caimento impecável." },
      { property: "og:title", content: "#temprati — moda feminina premium" },
      { property: "og:description", content: "roupas, calçados e acessórios femininos com design atemporal, tecidos nobres e caimento impecável." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "#temprati — moda feminina premium" },
      { name: "twitter:description", content: "roupas, calçados e acessórios femininos com design atemporal, tecidos nobres e caimento impecável." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d5fa327b-3b26-48cb-aef7-717f1a9cc99a/id-preview-d0693197--083afbce-13b9-4824-952e-5ca958b47091.lovable.app-1784916962372.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d5fa327b-3b26-48cb-aef7-717f1a9cc99a/id-preview-d0693197--083afbce-13b9-4824-952e-5ca958b47091.lovable.app-1784916962372.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        <CartProvider>
          <SiteLayout>
            <Outlet />
          </SiteLayout>
          <Toaster position="top-center" />
        </CartProvider>
      </FavoritesProvider>
    </QueryClientProvider>
  );
}

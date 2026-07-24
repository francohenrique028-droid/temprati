import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({ meta: [{ title: "Política de Privacidade — Ateliê" }] }),
  component: () => (
    <div className="container-x max-w-3xl py-20 space-y-6 text-sm leading-relaxed text-foreground/85">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">Ajuda</p>
      <h1 className="text-4xl font-light tracking-tight text-foreground">Política de Privacidade</h1>
      <p>Respeitamos sua privacidade. Coletamos apenas dados necessários para processar seu pedido e melhorar sua experiência.</p>
      <p>Seus dados nunca são compartilhados com terceiros para fins de marketing sem seu consentimento explícito.</p>
      <p>Você pode solicitar a exclusão de seus dados a qualquer momento em ola@atelie.com.br.</p>
    </div>
  ),
});

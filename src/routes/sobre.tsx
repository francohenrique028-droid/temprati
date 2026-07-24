import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sobre")({
  head: () => ({ meta: [{ title: "Sobre — Ateliê" }, { name: "description", content: "A história por trás do Ateliê." }] }),
  component: () => (
    <div className="container-x py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">Nossa história</p>
        <h1 className="mt-3 text-4xl font-light tracking-tight md:text-6xl">Feito para durar.</h1>
        <p className="mt-8 text-base leading-relaxed text-muted-foreground">
          O Ateliê nasce da vontade de resgatar o valor do bem-feito. Trabalhamos com tecidos nobres — cashmere italiano, linho europeu, couros vegetais — e com pequenos ateliês que dominam o ofício da alfaiataria há gerações. Cada peça é pensada para atravessar temporadas.
        </p>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Menos coleções, mais consciência. Escolhas que respeitam quem veste, quem produz e o ambiente ao redor.
        </p>
      </div>
    </div>
  ),
});

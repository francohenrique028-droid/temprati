import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/politica-de-trocas")({
  head: () => ({ meta: [{ title: "Política de Trocas — Ateliê" }] }),
  component: () => (
    <div className="container-x max-w-3xl py-20">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">Ajuda</p>
      <h1 className="mt-3 text-4xl font-light tracking-tight">Política de Trocas</h1>
      <Accordion type="single" collapsible className="mt-10">
        {[
          ["Prazo", "Trocas e devoluções em até 30 dias após o recebimento."],
          ["Condições", "Produto sem uso, com etiqueta e embalagem originais."],
          ["Como solicitar", "Acesse Minha Conta > Pedidos e selecione a peça."],
          ["Reembolso", "Estornado em até 7 dias úteis no mesmo meio de pagamento."],
        ].map(([q, a]) => (
          <AccordionItem key={q} value={q} className="border-border">
            <AccordionTrigger className="text-left">{q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
});

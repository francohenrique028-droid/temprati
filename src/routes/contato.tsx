import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [{ title: "Contato — Ateliê" }, { name: "description", content: "Fale com o Ateliê." }],
  }),
  component: () => (
    <div className="container-x py-14">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
        Fale com a gente
      </p>
      <h1 className="mt-3 text-4xl font-light tracking-tight md:text-5xl">Contato</h1>
      <div className="mt-14 grid gap-14 md:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast("Mensagem enviada");
          }}
          className="space-y-4"
        >
          <F label="Nome" />
          <F label="E-mail" type="email" />
          <F label="Assunto" />
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Mensagem
            </span>
            <textarea
              rows={6}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <button className="rounded-2xl bg-primary px-7 py-4 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground hover:bg-[#333]">
            Enviar mensagem
          </button>
        </form>
        <div className="space-y-6">
          <Info
            icon={MapPin}
            title="Endereço"
            text="Rua Oscar Freire, 1200 — Jardins, São Paulo — SP"
          />
          <Info icon={Phone} title="Telefone" text="+55 11 4000 0000" />
          <Info icon={Mail} title="E-mail" text="ola@atelie.com.br" />
          <Info icon={MapPin} title="Horário" text="Seg a Sáb · 10h às 20h" />
        </div>
      </div>
    </div>
  ),
});

function F({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
function Info({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-6">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {title}
        </p>
        <p className="mt-1 text-sm">{text}</p>
      </div>
    </div>
  );
}

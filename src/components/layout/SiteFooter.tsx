import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, MessageCircle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-background">
      <div className="container-x py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <div className="text-lg font-semibold tracking-[0.35em] uppercase">Ateliê</div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Moda premium para quem valoriza tecidos nobres, alfaiataria e o que permanece.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#" aria-label="Instagram" className="rounded-full border border-border p-2.5 hover:bg-secondary transition"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label="Facebook" className="rounded-full border border-border p-2.5 hover:bg-secondary transition"><Facebook className="h-4 w-4" /></a>
              <a href="#" aria-label="WhatsApp" className="rounded-full border border-border p-2.5 hover:bg-secondary transition"><MessageCircle className="h-4 w-4" /></a>
              <a href="#" aria-label="Pinterest" className="rounded-full border border-border p-2.5 hover:bg-secondary transition text-xs font-semibold">P</a>
            </div>
          </div>
          <FooterCol title="Institucional" links={[["Sobre","/sobre"],["Contato","/contato"],["Lojas","/contato"]]} />
          <FooterCol title="Ajuda" links={[["Trocas e Devoluções","/politica-de-trocas"],["Política de Privacidade","/politica-de-privacidade"],["Envio","/politica-de-trocas"]]} />
          <FooterCol title="Compre" links={[["Feminino","/categoria/feminino"],["Masculino","/categoria/masculino"],["Acessórios","/categoria/acessorios"],["Novidades","/novidades"]]} />
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Ateliê. Todos os direitos reservados.</p>
          <p>Feito com cuidado no Brasil.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">{title}</h4>
      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
        {links.map(([l, to]) => (
          <li key={l}><Link to={to} className="hover:text-foreground transition-colors">{l}</Link></li>
        ))}
      </ul>
    </div>
  );
}

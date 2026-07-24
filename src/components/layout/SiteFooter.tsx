import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, MessageCircle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-[#111] text-white/90">
      <div className="container-x py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <div className="text-2xl font-semibold lowercase text-primary">luxo<span className="italic font-normal text-white">.</span></div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60 italic">
              luxo sem igual — moda premium para quem valoriza design e caimento.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#" aria-label="Instagram" className="rounded-full border border-white/15 p-2.5 hover:bg-primary hover:border-primary transition"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label="Facebook" className="rounded-full border border-white/15 p-2.5 hover:bg-primary hover:border-primary transition"><Facebook className="h-4 w-4" /></a>
              <a href="#" aria-label="WhatsApp" className="rounded-full border border-white/15 p-2.5 hover:bg-primary hover:border-primary transition"><MessageCircle className="h-4 w-4" /></a>
              <a href="#" aria-label="Pinterest" className="rounded-full border border-white/15 p-2.5 hover:bg-primary hover:border-primary transition text-xs font-semibold">P</a>
            </div>
          </div>
          <FooterCol title="institucional" links={[["sobre","/sobre"],["contato","/contato"],["lojas","/contato"]]} />
          <FooterCol title="ajuda" links={[["trocas e devoluções","/politica-de-trocas"],["política de privacidade","/politica-de-privacidade"],["envio","/politica-de-trocas"]]} />
          <FooterCol title="compre" links={[["vestidos","/categoria/vestidos"],["blusas","/categoria/blusas"],["calçados","/categoria/calcados"],["acessórios","/categoria/acessorios"]]} />
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} luxo. todos os direitos reservados.</p>
          <p>feito com cuidado no brasil.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold lowercase tracking-wide text-primary">{title}</h4>
      <ul className="mt-4 space-y-3 text-sm lowercase text-white/70">
        {links.map(([l, to]) => (
          <li key={l}><Link to={to} className="hover:text-primary transition-colors">{l}</Link></li>
        ))}
      </ul>
    </div>
  );
}

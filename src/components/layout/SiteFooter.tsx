import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, MessageCircle } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeProvider";

export function SiteFooter() {
  const { theme } = useTheme();
  const f = theme.footer;
  const logo = theme.header.logoText;
  const logoImage = theme.header.logoImage?.trim() || "";
  return (
    <footer data-editor-block="footer" className="mt-24" style={{ background: "var(--tp-footer-bg)", color: "var(--tp-footer-text)" }}>
      <div className="container-x py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            {logoImage ? <img src={logoImage} alt={logo} className="h-10 max-w-[190px] object-contain object-left" /> : <div className="text-2xl font-semibold lowercase text-primary">{logo}</div>}
            <p className="mt-4 max-w-xs text-sm leading-relaxed opacity-70 italic">{f.aboutText}</p>
            <div className="mt-6 flex gap-3">
              {f.instagram && <a href={f.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full border border-white/15 p-2.5 hover:bg-primary hover:border-primary transition"><Instagram className="h-4 w-4" /></a>}
              {f.facebook && <a href={f.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full border border-white/15 p-2.5 hover:bg-primary hover:border-primary transition"><Facebook className="h-4 w-4" /></a>}
              {f.whatsapp && <a href={f.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-full border border-white/15 p-2.5 hover:bg-primary hover:border-primary transition"><MessageCircle className="h-4 w-4" /></a>}
            </div>
          </div>
          <FooterCol title="institucional" links={[["sobre", "/sobre"], ["contato", "/contato"]]} />
          <FooterCol title="ajuda" links={[["trocas e devoluções", "/politica-de-trocas"], ["política de privacidade", "/politica-de-privacidade"]]} />
          <FooterCol title="compre" links={[["vestidos", "/categoria/vestidos"], ["blusas", "/categoria/blusas"], ["calçados", "/categoria/calcados"], ["acessórios", "/categoria/acessorios"]]} />
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs opacity-60 md:flex-row">
          <p>{f.copyright}</p>
          <p>feito com cuidado no brasil.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return <div><h4 className="text-[11px] font-semibold lowercase tracking-wide text-primary">{title}</h4><ul className="mt-4 space-y-3 text-sm lowercase opacity-80">{links.map(([l, to]) => <li key={l}><Link to={to} className="hover:text-primary transition-colors">{l}</Link></li>)}</ul></div>;
}

import { Link } from "@tanstack/react-router";
import staticBanner from "@/assets/banner.jpg";

/**
 * Banner estático de largura total.
 * Para trocar a imagem: envie sua imagem no chat pedindo
 * "substitua a imagem em src/assets/banner.jpg" — o arquivo
 * será atualizado e o banner refletirá automaticamente.
 */
export function StaticBanner({
  href = "/novidades",
  alt = "Banner promocional",
}: {
  href?: string;
  alt?: string;
}) {
  return (
    <section className="w-full">
      <Link to={href} className="block w-full">
        <img
          src={staticBanner}
          alt={alt}
          loading="lazy"
          className="block h-auto w-full object-cover"
        />
      </Link>
    </section>
  );
}

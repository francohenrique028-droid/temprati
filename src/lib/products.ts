import prod1 from "@/assets/prod-1.jpg";
import prod2 from "@/assets/prod-2.jpg";
import prod3 from "@/assets/prod-3.jpg";
import prod4 from "@/assets/prod-4.jpg";
import prod5 from "@/assets/prod-5.jpg";
import prod6 from "@/assets/prod-6.jpg";
import prod7 from "@/assets/prod-7.jpg";
import prod8 from "@/assets/prod-8.jpg";
import vestidoMidiRose from "@/assets/vestido-midi-rose.jpg.asset.json";
import croppedTricotRosa from "@/assets/cropped-tricot-rosa.jpg.asset.json";
import croppedTricotRosaVideo from "@/assets/cropped-tricot-rosa.mp4.asset.json";
import calcaAlfaiatariaWide from "@/assets/calca-alfaiataria-wide.jpg.asset.json";
import conjuntoBlazerCalca from "@/assets/conjunto-blazer-calca.jpg.asset.json";
import tenisBrancoMinimal from "@/assets/tenis-branco-minimal.jpg.asset.json";
import saiaPlissadaRoseNova from "@/assets/saia-plissada-rose-nova.jpg.asset.json";
import novidade1 from "@/assets/novidade-1.jpg.asset.json";
import novidade2 from "@/assets/novidade-2.jpg.asset.json";
import novidade3 from "@/assets/novidade-3.jpg.asset.json";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  collection: string;
  brand: string;
  price: number;
  oldPrice?: number;
  badge?: "Novo" | "Promoção" | "Best Seller";
  images: string[];
  colors: string[];
  sizes: string[];
  bestseller?: boolean;
  isNew?: boolean;
  description: string;
  video?: string;
};

export const products: Product[] = [
  { id:"1", slug:"conjunto-camurca", name:"Conjunto Camurça", category:"conjuntos", collection:"lancamentos", brand:"temprati", price:289, oldPrice:349, badge:"Best Seller", images:[vestidoMidiRose.url, vestidoMidiRose.url], colors:["hsl(28 67% 80%)"], sizes:["PP","P","M","G"], bestseller:true, description:"Conjunto em tecido tipo camurça, corte moderno e caimento impecável." },
  { id:"2", slug:"regata-acetinada-off-white", name:"Regata Acetinada Off White", category:"blusas", collection:"lancamentos", brand:"temprati", price:159, images:[novidade1.url], colors:["#FFFFFF"], sizes:["P","M","G","GG"], isNew:true, badge:"Novo", description:"Blusa regata em tecido acetinado premium, decote sofisticado e caimento leve." },
  { id:"3", slug:"colete-alfaiataria-peach", name:"Colete de Alfaiataria", category:"blusas", collection:"bestsellers", brand:"temprati", price:89, oldPrice:119, badge:"Promoção", images:[croppedTricotRosa.url], colors:["hsl(28 67% 80%)"], sizes:["Único"], bestseller:true, description:"Colete de alfaiataria com caimento estruturado e acabamento refinado de alto luxo.", video: croppedTricotRosaVideo.url },
  { id:"4", slug:"vestido-linho-midi-branco", name:"Vestido de Linho Midi Branco", category:"vestidos", collection:"bestsellers", brand:"temprati", price:129, images:[calcaAlfaiatariaWide.url, calcaAlfaiatariaWide.url], colors:["hsl(28 67% 96%)"], sizes:["36","38","40","42"], bestseller:true, description:"Vestido midi confeccionado em linho puro, frescor e elegância para todas as ocasiões." },
  { id:"5", slug:"regata-acetinada-azul", name:"Regata Acetinada Azul", category:"blusas", collection:"lancamentos", brand:"temprati", price:149, images:[novidade2.url], colors:["#A0C4FF"], sizes:["P","M","G"], isNew:true, badge:"Novo", description:"Blusa regata acetinada em tom azul exclusivo, ideal para composições de luxo." },
  { id:"6", slug:"conjunto-urbana-chic", name:"Conjunto Urbana Chic", category:"conjuntos", collection:"bestsellers", brand:"temprati", price:459, oldPrice:589, badge:"Promoção", images:[conjuntoBlazerCalca.url], colors:["hsl(28 67% 80%)"], sizes:["PP","P","M","G"], bestseller:true, description:"Conjunto alfaiataria premium com blazer estruturado e calça reta de corte perfeito." },
  { id:"7", slug:"regata-acetinada-marrom", name:"Regata Acetinada Marrom", category:"blusas", collection:"lancamentos", brand:"temprati", price:149, images:[novidade3.url], colors:["#5D4037"], sizes:["Único"], isNew:true, badge:"Novo", description:"Blusa regata acetinada em tom marrom terroso, versátil e essencial no guarda-roupa sofisticado." },
  { id:"8", slug:"tenis-minimalista-branco", name:"Tênis Minimalista Branco", category:"calcados", collection:"bestsellers", brand:"temprati", price:99, oldPrice:139, badge:"Best Seller", images:[tenisBrancoMinimal.url], colors:["hsl(28 67% 88%)"], sizes:["34","35","36","37","38","39"], bestseller:true, description:"Tênis minimalista em couro premium, solado anatômico e design atemporal." },
];

export const formatPrice = (n: number) => n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
export const installment = (n: number, x = 10) => `${x}x de ${formatPrice(n/x)} sem juros`;

export const bestsellers = () => products.filter(p => p.bestseller);
export const newArrivals = () => products.filter(p => p.isNew || p.badge === "Novo");
export const byCategory = (c: string) => products.filter(p => p.category === c);
export const findBySlug = (slug: string) => products.find(p => p.slug === slug);

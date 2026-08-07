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
  { id:"1", slug:"vestido-midi-rose", name:"Conjunto Camurça", category:"vestidos", collection:"lancamentos", brand:"temprati", price:289, oldPrice:349, badge:"Best Seller", images:[vestidoMidiRose.url, vestidoMidiRose.url], colors:["hsl(28 67% 80%)"], sizes:["PP","P","M","G"], bestseller:true, description:"Vestido midi em tecido fluido, corte alinhado e caimento impecável." },
  { id:"2", slug:"blusa-manga-longa-off-white", name:"blusa manga longa off white", category:"blusas", collection:"lancamentos", brand:"temprati", price:159, images:[prod2, prod4], colors:["#FFFFFF"], sizes:["P","M","G","GG"], isNew:true, badge:"Novo", description:"Blusa em tecido leve, gola redonda e modelagem soltinha, perfeita para o dia a dia." },
  { id:"3", slug:"blusa-cropped-tricot", name:"colete de alfaiataria", category:"blusas", collection:"bestsellers", brand:"temprati", price:89, oldPrice:119, badge:"Promoção", images:[croppedTricotRosa.url], colors:["hsl(28 67% 80%)"], sizes:["Único"], bestseller:true, description:"Colete de alfaiataria com caimento estruturado e acabamento refinado.", video: croppedTricotRosaVideo.url },
  { id:"4", slug:"calca-alfaiataria-wide", name:"Vestido De Linho Midi Branco", category:"feminino", collection:"bestsellers", brand:"temprati", price:129, images:[calcaAlfaiatariaWide.url, calcaAlfaiatariaWide.url], colors:["hsl(28 67% 96%)"], sizes:["36","38","40","42"], bestseller:true, description:"Vestido midi em linho branco, caimento fluido e acabamento refinado." },
  { id:"5", slug:"saia-plissada-rose", name:"saia plissada rose", category:"feminino", collection:"lancamentos", brand:"temprati", price:79, images:[saiaPlissadaRoseNova.url, prod8], colors:["hsl(28 67% 80%)"], sizes:["P","M","G"], isNew:true, badge:"Novo", description:"Saia plissada em tecido leve, movimento fluido e look feminino." },
  { id:"6", slug:"conjunto-blazer-calca", name:"Conjunto Urbana Chic", category:"conjuntos", collection:"bestsellers", brand:"temprati", price:459, oldPrice:589, badge:"Promoção", images:[conjuntoBlazerCalca.url], colors:["hsl(28 67% 80%)"], sizes:["PP","P","M","G"], bestseller:true, description:"Conjunto alfaiataria com blazer estruturado e calça reta. Look completo pronto para usar." },
  { id:"7", slug:"bolsa-couro-rose", name:"bolsa couro rose", category:"acessorios", collection:"lancamentos", brand:"temprati", price:329, images:[prod7, prod2], colors:["hsl(28 67% 80%)"], sizes:["Único"], isNew:true, badge:"Novo", description:"Bolsa em couro sintético premium, alça ajustável e acabamento impecável." },
  { id:"8", slug:"tenis-branco-minimal", name:"tênis branco minimal", category:"calcados", collection:"bestsellers", brand:"temprati", price:99, oldPrice:139, badge:"Best Seller", images:[tenisBrancoMinimal.url], colors:["hsl(28 67% 88%)"], sizes:["34","35","36","37","38","39"], bestseller:true, description:"Tênis minimalista em couro sintético, solado macio e visual clean." },
];

export const formatPrice = (n: number) => n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
export const installment = (n: number, x = 10) => `${x}x de ${formatPrice(n/x)} sem juros`;

export const bestsellers = () => products.filter(p => p.bestseller);
export const newArrivals = () => products.filter(p => p.isNew || p.badge === "Novo");
export const byCategory = (c: string) => products.filter(p => p.category === c);
export const findBySlug = (slug: string) => products.find(p => p.slug === slug);

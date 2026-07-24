import prod1 from "@/assets/prod-1.jpg";
import prod2 from "@/assets/prod-2.jpg";
import prod3 from "@/assets/prod-3.jpg";
import prod4 from "@/assets/prod-4.jpg";
import prod5 from "@/assets/prod-5.jpg";
import prod6 from "@/assets/prod-6.jpg";
import prod7 from "@/assets/prod-7.jpg";
import prod8 from "@/assets/prod-8.jpg";

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
  images: [string, string];
  colors: string[];
  sizes: string[];
  bestseller?: boolean;
  isNew?: boolean;
  description: string;
};

export const products: Product[] = [
  { id:"1", slug:"perfume-rosa-eau-de-parfum", name:"perfume rosa eau de parfum", category:"perfumes", collection:"lancamentos", brand:"luxo", price:289, oldPrice:349, badge:"Best Seller", images:[prod1, prod3], colors:["#F472B6"], sizes:["50ml","100ml"], bestseller:true, description:"Fragrância floral sofisticada com notas de peônia, jasmim e âmbar." },
  { id:"2", slug:"serum-facial-vitamina-c", name:"sérum facial vitamina c", category:"skincare", collection:"lancamentos", brand:"luxo", price:159, images:[prod2, prod4], colors:["#FFFFFF"], sizes:["30ml"], isNew:true, badge:"Novo", description:"Sérum concentrado que ilumina e uniformiza o tom da pele." },
  { id:"3", slug:"batom-matte-pink-couture", name:"batom matte pink couture", category:"kits", collection:"bestsellers", brand:"luxo", price:89, oldPrice:119, badge:"Promoção", images:[prod3, prod1], colors:["#EC4899"], sizes:["Único"], bestseller:true, description:"Cor intensa, acabamento aveludado e longa duração." },
  { id:"4", slug:"creme-corporal-hidratante", name:"creme corporal hidratante", category:"bath", collection:"bestsellers", brand:"luxo", price:129, images:[prod4, prod5], colors:["#FFE4EC"], sizes:["200ml"], bestseller:true, description:"Hidratação profunda com manteiga de karité e óleo de rosas." },
  { id:"5", slug:"sabonete-liquido-rose", name:"sabonete líquido rose", category:"bath", collection:"lancamentos", brand:"luxo", price:79, images:[prod5, prod8], colors:["#F472B6"], sizes:["300ml"], isNew:true, badge:"Novo", description:"Espuma delicada com fragrância floral e óleos essenciais." },
  { id:"6", slug:"kit-beleza-essentials", name:"kit beleza essentials", category:"kits", collection:"bestsellers", brand:"luxo", price:459, oldPrice:589, badge:"Promoção", images:[prod6, prod1], colors:["#F472B6"], sizes:["Kit"], bestseller:true, description:"Kit completo com sérum, creme, sabonete e miniatura de perfume." },
  { id:"7", slug:"perfume-masculino-noir", name:"perfume masculino noir", category:"masculino", collection:"lancamentos", brand:"luxo", price:329, images:[prod7, prod2], colors:["#1F1F1F"], sizes:["100ml"], isNew:true, badge:"Novo", description:"Fragrância amadeirada com notas de bergamota, couro e sândalo." },
  { id:"8", slug:"gel-de-limpeza-facial", name:"gel de limpeza facial", category:"skincare", collection:"bestsellers", brand:"luxo", price:99, oldPrice:139, badge:"Best Seller", images:[prod8, prod2], colors:["#FFC1D9"], sizes:["150ml"], bestseller:true, description:"Limpeza profunda sem ressecar, para todos os tipos de pele." },
];

export const formatPrice = (n: number) => n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
export const installment = (n: number, x = 10) => `${x}x de ${formatPrice(n/x)} sem juros`;

export const bestsellers = () => products.filter(p => p.bestseller);
export const newArrivals = () => products.filter(p => p.isNew || p.badge === "Novo");
export const byCategory = (c: string) => products.filter(p => p.category === c);
export const findBySlug = (slug: string) => products.find(p => p.slug === slug);

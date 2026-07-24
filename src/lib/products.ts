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
  category: "masculino" | "feminino" | "acessorios" | "calcados";
  collection: "verao" | "inverno" | "casual" | "social" | "esportivo";
  brand: string;
  price: number;
  oldPrice?: number;
  badge?: "Novo" | "Promoção" | "Exclusivo";
  images: [string, string];
  colors: string[];
  sizes: string[];
  bestseller?: boolean;
  isNew?: boolean;
  description: string;
};

export const products: Product[] = [
  { id:"1", slug:"trico-cashmere-oat", name:"Tricô Cashmere Oat", category:"feminino", collection:"inverno", brand:"Ateliê", price:890, oldPrice:1190, badge:"Promoção", images:[prod1, prod3], colors:["#E8DFCF","#1F1F1F"], sizes:["P","M","G"], bestseller:true, description:"Peça atemporal em 100% cashmere italiano, tricô fino de manga longa." },
  { id:"2", slug:"camisa-linho-cream", name:"Camisa Linho Cream", category:"masculino", collection:"casual", brand:"Ateliê", price:520, images:[prod2, prod8], colors:["#F5E9D2","#1F1F1F"], sizes:["P","M","G","GG"], isNew:true, badge:"Novo", description:"Linho puro europeu, corte relaxado. Elegância descontraída." },
  { id:"3", slug:"trench-la-camel", name:"Trench Lã Camel", category:"feminino", collection:"inverno", brand:"Ateliê", price:2490, images:[prod3, prod1], colors:["#D6B58C"], sizes:["P","M","G"], badge:"Exclusivo", description:"Trench alfaiataria em lã dupla, botões de resina fosca." },
  { id:"4", slug:"vestido-slip-champagne", name:"Vestido Slip Champagne", category:"feminino", collection:"verao", brand:"Ateliê", price:1290, oldPrice:1590, badge:"Promoção", images:[prod4, prod3], colors:["#EBD4B0"], sizes:["PP","P","M","G"], bestseller:true, description:"Cetim de seda, caimento fluido, alças ajustáveis." },
  { id:"5", slug:"bolsa-couro-tan", name:"Bolsa Couro Tan", category:"acessorios", collection:"casual", brand:"Ateliê", price:1690, images:[prod5, prod6], colors:["#B4713E"], sizes:["Único"], bestseller:true, description:"Couro italiano, forro em suede, ferragens escovadas." },
  { id:"6", slug:"tenis-couro-branco", name:"Tênis Couro Branco", category:"calcados", collection:"casual", brand:"Ateliê", price:790, images:[prod6, prod5], colors:["#FFFFFF"], sizes:["36","37","38","39","40","41"], isNew:true, badge:"Novo", description:"Minimalista, solado ecológico, couro premium." },
  { id:"7", slug:"calca-pantalona-cream", name:"Calça Pantalona Cream", category:"feminino", collection:"social", brand:"Ateliê", price:690, images:[prod7, prod4], colors:["#F0E4CB"], sizes:["36","38","40","42"], bestseller:true, description:"Alfaiataria fluida, cintura alta, pregas frontais." },
  { id:"8", slug:"polo-tricot-olive", name:"Polo Tricot Olive", category:"masculino", collection:"casual", brand:"Ateliê", price:450, oldPrice:590, badge:"Promoção", images:[prod8, prod2], colors:["#7A7C4B"], sizes:["P","M","G","GG"], description:"Malha fio-a-fio, gola polo estruturada." },
];

export const formatPrice = (n: number) => n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
export const installment = (n: number, x = 10) => `${x}x de ${formatPrice(n/x)} sem juros`;

export const bestsellers = () => products.filter(p => p.bestseller);
export const newArrivals = () => products.filter(p => p.isNew || p.badge === "Novo");
export const byCategory = (c: Product["category"]) => products.filter(p => p.category === c);
export const findBySlug = (slug: string) => products.find(p => p.slug === slug);

import {
  ArrowDownRight,
  ArrowUpRight,
  LayoutDashboard,
  ListTree,
  PiggyBank,
  Sparkles,
  Target,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  shortLabel?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Visão Geral", icon: LayoutDashboard, shortLabel: "Visão" },
  { href: "/despesas", label: "Despesas", icon: ArrowDownRight, shortLabel: "Despesas" },
  { href: "/entradas", label: "Entradas", icon: ArrowUpRight, shortLabel: "Entradas" },
  { href: "/registros", label: "Registro", icon: ListTree, shortLabel: "Registro" },
  { href: "/metas", label: "Metas", icon: Target, shortLabel: "Metas" },
  { href: "/lucros", label: "Lucros", icon: PiggyBank, shortLabel: "Lucros" },
  { href: "/sonhos", label: "Sonhos", icon: Sparkles, shortLabel: "Sonhos" },
];

// 3 itens na bottom nav (+ slot central do + e slot do "Mais").
export const MOBILE_NAV_ITEMS: NavItem[] = [
  NAV_ITEMS[0]!, // Visão Geral
  NAV_ITEMS[1]!, // Despesas
  NAV_ITEMS[2]!, // Entradas
];

// Itens acessíveis via drawer "Mais" na bottom nav.
export const MOBILE_MORE_ITEMS: NavItem[] = [
  NAV_ITEMS[4]!, // Metas
  NAV_ITEMS[3]!, // Registro
  NAV_ITEMS[5]!, // Lucros
  NAV_ITEMS[6]!, // Sonhos
];

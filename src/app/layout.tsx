import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FinanceFlow · Controle financeiro do casal",
    template: "%s · FinanceFlow",
  },
  description:
    "Plataforma de controle financeiro para casal e família. Acompanhe entradas, saídas, metas e o saldo do mês com clareza.",
  applicationName: "FinanceFlow",
  authors: [{ name: "FinanceFlow" }],
  creator: "FinanceFlow",
  keywords: ["finanças", "controle financeiro", "orçamento", "metas", "casal"],
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      data-theme="dark"
      className={`${bricolage.variable} ${geist.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Aplica o tema antes da hidratação para evitar flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('ff-theme');if(t){document.documentElement.dataset.theme=t;}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-dvh font-sans antialiased text-fg">
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

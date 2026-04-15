import type { Metadata } from "next";
import { Abhaya_Libre, Montserrat } from "next/font/google";
import "./globals.css";
import { TenantProvider } from "@/contexts/TenantContext"; // 🛡️ PROVEDOR MESTRE INJETADO AQUI

const abhaya = Abhaya_Libre({
  weight: ['400', '700', '800'],
  subsets: ["latin"],
  variable: '--font-abhaya',
});

const montserrat = Montserrat({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ["latin"],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: "ORION | VRTICE GROWTH OS",
  description: "Sistema Operacional de Dominação de Mercado e Inteligência de Elite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${abhaya.variable} ${montserrat.variable}`}>
      <body className="bg-[#020202] text-white font-montserrat antialiased h-screen w-screen overflow-hidden selection:bg-[#d4af37] selection:text-black">
        {/* A NAVE MÃE ABRAÇA TUDO: Agora o contexto nunca falha */}
        <TenantProvider>
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}
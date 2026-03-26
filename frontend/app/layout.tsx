import type { Metadata } from "next";
import { Abhaya_Libre, Montserrat } from "next/font/google";
import "./globals.css";

// Importação otimizada das fontes da VÉRTICE (Identidade Mantida)
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
  title: "ORION | VRTICE",
  description: "Growth OS & Sistema de Inteligência Operacional de Elite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${abhaya.variable} ${montserrat.variable}`}>
      {/* 🛡️ UPGRADE DE ENGENHARIA (NO-SCROLL): 
        Alterado de 'min-h-screen' para 'h-screen w-screen overflow-hidden'.
        Isto tranca a viewport. O scroll ocorrerá apenas dentro dos painéis modulares do Dashboard.
      */}
      <body className="bg-v-black text-v-white-off font-montserrat antialiased h-screen w-screen overflow-hidden bg-v-radial-bg bg-fixed">
        {children}
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Abhaya_Libre, Montserrat } from "next/font/google";
import "./globals.css";

// Importação otimizada das fontes da VÉRTICE
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

export const metadata = {
  title: "ORION | VRTICE", // Removido o acento
  description: "Sistema de Inteligência Operacional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${abhaya.variable} ${montserrat.variable}`}>
      {/* Aqui aplicamos o preto absoluto e o gradiente radial nas costas de tudo */}
      <body className="bg-v-black text-v-white-off font-montserrat antialiased min-h-screen bg-v-radial-bg bg-fixed">
        {children}
      </body>
    </html>
  );
}
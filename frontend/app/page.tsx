"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para o login após 2 segundos de imersão na marca
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <h1 className="text-5xl md:text-7xl font-black tracking-[0.2em] text-[#d4af37] uppercase">
          Vrtice
        </h1>
        
        {/* Barra de carregamento minimalista */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
          className="h-[2px] bg-[#d4af37] mt-6"
        />
        
        <p className="mt-6 text-xs md:text-sm tracking-[0.3em] text-gray-500 font-light uppercase">
          Orion Social Suite • Inicializando
        </p>
      </motion.div>
    </div>
  );
}
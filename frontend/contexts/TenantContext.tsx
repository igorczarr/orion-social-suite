"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// Estrutura de Elite para os dados do cliente
export interface TenantData {
  id: number;
  name: string;
  initials: string;
  social_handle: string;
  niche: string;
}

interface TenantContextProps {
  tenantInfo: TenantData | null;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextProps | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantInfo, setTenantInfo] = useState<TenantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Evita bloqueios na tela de login
    if (pathname === "/" || pathname === "/login") {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("orion_token");
    if (!token) {
      router.replace("/");
      return;
    }

    // Injeta o cliente "VRTICE" na memória simulando o tempo de resposta da API
    setTimeout(() => {
      setTenantInfo({
        id: 1,
        name: "VRTICE Enterprise",
        initials: "VR",
        social_handle: "@vrtice.agency",
        niche: "Growth & Intelligence OS"
      });
      setIsLoading(false);
    }, 500);

  }, [pathname, router]);

  return (
    <TenantContext.Provider value={{ tenantInfo, isLoading }}>
      {isLoading ? (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#020202] text-[#d4af37] font-mono text-[10px] tracking-[0.3em] uppercase">
          <div className="w-16 h-16 border border-[#d4af37]/30 rounded-full border-t-[#d4af37] animate-spin mb-6 shadow-[0_0_15px_rgba(212,175,55,0.2)]"></div>
          Sincronizando Motor Lógico...
        </div>
      ) : (
        children
      )}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) throw new Error("useTenant deve ser usado dentro de um TenantProvider");
  return context;
}
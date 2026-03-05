// contexts/TenantContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { OrionAPI } from "@/lib/api"; // O nosso cabo de ligação

// A Estrutura de dados que vem do Backend (Python)
export interface TenantData {
  id: number;
  name: string;
  initials: string;
  social_handle?: string;
  niche?: string;
  keywords?: string;      
  personas?: string[];    
  competitors?: string[]; 
}

interface TenantContextProps {
  tenants: TenantData[];
  tenantInfo: TenantData | null; // Mantemos o nome 'tenantInfo' para não quebrar as telas
  isLoading: boolean;
  toggleTenant: () => void;
  refreshTenants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextProps | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar os dados reais do Python
  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const data = await OrionAPI.getTenants();
      
      if (data && data.length > 0) {
        // Formata os dados vindos do backend
        const formattedTenants = data.map((t: any) => ({
          ...t,
          initials: t.name.substring(0, 2).toUpperCase(),
          // Se o backend enviar string separada por vírgula, transformamos em array
          personas: t.personas ? (typeof t.personas === 'string' ? t.personas.split(',') : t.personas) : ["Público Geral"], 
          competitors: t.competitors ? (typeof t.competitors === 'string' ? t.competitors.split(',') : t.competitors) : ["Concorrente Não Definido"]
        }));
        setTenants(formattedTenants);
      } else {
        loadFallbackData();
      }
    } catch (error) {
      console.error("Falha ao carregar Tenants do Backend. Acionando modo Offline (Mock)...", error);
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  // Plano B: Se o Python estiver desligado, carregamos os dados estáticos antigos
  const loadFallbackData = () => {
    setTenants([
      { 
        id: 1, 
        name: "@sofs.valentini", 
        social_handle: "sofs.valentini", 
        niche: "Moda & Vestuário", 
        initials: "SV", 
        personas: ["Executiva / Alfaiataria (25-35a)", "Transição de Carreira (20-30a)", "Mãe Corporativa (30-45a)"], 
        competitors: ["@lojasrenner", "@zara_brasil"] 
      },
      { 
        id: 2, 
        name: "@lojasrenner", 
        social_handle: "lojasrenner", 
        niche: "Moda Acessível", 
        initials: "LR", 
        personas: ["Jovem Geração Z (18-24a)", "Moda Acessível / Dia a Dia (Todos)", "Básicos de Inverno (25-45a)"], 
        competitors: ["@cea_brasil", "@riachuelo"] 
      }
    ]);
  };

  // Roda uma vez quando o sistema abre
  useEffect(() => {
    fetchTenants();
  }, []);

  // Função para rodar a lista de clientes com o botão "Trocar"
  const toggleTenant = () => {
    if (tenants.length > 1) {
      setActiveIndex((prev) => (prev + 1) % tenants.length);
    }
  };

  const tenantInfo = tenants.length > 0 ? tenants[activeIndex] : null;

  return (
    <TenantContext.Provider value={{ 
      tenants, 
      tenantInfo, 
      isLoading, 
      toggleTenant,
      refreshTenants: fetchTenants 
    }}>
      {/* Apenas renderiza o sistema (children) se tivermos carregado o tenantInfo, 
        evitando erros de "undefined" nas telas 
      */}
      {tenantInfo ? children : (
        <div className="w-full h-screen flex items-center justify-center bg-v-black text-v-gold animate-pulse">
          Iniciando Motor Lógico...
        </div>
      )}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant deve ser usado dentro de um TenantProvider");
  }
  return context;
}
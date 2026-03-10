// contexts/TenantContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { OrionAPI } from "@/lib/api";

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
  tenantInfo: TenantData | null;
  isLoading: boolean;
  toggleTenant: () => void;
  refreshTenants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextProps | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Função Sênior para buscar os dados reais do Python
  const fetchTenants = async () => {
    try {
      // Bloqueio de Segurança: Se não tem token (ex: na tela de login), não bate na API.
      // Injetamos um placeholder para garantir que o React renderize as telas públicas.
      if (typeof window !== "undefined" && !localStorage.getItem("orion_token")) {
        setTenants([{ 
            id: -2, name: "Aguardando Autenticação", social_handle: "login_required", 
            niche: "Sistema", initials: "🔒", personas: [], competitors: [] 
        }]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const data = await OrionAPI.getTenants();
      
      if (data && data.length > 0) {
        // SUCESSO ABSOLUTO: O Banco tem clientes reais. Formata e exibe.
        const formattedTenants = data.map((t: any) => ({
          ...t,
          initials: t.name ? t.name.substring(0, 2).toUpperCase() : "CL",
          personas: t.personas ? (typeof t.personas === 'string' ? t.personas.split(',') : t.personas) : ["Público Geral"], 
          competitors: t.competitors ? (typeof t.competitors === 'string' ? t.competitors.split(',') : t.competitors) : ["Concorrente Não Definido"]
        }));
        setTenants(formattedTenants);
        
        // Garante que o índice não estoure se um cliente for apagado
        if (activeIndex >= formattedTenants.length) setActiveIndex(0);
      } else {
        // ESTADO ZERO: A API funcionou, mas o usuário não tem nenhum cliente cadastrado ainda.
        // Carregamos um "Cliente Fantasma" para o frontend não quebrar com null pointers.
        setTenants([{ 
          id: 0, 
          name: "Nenhum Cliente Cadastrado", 
          social_handle: "cadastre_agora", 
          niche: "Aguardando Setup", 
          initials: "00", 
          personas: [], 
          competitors: [] 
        }]);
        setActiveIndex(0);
      }
    } catch (error) {
      console.error("[Orion Core] Falha ao sincronizar Tenants.", error);
      // CAIU A INTERNET OU SERVIDOR: Carrega um aviso claro, não o Mock antigo.
      setTenants([{ 
        id: -1, 
        name: "Erro de Conexão", 
        social_handle: "offline", 
        niche: "Servidor Indisponível", 
        initials: "ER", 
        personas: [], 
        competitors: [] 
      }]);
    } finally {
      setIsLoading(false);
    }
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
      {/* A Renderização Segura: 
        Só bloqueia a tela se estiver buscando os dados inicialmente. 
        Uma vez resolvido (mesmo com o Zero-State), a aplicação é liberada.
      */}
      {isLoading ? (
        <div className="w-full h-screen flex items-center justify-center bg-[#050505] text-[#D4AF37] animate-pulse font-montserrat text-xs tracking-[0.2em] uppercase">
          Sincronizando Motor Lógico...
        </div>
      ) : tenantInfo ? children : null}
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
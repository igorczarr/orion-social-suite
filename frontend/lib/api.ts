// frontend/lib/api.ts

// O endereço do nosso Motor Lógico (Python/FastAPI) com apontamento Cloud-Native
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://orion-9pls.onrender.com";

// Função tática para resgatar o Crachá de Segurança (Token)
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    // CORREÇÃO: Atualizado para o novo padrão de token da arquitetura Orion
    return localStorage.getItem("orion_token");
  }
  return null;
};

// O Interceptor Central: Todas as comunicações passam por aqui
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();

  // Cabeçalhos padrão (Avisamos o Python que estamos a falar em JSON)
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Se o utilizador tem o crachá, prendemos ele na farda (Header de Autorização)
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Protocolo de Segurança: Se o token for falso ou expirou (Erro 401)
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("orion_token"); // CORREÇÃO: Limpa o token correto
        window.location.href = "/login"; // Expulsa para o Portão
      }
      throw new Error("Sessão expirada ou acesso negado.");
    }

    const data = await response.json();

    // Se o Python devolver um erro (ex: 404, 500), nós disparamos o alarme
    if (!response.ok) {
      throw new Error(data.detail || data.message || "Erro nos satélites do servidor.");
    }

    return data;
  } catch (error) {
    console.error(`[Orion API Error] Falha na rota ${endpoint}:`, error);
    throw error;
  }
}

// === O CATÁLOGO DE SERVIÇOS (As armas que a tela pode puxar) ===

export const OrionAPI = {
  
  // 1. Aciona o nosso radar em tempo real
  getTrendRadar: (username: string) => 
    fetchAPI(`/api/scout/trend-radar/${username}`, { method: "GET" }),

  // 2. GERAÇÃO DE ESTRATÉGIA (O Motor de IA)
  generateBriefing: (trendTopic: string, competitor: string) =>
    fetchAPI(`/api/ai/generate-briefing`, {
      method: "POST",
      body: JSON.stringify({ trend_topic: trendTopic, competitor: competitor })
    }),
    
  // Garanta que o nome seja 'force-sync' para bater com o backend acima
  forceSync: (tenantId: number) => 
    fetchAPI(`/api/workers/force-sync/${tenantId}`, { method: "POST" }),

  // === NOVAS ARMAS LIGADAS AO MOTOR MULTI-TENANT E NOVAS TELAS ===

  // 3. GESTÃO DE CLIENTES (TENANTS)
  getTenants: () => 
    fetchAPI(`/api/tenants`, { method: "GET" }),
  
  // CORREÇÃO: Adicionado 'keywords' na tipagem, pois o schema TenantCreate no backend o exige.
  createTenant: (tenantData: { name: string, social_handle: string, niche: string, personas: string, competitors: string, keywords: string }) => 
    fetchAPI(`/api/tenants`, {
      method: "POST",
      body: JSON.stringify(tenantData),
    }),

  // 4. A ARENA (CONCORRENTES E AD INTEL)
  getArenaData: (tenantId: number) => 
    fetchAPI(`/api/scout/arena/${tenantId}`, { method: "GET" }),

  // 5. SCOUT (OUVIDORIA SOCIAL)
  getSocialListening: (tenantId: number) => 
    fetchAPI(`/api/scout/social-listening/${tenantId}`, { method: "GET" }),

  // 6. GAMIFICAÇÃO
  getGamificationStatus: () => 
    fetchAPI(`/api/gamification/dashboard`, { method: "GET" }),

  // 7. GERAÇÃO DE DOSSIÊ COMPLETO
  generateDossier: (tenantId: number) => 
    fetchAPI(`/api/reports/dossier/${tenantId}`, { method: "GET" }),

  // 8. GERAÇÃO TÁTICA SOB DEMANDA (NOVA ARMA: RADAR TRÍPLICE)
  generateTacticalCopy: (tenantId: number, sourceType: 'trend' | 'proof', content: string) =>
    fetchAPI(`/api/ai/generate-tactical-copy/${tenantId}`, {
      method: "POST",
      body: JSON.stringify({ 
        source_type: sourceType, 
        content: content 
      }),
    }),
};
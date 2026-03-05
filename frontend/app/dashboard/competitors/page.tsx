"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Swords, ScanLine, Play, Clock, Flame, 
  Target, Zap, ShieldAlert, BarChart3, RefreshCw, Crosshair, BrainCircuit
} from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";

export default function CompetitorsPage() {
  const { tenantInfo } = useTenant(); 
  
  // === ESTADOS DE CARREGAMENTO ===
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWarMap, setIsLoadingWarMap] = useState(false);
  
  // === ESTADOS LIGADOS À API (BANCO DE DADOS REAL) ===
  const [allArenaData, setAllArenaData] = useState<any[]>([]); 
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>("");
  const [warMap, setWarMap] = useState<string>(""); // O Texto da Inteligência Competitiva

  // === 1. BUSCA OS DADOS DA ARENA ===
  const loadArenaData = async () => {
    if (!tenantInfo?.id) return;
    
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const token = localStorage.getItem("vrtice_token");
      const response = await fetch(`http://localhost:8000/api/scout/arena/${tenantInfo.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const payload = await response.json();
        const arenaList = payload.data || [];
        setAllArenaData(arenaList);
        
        // Seleciona automaticamente o primeiro concorrente do banco de dados
        if (arenaList.length > 0 && !selectedCompetitor) {
          setSelectedCompetitor(arenaList[0].concorrente);
        }
      } else {
        setAllArenaData([]);
      }
    } catch (error) {
      console.error("Falha ao puxar dados da Arena:", error);
      setAllArenaData([]); 
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // === 2. BUSCA O MAPA DE GUERRA DA IA ===
  const loadWarMap = async () => {
    if (!tenantInfo?.social_handle) return;
    setIsLoadingWarMap(true);
    try {
      const token = localStorage.getItem("vrtice_token");
      // Limpa o '@' caso exista para não quebrar a URL
      const cleanHandle = tenantInfo.social_handle.replace('@', '');
      const response = await fetch(`http://localhost:8000/api/scout/competitive-intel/${cleanHandle}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWarMap(data.mapa_de_guerra || "Nenhum relatório gerado.");
      }
    } catch (error) {
      console.error("Falha ao puxar Mapa de Guerra:", error);
      setWarMap("Falha ao contactar o cérebro do CMO.");
    } finally {
      setIsLoadingWarMap(false);
    }
  };

  // Gatilho Inicial
  useEffect(() => {
    loadArenaData();
    loadWarMap();
  }, [tenantInfo?.id]);

  const handleRefresh = () => {
    loadArenaData();
    loadWarMap();
  };

  // === EXTRAÇÃO DINÂMICA DE DADOS ===
  const currentCompetitorData = useMemo(() => {
    return allArenaData.find((c: any) => c.concorrente === selectedCompetitor) || null;
  }, [allArenaData, selectedCompetitor]);

  const activeAdsCount = currentCompetitorData?.anuncios_ativos?.length || 0;
  const recentPosts = currentCompetitorData?.posts_organicos_recentes || [];
  
  // Encontra o formato dominante baseado nos posts orgânicos recentes
  const formats = recentPosts.map((p: any) => p.tipo) || [];
  let dominantFormat = "N/A";
  if (formats.length > 0) {
    const counts = formats.reduce((acc: any, f: string) => { acc[f] = (acc[f] || 0) + 1; return acc; }, {});
    dominantFormat = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  const organicFrequency = recentPosts.length > 0 ? "Ativo" : "Estagnado";

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      
      {/* 1. CABEÇALHO TÁTICO E SELETOR DE ALVO */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-v-white-off/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]"></span>
            <span className="font-montserrat text-[0.65rem] text-red-400 uppercase tracking-widest border border-red-500/30 px-2 py-1 bg-red-500/10">
              Espionagem Ativa
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-v-white-off tracking-wide">
            A <span className="text-gold-gradient">Arena</span>
          </h1>
          <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest mt-2">
            Inteligência Competitiva & Tráfego Pago
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="glass-panel px-4 py-2 flex items-center gap-3 rounded-sm border-red-500/20 bg-red-500/5">
            <Crosshair size={14} className="text-red-400" />
            <span className="font-montserrat text-[0.65rem] uppercase tracking-widest text-red-400">Alvo Fixado:</span>
            
            {/* O DROPDOWN AGORA LÊ DIRETAMENTE DO BANCO DE DADOS */}
            <select 
              value={selectedCompetitor}
              onChange={(e) => setSelectedCompetitor(e.target.value)}
              className="bg-transparent text-v-white-off text-sm font-bold font-montserrat outline-none cursor-pointer"
            >
              {allArenaData.length > 0 ? (
                allArenaData.map((comp: any) => (
                  <option key={comp.concorrente} value={comp.concorrente} className="bg-v-black">
                    @{comp.concorrente}
                  </option>
                ))
              ) : (
                <option value="" className="bg-v-black">Aguardando Alvos...</option>
              )}
            </select>

          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-red-500/10 hover:text-red-400 transition-colors ${isRefreshing ? 'animate-spin text-red-400 border-red-400' : 'text-gray-400'}`}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* 2. TERMÔMETRO DE AMEAÇA DO ALVO (Dinâmico) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBox 
          title="Anúncios Ativos (Ouro)" 
          value={isLoading ? "..." : activeAdsCount.toString()} 
          subtitle="Ganchos mapeados pela IA" 
          icon={<Target size={16} />} 
          color="text-red-400" 
        />
        <MetricBox 
          title="Postagens Orgânicas" 
          value={isLoading ? "..." : recentPosts.length.toString()} 
          subtitle="Volume extraído no radar" 
          icon={<BarChart3 size={16} />} 
          color="text-green-500" 
        />
        <MetricBox 
          title="Formato Dominante" 
          value={isLoading ? "..." : dominantFormat.includes("Video") || dominantFormat.includes("Reels") ? "Vídeo" : dominantFormat} 
          subtitle="Estratégia do alvo" 
          icon={<Play size={16} />} 
          color="text-v-gold" 
        />
        <MetricBox 
          title="Status do Oponente" 
          value={isLoading ? "..." : organicFrequency} 
          subtitle="Avaliação algorítmica" 
          icon={<ShieldAlert size={16} />} 
          color="text-blue-400" 
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* === COLUNA 1: MAPA DE GUERRA (Substituiu a Visão Computacional) === */}
        <section className="glass-panel border border-v-gold/30 rounded-sm flex flex-col h-[600px] relative overflow-hidden bg-v-gold/5">
          <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none text-v-gold">
            <BrainCircuit size={300} />
          </div>
          
          <div className="p-6 border-b border-v-gold/10 flex justify-between items-center relative z-10 shrink-0 bg-v-black/20">
            <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-v-gold flex items-center gap-2">
              <Swords size={14} className="text-v-gold" /> Mapa de Guerra (Auditoria Externa)
            </h3>
            <span className="text-[0.6rem] font-bold uppercase tracking-widest px-2 py-1 bg-v-gold/10 text-v-gold rounded-sm border border-v-gold/20">
              Estratégia do CMO
            </span>
          </div>

          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-v-gold/20 relative z-10">
            {isLoadingWarMap ? (
              <div className="flex flex-col items-center justify-center h-full text-v-gold animate-pulse">
                <BrainCircuit size={32} className="mb-4" />
                <p className="font-montserrat text-sm uppercase tracking-widest">A IA está a cruzar os dados do mercado...</p>
                <p className="font-montserrat text-xs text-gray-500 mt-2 text-center max-w-xs">Isso pode levar alguns segundos dependendo da carga do Gemini.</p>
              </div>
            ) : warMap && warMap.length > 20 ? (
              <div className="font-montserrat text-[0.75rem] text-gray-300 leading-relaxed whitespace-pre-wrap">
                {warMap}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="font-montserrat text-sm uppercase tracking-widest">Sem dados suficientes.</p>
                <p className="font-montserrat text-xs mt-2 text-center max-w-xs">O Worker 1 (Apify) precisa de raspar a sua conta e a dos concorrentes para a IA conseguir compará-las.</p>
              </div>
            )}
          </div>
        </section>

        {/* === COLUNA 2: AD INTEL (Radar de Ganchos Reais) === */}
        <section className="glass-panel border border-v-white-off/10 rounded-sm flex flex-col h-[600px]">
          <div className="p-6 border-b border-v-white-off/10 flex justify-between items-center bg-white/5 shrink-0">
            <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
              <Zap size={14} className="text-v-gold" /> Arsenal de Ganchos (Copy)
            </h3>
            <span className="flex items-center gap-1 text-[0.55rem] uppercase tracking-widest text-gray-400 bg-v-black px-2 py-1 rounded-sm border border-v-white-off/10">
              <Clock size={10} /> Escaneado do Alvo
            </span>
          </div>

          <div className="p-5 border-b border-v-white-off/5 bg-v-black/50 shrink-0">
             <p className="text-xs font-montserrat text-gray-400 leading-relaxed">
               Estes são os ganchos (Hooks) exatos extraídos pela IA através da engenharia reversa dos posts mais performáticos do concorrente selecionado.
             </p>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-v-gold/20 p-2">
            <table className="w-full text-left border-collapse min-w-125">
              <thead>
                <tr className="border-b border-v-white-off/10 font-montserrat text-[0.6rem] uppercase tracking-widest text-gray-500">
                  <th className="p-4 font-medium">Tração (Dias)</th>
                  <th className="p-4 font-medium">Formato</th>
                  <th className="p-4 font-medium">Gatilho Primário (Hook)</th>
                  <th className="p-4 font-medium">Classificação</th>
                </tr>
              </thead>
              <tbody className="font-montserrat text-sm">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-v-gold text-xs animate-pulse">Infiltrando base de dados...</td></tr>
                ) : currentCompetitorData?.anuncios_ativos?.length > 0 ? (
                  currentCompetitorData.anuncios_ativos.map((ad: any, idx: number) => (
                    <tr key={idx} className="border-b border-v-white-off/5 hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Flame size={14} className={ad.dias_rodando > 30 ? "text-v-gold animate-pulse" : "text-gray-600"} />
                          <span className={`font-bold ${ad.dias_rodando > 30 ? "text-v-gold" : "text-gray-400"}`}>{ad.dias_rodando}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-[0.6rem] uppercase tracking-widest px-2 py-1 rounded-sm bg-v-black border border-v-white-off/10 text-gray-300 whitespace-nowrap">
                          {ad.formato.includes("Video") ? "Vídeo" : ad.formato}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-v-white-off italic leading-relaxed group-hover:text-v-gold transition-colors">
                        "{ad.copy}"
                      </td>
                      <td className="p-4">
                        <span className={`text-[0.55rem] uppercase tracking-widest font-bold px-2 py-1 rounded-sm border whitespace-nowrap ${
                          ad.status === 'Vencedor' ? 'bg-v-gold/10 text-v-gold border-v-gold/30' : 
                          ad.status === 'Escalando' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 
                          'bg-gray-500/10 text-gray-400 border-gray-500/30'
                        }`}>
                          {ad.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500 text-xs">Nenhum gancho estratégico extraído para este concorrente.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}

// Sub-componente da Caixa de Métrica
function MetricBox({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-panel p-5 border border-v-white-off/5 rounded-sm hover:border-v-gold/30 transition-colors flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <p className="font-montserrat text-[0.6rem] uppercase tracking-widest text-gray-500">{title}</p>
        <div className={`${color} opacity-80`}>{icon}</div>
      </div>
      <div>
        <div className={`font-abhaya text-3xl font-bold mb-1 ${color}`}>{value}</div>
        <div className="text-[0.6rem] text-gray-400 uppercase tracking-wide truncate">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
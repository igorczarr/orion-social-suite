"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Swords, ScanLine, Play, Clock, Flame, 
  Target, Zap, ShieldAlert, BarChart3, RefreshCw, 
  Crosshair, BrainCircuit, ExternalLink, Video, Image as ImageIcon, MessageSquare
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
  const [warMap, setWarMap] = useState<string>(""); 

  // NOVO ESTADO: Controle de Abas para Mídia vs Ganchos
  const [activeTab, setActiveTab] = useState<'ads' | 'organic'>('ads');

  // CONEXÃO COM A NUVEM SEGURA
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // === 1. BUSCA OS DADOS DA ARENA ===
  const loadArenaData = async () => {
    if (!tenantInfo?.id) return;
    
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const token = localStorage.getItem("orion_token"); // Atualizado para o novo padrão de token
      const response = await fetch(`${API_URL}/api/scout/arena/${tenantInfo.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const payload = await response.json();
        const arenaList = payload.data || [];
        setAllArenaData(arenaList);
        
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
      const token = localStorage.getItem("orion_token");
      const cleanHandle = tenantInfo.social_handle.replace('@', '');
      const response = await fetch(`${API_URL}/api/scout/competitive-intel/${cleanHandle}`, {
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
            A <span className="text-[#d4af37]">Arena</span>
          </h1>
          <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest mt-2">
            Inteligência Competitiva & Tráfego Pago
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="glass-panel px-4 py-2 flex items-center gap-3 rounded-lg border-red-500/20 bg-red-500/5">
            <Crosshair size={14} className="text-red-400" />
            <span className="font-montserrat text-[0.65rem] uppercase tracking-widest text-red-400">Alvo Fixado:</span>
            
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
            className={`p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors ${isRefreshing ? 'animate-spin text-red-400 border-red-400' : 'text-gray-400'}`}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* 2. TERMÔMETRO DE AMEAÇA DO ALVO */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBox title="Anúncios Ativos (Ouro)" value={isLoading ? "..." : activeAdsCount.toString()} subtitle="Ganchos mapeados pela IA" icon={<Target size={16} />} color="text-red-400" />
        <MetricBox title="Postagens Orgânicas" value={isLoading ? "..." : recentPosts.length.toString()} subtitle="Volume extraído no radar" icon={<BarChart3 size={16} />} color="text-green-500" />
        <MetricBox title="Formato Dominante" value={isLoading ? "..." : dominantFormat.includes("Video") || dominantFormat.includes("Reels") ? "Vídeo" : dominantFormat} subtitle="Estratégia do alvo" icon={<Play size={16} />} color="text-[#d4af37]" />
        <MetricBox title="Status do Oponente" value={isLoading ? "..." : organicFrequency} subtitle="Avaliação algorítmica" icon={<ShieldAlert size={16} />} color="text-blue-400" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* === COLUNA 1: MAPA DE GUERRA CMO === */}
        <section className="glass-panel border border-[#d4af37]/30 rounded-xl flex flex-col h-[650px] relative overflow-hidden bg-[#d4af37]/5">
          <div className="absolute -right-10 -top-10 opacity-[0.03] pointer-events-none text-[#d4af37]">
            <BrainCircuit size={300} />
          </div>
          
          <div className="p-6 border-b border-[#d4af37]/10 flex justify-between items-center relative z-10 shrink-0 bg-black/40">
            <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-[#d4af37] flex items-center gap-2">
              <Swords size={16} className="text-[#d4af37]" /> Mapa de Guerra (CMO)
            </h3>
            <span className="text-[0.6rem] font-bold uppercase tracking-widest px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] rounded-md border border-[#d4af37]/20">
              Estratégia IA
            </span>
          </div>

          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[#d4af37]/20 relative z-10">
            {isLoadingWarMap ? (
              <div className="flex flex-col items-center justify-center h-full text-[#d4af37] animate-pulse">
                <BrainCircuit size={40} className="mb-4 opacity-50" />
                <p className="font-montserrat text-sm uppercase tracking-widest">Cruzando dados de mercado...</p>
              </div>
            ) : warMap && warMap.length > 20 ? (
              <div className="font-montserrat text-[0.8rem] text-gray-300 leading-relaxed whitespace-pre-wrap">
                {warMap}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="font-montserrat text-sm uppercase tracking-widest">Sem dados suficientes.</p>
              </div>
            )}
          </div>
        </section>

        {/* === COLUNA 2: RADAR DE MÍDIA E GANCHOS (Com Tabs Interativas) === */}
        <section className="glass-panel border border-white/10 rounded-xl flex flex-col h-[650px] bg-black/20 overflow-hidden">
          
          {/* Cabeçalho com Tabs */}
          <div className="flex flex-col border-b border-white/10 shrink-0 bg-black/40">
            <div className="p-6 flex justify-between items-center pb-4">
              <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
                <Zap size={16} className="text-[#d4af37]" /> Radar de Capturas
              </h3>
            </div>
            
            <div className="flex px-6 gap-6">
              <button 
                onClick={() => setActiveTab('ads')}
                className={`pb-3 text-[0.65rem] font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'ads' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                Ganchos Extraídos (Ads)
              </button>
              <button 
                onClick={() => setActiveTab('organic')}
                className={`pb-3 text-[0.65rem] font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'organic' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                Mídia Orgânica (Feed)
              </button>
            </div>
          </div>

          {/* CONTEÚDO DINÂMICO BASEADO NA TAB */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-2">
            
            {/* TAB: GANCHOS (Tabela Original) */}
            {activeTab === 'ads' && (
              <table className="w-full text-left border-collapse min-w-125">
                <thead>
                  <tr className="border-b border-white/5 font-montserrat text-[0.6rem] uppercase tracking-widest text-gray-500">
                    <th className="p-4 font-medium">Tração</th>
                    <th className="p-4 font-medium">Formato</th>
                    <th className="p-4 font-medium">Gatilho (Hook)</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="font-montserrat text-sm">
                  {isLoading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-[#d4af37] text-xs animate-pulse">Infiltrando...</td></tr>
                  ) : currentCompetitorData?.anuncios_ativos?.length > 0 ? (
                    currentCompetitorData.anuncios_ativos.map((ad: any, idx: number) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Flame size={14} className={ad.dias_rodando > 30 ? "text-[#d4af37] animate-pulse" : "text-gray-600"} />
                            <span className={`font-bold ${ad.dias_rodando > 30 ? "text-[#d4af37]" : "text-gray-400"}`}>{ad.dias_rodando}d</span>
                          </div>
                        </td>
                        <td className="p-4 text-[0.6rem] uppercase tracking-widest text-gray-400">{ad.formato.includes("Video") ? "Vídeo" : ad.formato}</td>
                        <td className="p-4 text-xs text-v-white-off italic leading-relaxed">"{ad.copy}"</td>
                        <td className="p-4">
                          <span className={`text-[0.55rem] uppercase font-bold px-2 py-1 rounded-md border whitespace-nowrap ${
                            ad.status === 'Vencedor' ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/30' : 
                            'bg-gray-500/10 text-gray-400 border-gray-500/30'
                          }`}>
                            {ad.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500 text-xs">Nenhum gancho extraído.</td></tr>
                  )}
                </tbody>
              </table>
            )}

            {/* TAB: MÍDIA ORGÂNICA (Novo Design de Rich Media) */}
            {activeTab === 'organic' && (
              <div className="grid grid-cols-1 gap-4 p-4">
                {isLoading ? (
                  <div className="p-8 text-center text-[#d4af37] text-xs animate-pulse">Buscando mídias...</div>
                ) : recentPosts.length > 0 ? (
                  recentPosts.map((post: any, idx: number) => (
                    <div key={idx} className="bg-black/40 border border-white/5 rounded-xl p-5 hover:border-[#d4af37]/30 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 text-gray-400">
                          {post.tipo.includes("Video") ? <Video size={16} className="text-[#d4af37]" /> : <ImageIcon size={16} className="text-[#d4af37]" />}
                          <span className="text-[0.65rem] uppercase tracking-widest">{post.tipo}</span>
                        </div>
                        {post.url && (
                          <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#d4af37] transition-colors flex items-center gap-1 text-[0.65rem] uppercase tracking-widest font-bold bg-white/5 px-3 py-1 rounded-md">
                            Ver Post <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      <p className="text-sm font-montserrat text-gray-300 leading-relaxed mb-4">
                        {post.legenda ? (post.legenda.length > 180 ? `${post.legenda.substring(0, 180)}...` : post.legenda) : "Publicação sem legenda (Foco 100% visual)."}
                      </p>
                      <div className="flex gap-4 text-xs text-gray-500 border-t border-white/5 pt-3 mt-auto">
                        <span className="flex items-center gap-1"><MessageSquare size={12} /> Extração da Apify</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 text-xs">Nenhuma publicação orgânica recente mapeada.</div>
                )}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

function MetricBox({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-panel p-5 border border-white/5 rounded-xl hover:border-v-gold/30 transition-colors flex flex-col justify-between h-32 bg-black/20">
      <div className="flex justify-between items-start">
        <p className="font-montserrat text-[0.6rem] uppercase tracking-widest text-gray-500">{title}</p>
        <div className={`${color} opacity-80`}>{icon}</div>
      </div>
      <div>
        <div className={`font-abhaya text-3xl font-bold mb-1 ${color}`}>{value}</div>
        <div className="text-[0.65rem] text-gray-400 uppercase tracking-wide truncate">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
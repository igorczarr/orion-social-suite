"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Swords, ScanLine, Play, Clock, Flame, 
  Target, Zap, ShieldAlert, BarChart3, RefreshCw, 
  Crosshair, BrainCircuit, ExternalLink, Video, Image as ImageIcon, MessageSquare,
  Activity
} from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://orion-9pls.onrender.com";

  // === 1. BUSCA OS DADOS DA ARENA ===
  const loadArenaData = async () => {
    if (!tenantInfo?.id) return;
    
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const token = localStorage.getItem("orion_token"); 
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      
      {/* 1. CABEÇALHO TÁTICO E SELETOR DE ALVO */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-v-white-off/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]"></span>
            <span className="font-montserrat text-[0.65rem] text-red-400 uppercase tracking-widest border border-red-500/30 px-2 py-1 bg-red-500/10 rounded-md">
              Espionagem Ativa
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-v-white-off tracking-wide">
            A <span className="text-red-500">Arena</span>
          </h1>
          <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest mt-2">
            Inteligência Competitiva & Tráfego Pago
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          
          {/* SELETOR DE ALVOS ESTILO TOPOLOGIA */}
          <div className="flex items-center gap-2 bg-black/60 border border-white/10 p-2 rounded-xl backdrop-blur-md shadow-2xl relative group">
            <div className="w-10 h-10 bg-red-900/20 rounded-lg flex items-center justify-center border border-red-500/40 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]">
              <Target size={20} className="text-red-500 animate-pulse" />
            </div>
            <div className="pr-2 hidden sm:block">
              <p className="font-montserrat text-[0.6rem] text-gray-500 uppercase tracking-widest">Alvo Fixado</p>
              {allArenaData.length > 0 ? (
                <select 
                  value={selectedCompetitor}
                  onChange={(e) => setSelectedCompetitor(e.target.value)}
                  className="bg-transparent text-red-400 text-sm font-bold font-montserrat outline-none cursor-pointer border-none appearance-none"
                >
                  {allArenaData.map((comp: any) => (
                    <option key={comp.concorrente} value={comp.concorrente} className="bg-[#050505] text-red-400">
                      @{comp.concorrente}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm font-bold text-gray-600">Aguardando Alvos...</p>
              )}
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-3 bg-black border rounded-xl transition-all shadow-lg flex items-center justify-center ${isRefreshing ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/10 text-gray-400 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5'}`}
            title="Sincronizar Radares"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </motion.button>
        </div>
      </header>

      {/* 2. TERMÔMETRO DE AMEAÇA DO ALVO */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBox title="Anúncios Ativos" value={isLoading ? "..." : activeAdsCount.toString()} subtitle="Ganchos mapeados pela IA" icon={<Target size={16} />} color="text-red-400" />
        <MetricBox title="Postagens Orgânicas" value={isLoading ? "..." : recentPosts.length.toString()} subtitle="Volume extraído no radar" icon={<BarChart3 size={16} />} color="text-green-500" />
        <MetricBox title="Formato Dominante" value={isLoading ? "..." : dominantFormat.includes("Video") || dominantFormat.includes("Reels") ? "Vídeo" : dominantFormat} subtitle="Estratégia do alvo" icon={<Play size={16} />} color="text-[#d4af37]" />
        <MetricBox title="Status do Oponente" value={isLoading ? "..." : organicFrequency} subtitle="Avaliação algorítmica" icon={<ShieldAlert size={16} />} color="text-blue-400" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* === COLUNA 1: MAPA DE GUERRA CMO (WAR ROOM) === */}
        <section className="glass-panel border border-red-500/20 rounded-xl flex flex-col h-[650px] relative overflow-hidden bg-black/40 shadow-[0_0_40px_rgba(239,68,68,0.05)]">
          <div className="absolute -right-10 -top-10 opacity-[0.02] pointer-events-none text-red-500">
            <BrainCircuit size={300} />
          </div>
          
          <div className="p-6 border-b border-red-500/10 flex justify-between items-center relative z-10 shrink-0 bg-black/60">
            <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
              <Swords size={16} /> Cartografia de Guerra (OODA Loop)
            </h3>
            <span className="text-[0.6rem] font-bold uppercase tracking-widest px-3 py-1 bg-red-500/10 text-red-400 rounded-md border border-red-500/20 flex items-center gap-1 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]">
              <Activity size={10} className="animate-pulse" /> Inteligência OSINT
            </span>
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative z-10">
            {isLoadingWarMap ? (
               // EFEITO DE DATA MINING CINEMATOGRÁFICO
               <div className="flex flex-col items-center justify-center h-full text-red-500 font-mono text-xs">
                 <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                   [ INTERCEPTING ENEMY COMMUNICATIONS ]
                 </motion.div>
                 <div className="mt-6 h-20 overflow-hidden text-red-400/50 relative w-full max-w-xs text-center border-l-2 border-red-500/30 pl-4">
                   <motion.div animate={{ y: [0, -150] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="space-y-2">
                     <p>Analyzing competitor semantic structure...</p>
                     <p>Extracting emotional vectors...</p>
                     <p>Applying Blue Ocean Matrix (ERRC)...</p>
                     <p>Synthesizing Counter-Strategy...</p>
                   </motion.div>
                   <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-black/80 to-transparent"></div>
                 </div>
              </div>
            ) : warMap && warMap.length > 20 ? (
              <div className="prose prose-invert max-w-none font-montserrat text-[0.85rem] text-gray-300 leading-relaxed
                prose-headings:font-abhaya prose-headings:text-red-400 prose-headings:tracking-wide
                prose-strong:text-white prose-p:mb-4 prose-li:mb-2 prose-li:text-gray-400
                prose-blockquote:border-l-red-500 prose-blockquote:bg-red-500/5 prose-blockquote:p-4 prose-blockquote:italic prose-blockquote:text-white
              ">
                <ReactMarkdown>
                  {warMap}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Target size={40} className="mb-4 opacity-20" />
                <p className="font-montserrat text-xs uppercase tracking-widest text-center max-w-xs">Nenhum dado estratégico suficiente para mapear o fosso competitivo.</p>
              </div>
            )}
          </div>
        </section>

        {/* === COLUNA 2: RADAR DE MÍDIA E GANCHOS === */}
        <section className="glass-panel border border-white/10 rounded-xl flex flex-col h-[650px] bg-black/20 overflow-hidden shadow-2xl">
          
          {/* Cabeçalho com Tabs Premium */}
          <div className="flex flex-col border-b border-white/5 shrink-0 bg-black/60 relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"></div>
            
            <div className="p-6 flex justify-between items-center pb-4">
              <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
                <Zap size={16} className="text-[#d4af37]" /> Radar de Capturas
              </h3>
            </div>
            
            <div className="flex px-6 gap-6 relative">
              <button 
                onClick={() => setActiveTab('ads')}
                className={`pb-3 text-[0.65rem] font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'ads' ? 'text-[#d4af37]' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Ganchos Extraídos (Ads)
                {activeTab === 'ads' && <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 w-full h-[2px] bg-[#d4af37]" />}
              </button>
              <button 
                onClick={() => setActiveTab('organic')}
                className={`pb-3 text-[0.65rem] font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'organic' ? 'text-[#d4af37]' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Mídia Orgânica (Feed)
                {activeTab === 'organic' && <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 w-full h-[2px] bg-[#d4af37]" />}
              </button>
            </div>
          </div>

          {/* CONTEÚDO DINÂMICO COM ANIMAÇÕES */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 relative">
            <AnimatePresence mode="wait">
              
              {/* TAB: GANCHOS (Ads) */}
              {activeTab === 'ads' && (
                <motion.div key="ads" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 p-2 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-125">
                    <thead>
                      <tr className="border-b border-white/5 font-montserrat text-[0.6rem] uppercase tracking-widest text-gray-500 sticky top-0 bg-black/80 backdrop-blur-md z-10">
                        <th className="p-4 font-medium">Tração</th>
                        <th className="p-4 font-medium">Formato</th>
                        <th className="p-4 font-medium">Gatilho (Hook)</th>
                        <th className="p-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-montserrat text-sm">
                      {isLoading ? (
                        <tr><td colSpan={4} className="p-8 text-center text-[#d4af37] text-xs font-mono animate-pulse">Infiltrando Meta Ads Library...</td></tr>
                      ) : currentCompetitorData?.anuncios_ativos?.length > 0 ? (
                        currentCompetitorData.anuncios_ativos.map((ad: any, idx: number) => (
                          <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                            <td className="p-4">
                              <div className="flex items-center gap-2 bg-black/50 w-max px-2 py-1 rounded-md border border-white/5">
                                <Flame size={12} className={ad.dias_rodando > 30 ? "text-[#d4af37] animate-pulse" : "text-gray-600"} />
                                <span className={`text-[0.65rem] font-bold ${ad.dias_rodando > 30 ? "text-[#d4af37]" : "text-gray-400"}`}>{ad.dias_rodando}d</span>
                              </div>
                            </td>
                            <td className="p-4 text-[0.55rem] font-bold uppercase tracking-widest text-gray-400">{ad.formato.includes("Video") ? "Vídeo" : ad.formato}</td>
                            <td className="p-4 text-xs text-v-white-off italic leading-relaxed">"{ad.copy}"</td>
                            <td className="p-4">
                              <span className={`text-[0.55rem] uppercase font-bold px-2 py-1 rounded-md border whitespace-nowrap ${
                                ad.status === 'Vencedor' ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/30 shadow-[inset_0_0_10px_rgba(212,175,55,0.2)]' : 
                                'bg-gray-500/10 text-gray-400 border-gray-500/30'
                              }`}>
                                {ad.status}
                              </span>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr><td colSpan={4} className="p-16 text-center text-gray-500 text-xs font-montserrat uppercase tracking-widest">Nenhum anúncio rodando detectado.</td></tr>
                      )}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {/* TAB: MÍDIA ORGÂNICA (Posts) */}
              {activeTab === 'organic' && (
                <motion.div key="organic" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute inset-0 p-4 overflow-y-auto custom-scrollbar space-y-4">
                  {isLoading ? (
                    <div className="p-8 text-center text-[#d4af37] text-xs font-mono animate-pulse">Buscando mídias do alvo...</div>
                  ) : recentPosts.length > 0 ? (
                    recentPosts.map((post: any, idx: number) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={idx} className="bg-black/40 border border-white/5 rounded-xl p-5 hover:border-[#d4af37]/30 transition-all group shadow-lg relative overflow-hidden">
                        
                        {/* Efeito de Scanline Neon */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent group-hover:via-[#d4af37]/50 transition-all"></div>

                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-white/5">
                            {post.tipo.includes("Video") ? <Video size={14} className="text-[#d4af37]" /> : <ImageIcon size={14} className="text-[#d4af37]" />}
                            <span className="text-[0.6rem] font-bold text-gray-300 uppercase tracking-widest">{post.tipo}</span>
                          </div>
                          {post.url && (
                            <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black hover:bg-[#d4af37] transition-all flex items-center gap-2 text-[0.6rem] uppercase tracking-widest font-bold border border-white/10 hover:border-[#d4af37] px-3 py-1.5 rounded-md">
                              Inspecionar <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        <p className="text-[0.8rem] font-montserrat text-gray-300 leading-relaxed mb-4">
                          {post.legenda ? (post.legenda.length > 200 ? `${post.legenda.substring(0, 200)}...` : post.legenda) : <span className="italic opacity-50">Publicação sem legenda (Foco 100% visual).</span>}
                        </p>
                        <div className="flex gap-4 text-[0.65rem] font-bold uppercase tracking-widest text-gray-600 border-t border-white/5 pt-3 mt-auto">
                          <span className="flex items-center gap-1"><ScanLine size={12} /> Extração OSINT</span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-16 text-center text-gray-500 text-xs font-montserrat uppercase tracking-widest">Nenhuma publicação orgânica mapeada.</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

      </div>
    </motion.div>
  );
}

// COMPONENTE AUXILIAR APRIMORADO (METRICS DE GUERRA)
function MetricBox({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-panel p-5 border border-white/5 rounded-xl hover:border-white/20 transition-all flex flex-col justify-between h-32 bg-black/40 group overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      
      {/* Efeito Luminoso no Hover */}
      <div className={`absolute -right-10 -top-10 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity bg-current ${color}`}></div>

      <div className="flex justify-between items-start relative z-10">
        <p className="font-montserrat text-[0.6rem] uppercase tracking-widest text-gray-500">{title}</p>
        <div className={`${color} opacity-80 group-hover:scale-110 transition-transform`}>{icon}</div>
      </div>
      <div className="relative z-10">
        <div className={`font-abhaya text-3xl font-bold mb-1 ${color}`}>{value}</div>
        <div className="text-[0.6rem] text-gray-400 uppercase tracking-widest truncate">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
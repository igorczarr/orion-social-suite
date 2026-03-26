"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Swords, ScanLine, Play, Clock, Flame, 
  Target, Zap, ShieldAlert, BarChart3, RefreshCw, 
  Crosshair, BrainCircuit, ExternalLink, Video, Image as ImageIcon, MessageSquare,
  Activity, Skull, GitBranch, TerminalSquare, ChevronRight, X
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

  // NOVO ESTADO: Controle de Abas para Mídia vs Ganchos vs Funil
  const [activeTab, setActiveTab] = useState<'ads' | 'organic' | 'funnel'>('ads');

  // NOVO ESTADO: Protocolo Kill-Shot (Engenharia Reversa)
  const [killShotTarget, setKillShotTarget] = useState<{ type: string, content: string } | null>(null);
  const [isGeneratingKillShot, setIsGeneratingKillShot] = useState(false);

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

  // === AÇÃO: PROTOCOLO KILL-SHOT ===
  const handleKillShot = (type: string, content: string) => {
    setKillShotTarget({ type, content });
    setIsGeneratingKillShot(true);
    // Simula o OODA Loop do ai_engine.py
    setTimeout(() => {
      setIsGeneratingKillShot(false);
    }, 3500);
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

  // === CÁLCULO DO ÍNDICE DE VULNERABILIDADE (PILAR 3) ===
  const vulnerabilityScore = useMemo(() => {
    if (isLoading) return 0;
    // Lógica Sênior: Muitos posts orgânicos e zero ads = Alta dependência algorítmica = Alta Vulnerabilidade.
    let baseScore = 50;
    if (activeAdsCount === 0) baseScore += 35; // Risco Extremo (Sem tráfego pago)
    else if (activeAdsCount > 10) baseScore -= 20; // Risco Baixo (Escala forte)
    
    if (recentPosts.length < 5) baseScore += 10; // Pouca tração orgânica
    
    return Math.min(Math.max(baseScore, 10), 98); // Trava entre 10 e 98
  }, [activeAdsCount, recentPosts, isLoading]);

  return (
    // NO-SCROLL CONTAINER: Trava a página, permite rolagem apenas interna
    <div className="relative h-full w-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto space-y-8 pb-32">
          
          {/* 1. CABEÇALHO TÁTICO E SELETOR DE ALVO */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-v-white-off/10 pb-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]"></span>
                <span className="font-montserrat text-[0.65rem] text-red-400 uppercase tracking-widest border border-red-500/30 px-2 py-1 bg-red-500/10 rounded-md shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  Cyber-Recon & Due Diligence
                </span>
              </div>
              <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-v-white-off tracking-wide">
                A <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">Arena</span>
              </h1>
              <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest mt-2">
                Auditoria de Vulnerabilidades & Tráfego Pago
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
              
              {/* SELETOR DE ALVOS ESTILO TOPOLOGIA */}
              <div className="flex items-center gap-2 bg-black/60 border border-white/10 p-2 rounded-xl backdrop-blur-md shadow-2xl relative group hover:border-red-500/30 transition-colors">
                <div className="w-10 h-10 bg-red-900/20 rounded-lg flex items-center justify-center border border-red-500/40 shadow-[inset_0_0_15px_rgba(239,68,68,0.3)]">
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

          {/* 2. TERMÔMETRO DE AMEAÇA DO ALVO (COM VULNERABILIDADE) */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            <MetricBox title="Anúncios Ativos" value={isLoading ? "..." : activeAdsCount.toString()} subtitle="Ganchos mapeados pela IA" icon={<Crosshair size={16} />} color="text-red-400" />
            <MetricBox title="Postagens Orgânicas" value={isLoading ? "..." : recentPosts.length.toString()} subtitle="Volume extraído no radar" icon={<BarChart3 size={16} />} color="text-gray-300" />
            <MetricBox title="Formato Dominante" value={isLoading ? "..." : dominantFormat.includes("Video") || dominantFormat.includes("Reels") ? "Vídeo" : dominantFormat} subtitle="Estratégia do alvo" icon={<Play size={16} />} color="text-gray-300" />
            <VulnerabilityBox score={vulnerabilityScore} isLoading={isLoading} />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch relative z-10">
            
            {/* === COLUNA 1: MAPA DE GUERRA CMO (WAR ROOM TERMINAL) === */}
            <section className="glass-panel border border-red-500/20 rounded-xl flex flex-col h-[650px] relative overflow-hidden bg-[#050505] shadow-[0_0_50px_rgba(239,68,68,0.08)]">
              <div className="absolute -right-20 -top-20 opacity-[0.02] pointer-events-none text-red-500">
                <BrainCircuit size={400} />
              </div>
              
              <div className="p-6 border-b border-red-500/20 flex justify-between items-center relative z-10 shrink-0 bg-black/80 backdrop-blur-md">
                <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
                  <Swords size={16} /> Cartografia de Guerra (Matriz ERRC)
                </h3>
                <span className="text-[0.6rem] font-bold uppercase tracking-widest px-3 py-1 bg-red-500/10 text-red-400 rounded-md border border-red-500/20 flex items-center gap-2 shadow-[inset_0_0_15px_rgba(239,68,68,0.2)]">
                  <Activity size={10} className="animate-pulse" /> IA Analítica
                </span>
              </div>

              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative z-10">
                {isLoadingWarMap ? (
                   // EFEITO DE DATA MINING CINEMATOGRÁFICO
                   <div className="flex flex-col items-center justify-center h-full text-red-500 font-mono text-xs">
                     <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="tracking-[0.3em]">
                       [ INTERCEPTING ENEMY COMMUNICATIONS ]
                     </motion.div>
                     <div className="mt-6 h-20 overflow-hidden text-red-400/50 relative w-full max-w-xs text-center border-l-2 border-red-500/50 pl-4">
                       <motion.div animate={{ y: [0, -150] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="space-y-3">
                         <p>Analyzing competitor semantic structure...</p>
                         <p>Extracting emotional vectors...</p>
                         <p className="text-red-400 font-bold">Applying Blue Ocean Matrix (ERRC)...</p>
                         <p>Synthesizing Counter-Strategy...</p>
                         <p>Bypassing Heuristic Defenses...</p>
                       </motion.div>
                       <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-[#050505] to-transparent"></div>
                     </div>
                  </div>
                ) : warMap && warMap.length > 20 ? (
                  <div className="prose prose-invert max-w-none font-montserrat text-[0.85rem] text-gray-300 leading-relaxed
                    prose-headings:font-abhaya prose-headings:text-red-500 prose-headings:tracking-wide prose-headings:border-b prose-headings:border-red-500/20 prose-headings:pb-2
                    prose-strong:text-white prose-p:mb-4 prose-li:mb-2 prose-li:text-gray-400
                    prose-blockquote:border-l-red-500 prose-blockquote:bg-red-500/5 prose-blockquote:p-4 prose-blockquote:italic prose-blockquote:text-v-white-off prose-blockquote:rounded-r-lg
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

            {/* === COLUNA 2: RADAR DE MÍDIA E FUNIL DE SOMBRAS === */}
            <section className="glass-panel border border-white/10 rounded-xl flex flex-col h-[650px] bg-[#050505] overflow-hidden shadow-2xl">
              
              {/* Cabeçalho com Tabs Premium */}
              <div className="flex flex-col border-b border-white/10 shrink-0 bg-black/80 relative backdrop-blur-md">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                
                <div className="p-6 flex justify-between items-center pb-4">
                  <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
                    <ScanLine size={16} className="text-red-500" /> Radar de Escuta
                  </h3>
                </div>
                
                <div className="flex px-6 gap-6 relative">
                  <button 
                    onClick={() => setActiveTab('ads')}
                    className={`pb-3 text-[0.65rem] font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'ads' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Ganchos (Ads)
                    {activeTab === 'ads' && <motion.div layoutId="activeTabIndicatorArena" className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />}
                  </button>
                  <button 
                    onClick={() => setActiveTab('organic')}
                    className={`pb-3 text-[0.65rem] font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'organic' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Orgânico
                    {activeTab === 'organic' && <motion.div layoutId="activeTabIndicatorArena" className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />}
                  </button>
                  <button 
                    onClick={() => setActiveTab('funnel')}
                    className={`pb-3 text-[0.65rem] font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'funnel' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Shadow Funnel
                    {activeTab === 'funnel' && <motion.div layoutId="activeTabIndicatorArena" className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />}
                  </button>
                </div>
              </div>

              {/* CONTEÚDO DINÂMICO DAS TABS */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 relative bg-black/20">
                <AnimatePresence mode="wait">
                  
                  {/* TAB: GANCHOS (Ads) */}
                  {activeTab === 'ads' && (
                    <motion.div key="ads" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 p-2 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse min-w-125">
                        <thead>
                          <tr className="border-b border-white/5 font-montserrat text-[0.6rem] uppercase tracking-widest text-gray-500 sticky top-0 bg-[#050505] z-10">
                            <th className="p-4 font-medium">Tração</th>
                            <th className="p-4 font-medium">Gatilho Oculto (Hook)</th>
                            <th className="p-4 font-medium text-right">Ação Tática</th>
                          </tr>
                        </thead>
                        <tbody className="font-montserrat text-sm">
                          {isLoading ? (
                            <tr><td colSpan={3} className="p-8 text-center text-red-500 text-xs font-mono animate-pulse">Infiltrando Meta Ads Library...</td></tr>
                          ) : currentCompetitorData?.anuncios_ativos?.length > 0 ? (
                            currentCompetitorData.anuncios_ativos.map((ad: any, idx: number) => (
                              <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                  <div className="flex items-center gap-2 bg-black/50 w-max px-2 py-1 rounded-md border border-white/5">
                                    <Flame size={12} className={ad.dias_rodando > 30 ? "text-red-500 animate-pulse" : "text-gray-600"} />
                                    <span className={`text-[0.65rem] font-bold ${ad.dias_rodando > 30 ? "text-red-400" : "text-gray-400"}`}>{ad.dias_rodando}d</span>
                                  </div>
                                </td>
                                <td className="p-4 text-xs text-v-white-off leading-relaxed">
                                  <span className="text-[0.55rem] font-bold text-gray-500 uppercase tracking-widest block mb-1">{ad.formato.includes("Video") ? "Vídeo" : ad.formato}</span>
                                  "{ad.copy}"
                                </td>
                                <td className="p-4 text-right">
                                  <motion.button 
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleKillShot('Ad', ad.copy)}
                                    className="px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white transition-all text-[0.6rem] font-bold uppercase tracking-widest flex items-center justify-end gap-2 ml-auto shadow-[0_0_10px_rgba(239,68,68,0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                                  >
                                    Kill-Shot <Skull size={12} />
                                  </motion.button>
                                </td>
                              </motion.tr>
                            ))
                          ) : (
                            <tr><td colSpan={3} className="p-16 text-center text-gray-500 text-xs font-montserrat uppercase tracking-widest">Nenhum anúncio rodando detectado.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </motion.div>
                  )}

                  {/* TAB: MÍDIA ORGÂNICA (Posts) */}
                  {activeTab === 'organic' && (
                    <motion.div key="organic" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute inset-0 p-4 overflow-y-auto custom-scrollbar space-y-4">
                      {isLoading ? (
                        <div className="p-8 text-center text-red-500 text-xs font-mono animate-pulse">Buscando mídias do alvo...</div>
                      ) : recentPosts.length > 0 ? (
                        recentPosts.map((post: any, idx: number) => (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={idx} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 hover:border-red-500/30 transition-all group shadow-lg relative overflow-hidden">
                            
                            {/* Efeito de Scanline Neon */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent group-hover:via-red-500/80 transition-all"></div>

                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-white/5">
                                {post.tipo.includes("Video") ? <Video size={14} className="text-gray-400" /> : <ImageIcon size={14} className="text-gray-400" />}
                                <span className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">{post.tipo}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {post.url && (
                                  <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-all flex items-center gap-1 text-[0.6rem] uppercase tracking-widest font-bold px-2 py-1.5 rounded-md hover:bg-white/10">
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                                <motion.button 
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleKillShot('Orgânico', post.legenda || 'Mídia Visual')}
                                  className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-md hover:bg-red-500 hover:text-white transition-all text-[0.55rem] font-bold uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                                >
                                  Tear-down <Crosshair size={10} />
                                </motion.button>
                              </div>
                            </div>
                            <p className="text-[0.8rem] font-montserrat text-gray-300 leading-relaxed">
                              {post.legenda ? (post.legenda.length > 200 ? `${post.legenda.substring(0, 200)}...` : post.legenda) : <span className="italic opacity-50">Publicação visual. Sem decodificação de texto.</span>}
                            </p>
                          </motion.div>
                        ))
                      ) : (
                        <div className="p-16 text-center text-gray-500 text-xs font-montserrat uppercase tracking-widest">Nenhuma publicação orgânica mapeada.</div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB: SHADOW FUNNEL (Pilar 3) */}
                  {activeTab === 'funnel' && (
                    <motion.div key="funnel" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar flex flex-col items-center justify-start min-h-max">
                       <div className="w-full max-w-sm space-y-6 relative mt-4">
                         
                         {/* Linha conectora de fundo */}
                         <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-red-500/50 via-red-500/20 to-transparent -translate-x-1/2 z-0"></div>

                         {/* Nó 1: Origem */}
                         <div className="bg-black/80 border border-red-500/30 rounded-xl p-4 relative z-10 shadow-[0_0_20px_rgba(239,68,68,0.15)] flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center shrink-0">
                             <Target size={16} className="text-red-400" />
                           </div>
                           <div>
                             <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest">Tráfego de Entrada</p>
                             <p className="text-sm font-bold text-v-white-off">Meta Ads (Vídeo)</p>
                           </div>
                         </div>

                         {/* Nó 2: Landing Page */}
                         <div className="bg-black/80 border border-white/10 rounded-xl p-4 relative z-10 shadow-lg flex items-center gap-4 ml-4">
                           <div className="w-10 h-10 rounded-full bg-white/5 border border-white/20 flex items-center justify-center shrink-0">
                             <TerminalSquare size={16} className="text-gray-400" />
                           </div>
                           <div>
                             <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest">Destino (Landing Page)</p>
                             <p className="text-sm font-bold text-v-white-off">Página de Vendas Longa</p>
                             <p className="text-[0.6rem] text-red-400 mt-1 italic">Vulnerabilidade: Promessa Fraca</p>
                           </div>
                         </div>

                         {/* Nó 3: Checkout & Upsell */}
                         <div className="bg-black/80 border border-green-500/30 rounded-xl p-4 relative z-10 shadow-[0_0_20px_rgba(34,197,94,0.1)] flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center shrink-0">
                             <GitBranch size={16} className="text-green-400" />
                           </div>
                           <div>
                             <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest">Ponto de Faturamento</p>
                             <p className="text-sm font-bold text-v-white-off">Checkout + Order Bump</p>
                             <p className="text-[0.6rem] text-green-400 mt-1 uppercase tracking-widest">Est. AOV: Alto</p>
                           </div>
                         </div>

                       </div>

                       <div className="mt-12 text-center max-w-xs">
                         <BrainCircuit size={32} className="text-red-500/40 mx-auto mb-3" />
                         <p className="text-[0.65rem] text-gray-500 uppercase tracking-widest leading-relaxed">
                           Diagrama extraído através da varredura de infraestrutura. A IA sugere um ataque imediato na fragilidade da Landing Page.
                         </p>
                       </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* === MODAL DE EXECUÇÃO: PROTOCOLO KILL-SHOT === */}
      <AnimatePresence>
        {isGeneratingKillShot && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }} 
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }} 
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90"
          >
            <div className="max-w-xl w-full text-center">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="w-24 h-24 border-t-2 border-r-2 border-red-500 rounded-full mx-auto mb-8 shadow-[0_0_30px_rgba(239,68,68,0.5)]"
              />
              <h2 className="font-abhaya text-3xl text-red-500 mb-4 tracking-widest uppercase shadow-red-500 drop-shadow-lg">
                Protocolo Kill-Shot Iniciado
              </h2>
              <div className="font-mono text-xs text-red-400/80 space-y-2 tracking-[0.2em]">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>[ ISOLATING TARGET VECTOR ]</motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>[ REVERSE ENGINEERING CIALDINI TRIGGERS ]</motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }}>[ GENERATING BLUE OCEAN COUNTER-NARRATIVE ]</motion.p>
              </div>
            </div>
          </motion.div>
        )}

        {/* RESULTADO DO KILL SHOT */}
        {killShotTarget && !isGeneratingKillShot && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <div className="glass-panel max-w-2xl w-full p-8 border border-red-500/50 rounded-xl bg-[#050505] shadow-[0_0_80px_rgba(239,68,68,0.2)] relative">
              <button onClick={() => setKillShotTarget(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
              
              <div className="border-b border-red-500/20 pb-4 mb-6">
                <h2 className="font-abhaya text-3xl text-red-500 flex items-center gap-3"><Skull className="text-red-500" /> Relatório de Destruição (Tear-down)</h2>
                <p className="font-montserrat text-[0.65rem] text-gray-500 uppercase tracking-widest mt-2 truncate">Alvo: Fragmento de Copy ({killShotTarget.type})</p>
              </div>

              <div className="space-y-6 font-montserrat text-sm text-gray-300">
                <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-red-400 mb-2">Fraqueza Detetada (Market Gap)</p>
                  <p className="leading-relaxed">O alvo utilizou o gatilho de "Prova Social" superficial. A promessa foca apenas no resultado final, ignorando a objeção de "esforço e tempo" (Equação de Hormozi). O público está cético em relação a atalhos mágicos.</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-v-white-off mb-2">Instrução de Contra-Ataque (Counter-Strategy)</p>
                  <p className="leading-relaxed">Não ataque o resultado, ataque o veículo. Crie um Hook focado no "Custo Oculto" do método deles. Exemplo de Hook: <em>"A verdade que os gurus não te contam sobre o método tradicional é que ele drena o seu tempo."</em> Ofereça o seu produto como o <strong>Mecanismo Único</strong> que poupa tempo.</p>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={() => setKillShotTarget(null)} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-2">
                  <ChevronRight size={16} /> Transferir para o Fechador (Pilar 6)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// COMPONENTE AUXILIAR: MÉTRICAS GERAIS
function MetricBox({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-panel p-5 border border-white/5 rounded-xl hover:border-white/20 transition-all flex flex-col justify-between h-32 bg-[#050505] group overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <div className={`absolute -right-10 -top-10 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity bg-current ${color}`}></div>
      <div className="flex justify-between items-start relative z-10">
        <p className="font-montserrat text-[0.6rem] uppercase tracking-widest text-gray-500">{title}</p>
        <div className={`${color} opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all`}>{icon}</div>
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

// COMPONENTE AUXILIAR: ÍNDICE DE VULNERABILIDADE
function VulnerabilityBox({ score, isLoading }: { score: number, isLoading: boolean }) {
  const isCritical = score > 75;
  const isMedium = score > 40 && score <= 75;
  const color = isCritical ? "text-red-500" : isMedium ? "text-orange-400" : "text-green-500";
  const glowColor = isCritical ? "rgba(239,68,68,0.3)" : isMedium ? "rgba(249,115,22,0.3)" : "rgba(34,197,94,0.3)";

  return (
    <div className="glass-panel p-5 border border-white/5 rounded-xl hover:border-white/20 transition-all flex flex-col justify-between h-32 bg-[#050505] group overflow-hidden relative" style={{ boxShadow: `0 0 20px ${glowColor}` }}>
      <div className="flex justify-between items-start relative z-10">
        <p className="font-montserrat text-[0.6rem] font-bold uppercase tracking-widest text-gray-400">Índice de Vulnerabilidade</p>
        <div className={`${color} opacity-80 animate-pulse`}><Activity size={16} /></div>
      </div>
      <div className="relative z-10 mt-auto">
        <div className="flex justify-between items-end mb-2">
          <div className={`font-abhaya text-3xl font-bold ${color}`}>{isLoading ? "---" : `${score}%`}</div>
          <div className="text-[0.55rem] text-gray-500 uppercase tracking-widest pb-1">{isCritical ? "CRÍTICO" : isMedium ? "MÉDIO" : "BLINDADO"}</div>
        </div>
        <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${isLoading ? 0 : score}%` }} 
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full ${isCritical ? 'bg-red-500' : isMedium ? 'bg-orange-400' : 'bg-green-500'}`}
          />
        </div>
      </div>
    </div>
  );
}
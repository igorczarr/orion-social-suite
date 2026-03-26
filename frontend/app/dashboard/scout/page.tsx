"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Radar, AlertTriangle, Target, MessageSquare, 
  Sparkles, Filter, RefreshCw, BrainCircuit, CloudLightning, 
  ArrowRight, ShieldAlert, Crown, Zap, Search, Eye, Fingerprint, Lock, Ghost, Crosshair
} from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ScoutPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { tenantInfo, toggleTenant } = useTenant();
  
  // === ESTADO: DADOS REAIS DA API ===
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // CONEXÃO SEGURA COM A NUVEM
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://orion-9pls.onrender.com";

  const carregarInsights = async () => {
    if (!tenantInfo?.id) return;
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const token = localStorage.getItem("orion_token");
      const res = await fetch(`${API_URL}/api/scout/social-listening/${tenantInfo.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        const formatados = data.insights.map((item: any, idx: number) => ({
          id: idx,
          platform: item.platform || "Web",
          time: "Recente", 
          quote: item.quote,
          category: item.category,
          intensity: item.intensity || "Média"
        }));
        setInsights(formatados);
      } else {
        setInsights([]);
      }
    } catch (error) {
      console.error("Falha ao puxar dados reais:", error);
      setInsights([]);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarInsights();
  }, [tenantInfo?.id]);

  const handleRefresh = () => {
    carregarInsights();
  };

  // === CÁLCULOS DINÂMICOS (MATEMÁTICA DO OCEANO AZUL) ===
  const totalInsights = insights.length;
  
  const categoryCounts = insights.reduce((acc: any, curr: any) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});
  
  let dominantCategory = "Buscando dados...";
  let maxCount = 0;
  for (const cat in categoryCounts) {
    if (categoryCounts[cat] > maxCount) {
      maxCount = categoryCounts[cat];
      dominantCategory = cat;
    }
  }

  const aspirationInsights = insights.filter(i => i.category.toLowerCase().includes("aspiração"));
  const maxAspiration = aspirationInsights.length > 0 ? "Domínio/Crescimento" : "Estabilidade";

  // === MOTOR DE CALIBRAÇÃO DE VOZ (Lógica Real) ===
  const brandVoice = useMemo(() => {
    let empatia = 50;
    let autoridade = 50;
    let humor = 30;
    let aviso = "";
    let diretriz = "Aguardando volume de dados para traçar perfil psicológico.";

    if (totalInsights > 0) {
      const cat = dominantCategory.toLowerCase();
      
      if (cat.includes("dor") || cat.includes("medo") || cat.includes("vulnerabilidade")) {
        empatia = 85; autoridade = 60; humor = 5;
        aviso = "*Atenção: A audiência relata dores profundas. Risco de repulsa com ironia.";
        diretriz = `Posicione-se como um porto seguro. A categoria '${dominantCategory}' exige comunicação acolhedora, provando que você entende o problema antes de vender a solução.`;
      } 
      else if (cat.includes("demanda oculta") || cat.includes("aspiração")) {
        empatia = 40; autoridade = 90; humor = 20;
        aviso = "*Atenção: Público sedento por solução. Vá direto ao ponto.";
        diretriz = `A audiência está pronta para agir (Foco: '${dominantCategory}'). Use tom de liderança, mostre o caminho e posicione o produto como o veículo exclusivo para essa conquista.`;
      }
      else if (cat.includes("objeção") || cat.includes("dúvida")) {
        empatia = 60; autoridade = 80; humor = 10;
        aviso = "*Público cético. Necessidade de provas sociais e dados.";
        diretriz = `Destrua a '${dominantCategory}' através de dados, lógica e garantias inflexíveis. Assuma uma postura técnica e inquestionável.`;
      }
    }

    return { empatia, autoridade, humor, aviso, diretriz };
  }, [dominantCategory, totalInsights]);

  // === DADOS MOCKADOS: PILAR 1 (Até a API enviar o JSON Semântico Completo) ===
  const lexicalData = {
    tribal: ["Cringe", "Burnout", "High-Ticket", "Game-Changer", "Escala", "Fosso"],
    taboo: ["Baratinho", "Desconto", "Curtiu", "Mágica", "Gurus", "Aproveite"],
    shadow: "Sinto-me um impostor a cobrar este valor, apesar de ter resultados.",
    enemy: "O modelo de agência tradicional que foca em curtidas em vez de ROI."
  };

  return (
    // NO-SCROLL CONTAINER
    <div className="relative h-full w-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto space-y-8 pb-32">
          
          {/* 1. CABEÇALHO TÁTICO */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]"></span>
                <span className="font-montserrat text-[0.65rem] text-purple-400 uppercase tracking-widest border border-purple-500/30 px-2 py-1 bg-purple-500/10 rounded-md shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  Córtex do Antropólogo
                </span>
              </div>
              <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-v-white-off tracking-wide">
                Scout & <span className="text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">Psicanálise</span>
              </h1>
              <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest mt-2">
                Cartografia de Desejo & Mapeamento de Fricções Ocultas
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
              <div className="flex items-center gap-3 bg-black/60 border border-white/10 p-2 rounded-xl backdrop-blur-md relative group shadow-2xl hover:border-purple-500/30 transition-colors">
                <div className="w-10 h-10 bg-purple-900/20 rounded-lg flex items-center justify-center font-abhaya text-purple-400 text-xl border border-purple-500/40 shadow-[inset_0_0_15px_rgba(168,85,247,0.3)]">
                  {tenantInfo?.initials || "-"}
                </div>
                <div className="pr-2 hidden sm:block">
                  <p className="font-montserrat text-[0.6rem] text-gray-500 uppercase tracking-widest">Conta Monitorada</p>
                  <p className="font-montserrat text-sm font-bold text-v-white-off">{tenantInfo?.name || "Carregando..."}</p>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTenant}
                  className="px-3 py-2 text-[0.65rem] font-bold text-black bg-[#d4af37] uppercase tracking-widest hover:bg-[#b5952f] transition-colors rounded-md shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                >
                  Trocar
                </motion.button>
              </div>
            </div>
          </header>

          {/* FILTROS DA PERSONA */}
          <div className="flex items-center justify-between bg-[#050505] border border-purple-500/20 p-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.05)] relative z-10">
            <div className="flex items-center gap-3">
              <span className="font-montserrat text-[0.65rem] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Fingerprint size={14} className="text-purple-500" />
                Persona Alvo:
              </span>
              <select className="bg-transparent text-v-white-off text-sm font-bold font-montserrat outline-none cursor-pointer max-w-[200px] truncate border-none appearance-none">
                {tenantInfo?.personas && tenantInfo.personas.length > 0 ? (
                  tenantInfo.personas.map((persona) => (
                    <option key={persona} value={persona} className="bg-[#050505] text-purple-400">
                      {persona}
                    </option>
                  ))
                ) : (
                  <option className="bg-[#050505]">Público Geral</option>
                )}
              </select>
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-3 border rounded-xl transition-all shadow-lg flex items-center justify-center ${isRefreshing ? 'border-purple-500 bg-purple-500/10 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-white/10 text-gray-400 hover:border-purple-500/50 hover:text-purple-400 hover:bg-purple-500/5'}`}
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            </motion.button>
          </div>

          {/* 2. TERMÔMETRO EMOCIONAL */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            <EmotionBox title="Sentimento Dominante" value={isLoading ? "..." : dominantCategory} subtitle="Frequência máxima" icon={<CloudLightning size={16} />} color="text-red-400" />
            <EmotionBox title="Maior Aspiração" value={isLoading ? "..." : maxAspiration} subtitle="Estimativa Comportamental" icon={<Crown size={16} />} color="text-[#d4af37]" />
            <EmotionBox title="Nível de Intensidade" value={insights.length > 0 ? insights[0].intensity : "N/A"} subtitle="Das interações recentes" icon={<Zap size={16} />} color="text-blue-400" />
            <EmotionBox title="Volume Processado" value={isLoading ? "..." : totalInsights.toString()} subtitle="Comentários no banco" icon={<Radar size={16} />} color="text-purple-400" />
          </section>

          {/* 3. O GRID PRINCIPAL */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch relative z-10">
            
            {/* COLUNA ESQUERDA: FEED DE OCEANO AZUL & COFRE SEMÂNTICO */}
            <div className="lg:col-span-2 flex flex-col gap-6 h-[700px]">
              
              {/* O COFRE SEMÂNTICO (PILAR 1) */}
              <div className="glass-panel border border-[#d4af37]/30 rounded-xl flex flex-col bg-[#050505] shadow-[0_0_30px_rgba(212,175,55,0.05)] relative overflow-hidden shrink-0">
                <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none p-4"><Lock size={150} className="text-[#d4af37]" /></div>
                
                <div className="p-5 border-b border-[#d4af37]/10 flex justify-between items-center bg-black/80 shrink-0 relative z-10 backdrop-blur-md">
                  <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-[#d4af37] flex items-center gap-2">
                    <BrainCircuit size={14} /> O Cofre Lexical (Engenharia Semântica)
                  </h3>
                  <span className="text-[0.55rem] font-bold uppercase tracking-widest px-2 py-1 bg-[#d4af37]/10 text-[#d4af37] rounded-md border border-[#d4af37]/30 shadow-[inset_0_0_10px_rgba(212,175,55,0.2)]">
                    N-Gram Analysis
                  </span>
                </div>
                
                <div className="p-5 flex flex-col md:flex-row gap-6 relative z-10">
                  <div className="flex-1 space-y-3">
                    <p className="font-montserrat text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Target size={12} className="text-green-500" /> Léxico Tribal (Forçar uso)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lexicalData.tribal.map((word, i) => (
                        <span key={i} className="text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="w-[1px] bg-white/10 hidden md:block"></div>
                  <div className="flex-1 space-y-3">
                    <p className="font-montserrat text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert size={12} className="text-red-500" /> Palavras-Tabu (Risco de Churn)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lexicalData.taboo.map((word, i) => (
                        <span key={i} className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg line-through decoration-red-500/50">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* DATA LAKE (RADAR DE LACUNAS) */}
              <div className="glass-panel border border-purple-500/20 rounded-xl flex flex-col flex-1 bg-[#050505] shadow-[0_0_40px_rgba(168,85,247,0.05)] relative overflow-hidden">
                <div className="absolute -left-10 -top-10 opacity-[0.02] pointer-events-none text-purple-500">
                   <Radar size={300} />
                </div>

                <div className="p-6 border-b border-purple-500/10 flex justify-between items-center bg-black/80 shrink-0 relative z-10 backdrop-blur-md">
                  <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-purple-500 flex items-center gap-2">
                    <MessageSquare size={14} /> Scanner de Fricção (Web Data Lake)
                  </h3>
                  <button className="flex items-center gap-2 text-[0.65rem] text-gray-400 hover:text-purple-400 uppercase tracking-widest font-bold transition-colors bg-white/5 px-3 py-1.5 rounded-md border border-white/10 hover:border-purple-500/50">
                    <Filter size={12} /> Filtrar
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 relative z-10">
                  {isLoading ? (
                     // EFEITO DE DATA MINING CINEMATOGRÁFICO
                     <div className="flex flex-col items-center justify-center h-full text-purple-500 font-mono text-xs">
                       <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="tracking-[0.3em]">
                         [ SCRAPING GLOBAL SOCIAL NETWORKS ]
                       </motion.div>
                       <div className="mt-6 h-20 overflow-hidden text-purple-400/50 relative w-full max-w-xs text-center border-l-2 border-purple-500/50 pl-4">
                         <motion.div animate={{ y: [0, -150] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="space-y-3">
                           <p>Connecting to Apify Actor...</p>
                           <p>Extracting raw user complaints...</p>
                           <p>Bypassing standard noise...</p>
                           <p className="text-purple-400 font-bold">Filtering by sentiment intensity...</p>
                           <p>Structuring JSON Datalake...</p>
                         </motion.div>
                         <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-[#050505] to-transparent"></div>
                       </div>
                    </div>
                  ) : insights.length > 0 ? (
                    <AnimatePresence>
                      {insights.map((insight, idx) => {
                        const isPain = insight.category.toLowerCase().includes('dor') || insight.category.toLowerCase().includes('medo') || insight.category.toLowerCase().includes('obje');
                        const isDesire = insight.category.toLowerCase().includes('demanda') || insight.category.toLowerCase().includes('aspira');
                        
                        // Efeito Hover Dinâmico dependendo da emoção
                        const hoverColor = isPain ? 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]' : isDesire ? 'hover:border-[#d4af37]/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]';

                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: idx * 0.05 }}
                            key={insight.id} 
                            className={`bg-black/60 border border-white/5 p-5 rounded-xl transition-all group ${hoverColor}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <EmotionBadge category={insight.category} />
                                <span className="text-[0.6rem] text-gray-500 uppercase tracking-widest font-bold">{insight.platform} • {insight.time}</span>
                              </div>
                              <span className={`text-[0.55rem] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${insight.intensity.toLowerCase().includes('extrema') ? 'bg-red-500/10 text-red-400 border-red-500/30' : insight.intensity.toLowerCase().includes('alta') ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                                Intensidade: {insight.intensity}
                              </span>
                            </div>
                            <p className="font-montserrat text-sm text-gray-300 leading-relaxed italic group-hover:text-v-white-off transition-colors">
                              "{insight.quote}"
                            </p>
                            <div className="mt-4 flex justify-end">
                                <motion.button whileTap={{ scale: 0.95 }} className="text-[0.6rem] flex items-center gap-2 font-bold text-gray-400 uppercase tracking-widest hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors bg-white/5 px-3 py-1.5 rounded-md border border-white/5 hover:border-[#d4af37]/30">
                                  Transformar em Hook <ArrowRight size={10} />
                                </motion.button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <p className="font-montserrat text-sm uppercase tracking-widest text-purple-400 mb-2">Nenhuma demanda detectada.</p>
                      <p className="font-montserrat text-xs text-center max-w-sm leading-relaxed border border-white/5 bg-white/5 p-4 rounded-xl">O motor está operando em background para preencher a base de dados com comentários cruciais da sua audiência. Volte mais tarde.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* COLUNA DIREITA: CALIBRADOR DE TOM DE VOZ DA IA & SOMBRA */}
            <div className="flex flex-col gap-6 h-[700px]">
              
              {/* O REVELADOR DA SOMBRA (PILAR 1) */}
              <div className="glass-panel border border-red-500/20 rounded-xl flex flex-col bg-[#050505] relative overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.05)] shrink-0">
                <div className="p-5 border-b border-red-500/10 relative z-10 bg-black/80 backdrop-blur-md">
                  <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
                    <Ghost size={14} /> Mapeamento da Sombra
                  </h3>
                </div>
                <div className="p-5 relative z-10 space-y-4">
                  <div>
                    <p className="text-[0.55rem] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><CloudLightning size={10}/> Medo Inconfessável (Reddit/X)</p>
                    <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg text-[0.75rem] font-montserrat text-gray-300 italic leading-relaxed">
                      "{lexicalData.shadow}"
                    </div>
                  </div>
                  <div>
                    <p className="text-[0.55rem] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Crosshair size={10}/> O Inimigo Comum (Rival Mimético)</p>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg text-[0.75rem] font-montserrat text-gray-300 leading-relaxed font-bold">
                      {lexicalData.enemy}
                    </div>
                  </div>
                </div>
              </div>

              {/* CALIBRADOR DE BRAND VOICE */}
              <div className="glass-panel border border-[#d4af37]/30 rounded-xl flex flex-col flex-1 bg-[#050505] relative overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.05)]">
                <div className="absolute -right-10 -bottom-10 opacity-[0.03] text-[#d4af37] pointer-events-none"><BrainCircuit size={250} /></div>
                
                <div className="p-6 border-b border-[#d4af37]/10 relative z-10 bg-black/80 shrink-0 backdrop-blur-md">
                  <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-[#d4af37] flex items-center gap-2">
                    <Target size={14} /> Calibrador Brand Voice (IA)
                  </h3>
                </div>
                
                <div className="flex-1 p-6 flex flex-col relative z-10 overflow-y-auto custom-scrollbar">
                  <p className="font-montserrat text-xs text-gray-400 mb-6 leading-relaxed bg-white/5 p-4 rounded-lg border border-white/5 shadow-inner">
                    Baseado na lacuna <strong className="text-[#d4af37] uppercase">{dominantCategory}</strong>, a IA ajustou a personalidade da sua marca para máxima conversão.
                  </p>

                  <div className="space-y-6 flex-1">
                    <div>
                      <div className="flex justify-between text-[0.65rem] font-montserrat font-bold uppercase tracking-widest text-v-white-off mb-2">
                        <span>Empatia (Acolhimento)</span>
                        <span className="text-[#d4af37]">{brandVoice.empatia}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/80 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${brandVoice.empatia}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-gray-700 to-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.5)]"></motion.div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[0.65rem] font-montserrat font-bold uppercase tracking-widest text-v-white-off mb-2">
                        <span>Autoridade (Dureza)</span>
                        <span className="text-[#d4af37]">{brandVoice.autoridade}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/80 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${brandVoice.autoridade}%` }} transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }} className="h-full bg-gradient-to-r from-gray-700 to-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.5)]"></motion.div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[0.65rem] font-montserrat font-bold uppercase tracking-widest text-v-white-off mb-2">
                        <span>Humor / Ironia</span>
                        <span className="text-[#d4af37]">{brandVoice.humor}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/80 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${brandVoice.humor}%` }} transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }} className="h-full bg-gradient-to-r from-gray-700 to-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.5)]"></motion.div>
                      </div>
                      {brandVoice.aviso && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-[0.6rem] text-red-400 mt-4 font-montserrat italic bg-red-500/10 p-3 rounded-lg border border-red-500/20 flex items-start gap-2 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                          <ShieldAlert size={12} className="shrink-0 mt-0.5" />
                          {brandVoice.aviso}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 p-5 bg-black/60 border border-[#d4af37]/20 rounded-xl backdrop-blur-md shadow-[inset_0_0_20px_rgba(212,175,55,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
                    <h4 className="font-abhaya text-lg text-[#d4af37] mb-3 flex items-center gap-2">
                      <Sparkles size={14} /> Diretriz de Conteúdo
                    </h4>
                    <p className="font-montserrat text-[0.7rem] text-gray-300 leading-relaxed italic font-medium">
                      "{brandVoice.diretriz}"
                    </p>
                  </div>

                  <div className="mt-6">
                    <motion.button whileTap={{ scale: 0.95 }} disabled={totalInsights === 0} className="w-full py-4 bg-[#d4af37] text-black font-montserrat text-[0.65rem] font-bold uppercase tracking-widest hover:bg-[#c9a128] transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      <BrainCircuit size={14} /> Injetar Voz no Gerador
                    </motion.button>
                  </div>
                </div>
              </div>

            </div>

          </section>
        </div>
      </div>
    </div>
  );
}

function EmotionBox({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-panel p-5 border border-white/5 rounded-xl hover:border-white/20 transition-all flex flex-col justify-between h-32 bg-[#050505] group overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      
      {/* Efeito Luminoso no Hover */}
      <div className={`absolute -right-10 -top-10 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity bg-current ${color}`}></div>

      <div className="flex justify-between items-start relative z-10">
        <p className="font-montserrat text-[0.6rem] uppercase tracking-widest text-gray-500 font-bold">{title}</p>
        <div className={`${color} opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all`}>{icon}</div>
      </div>
      <div className="relative z-10">
        <div className={`font-abhaya text-3xl font-bold mb-1 truncate ${color}`}>{value}</div>
        <div className="text-[0.6rem] text-gray-400 uppercase tracking-wide truncate">
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function EmotionBadge({ category }: { category: string }) {
  let bgColor = "bg-gray-500/10";
  let textColor = "text-gray-400";
  let borderColor = "border-gray-500/30";
  let shadowColor = "";
  let Icon = Eye;

  const catLower = category.toLowerCase();

  if (catLower.includes("dor") || catLower.includes("medo")) {
    bgColor = "bg-red-500/10";
    textColor = "text-red-400";
    borderColor = "border-red-500/30";
    shadowColor = "shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]";
    Icon = ShieldAlert;
  } else if (catLower.includes("demanda oculta")) {
    bgColor = "bg-purple-500/10";
    textColor = "text-purple-400";
    borderColor = "border-purple-500/30";
    shadowColor = "shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]";
    Icon = Target;
  } else if (catLower.includes("aspiração")) {
    bgColor = "bg-[#d4af37]/10";
    textColor = "text-[#d4af37]";
    borderColor = "border-[#d4af37]/30";
    shadowColor = "shadow-[inset_0_0_10px_rgba(212,175,55,0.2)]";
    Icon = Sparkles;
  } else if (catLower.includes("objeção")) {
    bgColor = "bg-orange-500/10";
    textColor = "text-orange-400";
    borderColor = "border-orange-500/30";
    shadowColor = "shadow-[inset_0_0_10px_rgba(249,115,22,0.2)]";
    Icon = AlertTriangle;
  }

  return (
    <span className={`flex items-center gap-1.5 text-[0.55rem] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${bgColor} ${textColor} ${borderColor} ${shadowColor}`}>
      <Icon size={10} />
      {category}
    </span>
  );
}
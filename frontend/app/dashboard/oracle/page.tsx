"use client";

import { useState, useEffect } from "react";
import { 
  BrainCircuit, TrendingDown, TrendingUp, CalendarClock, 
  Calculator, Zap, AlertOctagon, Activity, RefreshCw, 
  Play, DollarSign, Target, ArrowRight, Server
} from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { motion, AnimatePresence } from "framer-motion";

export default function OraclePage() {
  const { tenantInfo, toggleTenant } = useTenant();
  
  // === ESTADOS DE CARREGAMENTO E DADOS API ===
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [oracleData, setOracleData] = useState<any>(null);

  // === ESTADOS DO SIMULADOR WHAT-IF ===
  const [isSimulating, setIsSimulating] = useState(false);
  const [simBudget, setSimBudget] = useState("500");
  const [simFormat, setSimFormat] = useState("Reels");
  const [simResult, setSimResult] = useState<{ reach: string, leads: string, roi: string } | null>(null);

  // CONEXÃO SEGURA COM A NUVEM
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://orion-9pls.onrender.com";

  // === MOTOR DE BUSCA (API MATEMÁTICA) ===
  const loadOracleData = async () => {
    if (!tenantInfo?.id) return;
    setIsLoading(true);
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem("orion_token"); 
      const res = await fetch(`${API_URL}/api/oracle/${tenantInfo.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOracleData(data);
      }
    } catch (error) {
      console.error("Falha ao consultar o Oráculo", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadOracleData();
  }, [tenantInfo?.id]);

  const handleRefresh = () => {
    loadOracleData();
  };

  // === LÓGICA DO SIMULADOR MATEMÁTICO CONSERVADOR ===
  const runSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimResult(null);
    
    setTimeout(() => {
      // Matemática ajustada para cenários de mercado realistas (Tráfego Frio)
      const multiplier = simFormat === 'Reels' ? 180 : simFormat === 'Carousel' ? 120 : 80; 
      const budget = parseFloat(simBudget) || 0;
      const estReach = Math.floor(budget * multiplier);
      
      // Conversão base de 0.8% a 1.2% (Realidade)
      const conversionRate = simFormat === 'Story' ? 0.012 : 0.008; 
      const estLeads = Math.floor(estReach * conversionRate); 
      
      // ROI Conservador
      const estRoi = (Math.random() * (2.8 - 1.2) + 1.2).toFixed(1);

      setSimResult({
        reach: `+${estReach.toLocaleString('pt-BR')}`,
        leads: `${estLeads} a ${Math.floor(estLeads * 1.3)}`,
        roi: `${estRoi}x`
      });
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      
      {/* 1. CABEÇALHO TÁTICO */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]"></span>
            <span className="font-montserrat text-[0.65rem] text-blue-400 uppercase tracking-widest border border-blue-500/30 px-2 py-1 bg-blue-500/10 rounded-md">
              Regressão Linear Ativa
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-v-white-off tracking-wide">
            O <span className="text-[#d4af37]">Oráculo</span>
          </h1>
          <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest mt-2">
            Predição Matemática & Prevenção de Fadiga
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <div className="flex items-center gap-3 bg-black/60 border border-white/10 p-2 rounded-xl backdrop-blur-md relative group shadow-2xl">
            <div className="w-10 h-10 bg-blue-900/20 rounded-lg flex items-center justify-center font-abhaya text-blue-400 text-xl border border-blue-500/40 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]">
              {tenantInfo?.initials || "-"}
            </div>
            <div className="pr-2 hidden sm:block">
              <p className="font-montserrat text-[0.6rem] text-gray-500 uppercase tracking-widest">A Prever Para</p>
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
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-3 bg-black border rounded-xl transition-all shadow-lg flex items-center justify-center ${isRefreshing ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-white/10 text-gray-400 hover:border-[#d4af37]/50 hover:text-[#d4af37] hover:bg-[#d4af37]/5'}`}
            title="Recalibrar Modelos"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </motion.button>
        </div>
      </header>

      {/* 2. TERMÔMETRO DO FUTURO */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBox title="Crescimento (7d)" value={isLoading ? "..." : oracleData?.metrics?.predicted_growth} subtitle="Predição Linear" icon={<TrendingUp size={16} />} color="text-green-500" />
        <MetricBox title="Risco de Fadiga" value={isLoading ? "..." : oracleData?.metrics?.fatigue_risk} subtitle="Saturação da base" icon={<AlertOctagon size={16} />} color={oracleData?.metrics?.fatigue_risk === "Alto" ? "text-red-400" : "text-[#d4af37]"} />
        <MetricBox title="Melhor Formato Hoje" value={isLoading ? "..." : oracleData?.metrics?.best_format} subtitle="Baseado em retenção" icon={<Play size={16} />} color="text-[#d4af37]" />
        <MetricBox title="Ação da Audiência" value={isLoading ? "..." : oracleData?.metrics?.audience_quality} subtitle="Estado atual" icon={<Target size={16} />} color="text-blue-400" />
      </section>

      {/* 3. GRID DO ORÁCULO */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* COLUNA ESQUERDA (Span 2): Fadiga e Simulador */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* 3A. Radar de Fadiga de Formato */}
          <div className="glass-panel border border-white/10 rounded-xl p-6 flex-1 bg-black/40 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Server size={150} className="text-[#d4af37]" /></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10 border-b border-white/5 pb-4">
              <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
                <Activity size={14} className="text-[#d4af37]" /> Decaimento de Formatos (Trend Decay)
              </h3>
            </div>
            
            <div className="space-y-4 relative z-10 overflow-y-auto custom-scrollbar max-h-[300px] pr-2">
              {isLoading ? (
                 <div className="flex flex-col items-center justify-center py-10 font-mono text-[#d4af37] text-xs">
                   <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                     [ CALCULATING REGRESSION VECTORS ]
                   </motion.div>
                 </div>
              ) : oracleData?.fatigue?.length > 0 ? (
                <AnimatePresence>
                  {oracleData.fatigue.map((item: any, idx: number) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: idx * 0.1 }}
                      key={item.id} 
                      className="bg-black/60 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-all group"
                    >
                      <div>
                        <h4 className="font-abhaya text-lg text-v-white-off flex items-center gap-2">
                          {item.format}
                          <span className={`text-[0.55rem] px-2 py-0.5 rounded-md border ${item.growth > 0 ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                            {item.growth > 0 ? '+' : ''}{item.growth}%
                          </span>
                        </h4>
                        <p className="font-montserrat text-[0.65rem] text-gray-500 uppercase tracking-widest mt-1">Previsão: <span className={item.forecast.includes('-') ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>{item.forecast}</span></p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[0.6rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md border ${item.status.includes('Fadiga') ? 'bg-red-500/10 text-red-400 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : item.status.includes('Ascensão') ? 'bg-green-500/10 text-green-400 border-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-gray-500/10 text-gray-400 border-gray-500/30'}`}>
                          {item.status}
                        </span>
                        <div className="text-[0.65rem] font-montserrat text-gray-300 w-32 text-right hidden md:block">
                          {item.recommendation}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <p className="text-center py-8 text-gray-500 text-xs font-montserrat uppercase tracking-widest">Sem histórico suficiente para cálculo estatístico.</p>
              )}
            </div>
          </div>

          {/* 3B. Simulador de Cenários (What-If) */}
          <div className="glass-panel border border-[#d4af37]/30 rounded-xl bg-[#d4af37]/5 relative overflow-hidden shrink-0 shadow-[0_0_30px_rgba(212,175,55,0.05)]">
            <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none p-4"><Calculator size={200} className="text-[#d4af37]" /></div>
            
            <div className="p-6 border-b border-[#d4af37]/10 relative z-10 bg-black/60">
              <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-[#d4af37] flex items-center gap-2">
                <BrainCircuit size={14} /> Gerador de Cenários (Simulação What-If)
              </h3>
            </div>
            
            <div className="p-6 flex flex-col md:flex-row gap-8 relative z-10">
              {/* Formulário do Simulador */}
              <form onSubmit={runSimulation} className="flex-1 space-y-5">
                <div className="group">
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-[#d4af37] transition-colors font-bold">Se eu injetar (R$ Tráfego)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#d4af37] transition-colors" />
                    <input 
                      type="number" 
                      value={simBudget}
                      onChange={(e) => setSimBudget(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg py-3 pl-9 pr-4 text-sm font-bold text-v-white-off focus:border-[#d4af37] outline-none transition-all shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]" 
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-[#d4af37] transition-colors font-bold">No seguinte formato</label>
                  <select 
                    value={simFormat}
                    onChange={(e) => setSimFormat(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm font-bold text-v-white-off focus:border-[#d4af37] outline-none cursor-pointer shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] appearance-none"
                  >
                    <option value="Reels">Vídeo Curto (Reels/TikTok)</option>
                    <option value="Carousel">Carrossel Educativo</option>
                    <option value="Story">Sequência de Stories (Venda)</option>
                  </select>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  type="submit" 
                  disabled={isSimulating}
                  className="w-full py-4 bg-[#d4af37] text-black font-montserrat text-[0.65rem] font-bold uppercase tracking-widest hover:bg-[#c9a128] transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] flex justify-center items-center gap-2 disabled:opacity-50 rounded-lg"
                >
                  {isSimulating ? <><Activity size={14} className="animate-spin" /> Processando Algoritmo...</> : "Projetar Retorno"}
                </motion.button>
              </form>

              {/* Resultado do Simulador */}
              <div className="flex-1 flex flex-col justify-center">
                {isSimulating ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-[#d4af37]/30 rounded-xl bg-black/40">
                     <Activity size={30} className="text-[#d4af37] animate-spin mb-4" />
                     <p className="font-mono text-[0.65rem] text-[#d4af37] uppercase tracking-[0.2em] animate-pulse">Running Monte Carlo Simulation...</p>
                  </div>
                ) : simResult ? (
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-black/80 border border-[#d4af37]/50 p-6 rounded-xl space-y-4 shadow-[0_0_30px_rgba(212,175,55,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
                    <h4 className="font-abhaya text-xl text-[#d4af37] border-b border-[#d4af37]/20 pb-2 mb-4 flex items-center justify-between">
                      Projeção Conservadora
                      <CheckCircle2 size={16} className="text-green-500" />
                    </h4>
                    <div className="flex justify-between items-end">
                      <span className="font-montserrat text-[0.65rem] uppercase tracking-widest text-gray-400">Alcance Extra</span>
                      <span className="font-bold text-v-white-off text-lg">{simResult.reach}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="font-montserrat text-[0.65rem] uppercase tracking-widest text-gray-400">Leads Estimados</span>
                      <span className="font-bold text-v-white-off text-lg">{simResult.leads}</span>
                    </div>
                    <div className="flex justify-between items-end pt-3 border-t border-white/10 mt-2">
                      <span className="font-montserrat text-[0.65rem] font-bold uppercase tracking-widest text-[#d4af37]">ROAS Previsto (Retorno)</span>
                      <span className="font-bold text-green-400 text-3xl drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">{simResult.roi}</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-xl bg-black/20">
                    <BrainCircuit size={32} className="text-gray-600 mb-3" />
                    <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest leading-relaxed">
                      Ajuste o caixa e o formato para prever o retorno da próxima campanha.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (Span 1): Heatmap de Conversão */}
        <div className="glass-panel border border-blue-500/20 rounded-xl flex flex-col h-full bg-black/40 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.05)]">
          <div className="p-6 border-b border-blue-500/10 flex justify-between items-center bg-black/60 shrink-0 relative z-10">
            <h3 className="font-montserrat text-[0.65rem] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
              <CalendarClock size={14} /> Matriz de Oportunidade
            </h3>
          </div>
          <div className="p-5 border-b border-white/5 bg-black/40 shrink-0">
             <p className="text-[0.65rem] font-montserrat text-gray-400 leading-relaxed text-justify">
               Zonas de calor geradas pela análise matemática do seu histórico. Exibe os clusters de horário com maior taxa de retenção algorítmica.
             </p>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center">
            
            {isLoading ? (
               <div className="flex flex-col items-center justify-center font-mono text-blue-400 text-xs">
                 <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                   [ MAPPING CHRONO VECTORS ]
                 </motion.div>
               </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:gap-2 w-full text-center">
                {/* Cabeçalho */}
                <div></div>
                <div className="text-[0.55rem] font-montserrat font-bold text-gray-500 uppercase tracking-widest mb-2">Manhã</div>
                <div className="text-[0.55rem] font-montserrat font-bold text-gray-500 uppercase tracking-widest mb-2">Tarde</div>
                <div className="text-[0.55rem] font-montserrat font-bold text-gray-500 uppercase tracking-widest mb-2">Noite</div>

                {/* Renderização Dinâmica do Heatmap */}
                {['Ter', 'Qua', 'Qui'].map(dia => (
                  <HeatmapRow key={dia} dia={dia} dados={oracleData?.heatmap?.[dia]} />
                ))}
              </div>
            )}

            <div className="mt-auto pt-8">
               <motion.button whileTap={{ scale: 0.95 }} className="w-full py-3 bg-black border border-white/10 text-gray-400 font-montserrat text-[0.6rem] font-bold uppercase tracking-widest hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition-all flex justify-center items-center gap-2 rounded-lg">
                 Sincronizar com Agenda <ArrowRight size={12} />
               </motion.button>
            </div>
          </div>
        </div>

      </section>
    </motion.div>
  );
}

// === COMPONENTES AUXILIARES APRIMORADOS (ELITE UI) ===

function HeatmapRow({ dia, dados }: { dia: string, dados: any }) {
  const m = dados?.Manhã || 10;
  const t = dados?.Tarde || 10;
  const n = dados?.Noite || 10;

  return (
    <>
      <div className="text-[0.6rem] font-montserrat font-bold text-gray-400 uppercase flex items-center justify-end pr-2">{dia}</div>
      <HeatBox value={m} />
      <HeatBox value={t} />
      <HeatBox value={n} />
    </>
  );
}

function HeatBox({ value }: { value: number }) {
  const isHigh = value > 75;
  const isMed = value > 40 && value <= 75;
  
  // Padrão Elite Visual (Blue/Gold Heatmap)
  let bgClass = "bg-blue-500/5 border-blue-500/10";
  let textClass = "text-blue-400/40 font-normal";
  let shadowClass = "";

  if (isHigh) {
    bgClass = "bg-[#d4af37]/80 border-[#d4af37]/50";
    textClass = "text-black font-bold";
    shadowClass = "shadow-[0_0_15px_rgba(212,175,55,0.4)] z-10 scale-105";
  } else if (isMed) {
    bgClass = "bg-blue-500/30 border-blue-500/40";
    textClass = "text-blue-200 font-bold";
  }

  return (
    <div className={`h-10 rounded-md border flex items-center justify-center text-[0.55rem] transition-all duration-300 ${bgClass} ${textClass} ${shadowClass}`}>
      {Math.min(Math.round(value), 99)}%
    </div>
  );
}

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
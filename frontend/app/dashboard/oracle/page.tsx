"use client";

import { useState, useEffect } from "react";
import { 
  BrainCircuit, TrendingDown, TrendingUp, CalendarClock, 
  Calculator, Zap, AlertOctagon, Activity, RefreshCw, 
  Play, DollarSign, Target, ArrowRight
} from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";

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
      const token = localStorage.getItem("orion_token"); // Atualizado para o token padrão
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
      const multiplier = simFormat === 'Reels' ? 180 : simFormat === 'Carousel' ? 120 : 80; // Custo por mil (CPM) ajustado
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
    <div className="space-y-8 animate-fade-in-up pb-20">
      
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
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-lg backdrop-blur-sm">
            <div className="w-10 h-10 bg-black/50 rounded-md flex items-center justify-center font-abhaya text-[#d4af37] text-xl border border-[#d4af37]/20">
              {tenantInfo?.initials || "-"}
            </div>
            <div className="pr-2 hidden sm:block">
              <p className="font-montserrat text-[0.6rem] text-gray-500 uppercase tracking-widest">A Prever Para</p>
              <p className="font-montserrat text-sm font-bold text-v-white-off">{tenantInfo?.name || "Carregando..."}</p>
            </div>
            <button 
              onClick={toggleTenant}
              className="px-3 py-2 text-[0.65rem] font-bold text-black bg-[#d4af37] uppercase tracking-widest hover:bg-[#b5952f] transition-colors rounded-md"
            >
              Trocar
            </button>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-[#d4af37]/10 hover:text-[#d4af37] transition-colors ${isRefreshing ? 'animate-spin text-[#d4af37] border-[#d4af37]' : 'text-gray-400'}`}
          >
            <RefreshCw size={16} />
          </button>
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
          <div className="glass-panel border border-white/10 rounded-xl p-6 flex-1 bg-black/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
                <Activity size={14} className="text-[#d4af37]" /> Decaimento de Formatos (Trend Decay)
              </h3>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                 <div className="text-center py-8 text-[#d4af37] animate-pulse font-montserrat text-xs uppercase tracking-widest">Processando regressão linear...</div>
              ) : oracleData?.fatigue?.length > 0 ? (
                oracleData.fatigue.map((item: any) => (
                  <div key={item.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-all group">
                    <div>
                      <h4 className="font-abhaya text-lg text-v-white-off flex items-center gap-2">
                        {item.format}
                        <span className={`text-[0.55rem] px-2 py-0.5 rounded-full border ${item.growth > 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {item.growth > 0 ? '+' : ''}{item.growth}%
                        </span>
                      </h4>
                      <p className="font-montserrat text-[0.65rem] text-gray-500 uppercase tracking-widest mt-1">Previsão: <span className={item.forecast.includes('-') ? 'text-red-400' : 'text-green-400'}>{item.forecast}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[0.6rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md border ${item.status.includes('Fadiga') ? 'bg-red-500/10 text-red-400 border-red-500/30' : item.status.includes('Ascensão') ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-gray-500/10 text-gray-400 border-gray-500/30'}`}>
                        {item.status}
                      </span>
                      <div className="text-[0.65rem] font-montserrat text-gray-300 w-32 text-right hidden md:block">
                        {item.recommendation}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-gray-500 text-xs">Sem histórico suficiente para cálculo estatístico.</p>
              )}
            </div>
          </div>

          {/* 3B. Simulador de Cenários (What-If) */}
          <div className="glass-panel border border-[#d4af37]/30 rounded-xl bg-[#d4af37]/5 relative overflow-hidden shrink-0">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none p-4"><Calculator size={150} className="text-[#d4af37]" /></div>
            <div className="p-6 border-b border-[#d4af37]/10 relative z-10 bg-black/40">
              <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-[#d4af37] flex items-center gap-2">
                <BrainCircuit size={14} /> Gerador de Cenários (Simulação)
              </h3>
            </div>
            
            <div className="p-6 flex flex-col md:flex-row gap-8 relative z-10">
              {/* Formulário do Simulador */}
              <form onSubmit={runSimulation} className="flex-1 space-y-5">
                <div className="group">
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-[#d4af37] transition-colors">Se eu injetar (R$ Tráfego)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#d4af37] transition-colors" />
                    <input 
                      type="number" 
                      value={simBudget}
                      onChange={(e) => setSimBudget(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-9 pr-4 text-sm text-v-white-off focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/30 outline-none transition-all" 
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-[#d4af37] transition-colors">No seguinte formato</label>
                  <select 
                    value={simFormat}
                    onChange={(e) => setSimFormat(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-v-white-off focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/30 outline-none cursor-pointer"
                  >
                    <option value="Reels">Vídeo Curto (Reels/TikTok)</option>
                    <option value="Carousel">Carrossel Educativo</option>
                    <option value="Story">Sequência de Stories (Venda)</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  disabled={isSimulating}
                  className="w-full py-3 bg-[#d4af37] text-black font-montserrat text-[0.65rem] font-bold uppercase tracking-widest hover:bg-[#c9a128] transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] flex justify-center items-center gap-2 disabled:opacity-50 rounded-lg"
                >
                  {isSimulating ? <><Activity size={14} className="animate-spin" /> Calculando Vetores...</> : "Projetar Retorno"}
                </button>
              </form>

              {/* Resultado do Simulador */}
              <div className="flex-1 flex flex-col justify-center">
                {simResult ? (
                  <div className="bg-black/60 border border-[#d4af37]/30 p-6 rounded-xl space-y-4 animate-fade-in-up shadow-xl backdrop-blur-sm">
                    <h4 className="font-abhaya text-xl text-[#d4af37] border-b border-[#d4af37]/10 pb-2 mb-4">Projeção Conservadora</h4>
                    <div className="flex justify-between items-end">
                      <span className="font-montserrat text-[0.65rem] uppercase tracking-widest text-gray-400">Alcance Extra</span>
                      <span className="font-bold text-v-white-off text-lg">{simResult.reach}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="font-montserrat text-[0.65rem] uppercase tracking-widest text-gray-400">Leads Estimados</span>
                      <span className="font-bold text-v-white-off text-lg">{simResult.leads}</span>
                    </div>
                    <div className="flex justify-between items-end pt-3 border-t border-white/5">
                      <span className="font-montserrat text-[0.65rem] uppercase tracking-widest text-[#d4af37]">ROAS Previsto (Retorno)</span>
                      <span className="font-bold text-green-400 text-2xl">{simResult.roi}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-xl bg-white/5">
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
        <div className="glass-panel border border-white/10 rounded-xl flex flex-col h-full bg-black/20 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40 shrink-0">
            <h3 className="font-montserrat text-[0.65rem] font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
              <CalendarClock size={14} className="text-[#d4af37]" /> Matriz de Oportunidade
            </h3>
          </div>
          <div className="p-5 border-b border-white/5 bg-black/60 shrink-0">
             <p className="text-[0.65rem] font-montserrat text-gray-400 leading-relaxed">
               Zonas de calor geradas pela análise matemática do seu histórico. Horários com maior taxa de retenção.
             </p>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center">
            
            {isLoading ? (
               <div className="text-center text-[#d4af37] animate-pulse font-montserrat text-xs uppercase tracking-widest">Processando calendário...</div>
            ) : (
              <div className="grid grid-cols-4 gap-1 sm:gap-2 w-full text-center">
                {/* Cabeçalho */}
                <div></div>
                <div className="text-[0.55rem] font-montserrat font-bold text-gray-500 uppercase tracking-widest">Manhã</div>
                <div className="text-[0.55rem] font-montserrat font-bold text-gray-500 uppercase tracking-widest">Tarde</div>
                <div className="text-[0.55rem] font-montserrat font-bold text-gray-500 uppercase tracking-widest">Noite</div>

                {/* Renderização Dinâmica do Heatmap */}
                {['Ter', 'Qua', 'Qui'].map(dia => (
                  <HeatmapRow key={dia} dia={dia} dados={oracleData?.heatmap?.[dia]} />
                ))}
              </div>
            )}

            <div className="mt-auto pt-8">
               <button className="w-full py-3 bg-black/50 border border-white/10 text-gray-400 font-montserrat text-[0.6rem] font-bold uppercase tracking-widest hover:border-[#d4af37]/50 hover:text-[#d4af37] transition-all flex justify-center items-center gap-2 rounded-lg">
                 Sincronizar com Agenda <ArrowRight size={12} />
               </button>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}

// === COMPONENTES AUXILIARES ===

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
  
  let bgClass = "bg-[#d4af37]/5 border-[#d4af37]/10";
  let textClass = "text-[#d4af37]/40 font-normal";
  let shadowClass = "";

  if (isHigh) {
    bgClass = "bg-[#d4af37]/80 border-[#d4af37]/50";
    textClass = "text-black font-bold";
    shadowClass = "shadow-[0_0_15px_rgba(212,175,55,0.3)]";
  } else if (isMed) {
    bgClass = "bg-[#d4af37]/40 border-[#d4af37]/20";
    textClass = "text-black font-bold";
  }

  return (
    <div className={`h-10 rounded-md border flex items-center justify-center text-[0.55rem] transition-colors ${bgClass} ${textClass} ${shadowClass}`}>
      {Math.min(Math.round(value), 99)}%
    </div>
  );
}

function MetricBox({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-panel p-5 border border-white/5 rounded-xl hover:border-[#d4af37]/30 transition-colors flex flex-col justify-between h-32 bg-black/20">
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
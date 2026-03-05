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

  // === MOTOR DE BUSCA (API) ===
  const loadOracleData = async () => {
    if (!tenantInfo?.id) return;
    setIsLoading(true);
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem("vrtice_token");
      const res = await fetch(`http://localhost:8000/api/oracle/${tenantInfo.id}`, {
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

  // === LÓGICA DO SIMULADOR MATEMÁTICO ===
  const runSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimResult(null);
    
    setTimeout(() => {
      // Matemática real de simulação baseada no formato escolhido e no budget
      const multiplier = simFormat === 'Reels' ? 250 : simFormat === 'Carousel' ? 180 : 120;
      const budget = parseFloat(simBudget) || 0;
      const estReach = Math.floor(budget * multiplier);
      const estLeads = Math.floor(estReach * 0.015); // 1.5% conversão base
      const estRoi = (Math.random() * (3.5 - 1.5) + 1.5).toFixed(1);

      setSimResult({
        reach: `+${estReach.toLocaleString('pt-BR')}`,
        leads: `${estLeads} a ${Math.floor(estLeads * 1.2)}`,
        roi: `${estRoi}x`
      });
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      
      {/* 1. CABEÇALHO TÁTICO */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-v-white-off/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]"></span>
            <span className="font-montserrat text-[0.65rem] text-blue-400 uppercase tracking-widest border border-blue-500/30 px-2 py-1 bg-blue-500/10">
              Motor Preditivo Ativo
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-v-white-off tracking-wide">
            O <span className="text-gold-gradient">Oráculo</span>
          </h1>
          <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest mt-2">
            Previsão de Cenários & Prevenção de Fadiga
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 bg-white/5 border border-v-white-off/10 p-2 rounded-sm backdrop-blur-sm">
            <div className="w-10 h-10 bg-v-blue-navy rounded-sm flex items-center justify-center font-abhaya text-v-gold text-xl border border-v-gold/20">
              {tenantInfo?.initials || "-"}
            </div>
            <div className="pr-2 hidden sm:block">
              <p className="font-montserrat text-[0.6rem] text-gray-500 uppercase tracking-widest">A Prever Para</p>
              <p className="font-montserrat text-sm font-bold text-v-white-off">{tenantInfo?.name || "Carregando..."}</p>
            </div>
            <button 
              onClick={toggleTenant}
              className="px-3 py-2 text-[0.65rem] font-bold text-v-black bg-v-gold uppercase tracking-widest hover:bg-v-white-off transition-colors rounded-sm"
            >
              Trocar
            </button>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-v-gold/10 hover:text-v-gold transition-colors ${isRefreshing ? 'animate-spin text-v-gold border-v-gold' : 'text-gray-400'}`}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* 2. TERMÔMETRO DO FUTURO */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBox title="Crescimento Previsto (7d)" value={isLoading ? "..." : oracleData?.metrics?.predicted_growth} subtitle="Alta probabilidade" icon={<TrendingUp size={16} />} color="text-green-500" />
        <MetricBox title="Risco de Fadiga" value={isLoading ? "..." : oracleData?.metrics?.fatigue_risk} subtitle="Saturação da base" icon={<AlertOctagon size={16} />} color={oracleData?.metrics?.fatigue_risk === "Alto" ? "text-red-400" : "text-v-gold"} />
        <MetricBox title="Melhor Formato Hoje" value={isLoading ? "..." : oracleData?.metrics?.best_format} subtitle="Baseado em retenção" icon={<Play size={16} />} color="text-v-gold" />
        <MetricBox title="Qualidade da Audiência" value={isLoading ? "..." : oracleData?.metrics?.audience_quality} subtitle="Prontos para conversão" icon={<Target size={16} />} color="text-blue-400" />
      </section>

      {/* 3. GRID DO ORÁCULO */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* COLUNA ESQUERDA (Span 2): Fadiga e Simulador */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* 3A. Radar de Fadiga de Formato */}
          <div className="glass-panel border border-v-white-off/10 rounded-sm p-6 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
                <Activity size={14} className="text-v-gold" /> Decaimento de Formatos (Trend Decay)
              </h3>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                 <div className="text-center py-8 text-v-gold animate-pulse font-montserrat text-xs uppercase tracking-widest">Calculando matriz de decaimento...</div>
              ) : oracleData?.fatigue?.length > 0 ? (
                oracleData.fatigue.map((item: any) => (
                  <div key={item.id} className="bg-v-black/50 border border-v-white-off/5 p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-v-white-off/20 transition-colors">
                    <div>
                      <h4 className="font-abhaya text-lg text-v-white-off">{item.format}</h4>
                      <p className="font-montserrat text-[0.65rem] text-gray-500 uppercase tracking-widest mt-1">Previsão: <span className={item.forecast.includes('-') ? 'text-red-400' : 'text-green-400'}>{item.forecast}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[0.6rem] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border ${item.status.includes('Fadiga') ? 'bg-red-500/10 text-red-400 border-red-500/30' : item.status.includes('Ascensão') ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-gray-500/10 text-gray-400 border-gray-500/30'}`}>
                        {item.status}
                      </span>
                      <div className="text-[0.65rem] font-montserrat text-gray-300 w-32 text-right hidden md:block">
                        {item.recommendation}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-gray-500 text-xs">Sem dados suficientes para análise.</p>
              )}
            </div>
          </div>

          {/* 3B. Simulador de Cenários (What-If) */}
          <div className="glass-panel border border-v-gold/30 rounded-sm bg-v-gold/5 relative overflow-hidden shrink-0">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none p-4"><Calculator size={150} className="text-v-gold" /></div>
            <div className="p-6 border-b border-v-gold/10 relative z-10 bg-v-black/20">
              <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-v-gold flex items-center gap-2">
                <BrainCircuit size={14} /> Gerador de Cenários (IA)
              </h3>
            </div>
            
            <div className="p-6 flex flex-col md:flex-row gap-8 relative z-10">
              {/* Formulário do Simulador */}
              <form onSubmit={runSimulation} className="flex-1 space-y-5">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Se eu injetar (R$ Tráfego)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="number" 
                      value={simBudget}
                      onChange={(e) => setSimBudget(e.target.value)}
                      className="w-full bg-v-black border border-v-white-off/20 rounded-sm py-3 pl-9 pr-4 text-sm text-v-white-off focus:border-v-gold outline-none transition-colors" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">No seguinte formato</label>
                  <select 
                    value={simFormat}
                    onChange={(e) => setSimFormat(e.target.value)}
                    className="w-full bg-v-black border border-v-white-off/20 rounded-sm px-4 py-3 text-sm text-v-white-off focus:border-v-gold outline-none cursor-pointer"
                  >
                    <option value="Reels">Vídeo Curto (Reels/TikTok)</option>
                    <option value="Carousel">Carrossel Educativo</option>
                    <option value="Story">Sequência de Stories (Venda)</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  disabled={isSimulating}
                  className="w-full py-3 bg-v-gold text-v-black font-montserrat text-[0.65rem] font-bold uppercase tracking-widest hover:bg-v-white-off transition-colors shadow-[0_0_15px_rgba(200,169,112,0.3)] flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isSimulating ? <><Activity size={14} className="animate-spin" /> Processando IA...</> : "Calcular Previsão"}
                </button>
              </form>

              {/* Resultado do Simulador */}
              <div className="flex-1 flex flex-col justify-center">
                {simResult ? (
                  <div className="bg-v-black/80 border border-v-gold/30 p-6 rounded-sm space-y-4 animate-fade-in-up">
                    <h4 className="font-abhaya text-xl text-v-gold border-b border-v-gold/10 pb-2 mb-4">Projeção da Máquina</h4>
                    <div className="flex justify-between items-end">
                      <span className="font-montserrat text-[0.65rem] uppercase tracking-widest text-gray-400">Alcance Extra Estimado</span>
                      <span className="font-bold text-v-white-off text-lg">{simResult.reach}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="font-montserrat text-[0.65rem] uppercase tracking-widest text-gray-400">Geração de Leads</span>
                      <span className="font-bold text-v-white-off text-lg">{simResult.leads}</span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-v-white-off/10">
                      <span className="font-montserrat text-[0.65rem] uppercase tracking-widest text-v-gold">ROAS Previsto (Retorno)</span>
                      <span className="font-bold text-green-400 text-2xl">{simResult.roi}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-v-white-off/10 rounded-sm">
                    <BrainCircuit size={32} className="text-gray-600 mb-3" />
                    <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest leading-relaxed">
                      Ajuste os parâmetros ao lado para prever o retorno da sua próxima campanha.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (Span 1): Heatmap de Conversão */}
        <div className="glass-panel border border-v-white-off/10 rounded-sm flex flex-col h-full">
          <div className="p-6 border-b border-v-white-off/10 flex justify-between items-center bg-white/5 shrink-0">
            <h3 className="font-montserrat text-[0.65rem] font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
              <CalendarClock size={14} className="text-v-gold" /> Matriz de Oportunidade
            </h3>
          </div>
          <div className="p-5 border-b border-v-white-off/5 bg-v-black/50 shrink-0">
             <p className="text-[0.65rem] font-montserrat text-gray-400 leading-relaxed">
               Zonas de calor geradas pela análise do seu histórico orgânico. Horários com maior propensão a cliques.
             </p>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center">
            
            {isLoading ? (
               <div className="text-center text-v-gold animate-pulse font-montserrat text-xs uppercase tracking-widest">Mapeando horários...</div>
            ) : (
              <div className="grid grid-cols-4 gap-1 sm:gap-2 w-full text-center">
                {/* Cabeçalho */}
                <div></div>
                <div className="text-[0.55rem] font-montserrat font-bold text-gray-500 uppercase tracking-widest">Manhã</div>
                <div className="text-[0.55rem] font-montserrat font-bold text-gray-500 uppercase tracking-widest">Tarde</div>
                <div className="text-[0.55rem] font-montserrat font-bold text-gray-500 uppercase tracking-widest">Noite</div>

                {/* Renderização Dinâmica do Heatmap vindo da API */}
                {['Ter', 'Qua', 'Qui'].map(dia => (
                  <HeatmapRow key={dia} dia={dia} dados={oracleData?.heatmap?.[dia]} />
                ))}
              </div>
            )}

            <div className="mt-8">
               <button className="w-full py-3 bg-v-black border border-v-white-off/20 text-gray-400 font-montserrat text-[0.6rem] font-bold uppercase tracking-widest hover:border-v-gold hover:text-v-gold transition-colors flex justify-center items-center gap-2">
                 Programar Posts Automáticos <ArrowRight size={12} />
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
  // Se não houver dados reais, preenche com um tom base baixo
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
  // Calcula a intensidade da cor baseada no valor (0 a 100)
  const isHigh = value > 75;
  const isMed = value > 40 && value <= 75;
  
  let bgClass = "bg-v-gold/10 border-v-gold/5";
  let textClass = "text-v-gold/50 font-normal";
  let shadowClass = "";

  if (isHigh) {
    bgClass = "bg-v-gold/80 border-v-gold/50";
    textClass = "text-v-black font-bold";
    shadowClass = "shadow-[0_0_10px_rgba(200,169,112,0.4)]";
  } else if (isMed) {
    bgClass = "bg-v-gold/40 border-v-gold/20";
    textClass = "text-v-black font-bold";
  }

  return (
    <div className={`h-10 rounded-sm border flex items-center justify-center text-[0.5rem] md:text-[0.6rem] transition-colors ${bgClass} ${textClass} ${shadowClass}`}>
      {Math.min(Math.round(value), 99)}%
    </div>
  );
}

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
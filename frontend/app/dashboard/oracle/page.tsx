"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { 
  BrainCircuit, Activity, Calculator, Thermometer, 
  TrendingUp, TrendingDown, Clock, Zap, Target, 
  AlertOctagon, Play, Crosshair, BarChart2, Database
} from "lucide-react";

// === MOCK DATA: MACHINE LEARNING & PREDICTIONS ===
const vulnerabilityMap = [
  { day: "Segunda", time: "07:00", emotion: "Ansiedade / Planeamento", vulnerability: "Alta", action: "Conteúdo Lógico/Estratégico" },
  { day: "Terça", time: "15:00", emotion: "Fadiga Cognitiva", vulnerability: "Média", action: "Entretenimento Rápido (Dopamina)" },
  { day: "Quinta", time: "20:00", emotion: "Exaustão Operacional", vulnerability: "Extrema", action: "Anúncios de 'Feito por Você' (Alívio da Dor)" },
  { day: "Domingo", time: "21:00", emotion: "Pânico Pré-Semana", vulnerability: "Crítica", action: "Venda de Promessa de Longo Prazo / Esperança" }
];

const alphaSignals = [
  { pattern: "Hook de Desconstrução (Mito)", duration: "60s+", format: "Talking Head Agressivo", winRate: "78%", momentum: "+14%" },
  { pattern: "B-Roll Cinematográfico + Voz IA", duration: "15-30s", format: "Short/Reel Estético", winRate: "65%", momentum: "+22%" },
  { pattern: "Mini-Documentário (Case Study)", duration: "10m+", format: "YouTube Long-Form", winRate: "82%", momentum: "+8%" }
];

const saturationIndex = [
  { format: "Vlog de Rotina Genérica", status: "Saturado (Morte)", trend: "-45%", advice: "Pausar Produção Imediatamente" },
  { format: "Entrevistas de Podcast (Cortes)", status: "Fadiga Alta", trend: "-20%", advice: "Usar apenas se o convidado for Tier 1" }
];

export default function OracleQuantPage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Parâmetros do Simulador
  const [simFormat, setSimFormat] = useState("reels");
  const [simTrigger, setSimTrigger] = useState("medo");
  const [simTime, setSimTime] = useState("noite");

  const runSimulation = () => {
    setIsSimulating(true);
    setSimResult(null);
    
    // Simulação do Motor de Cálculo
    setTimeout(() => {
      setSimResult({
        projViews: "14.5K - 22.8K",
        projEngagement: "4.2%",
        fatigueRisk: simFormat === 'reels' ? "Médio" : "Baixo",
        verdict: simTrigger === 'medo' && simTime === 'noite' 
          ? "ALINHAMENTO PERFEITO. A vulnerabilidade noturna maximiza o gatilho de aversão à perda. Autorizado para produção." 
          : "ALINHAMENTO SUB-OTIMIZADO. Considere alterar o gatilho emocional para Autoridade/Status."
      });
      setIsSimulating(false);
    }, 2500);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      {/* =====================================================================
          1. HEADER TÁTICO & STATUS DO MODELO
      ===================================================================== */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full animate-pulse shadow-[0_0_8px_#a855f7]"></div>
            <span className="font-mono text-[9px] text-[#a855f7] uppercase tracking-widest font-bold">
              Pilar 04 • Inteligência & Predição
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-white tracking-wide">
            O <span className="text-[#a855f7] drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">Oráculo</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end bg-[#0a0a0a] p-2 px-4 rounded-lg border border-white/5 shadow-inner">
            <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Dataset de Treino</span>
            <span className="text-[11px] font-mono text-[#a855f7] font-bold flex items-center gap-1.5">
              <Database size={10} /> 1.2M+ Posts Analisados
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. O SIMULADOR MATEMÁTICO (MONTE CARLO) E VULNERABILIDADE
      ===================================================================== */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Simulador Preditivo */}
        <motion.div variants={itemVariants} className="xl:col-span-7 bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#a855f7] opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#a855f7]/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="p-6 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between">
            <h2 className="text-[10px] text-[#a855f7] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Calculator size={14} /> Simulador Preditivo de Desempenho
            </h2>
            <span className="text-[8px] bg-white/5 text-gray-400 border border-white/10 px-2 py-0.5 rounded font-mono">Regressão Linear Ativa</span>
          </div>

          <div className="p-6 flex flex-col gap-6 flex-1 bg-black/20 z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Formato & Plataforma</span>
                <select value={simFormat} onChange={(e) => setSimFormat(e.target.value)} className="bg-black text-[10px] text-white border border-gray-800 rounded-lg px-3 py-2 outline-none font-bold uppercase tracking-wider cursor-pointer hover:border-[#a855f7]/50 focus:border-[#a855f7] transition-colors shadow-inner">
                  <option value="reels">Short-Form (Reels/TikTok)</option>
                  <option value="long">Long-Form (YouTube)</option>
                  <option value="carousel">Carrossel Técnico (IG/LI)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Gatilho Emocional</span>
                <select value={simTrigger} onChange={(e) => setSimTrigger(e.target.value)} className="bg-black text-[10px] text-white border border-gray-800 rounded-lg px-3 py-2 outline-none font-bold uppercase tracking-wider cursor-pointer hover:border-[#a855f7]/50 focus:border-[#a855f7] transition-colors shadow-inner">
                  <option value="medo">Aversão à Perda (Medo)</option>
                  <option value="ganancia">Status / Ganância</option>
                  <option value="tribo">Pertencimento (Tribo)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Horário de Impacto</span>
                <select value={simTime} onChange={(e) => setSimTime(e.target.value)} className="bg-black text-[10px] text-white border border-gray-800 rounded-lg px-3 py-2 outline-none font-bold uppercase tracking-wider cursor-pointer hover:border-[#a855f7]/50 focus:border-[#a855f7] transition-colors shadow-inner">
                  <option value="manha">Manhã (Lógica/Setup)</option>
                  <option value="tarde">Tarde (Fadiga)</option>
                  <option value="noite">Noite (Vulnerabilidade)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full py-4 bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/30 hover:bg-[#a855f7] hover:text-white font-bold text-[10px] uppercase tracking-[0.2em] transition-all rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.15)] flex items-center justify-center gap-3 disabled:opacity-50 group"
            >
              {isSimulating ? (
                <><Activity size={14} className="animate-spin" /> Processando Dataset...</>
              ) : (
                <><BrainCircuit size={14} className="group-hover:scale-110 transition-transform" /> Executar Simulação de Risco</>
              )}
            </button>

            {/* Resultados da Simulação */}
            <div className="mt-auto">
              {!simResult && !isSimulating && (
                <div className="h-32 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-[9px] font-mono text-gray-600 uppercase tracking-widest bg-white/[0.02]">
                  Aguardando Parâmetros para Projeção...
                </div>
              )}
              {isSimulating && (
                <div className="h-32 border border-[#a855f7]/20 rounded-xl flex items-center justify-center bg-[#a855f7]/5">
                  <div className="flex items-center gap-2 text-[#a855f7] font-mono text-[10px] uppercase tracking-widest">
                    <BarChart2 size={14} className="animate-pulse" /> Calculando Árvore de Probabilidades...
                  </div>
                </div>
              )}
              {simResult && !isSimulating && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#121927] border border-white/10 p-4 rounded-xl shadow-inner flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Projeção de Views (Min-Max)</span>
                      <span className="text-xl font-mono font-bold text-white drop-shadow-md">{simResult.projViews}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Engajamento Base</span>
                      <span className="text-xl font-mono font-bold text-[#10B981]">{simResult.projEngagement}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Risco de Fadiga</span>
                      <span className="text-sm font-mono font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">{simResult.fatigueRisk}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-black/40 p-3 rounded-lg border border-white/5">
                    <Crosshair size={14} className={simResult.verdict.includes('PERFEITO') ? 'text-[#10B981] shrink-0 mt-0.5' : 'text-yellow-500 shrink-0 mt-0.5'} />
                    <span className="text-[10px] font-mono text-gray-300 leading-relaxed uppercase tracking-wide">
                      {simResult.verdict}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Heatmap de Vulnerabilidade Cronológica */}
        <motion.div variants={itemVariants} className="xl:col-span-5 bg-[#050505]/90 backdrop-blur-xl border border-red-500/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden group hover:border-red-500/30 transition-colors">
          <div className="p-6 border-b border-white/5 bg-[#0a0a0a]">
            <h2 className="text-[10px] text-red-500 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Thermometer size={14} /> Mapa Termal de Vulnerabilidade
            </h2>
          </div>
          
          <div className="p-6 flex flex-col gap-4 flex-1 bg-black/20 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] text-gray-400 font-mono leading-relaxed mb-2">
              Janelas temporais em que a guarda psicológica da persona desce, aumentando a permeabilidade a ofertas e conversões de alto ticket.
            </p>

            <div className="flex flex-col gap-3">
              {vulnerabilityMap.map((map, i) => (
                <div key={i} className="bg-[#121927] border border-white/5 p-3.5 rounded-xl shadow-sm flex flex-col gap-2 relative overflow-hidden">
                  <div className={`absolute right-0 top-0 w-1.5 h-full ${map.vulnerability === 'Crítica' ? 'bg-red-500 shadow-[0_0_10px_#EF4444]' : map.vulnerability === 'Extrema' ? 'bg-orange-500' : map.vulnerability === 'Alta' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-gray-500" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{map.day}, {map.time}</span>
                    </div>
                    <span className="text-[9px] font-mono text-gray-400 border border-gray-700 bg-black px-1.5 py-0.5 rounded shadow-inner">Nível: {map.vulnerability}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Estado Emocional: <span className="text-white normal-case">{map.emotion}</span></span>
                    <span className="text-[9px] text-[#10B981] uppercase tracking-widest font-bold mt-1">Sugerido: <span className="text-gray-300 normal-case">{map.action}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </section>

      {/* =====================================================================
          3. O RADAR DE FORMATOS (ALPHA SIGNALS E SATURAÇÃO)
      ===================================================================== */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        
        {/* Alpha Signals (O que está a funcionar) */}
        <motion.div variants={itemVariants} className="bg-[#050505]/90 backdrop-blur-xl border border-[#10B981]/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#10B981]/10 bg-[#0a0a0a] flex items-center justify-between">
            <h2 className="text-[10px] text-[#10B981] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <TrendingUp size={14} /> Alpha Signals (Padrões Vencedores)
            </h2>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-black/20">
            <div className="flex flex-col gap-3">
              {alphaSignals.map((signal, i) => (
                <div key={i} className="flex flex-col gap-2 p-4 bg-[#121927] border border-white/5 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{signal.pattern}</span>
                      <span className="text-[9px] text-gray-500 font-mono uppercase mt-1 flex items-center gap-1">
                        <Play size={10}/> {signal.format} ({signal.duration})
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">Win Rate: {signal.winRate}</span>
                      <span className="text-[9px] text-gray-400 font-mono flex items-center gap-1"><Zap size={8} className="text-yellow-500"/> {signal.momentum} Momentum</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Saturation Index (O que está morto) */}
        <motion.div variants={itemVariants} className="bg-[#050505]/90 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between">
            <h2 className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <TrendingDown size={14} className="text-gray-600" /> Índice de Saturação (Dead Formats)
            </h2>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-black/20">
            <div className="flex flex-col gap-3">
              {saturationIndex.map((dead, i) => (
                <div key={i} className="flex flex-col gap-2 p-4 bg-black/40 border border-white/5 rounded-xl shadow-inner opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 line-through decoration-red-500/50">{dead.format}</span>
                    <span className="text-[9px] font-mono font-bold text-red-500">{dead.trend} EV</span>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <span className="text-[9px] text-red-400 uppercase tracking-widest font-bold flex items-center gap-1"><AlertOctagon size={10}/> {dead.status}</span>
                    <span className="text-[9px] text-gray-500 font-mono bg-[#121927] px-2 py-0.5 rounded border border-gray-800">{dead.advice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </section>
    </motion.div>
  );
}
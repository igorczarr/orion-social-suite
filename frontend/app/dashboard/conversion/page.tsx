"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Zap, Target, ShieldCheck, Flame, GitMerge, Link2, 
  Search, Activity, FileJson, Layers, Crosshair, BrainCircuit, 
  SlidersHorizontal, AlertTriangle, ArrowRight
} from "lucide-react";

// === MOCK DATA: ENGENHARIA FINANCEIRA (Kahneman, Hormozi, Schwartz) ===
const conversionData = {
  uniqueMechanism: {
    name: "Protocolo de Retenção Mnemônica (PRM-12)",
    description: "Substitui 'Aulas de Inglês' (Saturado) por um sistema neurobiológico de retenção de vocabulário em 12 dias."
  },
  offerEngineering: {
    guarantee: "Lucro Garantido ou Devolução em Dobro + Mentoria 1-1.",
    packages: [
      { name: "Apenas Curso (A Isca)", price: "R$ 1.500", type: "decoy" },
      { name: "Pacote Elite (Core)", price: "R$ 1.997", type: "core", highlight: "Inclui PRM-12 + Mentoria" },
      { name: "Consultoria (Ancoragem)", price: "R$ 15.000", type: "anchor" }
    ],
    anchorEffect: "O pacote Elite parece irracionalmente vantajoso em comparação à Isca. A Ancoragem de R$ 15k remove a fricção de preço."
  },
  liquidCopy: [
    { objection: "Não tenho tempo para aplicar.", refutation: "O PRM-12 foi desenhado para ser injetado em gaps de 15 minutos na rotina, como no trânsito ou banho." },
    { objection: "Já tentei outros e falhei.", refutation: "Você falhou porque usou métodos dependentes de motivação. O PRM-12 depende de condicionamento operante." },
    { objection: "É muito caro.", refutation: "Caro é perder a promoção de US$ 5k/mês por ser fluente apenas em português. O ROI é imediato." }
  ],
  remarketingHound: [
    { day: "Dia 01", angle: "Lógica Institucional", focus: "Gráficos de ROI e matemática da fluência.", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
    { day: "Dia 02", angle: "Aversão à Perda (Medo)", focus: "O custo oculto de estagnar na carreira em 2026.", color: "text-red-400 border-red-500/30 bg-red-500/10" },
    { day: "Dia 03", angle: "Prova Social do Inimigo", focus: "Como 'João' venceu o curso tradicional de 5 anos usando PRM-12.", color: "text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10" },
    { day: "Dia 04", angle: "Identidade & Ego", focus: "Você é um Executor ou um Espectador do sucesso alheio?", color: "text-[#d4af37] border-[#d4af37]/30 bg-[#d4af37]/10" }
  ]
};

export default function ConversionWarRoomPage() {
  // Estados do Configurador de Pressão
  const [pressureLevel, setPressureLevel] = useState<number>(8);
  const [pressureTheme, setPressureTheme] = useState("text-[#10B981] bg-[#10B981]");
  
  // Estados da Auditoria Reversa
  const [lpUrl, setLpUrl] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  
  // Exportação
  const [isExporting, setIsExporting] = useState(false);

  // Efeito do Configurador de Pressão
  useEffect(() => {
    if (pressureLevel <= 3) setPressureTheme("text-blue-400 bg-blue-500 shadow-[0_0_15px_#3b82f6]");
    else if (pressureLevel <= 7) setPressureTheme("text-orange-400 bg-orange-500 shadow-[0_0_15px_#f97316]");
    else setPressureTheme("text-red-500 bg-red-600 shadow-[0_0_20px_#dc2626] animate-pulse");
  }, [pressureLevel]);

  const getPressureLabel = () => {
    if (pressureLevel <= 3) return "Evergreen (Autoridade Lógica)";
    if (pressureLevel <= 7) return "Campanha Ativa (Urgência Base)";
    return "Lançamento (Escassez Extrema / FOMO)";
  };

  const handleReverseAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lpUrl) return;
    setIsAuditing(true);
    setAuditResult(null);
    setTimeout(() => {
      setAuditResult("VULNERABILIDADE DETECTADA: A sua taxa de conversão sangra porque a promessa exige muito 'Esforço' (Hormozi). Falta um 'Mecanismo Único'. Ação: Substitua a headline principal e injete a Garantia Condicional no primeiro scroll visual.");
      setIsAuditing(false);
    }, 2500);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("✅ PROTOCOLO KILL SHOT EXPORTADO: JSON Estruturado com VSL, Landing Page Copy, 7 Emails e Scripts de WhatsApp.");
    }, 2000);
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
          1. HEADER TÁTICO & CONFIGURADOR DE PRESSÃO
      ===================================================================== */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_8px_#10B981]"></div>
            <span className="font-mono text-[9px] text-[#10B981] uppercase tracking-widest font-bold">
              Pilar 06 • Engenharia Financeira
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-white tracking-wide">
            O <span className="text-[#10B981] drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">Fechador</span>
          </h1>
        </div>

        {/* The Pressure Configurator */}
        <motion.div variants={itemVariants} className="flex-1 max-w-xl bg-[#0a0a0a] border border-white/5 p-5 rounded-2xl shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-[#10B981]" /> Pressão Algorítmica da Copy
            </h3>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-white/10 ${pressureTheme.split(' ')[0]}`}>
              NÍVEL {pressureLevel}
            </span>
          </div>
          
          <div className="relative w-full h-1.5 bg-gray-900 rounded-full overflow-visible border border-white/5 shadow-inner">
            <input 
              type="range" min="1" max="10" value={pressureLevel} 
              onChange={(e) => setPressureLevel(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${pressureTheme.split(' ')[1]} ${pressureTheme.split(' ')[2] || ''}`} style={{ width: `${pressureLevel * 10}%` }}></div>
            {/* Custom Thumb Visual */}
            <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-black bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300 pointer-events-none`} style={{ left: `calc(${pressureLevel * 10}% - 8px)` }}></div>
          </div>
          
          <div className="flex justify-between mt-3">
            <span className="text-[8px] text-gray-600 font-mono uppercase tracking-widest">Lógica</span>
            <span className="text-[9px] text-white font-mono uppercase tracking-widest font-bold">{getPressureLabel()}</span>
            <span className="text-[8px] text-gray-600 font-mono uppercase tracking-widest">Escassez</span>
          </div>
        </motion.div>
      </header>

      {/* =====================================================================
          2. A OFERTA (MECANISMO, DECOY PRICING & INVERSÃO DE RISCO)
      ===================================================================== */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* O Mecanismo Único */}
        <motion.div variants={itemVariants} className="xl:col-span-5 bg-[#050505]/90 backdrop-blur-xl border border-[#10B981]/20 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden group hover:border-[#10B981]/40 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/10 rounded-full blur-[40px] pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4 relative z-10">
            <h2 className="text-[10px] text-[#10B981] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Zap size={14} /> Mecanismo Único (Diferenciação)
            </h2>
            <span className="text-[8px] font-mono bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded shadow-sm">Blue Ocean</span>
          </div>

          <div className="flex flex-col gap-4 relative z-10 flex-1">
            <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5 shadow-inner">
              <span className="text-xs font-bold text-white mb-2 block">{conversionData.uniqueMechanism.name}</span>
              <p className="font-montserrat text-[10px] text-gray-400 leading-relaxed italic border-l-2 border-[#10B981] pl-3">
                "{conversionData.uniqueMechanism.description}"
              </p>
            </div>
            
            <div className="mt-auto bg-[#10B981]/5 border border-[#10B981]/20 p-4 rounded-xl flex flex-col gap-2">
              <span className="text-[9px] text-[#10B981] uppercase tracking-widest font-bold flex items-center gap-1.5"><ShieldCheck size={12}/> Inversão de Risco Assimétrica</span>
              <p className="font-mono text-xs text-white font-bold drop-shadow-md">
                "{conversionData.offerEngineering.guarantee}"
              </p>
            </div>
          </div>
        </motion.div>

        {/* Decoy Pricing Architecture */}
        <motion.div variants={itemVariants} className="xl:col-span-7 bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Target size={14} className="text-blue-400" /> Arquitetura Pre-Suasion (Efeito Isca)
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-4 relative z-10 flex-1">
            {conversionData.offerEngineering.packages.map((pkg, i) => (
              <div key={i} className={`flex-1 flex flex-col p-5 rounded-xl border relative transition-all ${
                pkg.type === 'core' 
                  ? 'bg-gradient-to-b from-[#10B981]/10 to-transparent border-[#10B981]/40 shadow-[0_0_20px_rgba(16,185,129,0.1)] scale-105 z-10' 
                  : 'bg-[#0a0a0a] border-white/5 opacity-60 hover:opacity-100'
              }`}>
                {pkg.type === 'core' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#10B981] text-black text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded shadow-md">OFERTA ALVO</div>}
                
                <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-2 text-center mt-2">{pkg.name}</span>
                <span className={`text-2xl font-mono font-bold text-center mb-4 ${pkg.type === 'decoy' ? 'line-through text-gray-600' : 'text-white'}`}>{pkg.price}</span>
                
                {pkg.highlight && (
                  <div className="mt-auto bg-[#10B981]/20 border border-[#10B981]/30 p-2 rounded text-center text-[9px] font-mono text-[#10B981] font-bold">
                    {pkg.highlight}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest text-center">
              <strong className="text-white">Lógica IA:</strong> {conversionData.offerEngineering.anchorEffect}
            </p>
          </div>
        </motion.div>

      </section>

      {/* =====================================================================
          3. COPY LÍQUIDA, REMARKETING HOUND & AUDITORIA REVERSA
      ===================================================================== */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Copy Líquida (Refutação Dinâmica) */}
        <motion.div variants={itemVariants} className="xl:col-span-8 bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Layers size={14} className="text-blue-500" /> Matriz de Refutação (Liquid Copy)
            </h2>
            <span className="text-[8px] font-mono text-gray-500 bg-[#121927] px-2 py-0.5 rounded border border-white/5">Injetado na VSL</span>
          </div>

          <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-12 gap-4 px-4 pb-2 border-b border-white/5">
              <div className="col-span-5 text-[8px] font-bold uppercase tracking-widest text-red-400">Objeção Capturada (Pilar 1)</div>
              <div className="col-span-7 text-[8px] font-bold uppercase tracking-widest text-[#10B981]">Refutação Modular Gerada</div>
            </div>
            
            {conversionData.liquidCopy.map((copy, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 bg-[#0a0a0a] border border-white/5 p-4 rounded-xl shadow-inner items-start group hover:border-[#10B981]/30 transition-colors">
                <div className="col-span-5 font-montserrat text-[10px] text-gray-400 italic leading-relaxed">
                  "{copy.objection}"
                </div>
                <div className="col-span-7 font-montserrat text-[11px] text-gray-200 font-bold leading-relaxed border-l border-white/10 pl-4 group-hover:border-[#10B981]/50 transition-colors">
                  {copy.refutation}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Remarketing Hound & Auditoria */}
        <div className="xl:col-span-4 flex flex-col gap-6 h-full">
          
          {/* O Cão de Caça (Angle-Based Remarketing) */}
          <motion.div variants={itemVariants} className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col flex-1">
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
              <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                <GitMerge size={14} className="text-purple-400" /> Remarketing Hound
              </h2>
            </div>
            <div className="flex flex-col gap-2.5">
              {conversionData.remarketingHound.map((rt, i) => (
                <div key={i} className="bg-[#0a0a0a] border border-white/5 p-3 rounded-xl flex flex-col gap-1.5 shadow-inner">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold font-mono text-white bg-white/5 px-1.5 py-0.5 rounded">{rt.day}</span>
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${rt.color}`}>
                      {rt.angle}
                    </span>
                  </div>
                  <p className="text-[10px] font-montserrat text-gray-400">
                    {rt.focus}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Auditoria Reversa (Raio-X) */}
          <motion.div variants={itemVariants} className="bg-[#0a0a0a] border border-red-500/20 rounded-2xl p-5 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)] relative overflow-hidden shrink-0">
            <div className="flex items-center gap-2 mb-4 border-b border-red-500/10 pb-3">
              <AlertTriangle size={14} className="text-red-500" />
              <h3 className="font-montserrat text-[10px] font-bold uppercase tracking-widest text-red-500">
                Auditoria Reversa (URL)
              </h3>
            </div>
            
            <form onSubmit={handleReverseAudit} className="flex flex-col gap-3">
              <div className="relative">
                <Link2 size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input 
                  type="url" required value={lpUrl} onChange={(e) => setLpUrl(e.target.value)}
                  placeholder="https://sua-pagina.com..."
                  className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 pl-8 pr-3 text-[10px] font-mono text-white focus:border-red-500 outline-none transition-colors shadow-inner"
                />
              </div>
              <button 
                type="submit" disabled={isAuditing}
                className="w-full py-2.5 bg-red-600/10 border border-red-500/40 text-red-400 font-bold text-[9px] uppercase tracking-widest rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                {isAuditing ? <><Activity size={12} className="animate-spin"/> Extraindo Fricção...</> : <><Search size={12}/> Raio-X Gemini</>}
              </button>
            </form>

            <AnimatePresence>
              {auditResult && !isAuditing && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                  <p className="font-montserrat text-[9px] leading-relaxed text-red-200">
                    <strong className="text-white block mb-1">Veredito da IA:</strong> {auditResult}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

      </section>

      {/* =====================================================================
          4. A BOMBA NUCLEAR (EXPORTAÇÃO 1-CLICK)
      ===================================================================== */}
      <motion.div variants={itemVariants} className="mt-4 pb-10">
        <button 
          onClick={handleExport} disabled={isExporting}
          className="w-full py-6 bg-gradient-to-r from-[#10B981] to-[#047857] text-black font-abhaya text-2xl tracking-widest font-bold rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-4 disabled:opacity-50 overflow-hidden relative group"
        >
          <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>
          
          {isExporting ? (
            <><Activity size={24} className="animate-spin" /> COMPILANDO ENGENHARIA DE VENDAS...</>
          ) : (
            <><FileJson size={24} /> EXPORTAR FUNIL ESTRUTURADO (1-CLICK)</>
          )}
        </button>
        <p className="text-center text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-4">
          Gera JSON/Notion Board com: Script VSL (Modular), Copy da Landing Page, 4 Sequências de Remarketing e Scripts de WhatsApp.
        </p>
      </motion.div>

    </motion.div>
  );
}
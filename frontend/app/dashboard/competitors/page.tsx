"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { 
  Crosshair, Skull, Layers, Zap, Activity, ShieldAlert, 
  Terminal, ArrowRight, DollarSign, Database, MonitorSmartphone, 
  ThumbsDown, AlertOctagon, TrendingDown
} from "lucide-react";

// === MOCK DATA: THE SHADOW FUNNEL & KILL SHOT PROTOCOL ===
const competitorData = {
  name: "Dr. Lair (Geração Saúde)",
  niche: "Emagrecimento / Biohacking",
  vulnerabilityIndex: 82, // 0-100 (Quanto maior, mais fácil de derrubar)
  estAOV: "R$ 1.250",
  
  shadowFunnel: [
    { stage: "Top of Funnel", type: "Meta Ads (Vídeo VSL)", status: "Ativo > 45d", metric: "CAC Est: R$ 65" },
    { stage: "Front-End", type: "E-book Dieta Keto", price: "R$ 47", status: "Conversão: ~8%", metric: "Cobre o CAC" },
    { stage: "Order Bump", type: "Checklist de Supermercado", price: "R$ 27", status: "Take Rate: 15%", metric: "Lucro Imediato" },
    { stage: "Core Offer (Upsell 1)", type: "Mentoria Metabólica 30D", price: "R$ 997", status: "Fricção Alta", metric: "Conv: < 2%" },
    { stage: "Downsell", type: "Acesso Apenas Plataforma", price: "R$ 497", status: "Take Rate: 5%", metric: "Recuperação" }
  ],

  hormoziEquation: {
    dreamOutcome: { score: 9, text: "Perder 10kg sem flacidez" },
    certainty: { score: 4, text: "Falta prova social de alunos reais (apenas o médico)" },
    timeDelay: { score: 7, text: "Promessa em 30 dias (Rápido)" },
    effort: { score: 9, text: "Exige cozinhar 4x ao dia (Esforço Extremo)" },
    verdict: "O 'Esforço' destrói o valor da oferta. Oportunidade de criar um método 'Lazy Keto' para pessoas ocupadas."
  },

  techStack: [
    { category: "Plataforma", name: "Kiwify" },
    { category: "Tracking", name: "Meta Pixel + GTM (Server-Side Missing)" },
    { category: "CRM", name: "ActiveCampaign" },
    { category: "Frontend", name: "WordPress + Elementor" }
  ],

  churnAudit: [
    { source: "Reclame Aqui", complaint: "Suporte não responde para reembolso.", severity: "High" },
    { source: "YouTube Comments", complaint: "As receitas são muito caras para manter.", severity: "Critical" },
    { source: "Instagram", complaint: "Vídeos da mentoria não abrem no celular.", severity: "Medium" }
  ],

  adsProfitPool: [
    { adName: "O Mito do Pão Integral", duration: "142 dias", angle: "Desmistificação / Inimigo Comum", type: "Vídeo 1:30s" },
    { adName: "Por que você está sempre cansado", duration: "85 dias", angle: "Agitação da Dor", type: "Carrossel" }
  ]
};

export default function CompetitorsArenaPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleKillShot = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
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
          1. HEADER TÁTICO & TARGET SELECTOR
      ===================================================================== */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#EF4444]"></div>
            <span className="font-mono text-[9px] text-red-400 uppercase tracking-widest font-bold">
              Pilar 03 • Auditor Corporativo
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-white tracking-wide">
            A <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">Arena</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2 bg-[#0a0a0a] p-2 px-4 rounded-lg border border-white/5 shadow-inner">
            <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Alvo de Espionagem</span>
            <select className="bg-transparent text-[11px] font-mono text-white font-bold outline-none cursor-pointer">
              <option value="dr_lair">{competitorData.name}</option>
              <option value="nutri_x">Nutri Expert (Top 2)</option>
              <option value="gym_y">Gym Pro (Top 3)</option>
            </select>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. PROTOCOLO KILL SHOT (O VEREDITO EXECUTIVO)
      ===================================================================== */}
      <motion.section variants={itemVariants} className="bg-red-950/10 backdrop-blur-xl border border-red-500/30 p-6 md:p-8 rounded-2xl shadow-[inset_0_0_40px_rgba(239,68,68,0.05),_0_20px_50px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-1 h-full bg-red-500 shadow-[0_0_15px_#EF4444]"></div>
        
        <div className="flex flex-col md:flex-row gap-8 justify-between">
          <div className="flex flex-col w-full md:w-1/3">
            <h2 className="text-[10px] text-red-500 uppercase tracking-[0.2em] font-bold flex items-center gap-2 mb-4">
              <Skull size={14} /> Protocolo Kill Shot
            </h2>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-6xl font-mono font-bold text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.3)] tracking-tighter">
                {competitorData.vulnerabilityIndex}%
              </span>
              <span className="text-[9px] text-red-400 uppercase tracking-widest font-bold mb-2">Índice de<br/>Vulnerabilidade</span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono leading-relaxed mt-2">
              Alvo apresenta alta fricção de oferta e brechas severas no *Customer Success*. O CAC do inimigo é insustentável a longo prazo devido ao Churn agressivo.
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold border-b border-red-500/10 pb-1">Ordens de Execução (Bite-Sized)</span>
            
            <div className="bg-[#050505] p-3 rounded-lg border border-red-500/20 flex items-center justify-between group/btn hover:border-red-500/50 transition-colors">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Criar Oferta "Lazy Keto"</span>
                <span className="text-[9px] text-gray-500 font-mono mt-0.5">Atacar a dor do "Esforço" descoberta no Dossiê Hormozi.</span>
              </div>
              <button className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded text-[9px] font-bold uppercase transition-all flex items-center gap-1"><Zap size={10}/> Gerar Copy</button>
            </div>
            
            <div className="bg-[#050505] p-3 rounded-lg border border-red-500/20 flex items-center justify-between group/btn hover:border-red-500/50 transition-colors">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Anúncio Contrariano de Suporte</span>
                <span className="text-[9px] text-gray-500 font-mono mt-0.5">Explorar a reclamação nº1 do Reclame Aqui do concorrente.</span>
              </div>
              <button className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded text-[9px] font-bold uppercase transition-all flex items-center gap-1"><Zap size={10}/> Exportar Roteiro</button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* =====================================================================
          3. O SHADOW FUNNEL & A EQUAÇÃO DE VALOR
      ===================================================================== */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        
        {/* Dimensão 1: The Shadow Funnel */}
        <motion.div variants={itemVariants} className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-[#0a0a0a] flex justify-between items-center">
            <h2 className="text-[10px] text-[#10B981] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Layers size={14} /> The Shadow Funnel (Engenharia Reversa)
            </h2>
            <div className="flex items-center gap-1 text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
              <DollarSign size={10} /> Est AOV: {competitorData.estAOV}
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-black/20 flex flex-col gap-3">
            {competitorData.shadowFunnel.map((step, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-16 flex flex-col items-center justify-center shrink-0">
                  <div className="w-8 h-8 rounded border border-gray-700 bg-black flex items-center justify-center text-[10px] font-bold font-mono text-gray-500 shadow-inner group-hover:border-[#10B981]/50 group-hover:text-[#10B981] transition-colors">
                    S0{i+1}
                  </div>
                  {i !== competitorData.shadowFunnel.length - 1 && <div className="w-px h-6 bg-gradient-to-b from-gray-700 to-transparent my-1"></div>}
                </div>
                
                <div className="flex-1 bg-[#121927] border border-white/5 p-4 rounded-xl flex justify-between items-center hover:border-white/10 transition-colors shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold mb-1">{step.stage}</span>
                    <span className="text-sm font-bold text-white">{step.type}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {step.price && <span className="text-xs font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded border border-white/5">{step.price}</span>}
                    <span className="text-[9px] font-mono text-gray-400">{step.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dimensão 2: Dissecação da Oferta (Hormozi) */}
        <motion.div variants={itemVariants} className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] pointer-events-none"></div>
          <div className="p-6 border-b border-white/5 bg-[#0a0a0a]">
            <h2 className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Crosshair size={14} /> Dissecação de Oferta (Hormozi Equation)
            </h2>
          </div>
          
          <div className="p-6 flex flex-col gap-6 flex-1 bg-black/20">
            {/* Numerador (Crescimento) */}
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
              <div className="bg-[#121927] border border-[#10B981]/20 p-3 rounded-xl shadow-inner flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-[#10B981] uppercase tracking-widest font-bold">Dream Outcome</span>
                  <span className="text-xs font-mono font-bold text-white">{competitorData.hormoziEquation.dreamOutcome.score}/10</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight font-mono">{competitorData.hormoziEquation.dreamOutcome.text}</p>
              </div>
              <div className="bg-[#121927] border border-red-500/20 p-3 rounded-xl shadow-inner flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-red-400 uppercase tracking-widest font-bold">Certeza (Prova)</span>
                  <span className="text-xs font-mono font-bold text-white">{competitorData.hormoziEquation.certainty.score}/10</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight font-mono">{competitorData.hormoziEquation.certainty.text}</p>
              </div>
            </div>

            {/* Divisor Visual da Equação */}
            <div className="flex items-center justify-center -my-3 relative z-10">
              <span className="bg-black border border-white/10 px-3 py-0.5 rounded-full text-xs font-mono text-gray-500 shadow-md">DIVIDIDO POR</span>
            </div>

            {/* Denominador (Fricção) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#121927] border border-[#10B981]/20 p-3 rounded-xl shadow-inner flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-[#10B981] uppercase tracking-widest font-bold">Tempo (Rapidez)</span>
                  <span className="text-xs font-mono font-bold text-white">{competitorData.hormoziEquation.timeDelay.score}/10</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight font-mono">{competitorData.hormoziEquation.timeDelay.text}</p>
              </div>
              <div className="bg-[#121927] border border-red-500/20 p-3 rounded-xl shadow-inner flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-red-400 uppercase tracking-widest font-bold">Esforço (Dor)</span>
                  <span className="text-xs font-mono font-bold text-white">{competitorData.hormoziEquation.effort.score}/10</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight font-mono">{competitorData.hormoziEquation.effort.text}</p>
              </div>
            </div>

            {/* Conclusão */}
            <div className="mt-auto bg-blue-500/5 border border-blue-500/20 p-3 rounded-lg flex items-center gap-3">
              <Activity size={16} className="text-blue-400 shrink-0" />
              <span className="text-[10px] font-mono text-blue-200 leading-relaxed">{competitorData.hormoziEquation.verdict}</span>
            </div>
          </div>
        </motion.div>

      </section>

      {/* =====================================================================
          4. TECH STACK, ADS PROFIT POOLS E CHURN AUDIT
      ===================================================================== */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        
        {/* Dimensão 3: Cyber-Recon (Tech Stack) */}
        <motion.div variants={itemVariants} className="bg-[#050505] border border-white/5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-5">
          <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2 mb-4">
            <MonitorSmartphone size={14} className="text-gray-500" /> Infraestrutura (Tech Stack)
          </h2>
          <div className="flex flex-col gap-2">
            {competitorData.techStack.map((tech, i) => (
              <div key={i} className="flex items-center justify-between bg-[#0a0a0a] p-2.5 rounded border border-white/5">
                <span className="text-[9px] text-gray-500 uppercase font-bold">{tech.category}</span>
                <span className={`text-[10px] font-mono font-bold truncate max-w-[140px] text-right ${tech.name.includes('Missing') ? 'text-red-400' : 'text-white'}`}>{tech.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dimensão 4: Espionagem de Tráfego */}
        <motion.div variants={itemVariants} className="bg-[#050505] border border-white/5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Database size={14} className="text-[#d4af37]" /> Ads Profit Pools
            </h2>
            <span className="text-[8px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded font-mono">Ativos &gt; 30d</span>
          </div>
          <div className="flex flex-col gap-3">
            {competitorData.adsProfitPool.map((ad, i) => (
              <div key={i} className="flex flex-col bg-[#0a0a0a] p-3 rounded-lg border border-white/5 hover:border-[#d4af37]/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-white truncate pr-2">{ad.adName}</span>
                  <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20">{ad.duration}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-gray-400 uppercase font-bold">
                  <span>Ângulo: <span className="text-white">{ad.angle}</span></span>
                  <span className="font-mono">{ad.type}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dimensão 5: Auditoria de Churn */}
        <motion.div variants={itemVariants} className="bg-[#050505] border border-white/5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-orange-500 opacity-50"></div>
          <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2 mb-4">
            <ThumbsDown size={14} className="text-orange-500" /> Auditoria de Churn (Fricção)
          </h2>
          <div className="flex flex-col gap-3">
            {competitorData.churnAudit.map((churn, i) => (
              <div key={i} className="flex flex-col bg-[#0a0a0a] p-3 rounded-lg border border-white/5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{churn.source}</span>
                  <span className="text-[8px] font-mono text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded flex items-center gap-1"><AlertOctagon size={8}/> {churn.severity}</span>
                </div>
                <p className="text-[10px] font-montserrat text-gray-300 italic border-l-2 border-orange-500/30 pl-2">"{churn.complaint}"</p>
              </div>
            ))}
          </div>
        </motion.div>

      </section>

    </motion.div>
  );
}
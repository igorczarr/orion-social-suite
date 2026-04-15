"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Clapperboard, Activity, Zap, FastForward, MonitorPlay, 
  BrainCircuit, ShieldCheck, AlertTriangle, RefreshCw, 
  CheckCircle2, Mic, Clock, Network, X, Play
} from "lucide-react";

// === MOCK DATA: ENGENHARIA DE MÍDIA E NEUROCIÊNCIA ===
const attentionArbitrage = {
  platform: "LinkedIn (Texto Simples)",
  status: "Subfaturado (Ineficiência de Mercado)",
  action: "Pausar Reels técnicos. Converter Episódios 02 e 03 em posts de texto para LinkedIn hoje. Alcance orgânico 300% acima da média móvel.",
  urgency: "Crítico"
};

const neuroMatrix = [
  { name: "Dopamina", role: "Choque / Entretenimento", value: 45, color: "text-orange-500", bg: "bg-orange-500", glow: "shadow-[0_0_15px_#f97316]" },
  { name: "Ocitocina", role: "Vulnerabilidade / Tribo", value: 30, color: "text-purple-500", bg: "bg-purple-500", glow: "shadow-[0_0_15px_#a855f7]" },
  { name: "Serotonina", role: "Status / Autoridade", value: 25, color: "text-blue-500", bg: "bg-blue-500", glow: "shadow-[0_0_15px_#3b82f6]" },
];

const storyTree = [
  { 
    id: 1, ep: "Episódio 01", type: "Dopamina", title: "A mentira que te contaram sobre [Inimigo Comum]", 
    hook: "Se você ainda faz X, o seu negócio está sangrando dinheiro e você nem sabe.", 
    openLoop: "No final, revelo a única métrica que importa (mas não explico como medir).", 
    status: "Gravado", duration: "45s"
  },
  { 
    id: 2, ep: "Episódio 02", type: "Ocitocina", title: "Os bastidores do nosso maior fracasso", 
    hook: "Há 6 meses, quase falimos por focar na métrica errada. Foi assim que viramos o jogo.", 
    openLoop: "Fecho o loop do Ep 01, mas abro um novo: 'O método que criamos exige apenas 15 min/dia'.", 
    status: "Para Gravar", duration: "60s"
  },
  { 
    id: 3, ep: "Episódio 03", type: "Serotonina", title: "O Estudo de Caso (A Prova Irrefutável)", 
    hook: "Como o Cliente Y aplicou os 15 minutos por dia e dobrou o LTV em 4 semanas.", 
    openLoop: "Call to Action suave para o lançamento da próxima semana.", 
    status: "Rascunho IA", duration: "90s"
  },
];

const selfHealingLog = [
  { action: "Script Abortado", reason: "Retenção de 3s no formato 'Talking Head' caiu 40% no nicho B2B.", fix: "Episódio 04 reescrito para formato B-Roll (Visual) com Voiceover." },
  { action: "Gatilho Substituído", reason: "Palavra 'Desconto' gerou baixo CTR no tracking da concorrência.", fix: "Léxico do Episódio 05 alterado para 'Condição de Early Adopter'." }
];

export default function ShowrunnerPage() {
  const [activeTeleprompter, setActiveTeleprompter] = useState<any | null>(null);

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
      className="flex flex-col gap-6 relative"
    >
      {/* =====================================================================
          1. HEADER TÁTICO E BÚSSOLA DE ARBITRAGEM
      ===================================================================== */}
      <header className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_#f97316]"></span>
            <span className="font-mono text-[9px] text-orange-400 uppercase tracking-widest font-bold">
              Pilar 05 • Engenharia de Mídia
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-white tracking-wide">
            O <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">Showrunner</span>
          </h1>
        </div>

        {/* ALERTA DE ARBITRAGEM DE ATENÇÃO */}
        <motion.div variants={itemVariants} className="bg-[#050505] border border-orange-500/30 p-4 rounded-xl flex-1 max-w-2xl shadow-[inset_0_0_20px_rgba(249,115,22,0.05)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 shadow-[0_0_15px_#f97316]"></div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/30 shrink-0">
              <Activity size={18} className="text-orange-500" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Arbitragem de Atenção Real-Time</h3>
                <span className="text-[8px] font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                  {attentionArbitrage.urgency}
                </span>
              </div>
              <p className="text-[10px] font-mono text-gray-400 mt-2 leading-relaxed">
                <strong className="text-white uppercase tracking-widest font-sans">{attentionArbitrage.platform}:</strong> {attentionArbitrage.action}
              </p>
            </div>
          </div>
        </motion.div>
      </header>

      {/* =====================================================================
          2. O GRID PRINCIPAL (Árvore Narrativa vs Neuroquímica)
      ===================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

        {/* COLUNA ESQUERDA (Span 8): A ÁRVORE NARRATIVA (SOAP OPERA) */}
        <div className="xl:col-span-8 flex flex-col">
          <motion.div variants={itemVariants} className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col h-full relative overflow-hidden group hover:border-orange-500/20 transition-colors">
            <div className="absolute right-0 top-0 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <Network size={250} className="text-orange-500" />
            </div>

            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4 relative z-10">
              <h2 className="text-[10px] text-orange-500 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                <Clapperboard size={14} /> A Árvore Narrativa (Soap Opera Sequence)
              </h2>
              <span className="text-[9px] font-mono bg-white/5 text-gray-400 border border-white/10 px-3 py-1 rounded shadow-inner">Efeito Zeigarnik (Open Loops)</span>
            </div>

            {/* Timeline Vertical */}
            <div className="flex-1 relative z-10 space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-orange-500/50 before:via-white/10 before:to-transparent">
              
              {storyTree.map((episode, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group/ep">
                  
                  {/* Ícone Central da Timeline */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#050505] bg-black shadow-[0_0_15px_rgba(249,115,22,0.2)] shrink-0 md:order-1 md:group-odd/ep:-translate-x-1/2 md:group-even/ep:translate-x-1/2 relative z-10">
                    {episode.status === 'Gravado' ? <CheckCircle2 size={16} className="text-green-500" /> : <MonitorPlay size={16} className={episode.status === 'Para Gravar' ? 'text-orange-500' : 'text-gray-500'} />}
                  </div>

                  {/* Cartão do Episódio */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-[#0a0a0a] border border-white/5 p-5 rounded-xl shadow-inner hover:border-orange-500/40 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-transparent opacity-20"></div>
                    
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">{episode.ep}</span>
                      <span className="text-[9px] font-mono text-gray-500 flex items-center gap-1"><Clock size={10}/> {episode.duration}</span>
                    </div>
                    
                    <h3 className="font-abhaya text-xl text-white mb-4 leading-tight">{episode.title}</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-[#121927] p-3 rounded-lg border border-white/5 shadow-inner">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-blue-400 mb-1.5 flex items-center gap-1"><Zap size={10}/> Hook Letal</p>
                        <p className="text-[10px] font-montserrat text-gray-300 italic">"{episode.hook}"</p>
                      </div>
                      
                      <div className="bg-orange-500/5 border border-orange-500/10 p-3 rounded-lg relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-orange-500/10 to-transparent"></div>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-orange-500 mb-1.5 flex items-center gap-1 relative z-10"><FastForward size={10}/> Open Loop (Gatilho para o próximo)</p>
                        <p className="text-[10px] font-mono text-gray-400 leading-relaxed relative z-10">{episode.openLoop}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className={`text-[8px] font-mono uppercase tracking-widest font-bold px-2.5 py-1 rounded border ${episode.status === 'Gravado' ? 'bg-green-500/10 text-green-500 border-green-500/30' : episode.status === 'Para Gravar' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 animate-pulse' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                        {episode.status}
                      </span>
                      
                      <button 
                        onClick={() => setActiveTeleprompter(episode)}
                        className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-black bg-[#d4af37] px-4 py-2 rounded hover:bg-[#ebd074] transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                      >
                        <Mic size={12} /> Teleprompter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* COLUNA DIREITA (Span 4): NEUROQUÍMICA & SELF-HEALING */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Matriz Neuroquímica (Skinner Box) */}
          <motion.div variants={itemVariants} className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                <BrainCircuit size={14} className="text-[#10B981]" /> Matriz Neuroquímica
              </h2>
            </div>
            
            <p className="text-[9px] font-mono text-gray-500 mb-6 leading-relaxed uppercase tracking-widest">
              Balanço algorítmico da linha editorial para evitar fadiga (Skinner Box).
            </p>

            <div className="space-y-5">
              {neuroMatrix.map((neuro, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${neuro.color}`}>{neuro.name}</span>
                      <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">{neuro.role}</span>
                    </div>
                    <span className="font-mono text-white font-bold text-xs">{neuro.value}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: `${neuro.value}%` }} transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }} 
                      className={`h-full ${neuro.bg} ${neuro.glow}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="bg-[#10B981]/5 border border-[#10B981]/20 p-3 rounded-lg flex items-start gap-3 shadow-inner">
                <ShieldCheck size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                <p className="text-[9px] font-mono text-[#10B981] uppercase tracking-widest leading-relaxed">
                  Balanço Saudável. A proporção garante entretenimento (retenção) e autoridade (conversão).
                </p>
              </div>
            </div>
          </motion.div>

          {/* O MOTOR DE AUTOCORREÇÃO (SELF-HEALING) */}
          <motion.div variants={itemVariants} className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col flex-1 shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]">
              <h3 className="font-montserrat text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <RefreshCw size={14} className="text-yellow-500" /> Self-Healing Engine
              </h3>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4 bg-black/20">
              <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-4">
                Ajustes autónomos da IA nas últimas 24h:
              </p>
              
              {selfHealingLog.map((log, i) => (
                <div key={i} className="bg-[#121927] border border-white/5 p-4 rounded-xl shadow-inner flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={12} className="text-yellow-500" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-yellow-500">{log.action}</span>
                  </div>
                  <p className="text-[9px] font-mono text-gray-400 leading-relaxed border-l border-gray-700 pl-2">
                    <span className="text-gray-500 font-bold uppercase tracking-widest block mb-0.5">Motivo Detectado:</span> {log.reason}
                  </p>
                  <p className="text-[10px] font-montserrat text-[#10B981] font-medium leading-relaxed bg-[#10B981]/10 p-2.5 rounded border border-[#10B981]/20 mt-1 shadow-inner">
                    <span className="font-bold uppercase tracking-widest text-[8px] block mb-0.5">Nova Diretriz IA:</span> {log.fix}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      {/* =====================================================================
          3. MÓDULO TELEPROMPTER (MODAL FULLSCREEN DE FOCO)
      ===================================================================== */}
      <AnimatePresence>
        {activeTeleprompter && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[999] bg-[#020202] flex flex-col"
          >
            {/* Teleprompter Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0 bg-[#050505]">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_#ef4444]"></div>
                <div className="flex flex-col">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                    <MonitorPlay size={14} className="text-red-500" /> Modo Gravação (Foco)
                  </h2>
                  <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-1">{activeTeleprompter.ep} • {activeTeleprompter.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTeleprompter(null)} 
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-[10px] font-bold uppercase tracking-widest rounded border border-white/10 transition-colors"
              >
                <X size={14} /> Encerrar Gravação
              </button>
            </div>

            {/* Teleprompter Display */}
            <div className="flex-1 flex flex-col items-center justify-center p-12 overflow-hidden relative">
              <div className="absolute top-1/2 left-8 -translate-y-1/2 w-1 h-32 bg-gradient-to-b from-transparent via-[#d4af37] to-transparent opacity-30"></div>
              <div className="absolute top-1/2 right-8 -translate-y-1/2 w-1 h-32 bg-gradient-to-b from-transparent via-[#d4af37] to-transparent opacity-30"></div>
              
              <motion.div 
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="max-w-5xl w-full text-center space-y-12"
              >
                {/* Hook */}
                <p className="font-abhaya text-4xl md:text-6xl text-white leading-tight font-bold drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  "{activeTeleprompter.hook}"
                </p>
                {/* Script Body (Placeholder) */}
                <p className="font-montserrat text-xl md:text-2xl text-gray-400 leading-relaxed font-light px-10">
                  [O motor de IA injetaria aqui o corpo do roteiro. Pausas dramáticas estariam marcadas a vermelho. Ênfases vocais em negrito. A leitura deve ser fluída e autoritária.]
                </p>
                {/* Open Loop */}
                <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 p-8 rounded-2xl inline-block max-w-3xl shadow-[0_0_30px_rgba(212,175,55,0.05)]">
                  <span className="text-[10px] text-[#d4af37] uppercase tracking-[0.3em] font-bold block mb-4">Gatilho Zeigarnik (Leia com Mistério)</span>
                  <p className="font-abhaya text-3xl md:text-5xl text-[#d4af37] leading-tight font-bold">
                    "{activeTeleprompter.openLoop}"
                  </p>
                </div>
              </motion.div>
            </div>
            
            {/* Teleprompter Footer Controls */}
            <div className="p-6 border-t border-white/10 shrink-0 bg-[#050505] flex justify-center items-center gap-6">
               <button className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all hover:scale-105 shadow-lg"><Play size={24} className="ml-1" /></button>
               <button className="px-6 py-3 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#d4af37] hover:text-black transition-colors">Speed 1.2x</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
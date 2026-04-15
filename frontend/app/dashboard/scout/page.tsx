"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { 
  Radar, Fingerprint, Activity, Database, Crosshair, 
  MessageSquare, Youtube, Twitter, Instagram, BrainCircuit,
  AlertTriangle, ShieldAlert, Sliders, PlayCircle, Target
} from "lucide-react";

// === MOCK DATA: DOSSIÊ FBI & SOCIAL LISTENING ===
const fbiProfile = {
  archetype: "O Executor Exausto",
  consciousness: "Solução Consciente (Nível 4)",
  coreFear: "Ser engolido pelo mercado por não dominar IA e automação.",
  coreDesire: "Escala sem gargalos operacionais (Lucro sem caos).",
  lexicon: ["Custo de Oportunidade", "Gargalo", "LTV", "Churn", "CAC", "Delegar", "SOPs"]
};

const pulse24h = {
  scraped: 542,
  sentiment: { pos: 15, neu: 25, neg: 60 }, // Negativo alto = Dor de mercado = Oportunidade
  trendingTopics: ["#OpenAI", "Colapso do Tráfego Orgânico", "Taxa de Juros", "Burnout"],
  primaryEmotion: "Ansiedade Operacional"
};

const authorityMatrix = [
  { name: "Alex Hormozi", platform: "YouTube / X", influence: "Absoluta (Estratégia/Oferta)", bias: "Lógica / Hard Truths" },
  { name: "Naval Ravikant", platform: "Podcast / X", influence: "Alta (Mindset/Wealth)", bias: "Filosofia / Long-term" },
  { name: "Russell Brunson", platform: "Instagram", influence: "Média (Funis)", bias: "Marketing de Resposta Direta" }
];

const viralVault = [
  { title: "The TRUTH About Building a $100M Business...", views: "2.4M", platform: "YouTube", hook: "Desmistificação de esforço vs alavancagem." },
  { title: "Stop doing this if you want to scale.", views: "850K", platform: "TikTok", hook: "Ataque direto à micro-gestão (Delegação)." },
  { title: "My exact funnel that generated $1M in 30 days.", views: "1.2M", platform: "YouTube", hook: "Prova social + Step-by-step framework." }
];

export default function ScoutPersonaPage() {
  const [isScanning, setIsScanning] = useState(false);

  const triggerDeepScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
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
          1. HEADER TÁTICO & MOTOR DE SCANNING
      ===================================================================== */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]"></div>
            <span className="font-mono text-[9px] text-blue-400 uppercase tracking-widest font-bold">
              Inteligência de Sombra & Psicanálise
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-white tracking-wide">
            Scout & <span className="text-gray-500">Persona</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-[#0a0a0a] border border-white/5 px-4 py-2 rounded-lg shadow-inner">
            <Database size={14} className="text-gray-500" />
            <div className="flex flex-col">
              <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Data Lake Atual</span>
              <span className="text-[11px] font-mono text-white font-bold">5,000+ Interações</span>
            </div>
          </div>
          
          <button 
            onClick={triggerDeepScan}
            disabled={isScanning}
            className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] disabled:opacity-50"
          >
            {isScanning ? (
              <><Activity size={14} className="animate-spin" /> Mapeando Deep Web...</>
            ) : (
              <><Radar size={14} /> Forçar Deep Scan (24h)</>
            )}
          </button>
        </div>
      </header>

      {/* =====================================================================
          2. O DOSSIÊ FBI & RADAR DE PULSO (24H)
      ===================================================================== */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* The Shadow Profile (FBI Dossier) */}
        <motion.div variants={itemVariants} className="xl:col-span-7 bg-[#050505]/90 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden group hover:border-blue-500/20 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_15px_#3b82f6] opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4 pl-3">
            <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Fingerprint size={14} className="text-blue-500" /> Dossiê de Sombra (Perfil Psicológico)
            </h2>
            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest flex items-center gap-1"><ShieldAlert size={10}/> Confidencial</span>
          </div>

          <div className="flex flex-col gap-5 pl-3">
            <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
              <div className="w-14 h-14 rounded-full bg-[#121927] flex items-center justify-center border border-white/10 shrink-0">
                <Crosshair size={24} className="text-gray-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Arquétipo Dominante</span>
                <span className="font-abhaya text-2xl text-white font-bold tracking-wide">{fbiProfile.archetype}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-red-400 uppercase tracking-widest font-bold flex items-center gap-1.5"><AlertTriangle size={10}/> Medo Núcleo (Core Fear)</span>
                <p className="text-xs text-gray-300 font-montserrat leading-relaxed bg-[#121927] p-3 rounded-lg border border-white/5">"{fbiProfile.coreFear}"</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-[#10B981] uppercase tracking-widest font-bold flex items-center gap-1.5"><Target size={10}/> Desejo Núcleo (Core Desire)</span>
                <p className="text-xs text-gray-300 font-montserrat leading-relaxed bg-[#121927] p-3 rounded-lg border border-white/5">"{fbiProfile.coreDesire}"</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[9px] text-blue-400 uppercase tracking-widest font-bold">Mapa Lexical (O Código da Tribo)</span>
              <div className="flex flex-wrap gap-2">
                {fbiProfile.lexicon.map((word, i) => (
                  <span key={i} className="text-[10px] font-mono text-gray-300 bg-black border border-gray-800 px-2 py-1 rounded shadow-sm hover:border-blue-500/50 transition-colors cursor-default">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 24H Pulse Radar */}
        <motion.div variants={itemVariants} className="xl:col-span-5 bg-[#050505]/90 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden group">
          
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Activity size={14} className="text-red-500" /> Monitor de Pulso (Últimas 24h)
            </h2>
            <span className="text-[9px] font-mono text-gray-500">{pulse24h.scraped} Amostras</span>
          </div>

          <div className="flex flex-col gap-6 flex-1">
            <div className="flex flex-col items-center justify-center bg-black/40 py-4 rounded-xl border border-white/5 shadow-inner">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">Emoção Predominante (Hoje)</span>
              <span className="text-xl font-mono text-red-400 font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">{pulse24h.primaryEmotion}</span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold text-gray-500 mb-1">
                <span className="text-[#10B981]">Positivo ({pulse24h.sentiment.pos}%)</span>
                <span className="text-gray-500">Neutro ({pulse24h.sentiment.neu}%)</span>
                <span className="text-red-500">Dor ({pulse24h.sentiment.neg}%)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-900 rounded-full flex overflow-hidden shadow-inner">
                <div className="h-full bg-[#10B981]" style={{ width: `${pulse24h.sentiment.pos}%` }}></div>
                <div className="h-full bg-gray-600" style={{ width: `${pulse24h.sentiment.neu}%` }}></div>
                <div className="h-full bg-red-500 shadow-[0_0_10px_#EF4444]" style={{ width: `${pulse24h.sentiment.neg}%` }}></div>
              </div>
              <p className="text-[8px] font-mono text-gray-500 mt-1 text-center">Volume de "Dor" alto indica alta propensão à conversão se a oferta for agressiva hoje.</p>
            </div>

            <div className="mt-auto">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block mb-2">Trending Topics da Persona</span>
              <div className="flex flex-col gap-1.5">
                {pulse24h.trendingTopics.map((topic, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white bg-[#121927] px-3 py-2 rounded border border-white/5">
                    <span className="text-blue-500 font-mono font-bold">#{i+1}</span> {topic}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </section>

      {/* =====================================================================
          3. MATRIZ DE AUTORIDADE E VAULT DE VÍDEOS
      ===================================================================== */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        
        {/* Authority Matrix */}
        <motion.div variants={itemVariants} className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between">
            <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <BrainCircuit size={14} className="text-[#d4af37]" /> Mapa de Autoridades (Influência)
            </h2>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-black/20">
            <div className="flex flex-col gap-3">
              {authorityMatrix.map((auth, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#121927] border border-white/5 rounded-xl hover:border-[#d4af37]/30 transition-colors group">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white group-hover:text-[#d4af37] transition-colors">{auth.name}</span>
                    <span className="text-[9px] text-gray-500 font-mono uppercase mt-1 flex items-center gap-1.5">
                      {auth.platform.includes('YouTube') ? <Youtube size={10}/> : <Twitter size={10}/>} {auth.platform}
                    </span>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Viés de Consumo: <span className="text-white">{auth.bias}</span></span>
                    <span className="text-[9px] font-mono text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/20 px-2 py-0.5 rounded mt-1">Impacto: {auth.influence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Viral Content Vault */}
        <motion.div variants={itemVariants} className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between">
            <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <PlayCircle size={14} className="text-red-500" /> Cofre de Virais (Modelagem)
            </h2>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-black/20">
            <div className="flex flex-col gap-3">
              {viralVault.map((video, i) => (
                <div key={i} className="flex flex-col gap-2 p-4 bg-[#121927] border border-white/5 rounded-xl hover:border-red-500/30 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white pr-4 leading-relaxed group-hover:text-red-400 transition-colors">{video.title}</span>
                    <span className="text-[10px] font-mono font-bold text-white bg-black px-2 py-1 rounded border border-gray-700 shrink-0">{video.views}</span>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-[9px] text-gray-400 font-mono flex items-center gap-1">
                      {video.platform === 'YouTube' ? <Youtube size={10} className="text-red-500"/> : <Instagram size={10} className="text-pink-500"/>} {video.platform}
                    </span>
                    <span className="text-[8px] uppercase font-bold tracking-widest text-gray-500">Gancho (Hook): <span className="text-gray-300 normal-case">{video.hook}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </section>

      {/* =====================================================================
          4. BRAND VOICE CALIBRATOR (Controlo Paramétrico da IA)
      ===================================================================== */}
      <motion.section variants={itemVariants} className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col p-6">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
            <Sliders size={14} className="text-white" /> Calibrador de Tom de Voz (Prompt Engineering)
          </h2>
          <span className="text-[8px] text-[#10B981] font-mono uppercase bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30 animate-pulse">Sincronizado com API Gemini</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
          {/* Slider 1 */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-gray-400">
              <span>Académico</span><span>Agressivo (Rua)</span>
            </div>
            <input type="range" min="0" max="100" defaultValue="80" className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white" />
            <span className="text-[8px] font-mono text-gray-500 text-center">Foco em linguagem de impacto e quebra de padrão.</span>
          </div>

          {/* Slider 2 */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-gray-400">
              <span>Acolhedor</span><span>Polarizador</span>
            </div>
            <input type="range" min="0" max="100" defaultValue="90" className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white" />
            <span className="text-[8px] font-mono text-gray-500 text-center">Disposto a irritar a base para criar defensores fanáticos.</span>
          </div>

          {/* Slider 3 */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-gray-400">
              <span>Teórico / Visão</span><span>Tático / Passo-a-Passo</span>
            </div>
            <input type="range" min="0" max="100" defaultValue="40" className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white" />
            <span className="text-[8px] font-mono text-gray-500 text-center">Vende o "Porquê" e o "O Quê", oculta o "Como".</span>
          </div>
        </div>
      </motion.section>

    </motion.div>
  );
}
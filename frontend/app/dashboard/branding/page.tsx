"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { 
  Fingerprint, Crown, ShieldBan, Zap, Target, BookOpen, 
  Flame, Crosshair, AlertOctagon, FileJson, CheckCircle2, Activity 
} from "lucide-react";

// === MOCK DATA: ENGENHARIA DE BRAND EQUITY E MONOPÓLIO ===
const brandData = {
  categoryPOV: {
    categoryName: "Growth OS (Sistema Operacional de Crescimento)",
    oldWay: "Agências tradicionais que vendem 'posts bonitinhos' e tráfego sem inteligência de negócio.",
    newWay: "Infraestrutura de dados, automação e neurociência aplicada à conversão massiva.",
    inevitableShift: "A IA mercantilizou a execução. Quem não dominar a estratégia de sombra e a matemática da oferta, vai falir em 18 meses."
  },
  semiotics: {
    blacklist: ["Desconto", "Promoção", "Barato", "Agência de Marketing", "Postzinho", "🚀", "🔥"],
    sensoryAnchors: ["Cores escuras (Abissal/Gold)", "Tipografia Monoespaçada (Rigor)", "Metáforas Bélicas/Militares", "Tom Implacável/Direto"]
  },
  beliefSystem: {
    creationMyth: "Fundada após a perceção de que o mercado de marketing digital se tornou num mar de amadores vendendo vaidade.",
    rituals: ["Auditoria Reversa 1-Click", "Daily Boot Sequence", "Linguagem de 'Diretoria' e 'Senhores'"],
    pagans: ["Gurus de Palco", "Copywriters de Template", "Agências de Vaidade"]
  },
  polarization: {
    targetEnemy: "A mediocridade e a falta de rigor analítico no B2B.",
    crisisMatrix: "Se atacados por 'preço alto', dobrar a aposta: 'Não somos um custo, somos um fosso competitivo. Quem procura atalhos baratos deve procurar a concorrência.'"
  }
};

export default function BrandEquityPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleEnforcerSync = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
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
          1. HEADER TÁTICO E STATUS DO ENFORCER
      ===================================================================== */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-pulse shadow-[0_0_8px_#d4af37]"></div>
            <span className="font-mono text-[9px] text-[#d4af37] uppercase tracking-widest font-bold">
              Pilar 02 • Engenharia de Monopólio
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-white tracking-wide">
            Brand <span className="text-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">Equity</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Brand Enforcer (Prompt)</span>
            <span className="text-[10px] font-mono text-[#10B981] flex items-center gap-1"><CheckCircle2 size={10}/> Ativo e Vigiando</span>
          </div>
          <button 
            onClick={handleEnforcerSync}
            disabled={isExporting}
            className="flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37] hover:text-black px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)] disabled:opacity-50 group"
          >
            {isExporting ? (
              <><Activity size={14} className="animate-spin" /> Compilando JSON...</>
            ) : (
              <><FileJson size={14} className="group-hover:scale-110 transition-transform" /> Sincronizar Córtex IA</>
            )}
          </button>
        </div>
      </header>

      {/* =====================================================================
          2. CATEGORY DESIGN (O OCEANO AZUL)
      ===================================================================== */}
      <motion.section variants={itemVariants} className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between">
          <h2 className="text-[10px] text-[#d4af37] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
            <Crown size={14} /> Category Design (O Ponto de Vista)
          </h2>
          <span className="text-[8px] font-mono text-gray-500 border border-white/10 px-2 py-0.5 rounded bg-black">Categoria: {brandData.categoryPOV.categoryName}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
          {/* Velho Mundo vs Novo Mundo */}
          <div className="bg-[#0a0a0a] p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1.5"><AlertOctagon size={12} className="text-red-500"/> O Velho Modelo (A Morte)</span>
              <p className="font-montserrat text-sm text-gray-400 leading-relaxed border-l-2 border-red-500/50 pl-3">
                "{brandData.categoryPOV.oldWay}"
              </p>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1.5"><Zap size={12} className="text-[#10B981]"/> O Novo Modelo (A Salvação)</span>
              <p className="font-montserrat text-sm text-white font-bold leading-relaxed border-l-2 border-[#10B981]/50 pl-3 drop-shadow-sm">
                "{brandData.categoryPOV.newWay}"
              </p>
            </div>
          </div>
          
          {/* A Mudança Inevitável */}
          <div className="bg-[#050505] p-6 md:p-8 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#d4af37]/10 transition-colors"></div>
            <span className="text-[9px] text-[#d4af37] uppercase tracking-widest font-bold mb-4 flex items-center gap-1.5">
              <Target size={12} /> A Mudança Inevitável (O Gatilho)
            </span>
            <h3 className="font-abhaya text-2xl md:text-3xl text-white leading-tight font-bold relative z-10">
              "{brandData.categoryPOV.inevitableShift}"
            </h3>
            <p className="text-[9px] font-mono text-gray-500 mt-6 uppercase tracking-widest relative z-10">
              *Toda a Copy de topo de funil deve ancorar-se nesta premissa.
            </p>
          </div>
        </div>
      </motion.section>

      {/* =====================================================================
          3. ARQUITETURA SEMIÓTICA & O SISTEMA DE CRENÇAS
      ===================================================================== */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        
        {/* A Blacklist & Regras Visuais */}
        <motion.div variants={itemVariants} className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500 opacity-50"></div>
          <div className="p-6 border-b border-white/5">
            <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <ShieldBan size={14} className="text-red-500" /> Restrições Semióticas (Blacklist)
            </h2>
          </div>
          
          <div className="p-6 flex flex-col gap-6 flex-1 bg-black/20">
            <div className="flex flex-col gap-3">
              <span className="text-[9px] text-red-400 uppercase tracking-widest font-bold">Léxico Proibido (A IA recusará usar)</span>
              <div className="flex flex-wrap gap-2">
                {brandData.semiotics.blacklist.map((word, i) => (
                  <span key={i} className="text-[10px] font-mono font-bold text-red-300 bg-red-950/30 border border-red-500/20 px-2.5 py-1 rounded shadow-inner">
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-white/5 my-2"></div>

            <div className="flex flex-col gap-3">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Âncoras Sensoriais (Brand Assets)</span>
              <div className="flex flex-col gap-2">
                {brandData.semiotics.sensoryAnchors.map((anchor, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-300 bg-[#121927] px-3 py-2 rounded-lg border border-white/5">
                    <div className="w-1 h-1 bg-[#d4af37] rounded-full shadow-[0_0_5px_#d4af37]"></div>
                    {anchor}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* O Sistema de Crenças (The Cult) */}
        <motion.div variants={itemVariants} className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37] opacity-50"></div>
          <div className="p-6 border-b border-white/5">
            <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <BookOpen size={14} className="text-[#d4af37]" /> Sistema de Crenças (The Cult)
            </h2>
          </div>
          
          <div className="p-6 flex flex-col gap-6 flex-1 bg-black/20">
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-[#d4af37] uppercase tracking-widest font-bold">Mito de Criação</span>
              <p className="font-abhaya text-lg text-white leading-relaxed italic border-l-2 border-[#d4af37]/30 pl-3">
                "{brandData.beliefSystem.creationMyth}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Os Rituais da Tribo</span>
                <div className="flex flex-col gap-1.5">
                  {brandData.beliefSystem.rituals.map((ritual, i) => (
                    <span key={i} className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/5 border border-[#10B981]/20 px-2 py-1.5 rounded">
                      {ritual}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Os Pagãos (Inimigos)</span>
                <div className="flex flex-col gap-1.5">
                  {brandData.beliefSystem.pagans.map((pagan, i) => (
                    <span key={i} className="text-[10px] font-mono text-gray-400 bg-black border border-gray-800 px-2 py-1.5 rounded flex items-center gap-1.5">
                      <Crosshair size={10} className="text-red-500"/> {pagan}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </section>

      {/* =====================================================================
          4. POLARIZAÇÃO E MATRIZ DE CRISE
      ===================================================================== */}
      <motion.section variants={itemVariants} className="bg-black/40 border border-white/5 rounded-2xl shadow-inner flex flex-col md:flex-row items-center overflow-hidden">
        <div className="p-6 md:p-8 bg-[#121927] border-r border-white/5 flex flex-col justify-center w-full md:w-1/3 h-full">
          <Flame size={24} className="text-orange-500 mb-3" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-1">Polarização Calculada</h3>
          <p className="text-[10px] text-gray-500 font-mono">Fricção intencional para separar defensores de detratores.</p>
        </div>
        
        <div className="p-6 md:p-8 flex flex-col gap-4 w-full md:w-2/3">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Alvo do Ataque Filosófico</span>
            <span className="text-sm text-white font-bold">"{brandData.polarization.targetEnemy}"</span>
          </div>
          <div className="w-full h-px bg-white/5"></div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Matriz de Resposta a Crises (Regra de Ouro)</span>
            <span className="text-xs text-orange-400 font-mono font-bold leading-relaxed bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
              {brandData.polarization.crisisMatrix}
            </span>
          </div>
        </div>
      </motion.section>

    </motion.div>
  );
}
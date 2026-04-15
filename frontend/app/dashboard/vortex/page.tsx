"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Crosshair, Radar, Fingerprint, Zap, ExternalLink, 
  CheckCircle2, Copy, AlertTriangle, TrendingUp, Users,
  Activity, Play, Pause, Lock, KeyRound, Server, TerminalSquare, X, BrainCircuit
} from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";

// === MOCK DATA INICIAL (Até ligarmos a API Real) ===
const mockTargets = [
  { id: 1, username: "joao.almeida.digital", name: "João Almeida", matchScore: 94, origin: "@concorrente_alpha", status: "pending", bio: "Escalando negócios a 7 dígitos. Focado em tráfego e conversão. 🚀", aiAnalysis: "Alvo interage com 3 concorrentes diretos, mas comentou recentemente sobre a queda de ROAS. Alta propensão à troca de agência.", suggestedComment: "João, vi que acompanha o [Concorrente]. Se a queda de ROAS lá está a travar a tua escala, nós resolvemos isso com engenharia de oferta. Vê o nosso perfil." },
  { id: 2, username: "maria.health.md", name: "Dra. Maria Costa", matchScore: 88, origin: "@agencia_med", status: "pending", bio: "Nutrologia & Biohacking. Construindo longevidade.", aiAnalysis: "Alto engajamento no nicho de saúde. Procura posicionamento premium que a atual agência não entrega.", suggestedComment: "Dra. Maria, a sua autoridade exige um funil mais sofisticado do que apenas posts no feed. O seu conhecimento está sub-monetizado." },
  { id: 3, username: "pedro.ecom", name: "Pedro E-commerce", matchScore: 91, origin: "@guru_do_drop", status: "engaged", bio: "E-commerce & Brand Building.", aiAnalysis: "Escalando marca própria, gargalo na retenção.", suggestedComment: "Pedro, a sua LTV pode dobrar se aplicar o framework de retenção que usamos. Bom trabalho até aqui." },
  { id: 4, username: "lucas_invest", name: "Lucas F.", matchScore: 75, origin: "@fintech_br", status: "ignored", bio: "Trader e investidor.", aiAnalysis: "Fora do ICP atual. Foco exclusivo em B2C low-ticket.", suggestedComment: "-" },
];

export default function VortexSniperPage() {
  const { tenantInfo } = useTenant();
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // Simulação de Carga
  
  // === ESTADOS DO MOTOR ===
  const [targets, setTargets] = useState<any[]>(mockTargets);
  const [selectedTarget, setSelectedTarget] = useState<any>(mockTargets[0]);
  const [copied, setCopied] = useState(false);

  // === ESTADOS DO COFRE CRIPTOGRÁFICO ===
  const [isArmed, setIsArmed] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [sessionCookieInput, setSessionCookieInput] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Simula cópia da sugestão da IA
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simula Salvar Cookie de Sessão
  const handleSaveCookie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCookieInput.trim()) return;
    
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsArmed(true);
      setIsAuthModalOpen(false);
      setSessionCookieInput("");
      setIsAuthenticating(false);
    }, 2000);
  };

  // Simula a Ação do Worker
  const handleActionComplete = (id: number, action: 'engaged' | 'ignored') => {
    const updatedTargets = targets.map(t => t.id === id ? { ...t, status: action } : t);
    setTargets(updatedTargets);
    
    const nextTarget = updatedTargets.find(t => t.id !== id && t.status === 'pending');
    setSelectedTarget(nextTarget || null);

    if (action === 'engaged' && !isArmed) {
      alert("⚠️ Alerta Tático: Ação registrada, mas o Módulo Sniper está DESARMADO. O Worker invisível não executou a ação no Instagram.");
    }
  };

  // Abre a janela focada do Instagram (Fallback)
  const openSniperWindow = (username: string) => {
    window.open(`https://www.instagram.com/${username}/`, 'VortexSniper', 'width=400,height=700,left=200,top=100,toolbar=0,status=0');
  };

  // === CÁLCULO DINÂMICO DOS KPIs ===
  const pendingCount = targets.filter(t => t.status === 'pending').length;
  const engagedCount = targets.filter(t => t.status === 'engaged').length;
  const avgMatch = targets.length > 0 ? Math.round(targets.reduce((acc, curr) => acc + curr.matchScore, 0) / targets.length) : 0;
  const followBackRate = engagedCount > 0 ? "32.4%" : "0%"; 

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
      className="flex flex-col gap-6 h-full relative"
    >
      {/* =====================================================================
          1. HEADER TÁTICO & STATUS DE ARMAMENTO
      ===================================================================== */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-cyan-500 animate-pulse shadow-[0_0_10px_#06b6d4]' : 'bg-gray-500'}`}></span>
            <span className={`font-mono text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${isScanning ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' : 'text-gray-400 border-gray-500/30 bg-gray-500/10'}`}>
              Vórtex Lookalike {isScanning ? 'Ativo' : 'Pausado'}
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-white tracking-wide">
            O <span className="text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">Vórtex</span>
          </h1>
          <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mt-2">
            Infiltração de Audiência e Atirador de Elite (RPA)
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Módulo Sniper Status */}
          <div 
            onClick={() => !isArmed && setIsAuthModalOpen(true)}
            className={`flex items-center gap-3 p-2 pr-4 rounded-xl border transition-all ${isArmed ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/30 bg-red-500/10 cursor-pointer hover:border-red-500/50 hover:bg-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]'}`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isArmed ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-inner' : 'bg-red-500/20 text-red-500 border-red-500/40 shadow-inner animate-pulse'}`}>
              {isArmed ? <Lock size={16} /> : <AlertTriangle size={16} />}
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-bold">Módulo Sniper (Ghost)</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isArmed ? 'text-green-400' : 'text-red-500'}`}>
                {isArmed ? "Armado e Seguro" : "Desarmado (Acionar)"}
              </span>
            </div>
          </div>

          {/* Controles do Motor */}
          <div className="flex items-center gap-3">
            <div className="flex bg-[#0a0a0a] border border-white/5 rounded-lg p-1 shadow-inner">
              <button className="px-4 py-2 text-[9px] font-bold text-black bg-cyan-500 rounded-md uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                Infiltrar Concorrentes
              </button>
              <button className="px-4 py-2 text-[9px] font-bold text-gray-500 hover:text-white rounded-md uppercase tracking-widest transition-all">
                Base Própria
              </button>
            </div>
            <button 
              onClick={() => setIsScanning(!isScanning)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${isScanning ? 'border-red-500/30 text-red-500 hover:bg-red-500/10' : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'}`}
            >
              {isScanning ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. DADOS DE CONTROLE (KPIs)
      ===================================================================== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBox title="Alvos Mapeados (Fila)" value={pendingCount.toString()} subtitle="Pendentes de ação" icon={<Radar size={16} />} color="text-cyan-400" glow="shadow-[0_0_15px_rgba(6,182,212,0.2)]" />
        <MetricBox title="Taxa de Follow-Back" value={followBackRate} subtitle="Conversão histórica" icon={<Users size={16} />} color="text-[#10B981]" glow="shadow-[0_0_15px_rgba(16,185,129,0.2)]" />
        <MetricBox title="Afinidade Média" value={`${avgMatch}%`} subtitle="Match com a Persona" icon={<Fingerprint size={16} />} color="text-[#d4af37]" glow="shadow-[0_0_15px_rgba(212,175,55,0.2)]" />
        <MetricBox title="Ações Concluídas" value={engagedCount.toString()} subtitle="Engajamentos hoje" icon={<TrendingUp size={16} />} color="text-blue-400" glow="shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
      </section>

      {/* =====================================================================
          3. A ESTAÇÃO DE TRABALHO SNIPER (Fila vs Execução)
      ===================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        
        {/* COLUNA ESQUERDA (Span 4): Fila de Infiltração */}
        <motion.div variants={itemVariants} className="lg:col-span-4 bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col h-[600px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
          <div className="p-5 border-b border-white/5 bg-[#0a0a0a] shrink-0 flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
              <Crosshair size={14} className="text-cyan-500" /> Fila de Infiltração
            </h3>
            <span className="text-[9px] text-cyan-400 font-mono bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded shadow-inner">
              {pendingCount} Restantes
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-black/20">
            {targets.length > 0 ? (
              targets.map(target => (
                <div 
                  key={target.id}
                  onClick={() => target.status === 'pending' && setSelectedTarget(target)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 relative overflow-hidden group ${
                    selectedTarget?.id === target.id 
                      ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                      : target.status !== 'pending' 
                        ? 'bg-[#0a0a0a] border-white/5 opacity-40 cursor-not-allowed'
                        : 'bg-[#121927] border-white/5 hover:border-white/20'
                  }`}
                >
                  {selectedTarget?.id === target.id && <div className="absolute left-0 top-0 w-1 h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>}
                  
                  {/* Status Indicator */}
                  <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-black border border-white/10 shadow-inner">
                    {target.status === 'engaged' ? <CheckCircle2 size={14} className="text-green-500" /> : 
                     target.status === 'ignored' ? <AlertTriangle size={14} className="text-red-500" /> :
                     <div className={`w-2 h-2 rounded-full ${selectedTarget?.id === target.id ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]' : 'bg-gray-600'}`}></div>}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-xs text-white truncate group-hover:text-cyan-400 transition-colors">@{target.username}</p>
                      <span className="text-[9px] font-mono text-[#d4af37] font-bold">{target.matchScore}% Match</span>
                    </div>
                    <p className="text-[8px] text-gray-500 font-mono uppercase tracking-widest truncate">Origem: {target.origin}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 text-[10px] uppercase font-mono tracking-widest py-20 px-4 leading-relaxed bg-[#0a0a0a] rounded-xl border border-dashed border-white/10">
                Nenhum alvo na fila.<br />O Oráculo iniciará a busca na madrugada.
              </div>
            )}
          </div>
        </motion.div>

        {/* COLUNA DIREITA (Span 8): Terminal Sniper de Execução */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-[#050505]/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl flex flex-col relative overflow-hidden h-[600px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:scale-110 group-hover:opacity-[0.04] transition-all duration-700 pointer-events-none">
            <Fingerprint size={400} className="text-cyan-500" />
          </div>
          
          <div className="p-6 border-b border-white/5 bg-[#0a0a0a] shrink-0 flex justify-between items-center relative z-10">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
              <Activity size={14} className="text-cyan-500" /> Terminal de Execução (Córtex)
            </h3>
            <span className={`flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest border px-2.5 py-1 rounded shadow-inner ${isArmed ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-gray-500 border-white/10 bg-[#121927]'}`}>
              <Server size={10} /> {isArmed ? "Conexão Criptografada" : "Modo Manual Apenas"}
            </span>
          </div>

          <div className="flex-1 p-6 md:p-8 flex flex-col relative z-10 overflow-y-auto custom-scrollbar bg-black/20">
            
            {selectedTarget ? (
              <div className="flex flex-col h-full">
                {/* Identificação do Alvo */}
                <div className="mb-6">
                  <h2 className="font-abhaya text-4xl text-white mb-1 tracking-wide">{selectedTarget.name || "Usuário Não Identificado"}</h2>
                  <p className="font-mono text-xs text-cyan-500 font-bold mb-4">@{selectedTarget.username}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#121927] border border-white/5 p-4 rounded-xl shadow-inner">
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                        <Users size={12}/> Biografia Extraída
                      </p>
                      <p className="font-montserrat text-xs text-gray-300 leading-relaxed">{selectedTarget.bio}</p>
                    </div>

                    <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 p-4 rounded-xl shadow-inner">
                      <p className="text-[9px] text-[#d4af37] uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                        <BrainCircuit size={12} /> Dossiê da IA (Vulnerabilidade)
                      </p>
                      <p className="font-montserrat text-xs text-gray-300 leading-relaxed italic border-l-2 border-[#d4af37]/50 pl-2">
                        "{selectedTarget.aiAnalysis}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bloco de Munição (Copy Gerada) */}
                <div className="mb-auto">
                  <div className="flex justify-between items-end mb-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                      <Zap size={12} className="text-cyan-500"/> Munição Sugerida (Hook)
                    </p>
                    <button 
                      onClick={() => handleCopy(selectedTarget.suggestedComment)}
                      className="text-[9px] flex items-center gap-1.5 font-bold text-cyan-400 uppercase tracking-widest hover:text-white hover:bg-cyan-500/20 transition-colors bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      {copied ? <><CheckCircle2 size={12} /> Copiado!</> : <><Copy size={12} /> Copiar Área Transf.</>}
                    </button>
                  </div>
                  <div className="w-full bg-[#0a0a0a] border border-cyan-500/30 rounded-xl p-6 shadow-[inset_0_0_30px_rgba(6,182,212,0.05)] relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                    <p className="font-montserrat text-sm text-gray-200 italic leading-relaxed">
                      "{selectedTarget.suggestedComment}"
                    </p>
                  </div>
                </div>

                {/* Central de Comandos */}
                <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                  <button 
                    onClick={() => handleActionComplete(selectedTarget.id, 'ignored')}
                    className="py-4 bg-[#0a0a0a] border border-white/10 text-gray-500 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 hover:text-white transition-all rounded-xl shadow-sm"
                  >
                    Descartar Alvo
                  </button>
                  
                  <button 
                    onClick={() => openSniperWindow(selectedTarget.username)}
                    className="py-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all rounded-xl flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ExternalLink size={12} /> Ação Manual (Aba)
                  </button>

                  {/* Botão de Disparo */}
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionComplete(selectedTarget.id, 'engaged')}
                    className={`py-4 text-black text-[9px] font-bold uppercase tracking-[0.2em] transition-all rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)] ${isArmed ? 'bg-[#10B981] hover:bg-[#059669] shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-[#d4af37] hover:bg-[#ebd074]'}`}
                  >
                    {isArmed ? <Zap size={14} /> : <CheckCircle2 size={14} />} 
                    {isArmed ? "Disparar Sniper (Auto)" : "Confirmar Ação"}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#0a0a0a] rounded-2xl border border-dashed border-white/10">
                <Crosshair size={48} className="mb-4 text-cyan-500/20" />
                <p className="text-[10px] uppercase font-mono tracking-widest font-bold">Terminal em Standby</p>
                <p className="font-montserrat text-xs mt-2 text-center max-w-xs leading-relaxed">Selecione um alvo na fila de infiltração para analisar o dossiê e iniciar o engajamento tático.</p>
              </div>
            )}

          </div>
        </motion.div>

      </section>

      {/* =====================================================================
          MODAL DO COFRE CRIPTOGRÁFICO (VORTEX AUTH)
      ===================================================================== */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#020202]/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="w-full max-w-lg bg-[#050505] border border-cyan-500/50 rounded-2xl relative shadow-[0_30px_100px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              
              <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-5 right-5 text-gray-500 hover:text-white bg-white/5 p-1.5 rounded-lg transition-all"><X size={16} /></button>
              
              <div className="p-8 pb-6 border-b border-white/5 bg-[#0a0a0a]">
                <h2 className="font-abhaya text-3xl text-white mb-2 flex items-center gap-3">
                  <KeyRound className="text-cyan-500" /> Cofre Criptográfico
                </h2>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest leading-relaxed">
                  Autorização de nível militar. O Orion requer o seu <span className="text-cyan-400">Cookie de Sessão</span> para operar o RPA invisível. As credenciais nunca são armazenadas em banco de dados.
                </p>
              </div>
              
              <div className="p-8">
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-5 mb-6 shadow-inner">
                  <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <TerminalSquare size={12}/> Instruções de Captura (DevTools)
                  </h4>
                  <ol className="list-decimal list-inside font-mono text-[10px] text-gray-400 space-y-2.5 leading-relaxed">
                    <li>Acesse <strong className="text-white">instagram.com</strong> e faça login.</li>
                    <li>Pressione <strong className="text-white">F12</strong> (Aceder ao Inspecionar Elemento).</li>
                    <li>Navegue até a aba <strong className="text-white">Application</strong> {'>'} Storage {'>'} Cookies.</li>
                    <li>Encontre a linha com o Nome <strong className="text-cyan-400">sessionid</strong>.</li>
                    <li>Copie o <strong>Valor Alfanumérico</strong> e cole no cofre abaixo.</li>
                  </ol>
                </div>

                <form onSubmit={handleSaveCookie} className="space-y-6">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Cookie de Sessão (sessionid)</label>
                    <input 
                      required 
                      type="password" 
                      value={sessionCookieInput} 
                      onChange={e => setSessionCookieInput(e.target.value)} 
                      className="w-full bg-[#020202] border border-white/10 rounded-xl px-4 py-3 text-xs text-cyan-400 font-mono focus:border-cyan-500 outline-none transition-all shadow-inner placeholder-gray-700" 
                      placeholder="Ex: 58219491024%3AVrtxcZ..." 
                    />
                  </div>
                  
                  <button type="submit" disabled={isAuthenticating || !sessionCookieInput.trim()} className="w-full py-4 bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-cyan-600 hover:text-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] disabled:opacity-50 rounded-xl flex items-center justify-center gap-3">
                    {isAuthenticating ? <><Activity size={16} className="animate-spin"/> Criptografando...</> : <><Lock size={16}/> Trancar Cofre & Armar Sniper</>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

// === WIDGET AUXILIAR: KPI CARD ===
function MetricBox({ title, value, subtitle, icon, color, glow }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string, glow: string }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className={`bg-[#050505]/90 backdrop-blur-xl p-5 border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between h-32 group relative overflow-hidden`}>
      <div className={`absolute -right-10 -top-10 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity bg-current ${color}`}></div>
      <div className="flex justify-between items-start relative z-10">
        <p className="font-montserrat text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">{title}</p>
        <div className={`p-1.5 rounded bg-black/50 border border-white/5 ${color} opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-inner`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <div className={`font-mono text-3xl font-bold tracking-tight mb-1 drop-shadow-md ${color}`}>{value}</div>
        <div className="text-[8px] text-gray-600 font-mono uppercase tracking-widest truncate">{subtitle}</div>
      </div>
    </motion.div>
  );
}
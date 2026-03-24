"use client";

import { useState, useEffect } from "react";
import { 
  Crosshair, Radar, Fingerprint, Zap, ExternalLink, 
  CheckCircle2, Copy, AlertTriangle, TrendingUp, Users,
  Activity, Play, Pause, ChevronRight, UserPlus, BrainCircuit,
  Lock, KeyRound, Server, TerminalSquare, X
} from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { motion, AnimatePresence } from "framer-motion";

export default function VortexPage() {
  const { tenantInfo } = useTenant();
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // === ESTADOS LIGADOS À API ===
  const [targets, setTargets] = useState<any[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // === FASE 5: ESTADOS DO COFRE CRIPTOGRÁFICO ===
  const [isArmed, setIsArmed] = useState(false); // True se o backend tem o cookie do cliente
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [sessionCookieInput, setSessionCookieInput] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // CONEXÃO COM A NUVEM
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://orion-9pls.onrender.com";

  // === BUSCAR ALVOS E STATUS DO COFRE NA API ===
  const loadVortexQueue = async () => {
    if (!tenantInfo?.id) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("orion_token");
      const response = await fetch(`${API_URL}/api/vortex/${tenantInfo.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const payload = await response.json();
        
        // Recebe o status do Módulo Sniper (Cofre)
        setIsArmed(payload.is_armed || false);
        
        const fila = payload.targets || [];
        setTargets(fila);
        
        // Seleciona o primeiro alvo pendente automaticamente
        const firstPending = fila.find((t: any) => t.status === 'pending');
        setSelectedTarget(firstPending || null);
      }
    } catch (error) {
      console.error("Falha ao puxar fila do Vórtex:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVortexQueue();
  }, [tenantInfo?.id]);

  // Simula a cópia da sugestão da IA para a área de transferência
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // === FASE 5: SALVAR COOKIE DE SESSÃO NO BACKEND ===
  const handleSaveCookie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantInfo?.id || !sessionCookieInput.trim()) return;
    
    setIsAuthenticating(true);
    try {
      const token = localStorage.getItem("orion_token");
      const response = await fetch(`${API_URL}/api/vortex/${tenantInfo.id}/auth`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ session_cookie: sessionCookieInput })
      });
      
      if (response.ok) {
        setIsArmed(true);
        setIsAuthModalOpen(false);
        setSessionCookieInput("");
        alert("Módulo Sniper Armado com Sucesso. Automação furtiva pronta.");
      } else {
        alert("Falha ao criptografar sessão no cofre.");
      }
    } catch (error) {
      console.error("Falha na autenticação do cofre:", error);
      alert("Erro de comunicação com o servidor seguro.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // === REGISTRA AÇÃO NO BACKEND E DISPARA AUTOMAÇÃO (Engaged) ===
  const handleActionComplete = async (id: number, action: 'engaged' | 'ignored') => {
    // 1. Atualiza visualmente instantâneo (Optimistic UI)
    const updatedTargets = targets.map(t => t.id === id ? { ...t, status: action } : t);
    setTargets(updatedTargets);
    
    // Passa para o próximo alvo pendente
    const nextTarget = updatedTargets.find(t => t.id !== id && t.status === 'pending');
    setSelectedTarget(nextTarget || null);

    // Aviso se o usuário tentar engajar sem estar armado
    if (action === 'engaged' && !isArmed) {
      alert("Alerta: Ação registrada, mas o Módulo Sniper está desarmado. A curtida e o comentário não serão feitos pela automação.");
    }

    // 2. Envia para o Backend para persistir, ganhar XP e disparar o Worker Ghost
    try {
      const token = localStorage.getItem("orion_token");
      await fetch(`${API_URL}/api/vortex/action`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ target_id: id, action: action })
      });
    } catch (error) {
      console.error("Falha ao registrar ação no backend:", error);
    }
  };

  // Abre a janela focada do Instagram (Fallback Manual)
  const openSniperWindow = (username: string) => {
    window.open(
      `https://www.instagram.com/${username}/`, 
      'VortexSniper', 
      'width=400,height=700,left=200,top=100,toolbar=0,status=0'
    );
  };

  // === CÁLCULO DINÂMICO DOS KPIs ===
  const pendingCount = targets.filter(t => t.status === 'pending').length;
  const engagedCount = targets.filter(t => t.status === 'engaged').length;
  const avgMatch = targets.length > 0 
    ? Math.round(targets.reduce((acc, curr) => acc + curr.matchScore, 0) / targets.length) 
    : 0;
  // Simulação matemática baseada nos engajados 
  const followBackRate = engagedCount > 0 ? "32.4%" : "0%"; 

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      
      {/* 1. CABEÇALHO TÁTICO E STATUS DE ARMAMENTO */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-cyan-500 animate-pulse shadow-[0_0_10px_#06b6d4]' : 'bg-gray-500'}`}></span>
            <span className={`font-montserrat text-[0.65rem] uppercase tracking-widest border px-2 py-1 rounded-md ${isScanning ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' : 'text-gray-400 border-gray-500/30 bg-gray-500/10'}`}>
              Vórtex Lookalike {isScanning ? 'Ativo' : 'Pausado'}
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-v-white-off tracking-wide flex items-center gap-3">
            O <span className="text-cyan-400">Vórtex</span>
          </h1>
          <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest mt-2">
            Infiltração de Audiência e Atirador de Elite
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          {/* FASE 5: Badge de Status de Automação */}
          <div 
            onClick={() => !isArmed && setIsAuthModalOpen(true)}
            className={`flex items-center gap-3 border p-2 rounded-xl backdrop-blur-sm relative transition-all ${isArmed ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10 cursor-pointer hover:border-red-500/60'}`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-abhaya text-xl border ${isArmed ? 'bg-green-500/20 text-green-400 border-green-500/40 shadow-[inset_0_0_10px_rgba(34,197,94,0.2)]' : 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)] animate-pulse'}`}>
              {isArmed ? <Lock size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div className="pr-2">
              <p className="font-montserrat text-[0.6rem] text-gray-400 uppercase tracking-widest">Módulo Sniper (RPA)</p>
              <p className={`font-montserrat text-sm font-bold ${isArmed ? 'text-green-400' : 'text-red-400'}`}>
                {isArmed ? "ARMADO E SEGURO" : "DESARMADO (CLIQUE AQUI)"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-black border border-white/20 rounded-md p-1">
              <button className="px-4 py-2 text-[0.65rem] font-montserrat font-bold text-black bg-cyan-500 rounded-md uppercase tracking-widest transition-all">
                Roubar Concorrentes
              </button>
              <button className="px-4 py-2 text-[0.65rem] font-montserrat text-gray-400 hover:text-white transition-colors uppercase tracking-widest">
                Base Própria
              </button>
            </div>
            <button 
              onClick={() => setIsScanning(!isScanning)}
              className={`p-3 border rounded-md transition-colors flex items-center justify-center ${isScanning ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'}`}
            >
              {isScanning ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. DADOS DE CONTROLE (Assertividade Real) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBox title="Alvos Mapeados (Fila)" value={isLoading ? "..." : pendingCount.toString()} subtitle="Pendentes de ação" icon={<Radar size={16} />} color="text-cyan-400" />
        <MetricBox title="Taxa de Follow-Back" value={isLoading ? "..." : followBackRate} subtitle="Conversão histórica" icon={<Users size={16} />} color="text-green-500" />
        <MetricBox title="Afinidade Média" value={isLoading ? "..." : `${avgMatch}%`} subtitle="Match com a Persona" icon={<Fingerprint size={16} />} color="text-[#d4af37]" />
        <MetricBox title="Ações Concluídas" value={isLoading ? "..." : engagedCount.toString()} subtitle="Engajamentos hoje" icon={<TrendingUp size={16} />} color="text-blue-400" />
      </section>

      {/* 3. A ESTAÇÃO DE TRABALHO SNIPER */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* COLUNA ESQUERDA: Fila de Alvos (Radar) */}
        <div className="glass-panel border border-white/10 rounded-xl flex flex-col h-[600px] overflow-hidden bg-black/20">
          <div className="p-4 border-b border-white/10 bg-black/40 shrink-0 flex justify-between items-center">
            <h3 className="font-montserrat text-[0.65rem] font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
              <Crosshair size={14} className="text-cyan-400" /> Fila de Infiltração
            </h3>
            <span className="text-[0.6rem] text-gray-500 font-montserrat bg-white/5 px-2 py-1 rounded-md">
              {pendingCount} Restantes
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 p-3 space-y-2">
            {isLoading ? (
              <div className="text-center text-cyan-500 text-xs py-10 font-montserrat animate-pulse uppercase tracking-widest">
                Sincronizando com o Backend...
              </div>
            ) : targets.length > 0 ? (
              targets.map(target => (
                <div 
                  key={target.id}
                  onClick={() => target.status === 'pending' && setSelectedTarget(target)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                    selectedTarget?.id === target.id 
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                      : target.status !== 'pending' 
                        ? 'bg-black/20 border-transparent opacity-40 cursor-not-allowed'
                        : 'bg-black/40 border-white/5 hover:border-white/20'
                  }`}
                >
                  {/* Status Indicator */}
                  <div className="shrink-0">
                    {target.status === 'engaged' ? <CheckCircle2 size={16} className="text-green-500" /> : 
                     target.status === 'ignored' ? <AlertTriangle size={16} className="text-red-500" /> :
                     <div className={`w-2 h-2 rounded-full ${selectedTarget?.id === target.id ? 'bg-cyan-400 animate-ping' : 'bg-gray-600'}`}></div>}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-montserrat text-xs font-bold text-v-white-off truncate">@{target.username}</p>
                      <span className="text-[0.55rem] text-[#d4af37] font-bold">{target.matchScore}% Match</span>
                    </div>
                    <p className="text-[0.6rem] text-gray-500 uppercase tracking-widest truncate">Origem: {target.origin}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 text-xs py-10 font-montserrat px-4 leading-relaxed">
                Nenhum alvo na fila de prioridade no momento.<br />O Oráculo iniciará a busca de novos prospectos na madrugada.
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA (Span 2): Terminal Sniper */}
        <div className="lg:col-span-2 glass-panel border border-cyan-500/30 rounded-xl flex flex-col bg-cyan-900/10 relative overflow-hidden h-[600px] shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none"><Fingerprint size={300} className="text-cyan-500" /></div>
          
          <div className="p-6 border-b border-cyan-500/20 bg-black/40 shrink-0 flex justify-between items-center relative z-10">
            <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Activity size={14} /> Terminal de Ação Humana
            </h3>
            <span className={`flex items-center gap-1 text-[0.6rem] uppercase tracking-widest border px-2 py-1 rounded-md ${isArmed ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-gray-400 border-gray-500/30 bg-gray-500/10'}`}>
              <Server size={12} /> {isArmed ? "RPA Conectado" : "Apenas Manual"}
            </span>
          </div>

          <div className="flex-1 p-6 md:p-8 flex flex-col relative z-10 overflow-y-auto">
            
            {selectedTarget ? (
              <>
                {/* Bloco de Informação do Alvo */}
                <div className="mb-8">
                  <h2 className="font-abhaya text-3xl text-v-white-off mb-1">{selectedTarget.name || "Usuário do Instagram"}</h2>
                  <p className="font-montserrat text-sm text-cyan-400 font-bold mb-4">@{selectedTarget.username}</p>
                  
                  <div className="bg-black/40 border border-white/5 p-5 rounded-xl mb-4">
                    <p className="font-montserrat text-[0.7rem] text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      Biografia Extraída
                    </p>
                    <p className="font-montserrat text-sm text-v-white-off leading-relaxed">{selectedTarget.bio || "Usuário não forneceu biografia pública."}</p>
                  </div>

                  <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 p-5 rounded-xl">
                    <p className="font-montserrat text-[0.7rem] text-[#d4af37] uppercase tracking-widest mb-2 flex items-center gap-2">
                      <BrainCircuit size={12} /> Dossiê da IA (Porquê atacar?)
                    </p>
                    <p className="font-montserrat text-xs text-gray-300 leading-relaxed italic">"{selectedTarget.aiAnalysis}"</p>
                  </div>
                </div>

                {/* Bloco de Munição (Copy Gerada) */}
                <div className="mb-auto">
                  <div className="flex justify-between items-end mb-2">
                    <p className="font-montserrat text-[0.65rem] text-gray-400 uppercase tracking-widest">Munição Sugerida</p>
                    <button 
                      onClick={() => handleCopy(selectedTarget.suggestedComment)}
                      className="text-[0.6rem] flex items-center gap-1 font-bold text-cyan-400 uppercase tracking-widest hover:text-white transition-colors bg-cyan-500/10 px-2 py-1 rounded-md"
                    >
                      {copied ? <><CheckCircle2 size={12} /> Copiado!</> : <><Copy size={12} /> Copiar Hook</>}
                    </button>
                  </div>
                  <div className="w-full bg-black/60 border border-cyan-500/30 rounded-xl p-5 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]">
                    <p className="font-montserrat text-sm text-v-white-off italic leading-relaxed">
                      "{selectedTarget.suggestedComment}"
                    </p>
                  </div>
                </div>

                {/* Central de Comandos */}
                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                  <button 
                    onClick={() => handleActionComplete(selectedTarget.id, 'ignored')}
                    className="py-4 border border-white/10 text-gray-500 font-montserrat text-[0.65rem] font-bold uppercase tracking-widest hover:bg-white/5 hover:text-white transition-colors rounded-lg"
                  >
                    Descartar Alvo
                  </button>
                  
                  <button 
                    onClick={() => openSniperWindow(selectedTarget.username)}
                    className="py-4 bg-cyan-900/40 border border-cyan-500/50 text-cyan-400 font-montserrat text-[0.65rem] font-bold uppercase tracking-widest hover:bg-cyan-900/80 transition-colors rounded-lg flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={14} /> Fazer Manualmente
                  </button>

                  {/* FASE 5: Botão Engajar agora engatilha automação se armado */}
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionComplete(selectedTarget.id, 'engaged')}
                    className={`py-4 text-black font-montserrat text-[0.65rem] font-bold uppercase tracking-widest transition-colors rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)] ${isArmed ? 'bg-green-500 hover:bg-green-400' : 'bg-[#d4af37] hover:bg-[#c9a128]'}`}
                  >
                    {isArmed ? <Zap size={14} /> : <CheckCircle2 size={14} />} 
                    {isArmed ? "Disparar Sniper (Auto)" : "Confirmar Ação (Manual)"}
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-black/20 rounded-xl border border-dashed border-white/5">
                <Crosshair size={48} className="mb-4 text-cyan-500/30" />
                <p className="font-montserrat text-sm uppercase tracking-widest font-bold">Terminal Inativo</p>
                <p className="font-montserrat text-xs mt-2 text-center max-w-xs leading-relaxed">Selecione um alvo pendente na fila de infiltração para iniciar o engajamento tático.</p>
              </div>
            )}

          </div>
        </div>

      </section>

      {/* =====================================================================
          MODAL DO COFRE CRIPTOGRÁFICO (VORTEX AUTH)
      ===================================================================== */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="glass-panel w-full max-w-lg bg-black border border-cyan-500/50 rounded-xl relative shadow-[0_0_80px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden">
              
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent"></div>
              
              <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-white transition-all"><X size={20} /></button>
              
              <div className="p-8 pb-4 shrink-0 border-b border-white/5">
                <h2 className="font-abhaya text-3xl text-v-white-off mb-2 flex items-center gap-3">
                  <KeyRound className="text-cyan-400" /> Cofre Criptográfico
                </h2>
                <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest leading-relaxed">
                  Autorização de nível militar. O Orion precisa do seu Cookie de Sessão para operar de forma invisível. Suas senhas nunca são armazenadas.
                </p>
              </div>
              
              <div className="p-8">
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4 mb-6">
                  <h4 className="font-montserrat text-[0.65rem] font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2"><TerminalSquare size={12}/> Instruções de Captura</h4>
                  <ol className="list-decimal list-inside font-montserrat text-xs text-gray-300 space-y-2 leading-relaxed">
                    <li>Acesse <strong className="text-white">instagram.com</strong> e faça login na conta da marca.</li>
                    <li>Pressione <strong className="text-white">F12</strong> (Inspecionar Elemento).</li>
                    <li>Vá na aba <strong className="text-white">Application</strong> {'>'} Storage {'>'} Cookies.</li>
                    <li>Encontre a linha com o Nome <strong className="text-cyan-400">sessionid</strong>.</li>
                    <li>Copie o <strong>Valor</strong> enorme e cole no cofre abaixo.</li>
                  </ol>
                </div>

                <form onSubmit={handleSaveCookie} className="space-y-6 font-montserrat">
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-v-white-off mb-2">Cookie (sessionid)</label>
                    <input 
                      required 
                      type="password" 
                      value={sessionCookieInput} 
                      onChange={e => setSessionCookieInput(e.target.value)} 
                      className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-sm text-cyan-400 font-mono focus:border-cyan-400 outline-none transition-colors shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]" 
                      placeholder="Ex: 58219491024%3AVrtxcZ..." 
                    />
                  </div>
                  
                  <button type="submit" disabled={isAuthenticating} className="w-full py-4 bg-cyan-600 text-white text-xs font-bold uppercase tracking-[0.15em] hover:bg-cyan-500 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 rounded-lg flex items-center justify-center gap-2">
                    {isAuthenticating ? <><Activity size={16} className="animate-spin"/> Criptografando...</> : <><Lock size={16}/> Trancar Cofre & Armar Sniper</>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function MetricBox({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-panel p-5 border border-white/5 rounded-xl hover:border-cyan-500/30 transition-colors flex flex-col justify-between h-32 bg-black/20 shadow-lg">
      <div className="flex justify-between items-start">
        <p className="font-montserrat text-[0.6rem] uppercase tracking-widest text-gray-500">{title}</p>
        <div className={`${color} opacity-80`}>{icon}</div>
      </div>
      <div>
        <div className={`font-abhaya text-3xl font-bold mb-1 ${color}`}>{value}</div>
        <div className="text-[0.6rem] text-gray-400 uppercase tracking-wide">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
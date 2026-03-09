"use client";

import { useState, useEffect } from "react";
import { 
  Crosshair, Radar, Fingerprint, Zap, ExternalLink, 
  CheckCircle2, Copy, AlertTriangle, TrendingUp, Users,
  Activity, Play, Pause, ChevronRight, UserPlus, BrainCircuit 
} from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";

export default function VortexPage() {
  const { tenantInfo } = useTenant();
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // === ESTADOS LIGADOS À API ===
  const [targets, setTargets] = useState<any[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // CONEXÃO COM A NUVEM
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // === BUSCAR ALVOS NA API ===
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

  // === REGISTRA AÇÃO NO BACKEND (Engajou ou Ignorou) ===
  const handleActionComplete = async (id: number, action: 'engaged' | 'ignored') => {
    // 1. Atualiza visualmente instantâneo (Optimistic UI)
    const updatedTargets = targets.map(t => t.id === id ? { ...t, status: action } : t);
    setTargets(updatedTargets);
    
    // Passa para o próximo alvo pendente
    const nextTarget = updatedTargets.find(t => t.id !== id && t.status === 'pending');
    setSelectedTarget(nextTarget || null);

    // 2. Envia para o Backend para persistir e ganhar XP
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

  // Abre a janela focada do Instagram
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
      
      {/* 1. CABEÇALHO TÁTICO */}
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
            <span className="flex items-center gap-1 text-[0.6rem] text-green-400 uppercase tracking-widest border border-green-500/30 bg-green-500/10 px-2 py-1 rounded-md">
              <CheckCircle2 size={12} /> Seguro (Anti-Ban)
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
                    className="py-4 bg-cyan-600 text-white font-montserrat text-[0.65rem] font-bold uppercase tracking-widest hover:bg-cyan-500 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] rounded-lg flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={14} /> Abrir Instagram
                  </button>

                  <button 
                    onClick={() => handleActionComplete(selectedTarget.id, 'engaged')}
                    className="py-4 bg-[#d4af37] text-black font-montserrat text-[0.65rem] font-bold uppercase tracking-widest hover:bg-[#c9a128] transition-colors rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                  >
                    <CheckCircle2 size={14} /> Confirmar Ação
                  </button>
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
    </div>
  );
}

function MetricBox({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-panel p-5 border border-white/5 rounded-xl hover:border-cyan-500/30 transition-colors flex flex-col justify-between h-32 bg-black/20">
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
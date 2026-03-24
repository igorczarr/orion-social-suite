"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, Users, Target, Activity, Zap, Flame, Crosshair, 
  ArrowUpDown, Filter, Search, Eye, Heart, Bookmark, Swords, 
  Trophy, BrainCircuit, Radar, MessageCircle, PenTool, X, Plus, 
  Settings, Edit3, ShieldAlert, RefreshCw, Terminal, Layout, 
  Download, FileText, Command
} from "lucide-react";
import { OrionAPI } from "@/lib/api"; 
import { useTenant } from "@/contexts/TenantContext";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const { tenantInfo, toggleTenant, refreshTenants } = useTenant();

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'ytd'>('ytd');
  const [selectedCompetitorIdx, setSelectedCompetitorIdx] = useState<number>(0);

  const [radarFilter, setRadarFilter] = useState<'Todos' | 'Global/Brasil' | 'Trending Topics' | 'Authority Proof'>('Todos');

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<any>(null);
  
  const [isGeneratingTactics, setIsGeneratingTactics] = useState(false);
  const [tacticalResult, setTacticalResult] = useState<string | null>(null);
  const [tacticalSource, setTacticalSource] = useState<string | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTheme, setActiveTheme] = useState("navy");
  
  // === FASE 4: ESTADOS DE ELITE (VIEWS E TERMINAL) ===
  const [viewMode, setViewMode] = useState<'cockpit' | 'activation' | 'branding'>('cockpit');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalInput, setTerminalInput] = useState("");

  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "", social_handle: "", niche: "Moda & Vestuário", personas: "", competitors: "", keywords: ""
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://orion-9pls.onrender.com";

  useEffect(() => {
    const savedTheme = localStorage.getItem("orion_theme") || "navy";
    setActiveTheme(savedTheme);
    document.documentElement.classList.add(savedTheme);
  }, []);

  // === FASE 4: OUVINTE DO TERMINAL (Cmd+K / Ctrl+K) ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openEditModal = () => {
    if (tenantInfo) {
      setFormData({
        name: tenantInfo.name,
        social_handle: tenantInfo.social_handle || "",
        niche: tenantInfo.niche || "Moda & Vestuário",
        personas: Array.isArray(tenantInfo.personas) ? tenantInfo.personas.join(", ") : "",
        competitors: Array.isArray(tenantInfo.competitors) ? tenantInfo.competitors.join(", ") : "",
        keywords: tenantInfo.keywords || ""
      });
      setIsEditClientModalOpen(true);
    }
  };

  useEffect(() => {
    async function loadDashboardOverview() {
      if (!tenantInfo?.id || tenantInfo.id <= 0) return;
      setIsLoadingDashboard(true);
      setSelectedCompetitorIdx(0); 
      try {
        const token = localStorage.getItem("orion_token");
        const res = await fetch(`${API_URL}/api/dashboard/${tenantInfo.id}/overview`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if(res.ok) {
           const data = await res.json();
           setDashboardData(data);
           setPosts(data.posts || []);
        }
      } catch (error) {
        console.error("Falha ao puxar dados do Dashboard", error);
      } finally {
        setIsLoadingDashboard(false);
      }
    }
    loadDashboardOverview();
  }, [tenantInfo?.id]);

  const handleStartEngine = async () => {
    if (!tenantInfo || tenantInfo.id <= 0) {
      alert("Selecione um cliente real para sincronizar.");
      return;
    }
    setIsSyncing(true);
    try {
      await OrionAPI.forceSync(tenantInfo.id);
      alert("Motor Orion em campo! A cascata tática foi iniciada. Atualizaremos os dados em 2 minutos.");
      setTimeout(() => { window.location.reload(); }, 120000);
    } catch (error) {
      console.error("Falha no disparo manual:", error);
      alert("Erro ao acionar o motor. Verifique a conexão com o Render.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleIAAdjustment = () => {
    alert("Iniciando recalibragem de rota estratégica... O cérebro Gemini aplicará as mudanças no próximo ciclo.");
  };

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = [...posts];
    const now = new Date();
    
    if (timeFilter === '7d') {
      filtered = filtered.filter(p => (now.getTime() - new Date(p.date).getTime()) / (1000 * 3600 * 24) <= 7);
    } else if (timeFilter === '30d') {
      filtered = filtered.filter(p => (now.getTime() - new Date(p.date).getTime()) / (1000 * 3600 * 24) <= 30);
    }

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [posts, sortConfig, timeFilter]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  const unifiedRadarData = useMemo(() => {
    if (!dashboardData) return [];
    let combined: any[] = [];

    if (dashboardData.global_trends && Array.isArray(dashboardData.global_trends)) {
      dashboardData.global_trends.forEach((t: any) => {
        const cat = t.category || "";
        const catLower = cat.toLowerCase();
        combined.push({
          topic: t.topic || "Tópico sem título",
          category: cat,
          heat: t.heat || 'Alto',
          source_type: 'trend',
          filterGroup: (catLower.includes('entretenimento') || catLower.includes('x ') || catLower.includes('(x)')) 
            ? 'Trending Topics' : 'Global/Brasil'
        });
      });
    }

    if (dashboardData.authority_proofs && Array.isArray(dashboardData.authority_proofs)) {
      dashboardData.authority_proofs.forEach((p: any) => {
        combined.push({
          topic: p.title || "Estudo indisponível",
          category: `Autoridade (${p.source || 'Nicho'})`,
          heat: 'Estudo',
          source_type: 'proof',
          filterGroup: 'Authority Proof'
        });
      });
    }

    if (radarFilter !== 'Todos') {
      combined = combined.filter(item => item.filterGroup === radarFilter);
    }
    return combined;
  }, [dashboardData, radarFilter]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingTenant(true);
    try {
      await OrionAPI.createTenant(formData);
      await refreshTenants(); 
      setIsNewClientModalOpen(false);
      setFormData({ name: "", social_handle: "", niche: "Moda & Vestuário", personas: "", competitors: "", keywords: "" }); 
      alert("Motor de Inteligência ativado para o novo cliente!");
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      alert("Falha na comunicação com o servidor.");
    } finally {
      setIsCreatingTenant(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!tenantInfo || tenantInfo.id <= 0) return;
    setIsGeneratingReport(true);
    try {
      const res = await OrionAPI.generateDossier(tenantInfo.id);
      setReportData(res);
      const html2pdf = (await import("html2pdf.js")).default;
      setTimeout(() => {
        const element = document.getElementById("vrtice-pdf-report");
        if (element) {
          const opt = {
            margin:       15,
            filename:     `Dossie_Estrategico_${tenantInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            image:        { type: 'jpeg' as const, quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#020617' },
            jsPDF:        { unit: 'mm', format: 'a4' as const, orientation: 'portrait' as const }
          };
          html2pdf().set(opt as any).from(element).save().then(() => {
            setIsGeneratingReport(false);
            setReportData(null); 
          });
        }
      }, 1500); 
    } catch (error) {
      alert("Falha ao sintetizar o Dossiê CMO. A IA pode estar sobrecarregada ou a chave é inválida.");
      setIsGeneratingReport(false);
    }
  };

  const handleGenerateBriefing = async () => {
    setIsGenerating(true);
    try {
      const comp = dashboardData?.arena?.[selectedCompetitorIdx]?.username || "@concorrente";
      const realPainPoint = dashboardData?.radar?.[0]?.quote 
        ? `A dor profunda da audiência é: "${dashboardData.radar[0].quote}"` : "Dificuldade na atração de clientes";
      const response = await OrionAPI.generateBriefing(realPainPoint, comp);
      setAiBriefing(response.data); 
    } catch (error) {
      alert("Falha ao gerar briefing. Verifique a conexão.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTacticalCopy = async (sourceType: 'trend' | 'proof', content: string) => {
    if (!tenantInfo || tenantInfo.id <= 0) return;
    setIsGeneratingTactics(true);
    setTacticalSource(content); 
    try {
      const response = await OrionAPI.generateTacticalCopy(tenantInfo.id, sourceType, content);
      setTacticalResult(response.data);
    } catch (error) {
      alert("Falha na geração tática. Verifique os logs do sistema.");
    } finally {
      setIsGeneratingTactics(false);
    }
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(terminalInput.trim()) {
      alert(`[Orion Command Executed]: ${terminalInput}\nFunção restrita na versão atual.`);
      setTerminalInput("");
      setIsTerminalOpen(false);
    }
  };

  const currentCompetitor = dashboardData?.arena?.[selectedCompetitorIdx] || null;

  return (
    <div className={`space-y-8 animate-fade-in-up pb-32 relative min-h-screen ${activeTheme === 'navy' ? 'theme-navy' : ''}`}>
      
      {/* 1. BARRA DE COMANDO GLOBAL & SPLIT VIEW */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-v-white-off/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-red-500 animate-ping' : 'bg-green-500 animate-pulse'} shadow-[0_0_10px_#22c55e]`}></span>
            <span className="font-montserrat text-[0.65rem] text-[#d4af37] uppercase tracking-widest border border-[#d4af37]/30 px-2 py-1 bg-[#d4af37]/10 rounded-md">
              {isSyncing ? "Cascata Tática Acionada" : "Sistema Operacional Ativo"}
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-v-white-off tracking-wide">
            Centro de <span className="text-[#d4af37]">Comando</span>
          </h1>
          
          {/* FASE 4: Roteador de Visão (Progressive Disclosure) */}
          <div className="flex bg-black/50 border border-white/5 rounded-lg p-1 mt-6 w-max shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
            <button onClick={() => setViewMode('cockpit')} className={`px-5 py-2 text-[0.7rem] font-montserrat font-bold uppercase tracking-widest transition-all rounded-md flex items-center gap-2 ${viewMode === 'cockpit' ? 'bg-v-white-off/10 text-v-white-off shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
              <Activity size={14}/> God Mode
            </button>
            <button onClick={() => setViewMode('activation')} className={`px-5 py-2 text-[0.7rem] font-montserrat font-bold uppercase tracking-widest transition-all rounded-md flex items-center gap-2 ${viewMode === 'activation' ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}>
              <Flame size={14}/> Sales Activation
            </button>
            <button onClick={() => setViewMode('branding')} className={`px-5 py-2 text-[0.7rem] font-montserrat font-bold uppercase tracking-widest transition-all rounded-md flex items-center gap-2 ${viewMode === 'branding' ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}>
              <Target size={14}/> Brand Building
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          {viewMode === 'activation' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex bg-black/40 border border-white/10 rounded-lg p-1">
              <button onClick={() => setTimeFilter('7d')} className={`px-4 py-1.5 text-[0.65rem] font-montserrat font-bold uppercase tracking-widest transition-colors rounded-md ${timeFilter === '7d' ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'}`}>7 Dias</button>
              <button onClick={() => setTimeFilter('30d')} className={`px-4 py-1.5 text-[0.65rem] font-montserrat font-bold uppercase tracking-widest transition-colors rounded-md ${timeFilter === '30d' ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'}`}>30 Dias</button>
              <button onClick={() => setTimeFilter('ytd')} className={`px-4 py-1.5 text-[0.65rem] font-montserrat font-bold uppercase tracking-widest transition-colors rounded-md ${timeFilter === 'ytd' ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'}`}>YTD</button>
            </motion.div>
          )}
          
          <div className="flex items-center gap-3 bg-black/60 border border-white/10 p-2 rounded-xl backdrop-blur-md relative group shadow-2xl">
            <div className="w-10 h-10 bg-black/80 rounded-lg flex items-center justify-center font-abhaya text-[#d4af37] text-xl border border-[#d4af37]/40 shadow-[inset_0_0_10px_rgba(212,175,55,0.2)]">
              {tenantInfo?.initials || "00"}
            </div>
            <div className="pr-2 hidden sm:block">
              <p className="font-montserrat text-[0.6rem] text-gray-500 uppercase tracking-widest">Conta Monitorada</p>
              <p className="font-montserrat text-sm font-bold text-v-white-off">{tenantInfo?.name || "Nenhum Cliente"}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={openEditModal} className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors" title="Afinar Cliente">
                <Settings size={14} />
              </button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={toggleTenant} className="px-3 py-2 text-[0.65rem] font-bold text-black bg-[#d4af37] uppercase tracking-widest hover:bg-[#b5952f] transition-colors rounded-md shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                Trocar
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsNewClientModalOpen(true)} className="px-3 py-2 text-[0.65rem] font-bold text-[#d4af37] bg-black border border-[#d4af37] uppercase tracking-widest hover:bg-[#d4af37]/10 transition-colors rounded-md flex items-center gap-1">
                <Plus size={12} /> Novo
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* RENDERIZAÇÃO CONDICIONAL BASEADA NAS VIEWS (PROGRESSIVE DISCLOSURE) */}
      <AnimatePresence mode="wait">
        
        {/* ===================== COCKPIT VIEW ===================== */}
        {viewMode === 'cockpit' && (
          <motion.div key="cockpit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricBox isLoading={isLoadingDashboard} title="Crescimento (Followers)" value={dashboardData?.kpis?.followers?.toLocaleString('pt-BR')} trend={dashboardData?.kpis?.delta_followers >= 0 ? `+${dashboardData?.kpis?.delta_followers} diário` : `${dashboardData?.kpis?.delta_followers} diário`} isPositive={dashboardData?.kpis?.delta_followers >= 0} icon={<Users size={16} />} />
              <MetricBox isLoading={isLoadingDashboard} title="Taxa Média Engajamento" value={`${dashboardData?.kpis?.avg_engagement || 0}%`} trend="Orgânico" isPositive={true} icon={<Heart size={16} />} />
              <MetricBox isLoading={isLoadingDashboard} title="Alcance Global (Est.)" value={dashboardData?.kpis?.total_reach?.toLocaleString('pt-BR')} trend="Em alta" isPositive={true} icon={<Eye size={16} />} />
              <MetricBox isLoading={isLoadingDashboard} title="Tração (Saves)" value={dashboardData?.kpis?.total_saves?.toLocaleString('pt-BR')} trend="Retenção" isPositive={true} icon={<Bookmark size={16} />} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-panel p-8 border border-white/5 rounded-xl relative overflow-hidden bg-black/40 shadow-xl">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Target size={120} /></div>
                <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <Trophy size={14} className="text-[#d4af37]" /> Meta do Trimestre (Gamificação)
                </h3>
                <div className="flex justify-between items-end mb-2 relative z-10">
                  <div>
                    <p className="font-abhaya text-4xl font-bold text-v-white-off">
                      {isLoadingDashboard ? "---" : dashboardData?.gamification?.target?.toLocaleString('pt-BR')} <span className="text-lg text-gray-500 font-montserrat">Seguidores</span>
                    </p>
                    <p className="font-montserrat text-xs text-[#d4af37] mt-1">Faltam {isLoadingDashboard ? "---" : dashboardData?.gamification?.remaining?.toLocaleString('pt-BR')} para o Marco</p>
                  </div>
                  <p className="font-montserrat text-3xl font-bold text-v-white-off">{isLoadingDashboard ? "0" : dashboardData?.gamification?.percent}%</p>
                </div>
                <div className="w-full h-3 bg-black/80 border border-white/10 rounded-full mt-4 overflow-hidden relative z-10">
                  <div 
                    className="h-full bg-gradient-to-r from-gray-700 to-[#d4af37] relative shadow-[0_0_15px_rgba(212,175,55,0.5)] transition-all duration-1000"
                    style={{ width: `${dashboardData?.gamification?.percent || 0}%` }}
                  >
                    <div className="absolute top-0 right-0 w-2 h-full bg-white/50 animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-8 border border-red-500/30 rounded-xl relative bg-gradient-to-b from-transparent to-red-900/10 flex flex-col justify-between shadow-[inset_0_0_50px_rgba(239,68,68,0.05)]">
                <div>
                  <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-red-400 mb-4 flex items-center gap-2">
                    <ShieldAlert size={14} /> Intervenção Crítica (IA)
                  </h3>
                  <p className="font-montserrat text-[0.85rem] text-gray-300 leading-relaxed">
                    {isLoadingDashboard ? "Sincronizando com o cérebro central..." : dashboardData?.intervencao}
                  </p>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleIAAdjustment} className="w-full mt-4 py-3 border border-red-500/50 text-red-400 font-montserrat text-[0.65rem] uppercase tracking-widest hover:bg-red-500/20 transition-colors font-bold flex justify-center items-center gap-2 rounded-lg">
                  <Zap size={14} /> Aplicar Ajuste de Rota
                </motion.button>
              </div>
            </section>
          </motion.div>
        )}

        {/* ===================== SALES ACTIVATION VIEW ===================== */}
        {viewMode === 'activation' && (
          <motion.div key="activation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              
              {/* ARENA (Topologia Simulada) */}
              <div className="glass-panel border border-red-500/20 rounded-xl flex flex-col h-full min-h-[350px] bg-black/40 relative overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.05)]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/60 shrink-0 relative z-10">
                   <h3 className="font-montserrat text-[0.6rem] font-bold uppercase tracking-widest text-red-400 flex items-center gap-2"><Swords size={12} /> A Arena</h3>
                </div>
                <div className="p-6 relative z-10 flex-1 flex flex-col">
                  {dashboardData?.arena && dashboardData.arena.length > 0 ? (
                    <select value={selectedCompetitorIdx} onChange={(e) => setSelectedCompetitorIdx(Number(e.target.value))} className="bg-black/80 border border-white/20 text-v-white-off text-[0.65rem] uppercase tracking-widest rounded-md px-3 py-3 outline-none focus:border-red-500 cursor-pointer w-full mb-6 shadow-xl">
                      {dashboardData.arena.map((c: any, idx: number) => <option key={idx} value={idx}>@{c.username}</option>)}
                    </select>
                  ) : (
                    <span className="text-[0.6rem] text-gray-500 uppercase tracking-widest block mb-3">Sem Alvos Mapeados</span>
                  )}
                  
                  {/* Radar Pulse Visual */}
                  <div className="flex-1 flex items-center justify-center relative my-4">
                     <div className="absolute w-32 h-32 rounded-full border border-red-500/20 animate-ping"></div>
                     <div className="absolute w-24 h-24 rounded-full border border-red-500/40 animate-pulse"></div>
                     <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400 font-abhaya text-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] z-10">
                        {currentCompetitor?.frequency?.split('x')[0] || "!"}x
                     </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between text-[0.65rem] font-montserrat mb-2">
                      <span className="text-v-white-off">Nós: <strong className="text-green-400">{dashboardData?.kpis?.avg_engagement || 0}%</strong></span>
                      <span className="text-gray-400">Eles: <strong className="text-red-400">{currentCompetitor?.engagement || 0}%</strong></span>
                    </div>
                    <div className="w-full h-2 bg-black/80 rounded-full overflow-hidden border border-white/5 flex">
                      <div className="h-full bg-green-500 transition-all" style={{ width: `50%` }}></div>
                      <div className="h-full bg-red-500 transition-all opacity-50" style={{ width: `50%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ARSENAL & ESTRATÉGIA CMO */}
              <div className="flex flex-col gap-6 h-full min-h-[350px]">
                <div className="glass-panel border border-white/10 rounded-xl flex flex-col flex-1 overflow-hidden min-h-[200px] bg-black/40">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/60 shrink-0">
                    <h3 className="font-montserrat text-[0.6rem] font-bold uppercase tracking-widest text-gray-300 flex items-center gap-2">
                      <PenTool size={12} className="text-red-400" /> Arsenal Bélico (Ganchos Inimigos)
                    </h3>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                    {isLoadingDashboard ? (
                      <div className="flex flex-col items-center justify-center h-full opacity-50">
                        <Activity size={20} className="text-red-500 animate-spin mb-2" />
                        <p className="text-xs text-red-400 font-mono tracking-widest">DECRYPTING...</p>
                      </div>
                    ) : dashboardData?.arsenal?.length > 0 ? (
                      dashboardData.arsenal.map((item: any, i: number) => (
                        <div key={i} className="group cursor-pointer border-b border-white/5 pb-2">
                          <p className="font-abhaya text-sm text-gray-400 group-hover:text-v-white-off transition-colors">"{item.hook}"</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 font-montserrat mt-2 text-center">Nenhum gancho mapeado.</p>
                    )}
                  </div>
                </div>

                <div className="glass-panel border border-red-500/30 rounded-xl flex flex-col bg-red-500/5 relative overflow-hidden shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                  <div className="p-4 border-b border-red-500/10 relative z-10 bg-black/60">
                    <h3 className="font-montserrat text-[0.6rem] font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2"><Crosshair size={12} className="text-red-500" /> Tática de Guerrilha</h3>
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-center items-center text-center relative z-10">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleGenerateBriefing} disabled={isGenerating || isLoadingDashboard} className="w-full py-4 bg-red-600 text-white font-montserrat text-[0.65rem] font-bold uppercase tracking-[0.15em] hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-70 flex justify-center items-center gap-2 rounded-lg">
                      {isGenerating ? <><Activity size={14} className="animate-spin" /> Sintetizando...</> : "Gerar Ataque de Vendas"}
                    </motion.button>
                  </div>
                </div>
              </div>
            </section>

            {/* MATRIZ DE CONTEÚDO (Inalterada logicamente, apenas visual) */}
            <section className="glass-panel border border-white/10 rounded-xl overflow-hidden bg-black/40 shadow-2xl">
              <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-black/60">
                <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
                  <TrendingUp size={14} className="text-[#d4af37]" /> Matriz Analítica de Postagens
                </h3>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" placeholder="Buscar legenda..." className="w-full bg-black/80 border border-white/20 rounded-md py-2 pl-9 pr-4 text-xs font-montserrat text-v-white-off outline-none focus:border-[#d4af37] transition-colors" />
                  </div>
                  <button className="p-2 border border-white/20 rounded-md hover:border-[#d4af37] text-gray-400 hover:text-[#d4af37] transition-colors">
                    <Filter size={16} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto min-h-[250px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/80 border-b border-white/10 font-montserrat text-[0.65rem] uppercase tracking-widest text-gray-500">
                      <th className="p-4 font-medium cursor-pointer hover:text-[#d4af37]" onClick={() => handleSort('date')}>Data <ArrowUpDown size={12} className="inline" /></th>
                      <th className="p-4 font-medium">Formato</th>
                      <th className="p-4 font-medium min-w-50">Resumo da Legenda</th>
                      <th className="p-4 font-medium cursor-pointer hover:text-[#d4af37]" onClick={() => handleSort('reach')}><Eye size={12} className="inline"/> Alcance</th>
                      <th className="p-4 font-medium cursor-pointer hover:text-[#d4af37]" onClick={() => handleSort('engagement')}><Heart size={12} className="inline"/> Engaj.</th>
                      <th className="p-4 font-medium cursor-pointer hover:text-[#d4af37]" onClick={() => handleSort('saves')}><Bookmark size={12} className="inline"/> Saves</th>
                      <th className="p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-montserrat text-sm">
                    {isLoadingDashboard ? (
                      <tr><td colSpan={7} className="p-8 text-center text-[#d4af37] text-xs font-mono animate-pulse">Sincronizando banco de dados...</td></tr>
                    ) : filteredAndSortedPosts.length > 0 ? (
                      filteredAndSortedPosts.map((post) => (
                        <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 text-gray-400 text-xs">{post.date}</td>
                          <td className="p-4"><span className={`text-[0.6rem] uppercase tracking-widest px-2 py-1 rounded-md border ${post.type?.includes('Reels') || post.type?.includes('Video') ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'}`}>{post.type}</span></td>
                          <td className="p-4 text-v-white-off truncate max-w-xs">{post.hook}</td>
                          <td className="p-4 text-gray-300">{post.reach?.toLocaleString('pt-BR')}</td>
                          <td className="p-4 text-[#d4af37] font-bold">{post.engagement}%</td>
                          <td className="p-4 text-gray-300">{post.saves?.toLocaleString('pt-BR')}</td>
                          <td className="p-4"><span className={`text-[0.55rem] uppercase tracking-widest font-bold px-2 py-1 rounded-md bg-black/80 ${post.status === 'Viral' ? 'text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.2)]' : post.status === 'Baixo' ? 'text-red-400 border border-red-500/20' : 'text-gray-400 border border-gray-500/20'}`}>{post.status}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={7} className="p-8 text-center text-gray-500 text-xs">Nenhum post coletado neste período.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </motion.div>
        )}

        {/* ===================== BRAND BUILDING VIEW ===================== */}
        {viewMode === 'branding' && (
          <motion.div key="branding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* RADAR DE PERSONA (Visual Simulado de Heatmap) */}
            <div className="glass-panel border border-[#d4af37]/20 rounded-xl flex flex-col h-full min-h-[400px] bg-black/40 shadow-[0_0_40px_rgba(212,175,55,0.05)]">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/60 shrink-0">
                <h3 className="font-montserrat text-[0.6rem] font-bold uppercase tracking-widest text-[#d4af37] flex items-center gap-2">
                  <MessageCircle size={12} /> Escuta Ativa (Psicanálise)
                </h3>
              </div>
              <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                {isLoadingDashboard ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <Activity size={20} className="text-[#d4af37] animate-spin mb-2" />
                    <p className="text-xs text-[#d4af37] font-mono tracking-widest">MINING DATA LAKE...</p>
                  </div>
                ) : dashboardData?.radar && dashboardData.radar.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {dashboardData.radar.map((insight: any, i: number) => {
                      // Simula a intensidade de calor baseado na categoria
                      const isPain = insight.category.toLowerCase().includes('dor') || insight.category.toLowerCase().includes('obje');
                      const heatColor = isPain ? 'border-red-500/50 bg-red-500/10 text-red-200' : 'border-blue-500/50 bg-blue-500/10 text-blue-200';
                      
                      return (
                        <div key={i} className={`p-4 rounded-xl border ${heatColor} hover:scale-[1.02] transition-transform cursor-default flex-1 min-w-[250px]`}>
                          <p className="font-abhaya text-lg leading-relaxed italic">"{insight.quote}"</p>
                          <div className="flex justify-between items-center mt-4 border-t border-white/10 pt-2">
                            <span className="text-[0.55rem] font-bold uppercase tracking-widest opacity-70">{insight.category}</span>
                            <span className="text-[0.55rem] font-mono opacity-50">{insight.platform}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 font-montserrat text-center mt-4">Nenhum insight mapeado.</p>
                )}
              </div>
            </div>

            {/* RADAR TRÍPLICE UNIFICADO */}
            <div className="glass-panel border border-white/10 rounded-xl flex flex-col h-full min-h-[400px] bg-black/40">
              <div className="p-4 border-b border-white/10 flex flex-col gap-3 bg-black/60 shrink-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-montserrat text-[0.65rem] font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
                    <Radar size={14} className="text-[#d4af37]" /> Data Lake Global
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Todos', 'Global/Brasil', 'Trending Topics', 'Authority Proof'].map(f => (
                    <button 
                      key={f} 
                      onClick={() => setRadarFilter(f as any)} 
                      className={`px-3 py-1.5 text-[0.55rem] font-montserrat font-bold uppercase tracking-widest rounded-md transition-colors border ${radarFilter === f ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-black/80 text-gray-400 border-white/10 hover:border-[#d4af37]/50'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {isLoadingDashboard ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <Activity size={20} className="text-gray-500 animate-spin mb-2" />
                  </div>
                ) : unifiedRadarData.length > 0 ? (
                  unifiedRadarData.map((item: any, i: number) => (
                    <TrendItem 
                      key={i} 
                      rank={i + 1} 
                      topic={item.topic} 
                      category={item.category} 
                      heat={item.heat} 
                      onZap={() => handleGenerateTacticalCopy(item.source_type, item.topic)}
                    />
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center mt-8">Nenhum dado encontrado para este filtro.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === FASE 4: TERMINAL SANDBOX (CMD+K) === */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-2xl">
            <div className="bg-black/90 border border-[#d4af37]/50 rounded-xl shadow-[0_0_50px_rgba(212,175,55,0.2)] backdrop-blur-xl overflow-hidden flex items-center p-2">
              <Terminal size={18} className="text-[#d4af37] ml-3 shrink-0" />
              <form onSubmit={handleTerminalSubmit} className="w-full">
                <input 
                  autoFocus
                  type="text" 
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Comando Orion (Ex: /auditar @zara_brasil)..." 
                  className="w-full bg-transparent border-none outline-none text-v-white-off font-mono text-sm px-4 py-3 placeholder:text-gray-600"
                />
              </form>
              <div className="flex items-center gap-1 mr-3 shrink-0 opacity-50">
                <kbd className="bg-white/10 px-2 py-1 rounded text-[0.5rem] font-mono text-white">ESC</kbd>
                <span className="text-[0.5rem] text-white">para sair</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === BARRA DE FERRAMENTAS FLUTUANTE (ACTION DOCK) === */}
      <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 p-2 bg-black/80 backdrop-blur-lg border border-v-gold/30 rounded-full shadow-[0_0_30px_rgba(212,175,55,0.15)]">
        <button 
          onClick={handleStartEngine}
          disabled={isSyncing}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isSyncing ? 'bg-red-500/20 text-red-500' : 'bg-v-gold/10 text-v-gold hover:bg-v-gold hover:text-black shadow-[inset_0_0_10px_rgba(212,175,55,0.2)]'}`}
          title="Forçar Sincronização do Motor"
        >
          <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
        </button>

        <button 
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
          className="w-12 h-12 rounded-full bg-v-white-off/5 text-v-white-off hover:bg-[#d4af37]/20 hover:text-[#d4af37] border border-transparent hover:border-[#d4af37]/50 flex items-center justify-center transition-all"
          title="Abrir Terminal de Comando (Cmd+K)"
        >
          <Command size={18} />
        </button>

        <button 
          onClick={handleGenerateReport}
          disabled={isGeneratingReport}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all group relative ${
            isGeneratingReport ? 'bg-v-gold/50 text-black animate-pulse' : 'bg-[#d4af37] text-black hover:bg-white hover:text-black border border-[#d4af37]'
          }`}
          title="Download Dossiê CMO"
        >
          {isGeneratingReport ? <RefreshCw size={20} className="animate-spin" /> : <Download size={20} />}
          <span className="absolute bottom-full right-0 mb-4 px-3 py-1 bg-[#d4af37] text-black text-[0.55rem] font-bold uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-[0_0_15px_rgba(212,175,55,0.4)] pointer-events-none">
            Baixar Dossiê Estratégico (PDF)
          </span>
        </button>
      </div>

      {/* === MODAL DE RESPOSTA DA IA (TÁTICA SOB DEMANDA) COM EFEITO DE MINERAÇÃO === */}
      {(tacticalResult || isGeneratingTactics) && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="glass-panel max-w-2xl w-full p-8 border border-[#d4af37]/40 rounded-xl relative shadow-[0_0_80px_rgba(212,175,55,0.15)] bg-[#050505] max-h-[85vh] flex flex-col">
            {!isGeneratingTactics && (
              <button onClick={() => {setTacticalResult(null); setTacticalSource(null);}} className="absolute top-6 right-6 text-gray-400 hover:text-v-white-off transition-all"><X size={24} /></button>
            )}
            
            <div className="border-b border-white/10 pb-4 mb-6 shrink-0">
              <h2 className="font-abhaya text-3xl text-v-white-off flex items-center gap-3">
                <BrainCircuit className="text-[#d4af37]" /> Engenharia de Copy Elite
              </h2>
              <p className="font-montserrat text-[0.65rem] text-gray-500 uppercase tracking-widest mt-2 truncate">
                Target: {tacticalSource || "Interceptando sinal..."}
              </p>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {isGeneratingTactics ? (
                // EFEITO DE DATA MINING CINEMATOGRÁFICO
                <div className="flex flex-col items-center justify-center py-16 font-mono text-[#d4af37] text-xs">
                   <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                     [ DECODING MATRICES ]
                   </motion.div>
                   <div className="mt-6 h-20 overflow-hidden text-green-500/50 relative w-full max-w-xs text-center border-l-2 border-green-500/30 pl-4">
                     <motion.div animate={{ y: [0, -150] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="space-y-2">
                       <p>Analyzing competitor semantic structure...</p>
                       <p>Extracting emotional vectors (OCEAN)...</p>
                       <p>Bypassing heuristic filters...</p>
                       <p>Mapping Jobs-to-be-Done arrays...</p>
                       <p>Applying Cialdini Triggers...</p>
                       <p>Synthesizing lethal copy payload...</p>
                     </motion.div>
                     <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-[#050505] to-transparent"></div>
                   </div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none font-montserrat text-[0.85rem] text-gray-300 leading-relaxed
                  prose-headings:font-abhaya prose-headings:text-[#d4af37] prose-headings:tracking-wide
                  prose-strong:text-white prose-p:mb-4 prose-li:mb-2 prose-li:text-gray-400
                ">
                  <ReactMarkdown>
                    {tacticalResult || ""}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {!isGeneratingTactics && (
              <div className="pt-6 border-t border-white/10 mt-4 shrink-0 flex justify-end gap-3">
                 <button onClick={() => {setTacticalResult(null); setTacticalSource(null);}} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-widest transition-colors rounded-lg">Descartar</button>
                 <motion.button whileTap={{ scale: 0.95 }} onClick={() => {alert("Roteiro transferido para a prancheta."); navigator.clipboard.writeText(tacticalResult || "");}} className="px-6 py-3 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#b5952f] transition-colors rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-2">
                   Copiar Roteiro
                 </motion.button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === MODAL DE IA ANTIGO (CMO BRIEFING) === */}
      {aiBriefing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="glass-panel max-w-3xl w-full p-8 md:p-10 border border-[#d4af37]/40 rounded-xl relative shadow-[0_0_80px_rgba(212,175,55,0.15)] bg-black/90">
            <button onClick={() => setAiBriefing(null)} className="absolute top-6 right-6 text-gray-400 hover:text-v-white-off transition-all"><X size={24} /></button>
            <h2 className="font-abhaya text-3xl text-[#d4af37] mb-8 flex items-center gap-3 border-b border-[#d4af37]/10 pb-4"><BrainCircuit /> Tática de Guerrilha</h2>
            <div className="space-y-6 font-montserrat text-sm text-v-white-off">
              <div>
                <h4 className="text-[0.65rem] uppercase tracking-widest text-gray-500 mb-2">Gatilho Primário (Hook Letal)</h4>
                <p className="p-4 bg-white/5 border border-white/10 rounded-lg font-bold text-[#d4af37] text-lg tracking-wide shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                  &quot;{aiBriefing.hook}&quot;
                </p>
              </div>
              <div>
                <h4 className="text-[0.65rem] uppercase tracking-widest text-gray-500 mb-2">Mecânica Psicológica</h4>
                <p className="p-4 bg-white/5 border border-white/10 rounded-lg leading-relaxed text-gray-300">{aiBriefing.strategy}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[0.65rem] uppercase tracking-widest text-gray-500 mb-2">Formato Ideal</h4>
                  <p className="p-4 bg-white/5 border border-white/10 rounded-lg"><Activity size={14} className="inline mr-2 text-[#d4af37]" /> {aiBriefing.format}</p>
                </div>
                <div>
                  <h4 className="text-[0.65rem] uppercase tracking-widest text-gray-500 mb-2">Call to Action (CTA)</h4>
                  <p className="p-4 bg-white/5 border border-white/10 rounded-lg"><Zap size={14} className="inline mr-2 text-[#d4af37]" /> {aiBriefing.call_to_action}</p>
                </div>
              </div>
            </div>
            <div className="mt-10"><button onClick={() => setAiBriefing(null)} className="w-full py-4 bg-[#d4af37] text-black font-bold text-xs uppercase tracking-[0.1em] hover:bg-[#b5952f] rounded-lg transition-colors">Aprovar & Iniciar Produção</button></div>
          </div>
        </div>
      )}

      {/* === MODAL DE EDIÇÃO DE CLIENTE === */}
      {isEditClientModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="glass-panel w-full max-w-2xl bg-black/95 border border-[#d4af37]/40 rounded-xl relative shadow-[0_0_80px_rgba(212,175,55,0.2)] flex flex-col max-h-[90vh]">
            <button onClick={() => setIsEditClientModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-v-white-off hover:rotate-90 transition-all z-10"><X size={24} /></button>
            <div className="p-6 md:p-8 pb-4 shrink-0 border-b border-white/10">
              <h2 className="font-abhaya text-3xl text-v-white-off mb-2 flex items-center gap-3"><Edit3 className="text-[#d4af37]" /> Ajustar Calibração IA</h2>
              <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest">Atualize as referências para melhorar a escuta do Scout</p>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-[#d4af37]/20">
              <form className="space-y-5 font-montserrat">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Palavras-Chave (Para Melhorar o Scout)</label>
                  <textarea rows={3} value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm text-v-white-off focus:border-[#d4af37] outline-none" />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Concorrentes Diretos (Para a Arena)</label>
                  <textarea rows={2} value={formData.competitors} onChange={e => setFormData({...formData, competitors: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm text-v-white-off focus:border-[#d4af37] outline-none" />
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-end gap-4 mt-2">
                  <button type="button" onClick={() => setIsEditClientModalOpen(false)} className="px-6 py-3 text-xs font-bold text-gray-400 hover:text-v-white-off uppercase rounded-lg">Cancelar</button>
                  <button type="button" onClick={() => setIsEditClientModalOpen(false)} className="px-8 py-3 bg-[#d4af37] text-black text-xs font-bold uppercase hover:bg-[#b5952f] transition-colors rounded-lg">Salvar Ajustes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL DE NOVO CLIENTE === */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="glass-panel w-full max-w-2xl bg-black/95 border border-[#d4af37]/40 rounded-xl relative shadow-[0_0_80px_rgba(212,175,55,0.2)] flex flex-col max-h-[90vh]">
            <button onClick={() => setIsNewClientModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-v-white-off hover:rotate-90 transition-all z-10"><X size={24} /></button>
            <div className="p-6 md:p-8 pb-4 shrink-0 border-b border-white/10">
              <h2 className="font-abhaya text-3xl text-v-white-off mb-2 flex items-center gap-3"><Plus className="text-[#d4af37]" /> Adicionar Conta</h2>
              <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest">Ative um novo motor de inteligência</p>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-[#d4af37]/20">
              <form onSubmit={handleCreateClient} className="space-y-5 font-montserrat">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Nome da Marca</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm text-v-white-off focus:border-[#d4af37] outline-none transition-colors" placeholder="Ex: Lojas Renner" />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">@ do Instagram</label>
                    <input required type="text" value={formData.social_handle} onChange={e => setFormData({...formData, social_handle: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm text-v-white-off focus:border-[#d4af37] outline-none transition-colors" placeholder="Ex: @lojasrenner" />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">
  Nicho de Mercado
</label>
<select value={formData.niche} onChange={e => setFormData({ ...formData, niche: e.target.value })} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm text-gray-300 focus:border-[#d4af37] outline-none cursor-pointer">
  <optgroup label="Moda & Vestuário">
    <option value="Moda Feminina">Moda Feminina</option>
    <option value="Moda Masculina">Moda Masculina</option>
    <option value="Moda Fitness">Moda Fitness</option>
    <option value="Moda Infantil">Moda Infantil</option>
    <option value="Moda Plus Size">Moda Plus Size</option>
    <option value="Moda Praia">Moda Praia</option>
    <option value="Streetwear">Streetwear</option>
  </optgroup>
  <optgroup label="Beleza & Cosmética">
    <option value="Maquiagem Profissional">Maquiagem Profissional</option>
    <option value="Skincare">Skincare</option>
    <option value="Cabelos / Tricologia">Cabelos / Tricologia</option>
    <option value="Barbearia">Barbearia</option>
    <option value="Estética Facial">Estética Facial</option>
    <option value="Estética Corporal">Estética Corporal</option>
    <option value="Nail Designer">Nail Designer</option>
  </optgroup>
  <optgroup label="Educação & Infoprodutos">
    <option value="Cursos Online">Cursos Online</option>
    <option value="Mentoria">Mentoria</option>
    <option value="Preparatório (ENEM/Concursos)">Preparatório (ENEM/Concursos)</option>
    <option value="Idiomas">Idiomas</option>
    <option value="Educação Financeira">Educação Financeira</option>
    <option value="Marketing Digital">Marketing Digital</option>
    <option value="Programação & Tecnologia">Programação & Tecnologia</option>
  </optgroup>
  <optgroup label="Serviços Profissionais">
    <option value="Advocacia">Advocacia</option>
    <option value="Contabilidade">Contabilidade</option>
    <option value="Consultoria Empresarial">Consultoria Empresarial</option>
    <option value="Design Gráfico">Design Gráfico</option>
    <option value="Web Design">Web Design</option>
    <option value="Social Media">Social Media</option>
    <option value="Copywriting">Copywriting</option>
  </optgroup>
  <optgroup label="Saúde & Bem-estar">
    <option value="Personal Trainer">Personal Trainer</option>
    <option value="Nutrição">Nutrição</option>
    <option value="Psicologia">Psicologia</option>
    <option value="Fisioterapia">Fisioterapia</option>
    <option value="Terapias Alternativas">Terapias Alternativas</option>
  </optgroup>
  <optgroup label="Outros Negócios">
    <option value="Restaurantes & Alimentação">Restaurantes & Alimentação</option>
    <option value="Delivery">Delivery</option>
    <option value="E-commerce Geral">E-commerce Geral</option>
    <option value="Dropshipping">Dropshipping</option>
    <option value="Afiliados">Afiliados</option>
  </optgroup>
</select>
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Personas Alvo</label>
                  <textarea required rows={2} value={formData.personas} onChange={e => setFormData({...formData, personas: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm text-v-white-off focus:border-[#d4af37] outline-none transition-colors resize-none" placeholder="Ex: Jovem Geração Z, Mãe Corporativa" />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Palavras-Chave (Scout)</label>
                  <textarea required rows={2} value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm text-v-white-off focus:border-[#d4af37] outline-none transition-colors resize-none" placeholder="Ex: alfaiataria feminina, moda inverno" />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Concorrentes Diretos</label>
                  <textarea required rows={2} value={formData.competitors} onChange={e => setFormData({...formData, competitors: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm text-v-white-off focus:border-[#d4af37] outline-none transition-colors resize-none" placeholder="Ex: @zara_brasil, @cea_brasil" />
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-end gap-4 mt-2 shrink-0">
                  <button type="button" onClick={() => setIsNewClientModalOpen(false)} className="px-6 py-3 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors rounded-lg">Cancelar</button>
                  <button type="submit" disabled={isCreatingTenant} className="px-8 py-3 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#b5952f] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50 rounded-lg">{isCreatingTenant ? "Ativando..." : "Cadastrar"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          O PAPEL TIMBRADO (RENDERIZADO APENAS PARA PDF)
      ========================================== */}
      {reportData && (
        <div className="absolute top-0 left-0 opacity-0 pointer-events-none w-full flex justify-center z-[-9999] overflow-hidden">
          <div id="vrtice-pdf-report" className="w-[210mm] bg-[#020617] text-v-white-off font-montserrat p-12 box-border relative min-h-[297mm]">
            <div className="absolute top-0 left-0 w-full h-[5px] bg-[#d4af37]"></div>
            <div className="absolute bottom-0 left-0 w-full h-[5px] bg-[#d4af37]"></div>
            <div className="absolute top-12 right-12 opacity-5"><Target size={250} className="text-[#d4af37]" /></div>
            
            <div className="border-b border-[#d4af37]/30 pb-6 mb-10 flex justify-between items-end relative z-10">
              <div>
                <h1 className="font-abhaya text-4xl text-[#d4af37] tracking-widest uppercase">V R T I C E</h1>
                <p className="text-[0.6rem] text-gray-500 uppercase tracking-[0.3em] mt-1">Intelligence Division • Orion System</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-widest">Dossiê Estratégico CMO</p>
                <p className="text-sm text-v-white-off font-bold mt-1 uppercase tracking-wider">{reportData.client_name}</p>
                <p className="text-[0.6rem] text-[#d4af37] mt-1 tracking-widest">Emitido em: {reportData.date}</p>
              </div>
            </div>

            <div className="prose prose-invert max-w-none relative z-10
              prose-headings:font-abhaya prose-headings:text-[#d4af37] prose-headings:tracking-wide
              prose-h2:text-3xl prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-3 prose-h2:mt-10
              prose-h3:text-xl prose-h3:text-white prose-h3:mt-6
              prose-p:text-[0.85rem] prose-p:leading-relaxed prose-p:text-gray-300 prose-p:text-justify
              prose-li:text-[0.85rem] prose-li:text-gray-300 prose-li:my-1
              prose-strong:text-white prose-strong:font-bold
              prose-blockquote:border-l-[#d4af37] prose-blockquote:bg-white/5 prose-blockquote:p-4 prose-blockquote:italic
            ">
              <ReactMarkdown>
                {reportData.content_md}
              </ReactMarkdown>
            </div>

            <div className="mt-16 pt-6 border-t border-white/10 text-center relative z-10">
               <p className="text-[0.55rem] text-gray-600 uppercase tracking-[0.4em]">Documento Confidencial • Propriedade Intelectual VRTICE Agency</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// COMPONENTES AUXILIARES
function MetricBox({ title, value, trend, isPositive, icon, isLoading = false }: { title: string, value: string | undefined, trend: string, isPositive: boolean, icon: React.ReactNode, isLoading?: boolean }) {
  return (
    <div className="glass-panel p-5 border border-white/5 rounded-xl flex flex-col justify-between h-32 bg-black/40 hover:border-[#d4af37]/30 transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.05)]">
      <div className="flex justify-between items-start">
        <p className="font-montserrat text-[0.6rem] uppercase tracking-widest text-gray-500">{title}</p>
        <div className="text-[#d4af37] opacity-50">{icon}</div>
      </div>
      <div>
        <div className="font-abhaya text-3xl font-bold text-v-white-off mb-1">{isLoading ? "---" : (value || "0")}</div>
        <div className={`text-[0.65rem] font-bold uppercase tracking-widest flex items-center gap-1 ${isLoading ? 'text-gray-500' : isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {!isLoading && (isPositive ? <TrendingUp size={10} /> : <Activity size={10} />)} {isLoading ? "Calculando..." : trend}
        </div>
      </div>
    </div>
  );
}

function TrendItem({ rank, topic, category, heat, onZap }: { rank: number, topic: string, category: string, heat: string, onZap: () => void }) {
  return (
    <motion.div whileHover={{ x: 4 }} className="flex items-center gap-3 p-3 bg-black/60 border-b border-white/5 hover:border-[#d4af37]/50 hover:bg-white/5 transition-all group rounded-lg mb-2 shadow-sm">
      <div className="w-6 h-6 flex shrink-0 items-center justify-center font-abhaya text-sm font-bold text-gray-600 group-hover:text-[#d4af37] group-hover:shadow-[0_0_10px_rgba(212,175,55,0.5)] rounded-full border border-transparent group-hover:border-[#d4af37]/30 transition-all">{rank}</div>
      
      <div className="flex-1 min-w-0 pr-2">
        <p className="font-montserrat text-xs font-bold text-gray-300 group-hover:text-v-white-off transition-colors truncate" title={topic}>{topic}</p>
        <p className="font-montserrat text-[0.55rem] text-gray-500 uppercase tracking-widest mt-1 truncate">{category}</p>
      </div>
      
      <div className={`shrink-0 text-[0.55rem] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${heat === 'Extremo' ? 'bg-red-500/10 text-red-400 border-red-500/30' : heat === 'Estudo' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : heat === 'Alto' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
        {heat}
      </div>

      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={onZap}
        className="shrink-0 p-2 bg-[#d4af37]/10 text-[#d4af37] rounded-md hover:bg-[#d4af37] hover:text-black transition-all shadow-[0_0_10px_rgba(212,175,55,0)] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] ml-1"
        title="Acionar Engenharia de Copy"
      >
        <Zap size={14} />
      </motion.button>
    </motion.div>
  );
}
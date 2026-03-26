"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, Users, Target, Activity, Zap, Flame, Crosshair, 
  ArrowUpDown, Filter, Search, Eye, Heart, Bookmark, Swords, 
  Trophy, BrainCircuit, Radar, MessageCircle, PenTool, X, Plus, 
  Settings, Edit3, ShieldAlert, RefreshCw, Terminal, Layout, 
  Download, FileText, Command, ChevronLeft, ChevronRight,
  Fingerprint, Hexagon, ScanEye, Compass, Clapperboard, Magnet // Novos Ícones dos 6 Pilares
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
  const [isActionDockOpen, setIsActionDockOpen] = useState(false);

  // === ESTADO DOS 6 PILARES DE WALL STREET ===
  const [activePillar, setActivePillar] = useState<number | null>(null);

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

  // === FASE 4: OUVINTE DO TERMINAL OMNISCIENTE (Cmd+K / Ctrl+K) ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
      // Atalho de segurança para fechar terminal
      if (e.key === 'Escape' && isTerminalOpen) {
        setIsTerminalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTerminalOpen]);

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

  // === MOTOR DE CARREGAMENTO BLINDADO ===
  useEffect(() => {
    let isCurrentTenant = true; // Flag de segurança contra Race Conditions

    async function loadDashboardOverview() {
      if (!tenantInfo?.id || tenantInfo.id <= 0) return;
      
      // Limpa a memória fantasma imediatamente
      setIsLoadingDashboard(true);
      setDashboardData(null);
      setPosts([]);
      setSelectedCompetitorIdx(0); 

      try {
        const token = localStorage.getItem("orion_token");
        const res = await fetch(`${API_URL}/api/dashboard/${tenantInfo.id}/overview`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if(res.ok) {
           const data = await res.json();
           
           if (isCurrentTenant) {
             setDashboardData(data);
             setPosts(data.posts || []);
           }
        }
      } catch (error) {
        if (isCurrentTenant) {
          console.error("Falha ao puxar dados do Dashboard", error);
        }
      } finally {
        if (isCurrentTenant) {
          setIsLoadingDashboard(false);
        }
      }
    }

    loadDashboardOverview();

    return () => {
      isCurrentTenant = false;
    };
  }, [tenantInfo?.id]);

  // ========================================================================
  // 🚀 MÓDULO DE IGNIÇÃO DO MOTOR (MANUAL E AUTOMÁTICO)
  // ========================================================================
  const handleStartEngine = async (isAuto = false) => {
    if (!tenantInfo || tenantInfo.id <= 0) {
      if (!isAuto) alert("Selecione um cliente real para sincronizar.");
      return;
    }
    
    if (!isAuto) setIsSyncing(true);
    
    try {
      const token = localStorage.getItem("orion_token");
      const res = await fetch(`${API_URL}/api/workers/force-sync/${tenantInfo.id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("O servidor Render recusou o disparo.");
      
      if (!isAuto) {
        alert("⚡ CASCATA OSINT ACIONADA! Os robôs estão varrendo a web agora mesmo. O painel recarregará em 60s para mostrar os primeiros resultados.");
        setTimeout(() => { window.location.reload(); }, 60000);
      } else {
        console.log(`[ORION AUTO-BOOT] Motores de raspagem acionados silenciosamente para: ${tenantInfo.name}`);
      }
      
    } catch (error) {
      console.error("Falha no disparo do motor:", error);
      if (!isAuto) alert("⚠️ Erro de comunicação. Verifique se o backend no Render está online.");
    } finally {
      if (!isAuto) setIsSyncing(false);
    }
  };

  // O GATILHO DE LOGIN (Auto-Atualização)
  useEffect(() => {
    if (!tenantInfo?.id || tenantInfo.id <= 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    const syncKey = `orion_autosync_${tenantInfo.id}_${today}`;
    
    if (!sessionStorage.getItem(syncKey)) {
      handleStartEngine(true); 
      sessionStorage.setItem(syncKey, "true");
    }
  }, [tenantInfo?.id]);

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
      alert(`[Orion Command Executed]: ${terminalInput}\nConectando aos agentes neuro-semânticos...`);
      setTerminalInput("");
      setIsTerminalOpen(false);
    }
  };

  const currentCompetitor = dashboardData?.arena?.[selectedCompetitorIdx] || null;

  // Definição Estrutural dos 6 Pilares de Wall Street
  const PILLARS = [
    { id: 1, name: "O Antropólogo", icon: Fingerprint, color: "text-purple-400", bgHover: "hover:bg-purple-500/10" },
    { id: 2, name: "Arquiteto Brand", icon: Hexagon, color: "text-[#d4af37]", bgHover: "hover:bg-[#d4af37]/10" },
    { id: 3, name: "Auditor Espião", icon: ScanEye, color: "text-red-400", bgHover: "hover:bg-red-500/10" },
    { id: 4, name: "Oráculo Alpha", icon: Compass, color: "text-blue-400", bgHover: "hover:bg-blue-500/10" },
    { id: 5, name: "O Showrunner", icon: Clapperboard, color: "text-orange-400", bgHover: "hover:bg-orange-500/10" },
    { id: 6, name: "A Máquina", icon: Magnet, color: "text-green-400", bgHover: "hover:bg-green-500/10" },
  ];

  return (
    // NO-SCROLL CONTAINER: A tela é fixa, apenas o painel central rola
    <div className={`relative h-full w-full overflow-hidden flex ${activeTheme === 'navy' ? 'theme-navy' : ''}`}>
      
      {/* === A DOCA FLUTUANTE DOS 6 PILARES (THE SPIRE) === */}
      <div className="hidden lg:flex flex-col items-center py-6 px-3 border-r border-white/5 bg-black/60 backdrop-blur-md z-40 relative">
        <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-[#d4af37]/30 to-transparent"></div>
        <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/40 flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer hover:scale-110 transition-transform">
          <BrainCircuit size={16} className="text-[#d4af37]" />
        </div>
        
        <div className="flex flex-col gap-6 flex-1 mt-4">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isActive = activePillar === pillar.id;
            return (
              <motion.button
                key={pillar.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActivePillar(isActive ? null : pillar.id)}
                className={`relative group p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]' : pillar.bgHover}`}
                title={pillar.name}
              >
                <Icon size={20} className={`${pillar.color} ${isActive ? 'drop-shadow-[0_0_8px_currentColor]' : 'opacity-50 group-hover:opacity-100'}`} />
                {isActive && <motion.div layoutId="pillarIndicator" className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#d4af37] rounded-r-md shadow-[0_0_10px_rgba(212,175,55,0.8)]" />}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* === O PALCO CENTRAL (SCROLLÁVEL) === */}
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-6 lg:p-10 relative">
        <div className="max-w-[1600px] mx-auto space-y-8 pb-32">
          
          {/* 1. BARRA DE COMANDO GLOBAL & SPLIT VIEW */}
          <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-v-white-off/10 pb-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-red-500 animate-ping' : 'bg-green-500 animate-pulse'} shadow-[0_0_10px_#22c55e]`}></span>
                <span className="font-montserrat text-[0.65rem] text-[#d4af37] uppercase tracking-widest border border-[#d4af37]/30 px-2 py-1 bg-[#d4af37]/10 rounded-md shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                  {isSyncing ? "Cascata Tática Acionada" : "Growth OS Ativo"}
                </span>
              </div>
              <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-v-white-off tracking-wide drop-shadow-md">
                Centro de <span className="text-[#d4af37]">Comando</span>
              </h1>
              
              {/* Roteador de Visão */}
              <div className="flex bg-black/60 border border-white/5 rounded-lg p-1 mt-6 w-max shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md">
                <button onClick={() => {setViewMode('cockpit'); setActivePillar(null);}} className={`px-5 py-2 text-[0.7rem] font-montserrat font-bold uppercase tracking-widest transition-all rounded-md flex items-center gap-2 ${viewMode === 'cockpit' && !activePillar ? 'bg-white/10 text-v-white-off shadow-[0_0_10px_rgba(255,255,255,0.1)]' : 'text-gray-500 hover:text-gray-300'}`}>
                  <Activity size={14}/> God Mode
                </button>
                <button onClick={() => {setViewMode('activation'); setActivePillar(null);}} className={`px-5 py-2 text-[0.7rem] font-montserrat font-bold uppercase tracking-widest transition-all rounded-md flex items-center gap-2 ${viewMode === 'activation' && !activePillar ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}>
                  <Flame size={14}/> Sales Activation
                </button>
                <button onClick={() => {setViewMode('branding'); setActivePillar(null);}} className={`px-5 py-2 text-[0.7rem] font-montserrat font-bold uppercase tracking-widest transition-all rounded-md flex items-center gap-2 ${viewMode === 'branding' && !activePillar ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}>
                  <Target size={14}/> Brand Building
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
              {viewMode === 'activation' && !activePillar && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex bg-black/40 border border-white/10 rounded-lg p-1 shadow-lg">
                  <button onClick={() => setTimeFilter('7d')} className={`px-4 py-1.5 text-[0.65rem] font-montserrat font-bold uppercase tracking-widest transition-colors rounded-md ${timeFilter === '7d' ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'}`}>7 Dias</button>
                  <button onClick={() => setTimeFilter('30d')} className={`px-4 py-1.5 text-[0.65rem] font-montserrat font-bold uppercase tracking-widest transition-colors rounded-md ${timeFilter === '30d' ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'}`}>30 Dias</button>
                  <button onClick={() => setTimeFilter('ytd')} className={`px-4 py-1.5 text-[0.65rem] font-montserrat font-bold uppercase tracking-widest transition-colors rounded-md ${timeFilter === 'ytd' ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'}`}>YTD</button>
                </motion.div>
              )}
              
              <div className="flex items-center gap-3 bg-black/60 border border-white/10 p-2 rounded-xl backdrop-blur-xl relative group shadow-2xl">
                <div className="w-10 h-10 bg-black/80 rounded-lg flex items-center justify-center font-abhaya text-[#d4af37] text-xl border border-[#d4af37]/40 shadow-[inset_0_0_15px_rgba(212,175,55,0.3)] group-hover:shadow-[inset_0_0_25px_rgba(212,175,55,0.5)] transition-all">
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
                  <motion.button whileTap={{ scale: 0.95 }} onClick={toggleTenant} className="px-3 py-2 text-[0.65rem] font-bold text-black bg-[#d4af37] uppercase tracking-widest hover:bg-[#b5952f] transition-colors rounded-md shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_20px_rgba(212,175,55,0.6)]">
                    Trocar
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsNewClientModalOpen(true)} className="px-3 py-2 text-[0.65rem] font-bold text-[#d4af37] bg-black border border-[#d4af37] uppercase tracking-widest hover:bg-[#d4af37]/10 transition-colors rounded-md flex items-center gap-1">
                    <Plus size={12} /> Novo
                  </motion.button>
                </div>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            
            {/* === RENDER DOS 6 PILARES (SOBREPOSIÇÃO MAGNÉTICA) === */}
            {activePillar !== null && (
              <motion.div 
                key={`pillar-${activePillar}`} 
                initial={{ opacity: 0, y: 20, scale: 0.98 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: -20, scale: 0.98 }} 
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="glass-panel w-full min-h-[600px] bg-black/80 border border-[#d4af37]/20 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"></div>
                <div className="absolute right-0 top-0 p-12 opacity-5 pointer-events-none">
                  {activePillar === 1 && <Fingerprint size={300} />}
                  {activePillar === 2 && <Hexagon size={300} />}
                  {activePillar === 3 && <ScanEye size={300} />}
                  {activePillar === 4 && <Compass size={300} />}
                  {activePillar === 5 && <Clapperboard size={300} />}
                  {activePillar === 6 && <Magnet size={300} />}
                </div>

                <div className="relative z-10 flex flex-col h-full items-center justify-center text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="mb-8 opacity-20">
                    <BrainCircuit size={80} className="text-[#d4af37]" />
                  </motion.div>
                  <h2 className="font-abhaya text-4xl text-[#d4af37] tracking-wide mb-4">
                    {PILLARS.find(p => p.id === activePillar)?.name}
                  </h2>
                  <p className="font-montserrat text-sm text-gray-400 max-w-lg leading-relaxed mb-8">
                    Módulo em calibração neuro-semântica. O motor do {PILLARS.find(p => p.id === activePillar)?.name} está sendo integrado ao Córtex Central para fornecer insights em tempo real na próxima atualização.
                  </p>
                  <button onClick={() => setActivePillar(null)} className="px-8 py-3 bg-white/5 border border-white/10 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/10 text-[#d4af37] text-xs font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg">
                    Retornar ao Cockpit
                  </button>
                </div>
              </motion.div>
            )}

            {/* ===================== COCKPIT VIEW ===================== */}
            {viewMode === 'cockpit' && activePillar === null && (
              <motion.div key="cockpit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricBox isLoading={isLoadingDashboard} title="Crescimento (Followers)" value={dashboardData?.kpis?.followers?.toLocaleString('pt-BR')} trend={dashboardData?.kpis?.delta_followers >= 0 ? `+${dashboardData?.kpis?.delta_followers} diário` : `${dashboardData?.kpis?.delta_followers} diário`} isPositive={dashboardData?.kpis?.delta_followers >= 0} icon={<Users size={16} />} />
                  <MetricBox isLoading={isLoadingDashboard} title="Taxa Média Engajamento" value={`${dashboardData?.kpis?.avg_engagement || 0}%`} trend="Orgânico" isPositive={true} icon={<Heart size={16} />} />
                  <MetricBox isLoading={isLoadingDashboard} title="Alcance Global (Est.)" value={dashboardData?.kpis?.total_reach?.toLocaleString('pt-BR')} trend="Em alta" isPositive={true} icon={<Eye size={16} />} />
                  <MetricBox isLoading={isLoadingDashboard} title="Tração (Saves)" value={dashboardData?.kpis?.total_saves?.toLocaleString('pt-BR')} trend="Retenção" isPositive={true} icon={<Bookmark size={16} />} />
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 glass-panel p-8 border border-white/5 rounded-xl relative overflow-hidden bg-black/40 shadow-xl group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Target size={120} /></div>
                    <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                      <Trophy size={14} className="text-[#d4af37]" /> Domínio de Mercado (Milestone)
                    </h3>
                    <div className="flex justify-between items-end mb-2 relative z-10">
                      <div>
                        <p className="font-abhaya text-4xl font-bold text-v-white-off">
                          {isLoadingDashboard ? "---" : dashboardData?.gamification?.target?.toLocaleString('pt-BR')} <span className="text-lg text-gray-500 font-montserrat">Seguidores</span>
                        </p>
                        <p className="font-montserrat text-xs text-[#d4af37] mt-1">Faltam {isLoadingDashboard ? "---" : dashboardData?.gamification?.remaining?.toLocaleString('pt-BR')} para o Marco</p>
                      </div>
                      <p className="font-montserrat text-3xl font-bold text-v-white-off drop-shadow-md">{isLoadingDashboard ? "0" : dashboardData?.gamification?.percent}%</p>
                    </div>
                    <div className="w-full h-3 bg-black/80 border border-white/10 rounded-full mt-4 overflow-hidden relative z-10 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                      <div 
                        className="h-full bg-gradient-to-r from-gray-700 via-[#c8a970] to-[#FFE5A3] relative shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all duration-1000"
                        style={{ width: `${dashboardData?.gamification?.percent || 0}%` }}
                      >
                        <div className="absolute top-0 right-0 w-2 h-full bg-white/80 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel p-8 border border-red-500/30 rounded-xl relative bg-gradient-to-b from-transparent to-red-900/10 flex flex-col justify-between shadow-[inset_0_0_50px_rgba(239,68,68,0.05)] hover:border-red-500/50 transition-colors">
                    <div>
                      <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-red-400 mb-4 flex items-center gap-2">
                        <ShieldAlert size={14} /> Intervenção Crítica (IA)
                      </h3>
                      <p className="font-montserrat text-[0.85rem] text-gray-300 leading-relaxed">
                        {isLoadingDashboard ? "Sincronizando com o cérebro central..." : dashboardData?.intervencao}
                      </p>
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleIAAdjustment} className="w-full mt-4 py-3 border border-red-500/50 text-red-400 font-montserrat text-[0.65rem] uppercase tracking-widest hover:bg-red-500/20 transition-colors font-bold flex justify-center items-center gap-2 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                      <Zap size={14} /> Aplicar Ajuste de Rota
                    </motion.button>
                  </div>
                </section>
              </motion.div>
            )}

            {/* ===================== SALES ACTIVATION VIEW ===================== */}
            {viewMode === 'activation' && activePillar === null && (
              <motion.div key="activation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  
                  {/* ARENA (Topologia Simulada) */}
                  <div className="glass-panel border border-red-500/20 rounded-xl flex flex-col h-full min-h-[350px] bg-black/40 relative overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.05)] hover:border-red-500/40 transition-colors">
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
                      
                      <div className="flex-1 flex items-center justify-center relative my-4">
                         <div className="absolute w-32 h-32 rounded-full border border-red-500/20 animate-ping"></div>
                         <div className="absolute w-24 h-24 rounded-full border border-red-500/40 animate-pulse"></div>
                         <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400 font-abhaya text-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] z-10 backdrop-blur-sm">
                            {currentCompetitor?.frequency?.split('x')[0] || "!"}x
                         </div>
                      </div>

                      <div className="mt-auto">
                        <div className="flex justify-between text-[0.65rem] font-montserrat mb-2">
                          <span className="text-v-white-off">Nós: <strong className="text-green-400 drop-shadow-md">{dashboardData?.kpis?.avg_engagement || 0}%</strong></span>
                          <span className="text-gray-400">Eles: <strong className="text-red-400 drop-shadow-md">{currentCompetitor?.engagement || 0}%</strong></span>
                        </div>
                        <div className="w-full h-2 bg-black/80 rounded-full overflow-hidden border border-white/5 flex shadow-inner">
                          <div className="h-full bg-green-500 transition-all shadow-[0_0_10px_#22c55e]" style={{ width: `50%` }}></div>
                          <div className="h-full bg-red-500 transition-all opacity-50 shadow-[0_0_10px_#ef4444]" style={{ width: `50%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ARSENAL & ESTRATÉGIA CMO */}
                  <div className="flex flex-col gap-6 h-full min-h-[350px]">
                    <div className="glass-panel border border-white/10 rounded-xl flex flex-col flex-1 overflow-hidden min-h-[200px] bg-black/40 hover:border-white/20 transition-all shadow-xl">
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
                            <div key={i} className="group cursor-pointer border-b border-white/5 pb-2 hover:bg-white/5 rounded px-2 transition-all">
                              <p className="font-abhaya text-sm text-gray-400 group-hover:text-v-white-off transition-colors">"{item.hook}"</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 font-montserrat mt-2 text-center">Nenhum gancho mapeado.</p>
                        )}
                      </div>
                    </div>

                    <div className="glass-panel border border-red-500/30 rounded-xl flex flex-col bg-red-500/5 relative overflow-hidden shrink-0 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                      <div className="p-4 border-b border-red-500/10 relative z-10 bg-black/60">
                        <h3 className="font-montserrat text-[0.6rem] font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2"><Crosshair size={12} className="text-red-500" /> Tática de Guerrilha</h3>
                      </div>
                      <div className="flex-1 p-5 flex flex-col justify-center items-center text-center relative z-10">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={handleGenerateBriefing} disabled={isGenerating || isLoadingDashboard} className="w-full py-4 bg-red-600 text-white font-montserrat text-[0.65rem] font-bold uppercase tracking-[0.15em] hover:bg-red-500 transition-all shadow-[0_0_25px_rgba(239,68,68,0.5)] disabled:opacity-70 flex justify-center items-center gap-2 rounded-lg">
                          {isGenerating ? <><Activity size={14} className="animate-spin" /> Sintetizando...</> : "Gerar Ataque de Vendas"}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="glass-panel border border-white/10 rounded-xl overflow-hidden bg-black/40 shadow-2xl">
                  <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-black/60">
                    <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
                      <TrendingUp size={14} className="text-[#d4af37]" /> Matriz Analítica de Postagens
                    </h3>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="relative w-full md:w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="text" placeholder="Buscar legenda..." className="w-full bg-black/80 border border-white/20 rounded-md py-2 pl-9 pr-4 text-xs font-montserrat text-v-white-off outline-none focus:border-[#d4af37] transition-colors shadow-inner" />
                      </div>
                      <button className="p-2 border border-white/20 rounded-md hover:border-[#d4af37] text-gray-400 hover:text-[#d4af37] transition-colors bg-black/50">
                        <Filter size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto min-h-[250px] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-black/80 border-b border-white/10 font-montserrat text-[0.65rem] uppercase tracking-widest text-gray-500">
                          <th className="p-4 font-medium cursor-pointer hover:text-[#d4af37] transition-colors" onClick={() => handleSort('date')}>Data <ArrowUpDown size={12} className="inline" /></th>
                          <th className="p-4 font-medium">Formato</th>
                          <th className="p-4 font-medium min-w-50">Resumo da Legenda</th>
                          <th className="p-4 font-medium cursor-pointer hover:text-[#d4af37] transition-colors" onClick={() => handleSort('reach')}><Eye size={12} className="inline"/> Alcance</th>
                          <th className="p-4 font-medium cursor-pointer hover:text-[#d4af37] transition-colors" onClick={() => handleSort('engagement')}><Heart size={12} className="inline"/> Engaj.</th>
                          <th className="p-4 font-medium cursor-pointer hover:text-[#d4af37] transition-colors" onClick={() => handleSort('saves')}><Bookmark size={12} className="inline"/> Saves</th>
                          <th className="p-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="font-montserrat text-sm">
                        {isLoadingDashboard ? (
                          <tr><td colSpan={7} className="p-8 text-center text-[#d4af37] text-xs font-mono animate-pulse">Sincronizando banco de dados...</td></tr>
                        ) : filteredAndSortedPosts.length > 0 ? (
                          filteredAndSortedPosts.map((post) => (
                            <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                              <td className="p-4 text-gray-400 text-xs">{post.date}</td>
                              <td className="p-4"><span className={`text-[0.6rem] uppercase tracking-widest px-2 py-1 rounded-md border ${post.type?.includes('Reels') || post.type?.includes('Video') ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'}`}>{post.type}</span></td>
                              <td className="p-4 text-v-white-off truncate max-w-xs group-hover:text-white transition-colors">{post.hook}</td>
                              <td className="p-4 text-gray-300">{post.reach?.toLocaleString('pt-BR')}</td>
                              <td className="p-4 text-[#d4af37] font-bold drop-shadow-md">{post.engagement}%</td>
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
            {viewMode === 'branding' && activePillar === null && (
              <motion.div key="branding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                {/* RADAR DE PERSONA */}
                <div className="glass-panel border border-[#d4af37]/20 rounded-xl flex flex-col h-full min-h-[400px] bg-black/40 shadow-[0_0_40px_rgba(212,175,55,0.05)] hover:border-[#d4af37]/40 transition-colors">
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
                          const isPain = insight.category.toLowerCase().includes('dor') || insight.category.toLowerCase().includes('obje');
                          const heatColor = isPain ? 'border-red-500/50 bg-red-500/10 text-red-200 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]' : 'border-blue-500/50 bg-blue-500/10 text-blue-200 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]';
                          
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
                <div className="glass-panel border border-white/10 rounded-xl flex flex-col h-full min-h-[400px] bg-black/40 shadow-2xl hover:border-white/20 transition-colors">
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
                          className={`px-3 py-1.5 text-[0.55rem] font-montserrat font-bold uppercase tracking-widest rounded-md transition-colors border ${radarFilter === f ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-black/80 text-gray-400 border-white/10 hover:border-[#d4af37]/50'}`}
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
        </div>
      </div>

      {/* === FASE 4: TERMINAL SANDBOX (CMD+K) (SPOTLIGHT BLUR) === */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }} 
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }} 
            className="fixed inset-0 z-[999] flex items-start justify-center pt-[20vh] bg-black/80"
          >
            <motion.div 
              initial={{ scale: 0.95, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-[90%] max-w-3xl"
            >
              <div className="bg-[#050505] border border-[#d4af37]/50 rounded-2xl shadow-[0_0_80px_rgba(212,175,55,0.25)] overflow-hidden flex items-center p-3 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/5 to-transparent pointer-events-none"></div>
                <Terminal size={24} className="text-[#d4af37] ml-4 shrink-0 relative z-10" />
                <form onSubmit={handleTerminalSubmit} className="w-full relative z-10">
                  <input 
                    autoFocus
                    type="text" 
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Orion OS Command (Ex: /auditar @zara_brasil)..." 
                    className="w-full bg-transparent border-none outline-none text-v-white-off font-mono text-lg px-5 py-4 placeholder:text-gray-600"
                  />
                </form>
                <div className="flex items-center gap-2 mr-4 shrink-0 opacity-50 relative z-10">
                  <kbd className="bg-white/10 px-2 py-1 rounded text-[0.6rem] font-mono text-white border border-white/20">ESC</kbd>
                  <span className="text-[0.6rem] text-white uppercase tracking-widest">fechar</span>
                </div>
              </div>
              <div className="mt-4 px-6 flex items-center justify-between text-[0.65rem] text-gray-500 uppercase tracking-widest font-bold">
                <span>Atalhos Imediatos: /gerar-vsl, /analisar-funil, /scout-reddit</span>
                <span>Powered by Gemini Córtex</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === BARRA DE FERRAMENTAS FLUTUANTE (ACTION DOCK RETRÁTIL) === */}
      <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3">
        <AnimatePresence>
          {isActionDockOpen && (
            <motion.div 
              initial={{ opacity: 0, x: 50, scale: 0.8 }} 
              animate={{ opacity: 1, x: 0, scale: 1 }} 
              exit={{ opacity: 0, x: 50, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex items-center gap-2 p-2 bg-black/80 backdrop-blur-xl border border-[#d4af37]/30 rounded-full shadow-[0_0_40px_rgba(212,175,55,0.2)]"
            >
              <button 
                onClick={() => handleStartEngine(false)}
                disabled={isSyncing}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${isSyncing ? 'bg-red-500/20 text-red-500' : 'bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37] hover:text-black shadow-[inset_0_0_10px_rgba(212,175,55,0.2)]'}`}
                title="Forçar Sincronização do Motor"
              >
                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
              </button>

              <button 
                onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 text-white hover:bg-[#d4af37]/20 hover:text-[#d4af37] border border-transparent hover:border-[#d4af37]/50 flex items-center justify-center transition-all"
                title="Abrir Terminal de Comando (Cmd+K)"
              >
                <Command size={18} />
              </button>

              <button 
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all group relative ${
                  isGeneratingReport ? 'bg-[#d4af37]/50 text-black animate-pulse' : 'bg-[#d4af37] text-black hover:bg-white hover:text-black border border-[#d4af37]'
                }`}
                title="Download Dossiê CMO"
              >
                {isGeneratingReport ? <RefreshCw size={18} className="animate-spin" /> : <Download size={18} />}
                <span className="absolute bottom-full right-0 mb-4 px-3 py-1 bg-[#d4af37] text-black text-[0.55rem] font-bold uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-[0_0_15px_rgba(212,175,55,0.4)] pointer-events-none">
                  Baixar Dossiê Estratégico
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsActionDockOpen(!isActionDockOpen)}
          className="w-12 h-12 rounded-full bg-[#050505] border border-[#d4af37]/50 text-[#d4af37] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:bg-[#d4af37] hover:text-black transition-all z-[101]"
          title={isActionDockOpen ? "Recolher Painel" : "Painel de Comando Rápido"}
        >
          {isActionDockOpen ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
        </motion.button>
      </div>
      
      {/* === MODAL DE RESPOSTA DA IA === */}
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
            <div className="mt-10"><button onClick={() => setAiBriefing(null)} className="w-full py-4 bg-[#d4af37] text-black font-bold text-xs uppercase tracking-[0.1em] hover:bg-[#b5952f] rounded-lg transition-colors shadow-[0_0_15px_rgba(212,175,55,0.4)]">Aprovar & Iniciar Produção</button></div>
          </div>
        </div>
      )}

      {/* === MODAL DE EDIÇÃO DE CLIENTE === */}
      {isEditClientModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="glass-panel w-full max-w-2xl bg-[#050505] border border-[#d4af37]/40 rounded-xl relative shadow-[0_0_80px_rgba(212,175,55,0.2)] flex flex-col max-h-[90vh]">
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
                  <button type="button" onClick={() => setIsEditClientModalOpen(false)} className="px-8 py-3 bg-[#d4af37] text-black text-xs font-bold uppercase hover:bg-[#b5952f] transition-colors rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.4)]">Salvar Ajustes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL DE NOVO CLIENTE === */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="glass-panel w-full max-w-2xl bg-[#050505] border border-[#d4af37]/40 rounded-xl relative shadow-[0_0_80px_rgba(212,175,55,0.2)] flex flex-col max-h-[90vh]">
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
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm text-v-white-off focus:border-[#d4af37] outline-none transition-colors shadow-inner" placeholder="Ex: Lojas Renner" />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">@ do Instagram</label>
                    <input required type="text" value={formData.social_handle} onChange={e => setFormData({...formData, social_handle: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm text-v-white-off focus:border-[#d4af37] outline-none transition-colors shadow-inner" placeholder="Ex: @lojasrenner" />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Nicho de Mercado</label>
                  <select value={formData.niche} onChange={e => setFormData({ ...formData, niche: e.target.value })} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm text-gray-300 focus:border-[#d4af37] outline-none cursor-pointer shadow-inner">
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
                  <textarea required rows={2} value={formData.personas} onChange={e => setFormData({...formData, personas: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm text-v-white-off focus:border-[#d4af37] outline-none transition-colors resize-none shadow-inner" placeholder="Ex: Jovem Geração Z, Mãe Corporativa" />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Palavras-Chave (Scout)</label>
                  <textarea required rows={2} value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm text-v-white-off focus:border-[#d4af37] outline-none transition-colors resize-none shadow-inner" placeholder="Ex: alfaiataria feminina, moda inverno" />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Concorrentes Diretos</label>
                  <textarea required rows={2} value={formData.competitors} onChange={e => setFormData({...formData, competitors: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm text-v-white-off focus:border-[#d4af37] outline-none transition-colors resize-none shadow-inner" placeholder="Ex: @zara_brasil, @cea_brasil" />
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-end gap-4 mt-2 shrink-0">
                  <button type="button" onClick={() => setIsNewClientModalOpen(false)} className="px-6 py-3 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors rounded-lg">Cancelar</button>
                  <button type="submit" disabled={isCreatingTenant} className="px-8 py-3 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#b5952f] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50 rounded-lg">{isCreatingTenant ? "Ativando..." : "Cadastrar"}</button>
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
    <div className="glass-panel p-5 border border-white/5 rounded-xl flex flex-col justify-between h-32 bg-black/40 hover:border-[#d4af37]/40 transition-all hover:shadow-[0_0_25px_rgba(212,175,55,0.1)] group">
      <div className="flex justify-between items-start">
        <p className="font-montserrat text-[0.6rem] uppercase tracking-widest text-gray-500 group-hover:text-gray-400 transition-colors">{title}</p>
        <div className="text-[#d4af37] opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all">{icon}</div>
      </div>
      <div>
        <div className="font-abhaya text-3xl font-bold text-v-white-off mb-1 drop-shadow-md">{isLoading ? "---" : (value || "0")}</div>
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
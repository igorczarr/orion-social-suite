"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, Users, Target, Activity, Zap, Flame, Crosshair, 
  ArrowUpDown, Filter, Search, Eye, Heart, Bookmark, Swords, 
  Trophy, BrainCircuit, Radar, MessageCircle, PenTool, X, Plus, Settings, Edit3
} from "lucide-react";
import { OrionAPI } from "@/lib/api"; 
import { useTenant } from "@/contexts/TenantContext";

export default function DashboardPage() {
  const { tenantInfo, toggleTenant, refreshTenants } = useTenant();
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'ytd'>('30d');
  const [selectedCompetitorIdx, setSelectedCompetitorIdx] = useState<number>(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<any>(null);
  
  // Modais de Ação
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "", social_handle: "", niche: "Moda & Vestuário", personas: "", competitors: "", keywords: ""
  });

  const openEditModal = () => {
    if (tenantInfo) {
      setFormData({
        name: tenantInfo.name,
        social_handle: tenantInfo.social_handle || "",
        niche: tenantInfo.niche || "Moda & Vestuário",
        personas: tenantInfo.personas?.join(", ") || "",
        competitors: tenantInfo.competitors?.join(", ") || "",
        keywords: tenantInfo.keywords || ""
      });
      setIsEditClientModalOpen(true);
    }
  };

  useEffect(() => {
    async function loadDashboardOverview() {
      if (!tenantInfo?.id) return;
      setIsLoadingDashboard(true);
      setSelectedCompetitorIdx(0); 
      try {
        const token = localStorage.getItem("vrtice_token");
        const res = await fetch(`http://localhost:8000/api/dashboard/${tenantInfo.id}/overview`, {
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

  // IA HIPER-FOCADA: Envia a dor exata capturada no Radar para gerar o Briefing
  const handleGenerateBriefing = async () => {
    setIsGenerating(true);
    try {
      const comp = dashboardData?.arena?.[selectedCompetitorIdx]?.username || "@concorrente";
      // Pega a dor mais intensa mapeada pelo robô do YouTube
      const realPainPoint = dashboardData?.radar?.[0]?.quote 
        ? `A dor profunda da audiência é: "${dashboardData.radar[0].quote}"`
        : dashboardData?.global_trends?.[0]?.topic || "Dificuldade na atração de clientes";
        
      const response = await OrionAPI.generateBriefing(realPainPoint, comp);
      setAiBriefing(response.data); 
    } catch (error) {
      console.error("Falha na comunicação IA:", error);
      alert("Falha ao gerar briefing. Verifique a conexão.");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentCompetitor = dashboardData?.arena?.[selectedCompetitorIdx] || null;

  return (
    <div className="space-y-8 animate-fade-in-up pb-20 relative">
      
      {/* 1. BARRA DE COMANDO GLOBAL */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-v-white-off/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></span>
            <span className="font-montserrat text-[0.65rem] text-v-gold uppercase tracking-widest border border-v-gold/30 px-2 py-1 bg-v-gold/5">
              Sistema Operacional Ativo
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-v-white-off tracking-wide">
            Centro de <span className="text-gold-gradient">Comando</span>
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <div className="flex bg-white/5 border border-v-white-off/10 rounded-sm p-1">
            <button onClick={() => setTimeFilter('7d')} className={`px-4 py-1.5 text-[0.65rem] font-montserrat font-bold uppercase tracking-widest transition-colors rounded-sm ${timeFilter === '7d' ? 'bg-v-gold text-v-black' : 'text-gray-400 hover:text-v-white-off'}`}>7 Dias</button>
            <button onClick={() => setTimeFilter('30d')} className={`px-4 py-1.5 text-[0.65rem] font-montserrat font-bold uppercase tracking-widest transition-colors rounded-sm ${timeFilter === '30d' ? 'bg-v-gold text-v-black' : 'text-gray-400 hover:text-v-white-off'}`}>30 Dias</button>
            <button onClick={() => setTimeFilter('ytd')} className={`px-4 py-1.5 text-[0.65rem] font-montserrat font-bold uppercase tracking-widest transition-colors rounded-sm ${timeFilter === 'ytd' ? 'bg-v-gold text-v-black' : 'text-gray-400 hover:text-v-white-off'}`}>YTD</button>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 border border-v-white-off/10 p-2 rounded-sm backdrop-blur-sm relative group">
            <div className="w-10 h-10 bg-v-blue-navy rounded-sm flex items-center justify-center font-abhaya text-v-gold text-xl border border-v-gold/20">
              {tenantInfo?.initials || "-"}
            </div>
            <div className="pr-2 hidden sm:block">
              <p className="font-montserrat text-[0.6rem] text-gray-500 uppercase tracking-widest">Conta Monitorada</p>
              <p className="font-montserrat text-sm font-bold text-v-white-off">{tenantInfo?.name || "Carregando..."}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={openEditModal} className="p-2 text-gray-400 hover:text-v-gold transition-colors" title="Afinar Cliente">
                <Settings size={14} />
              </button>
              
              <button onClick={toggleTenant} className="px-3 py-2 text-[0.65rem] font-bold text-v-black bg-v-gold uppercase tracking-widest hover:bg-v-white-off transition-colors rounded-sm">
                Trocar
              </button>
              <button onClick={() => setIsNewClientModalOpen(true)} className="px-3 py-2 text-[0.65rem] font-bold text-v-gold bg-v-black border border-v-gold uppercase tracking-widest hover:bg-v-gold hover:text-v-black transition-colors rounded-sm flex items-center gap-1">
                <Plus size={12} /> Novo
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. RAIO-X DO PERFIL */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBox isLoading={isLoadingDashboard} title="Crescimento (Followers)" value={dashboardData?.kpis?.followers?.toLocaleString('pt-BR')} trend={dashboardData?.kpis?.delta_followers >= 0 ? `+${dashboardData?.kpis?.delta_followers} diário` : `${dashboardData?.kpis?.delta_followers} diário`} isPositive={dashboardData?.kpis?.delta_followers >= 0} icon={<Users size={16} />} />
        <MetricBox isLoading={isLoadingDashboard} title="Taxa Média Engajamento" value={`${dashboardData?.kpis?.avg_engagement || 0}%`} trend="Orgânico" isPositive={true} icon={<Heart size={16} />} />
        <MetricBox isLoading={isLoadingDashboard} title="Alcance Global (Est.)" value={dashboardData?.kpis?.total_reach?.toLocaleString('pt-BR')} trend="Em alta" isPositive={true} icon={<Eye size={16} />} />
        <MetricBox isLoading={isLoadingDashboard} title="Tração (Saves)" value={dashboardData?.kpis?.total_saves?.toLocaleString('pt-BR')} trend="Retenção" isPositive={true} icon={<Bookmark size={16} />} />
      </section>

      {/* 3. CAMADA TÁTICA (Gamificação + Oráculo) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-8 border border-v-white-off/10 rounded-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Target size={120} /></div>
          <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
            <Trophy size={14} className="text-v-gold" /> Meta do Trimestre (Gamificação)
          </h3>
          <div className="flex justify-between items-end mb-2 relative z-10">
            <div>
              <p className="font-abhaya text-4xl font-bold text-v-white-off">
                {isLoadingDashboard ? "---" : dashboardData?.gamification?.target?.toLocaleString('pt-BR')} <span className="text-lg text-gray-500 font-montserrat">Seguidores</span>
              </p>
              <p className="font-montserrat text-xs text-v-gold mt-1">Faltam {isLoadingDashboard ? "---" : dashboardData?.gamification?.remaining?.toLocaleString('pt-BR')} para o Marco</p>
            </div>
            <p className="font-montserrat text-3xl font-bold text-v-white-off">{isLoadingDashboard ? "0" : dashboardData?.gamification?.percent}%</p>
          </div>
          <div className="w-full h-3 bg-v-black border border-v-white-off/10 rounded-full mt-4 overflow-hidden relative z-10">
            <div 
              className="h-full bg-linear-to-r from-v-brown-earth to-v-gold relative shadow-[0_0_15px_rgba(200,169,112,0.5)] transition-all duration-1000"
              style={{ width: `${dashboardData?.gamification?.percent || 0}%` }}
            >
              <div className="absolute top-0 right-0 w-2 h-full bg-white/50 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 border border-red-500/30 rounded-sm relative bg-linear-to-b from-transparent to-red-900/10 flex flex-col justify-between">
          <div>
            <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-red-400 mb-4 flex items-center gap-2">
              <Activity size={14} /> Intervenção Crítica (IA)
            </h3>
            <p className="font-montserrat text-[0.85rem] text-gray-300 leading-relaxed">
              {isLoadingDashboard ? "Sincronizando com o cérebro central..." : dashboardData?.intervencao}
            </p>
          </div>
          <button className="w-full mt-4 py-3 border border-red-500/50 text-red-400 font-montserrat text-[0.65rem] uppercase tracking-widest hover:bg-red-500/10 transition-colors font-bold flex justify-center items-center gap-2">
            <Zap size={14} /> Aplicar Ajuste de Rota
          </button>
        </div>
      </section>

      {/* 4. MOTOR DE GUERRA */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Coluna 1: Radar Global */}
        <div className="glass-panel border border-v-white-off/10 rounded-sm flex flex-col h-full min-h-[350px]">
          <div className="p-5 border-b border-v-white-off/10 flex justify-between items-center bg-white/5">
            <h3 className="font-montserrat text-[0.65rem] font-bold uppercase tracking-widest text-v-gold flex items-center gap-2"><Radar size={14} /> Radar Global</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-v-gold/20">
            {isLoadingDashboard ? <p className="text-xs text-gray-500 text-center mt-8 animate-pulse">Buscando tendências reais...</p> : 
             dashboardData?.global_trends?.length > 0 ? dashboardData.global_trends.map((t: any, i: number) => <TrendItem key={i} rank={t.rank} topic={t.topic} category={t.category} heat={t.heat} />) : 
             <p className="text-xs text-gray-500 text-center mt-8">Nenhuma tendência mapeada.</p>}
          </div>
        </div>

        {/* Coluna 2: Arena + Radar de Persona (LAYOUT CORRIGIDO - HORIZONTAL) */}
        <div className="flex flex-col gap-6 h-full min-h-[350px]">
          
          {/* Box 1 (Arena): Dois cartões horizontais */}
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="glass-panel border border-v-white-off/10 rounded-sm flex flex-col justify-center p-4">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-montserrat text-[0.6rem] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2"><Swords size={12} className="text-v-gold" /> A Arena</h3>
              </div>
              {dashboardData?.arena && dashboardData.arena.length > 0 ? (
                <select value={selectedCompetitorIdx} onChange={(e) => setSelectedCompetitorIdx(Number(e.target.value))} className="bg-v-black border border-v-white-off/20 text-v-white-off text-[0.65rem] uppercase tracking-widest rounded-sm px-2 py-2 outline-none focus:border-v-gold cursor-pointer w-full mb-3">
                  {dashboardData.arena.map((c: any, idx: number) => <option key={idx} value={idx}>@{c.username}</option>)}
                </select>
              ) : (
                <span className="text-[0.6rem] text-gray-500 uppercase tracking-widest block mb-3">Sem Alvos</span>
              )}
              <div className="flex justify-between text-[0.65rem] font-montserrat mb-1">
                <span className="text-v-white-off">Nós: <strong className="text-v-gold">{dashboardData?.kpis?.avg_engagement || 0}%</strong></span>
                <span className="text-gray-500">Eles: {currentCompetitor?.engagement || 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-v-gold border-r border-v-black transition-all" style={{ width: `${Math.min(((dashboardData?.kpis?.avg_engagement || 0) / ((currentCompetitor?.engagement || 1) + 0.1)) * 50, 90)}%` }}></div>
                <div className="h-full bg-gray-600 flex-1"></div>
              </div>
            </div>

            <div className="glass-panel border border-v-white-off/10 rounded-sm flex flex-col justify-center p-4 text-center">
              <Activity size={14} className="text-v-gold mx-auto mb-2" />
              <h4 className="font-abhaya text-2xl text-v-white-off mb-1">{currentCompetitor?.frequency || "Indefinido"}</h4>
              <p className="font-montserrat text-[0.55rem] text-gray-500 uppercase tracking-widest">Padrão de Postagem</p>
            </div>
          </div>

          {/* Box 2 (Persona) */}
          <div className="glass-panel border border-v-white-off/10 rounded-sm flex flex-col flex-1 overflow-hidden min-h-[200px]">
            <div className="p-4 border-b border-v-white-off/10 flex justify-between items-center bg-white/5 shrink-0">
              <h3 className="font-montserrat text-[0.6rem] font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
                <MessageCircle size={12} className="text-v-gold" /> Radar de Persona
              </h3>
              <span className="text-[0.55rem] text-v-gold bg-v-gold/10 px-2 py-1 rounded-sm uppercase tracking-widest">Escuta Ativa</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-none">
              {isLoadingDashboard ? (
                 <p className="text-xs text-gray-500 text-center mt-4 animate-pulse">Lendo comentários...</p>
              ) : dashboardData?.radar?.length > 0 ? (
                dashboardData.radar.map((insight: any, i: number) => (
                  <div key={i} className="bg-v-black/50 p-3 rounded-sm border border-v-white-off/5">
                    <p className="font-montserrat text-[0.65rem] text-gray-300 leading-relaxed italic truncate">"{insight.quote}"</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[0.55rem] text-v-gold font-bold uppercase">{insight.category}</span>
                      <span className="text-[0.55rem] text-gray-500">{insight.platform}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 font-montserrat text-center mt-4">Nenhum insight. O Worker Scout rodará à noite.</p>
              )}
            </div>
          </div>

        </div>

        {/* Coluna 3: CMO Brain + Arsenal */}
        <div className="flex flex-col gap-6 h-full min-h-[350px]">
          <div className="glass-panel border border-v-gold/30 rounded-sm flex flex-col bg-v-gold/5 relative overflow-hidden shrink-0">
            <div className="absolute -right-5 -top-5 opacity-10 text-v-gold"><BrainCircuit size={100} /></div>
            <div className="p-4 border-b border-v-gold/10 relative z-10 bg-v-black/20">
              <h3 className="font-montserrat text-[0.6rem] font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2"><Crosshair size={12} className="text-v-gold" /> Estratégia do CMO</h3>
            </div>
            <div className="flex-1 p-5 flex flex-col justify-center items-center text-center relative z-10">
              <p className="font-montserrat text-[0.65rem] text-gray-300 mb-4 leading-relaxed">
                {isLoadingDashboard ? "Analisando dados..." : "Cruze a pior dor encontrada no Radar de Persona com a deficiência do concorrente e gere um conteúdo magnético."}
              </p>
              <button onClick={handleGenerateBriefing} disabled={isGenerating || isLoadingDashboard} className="w-full py-3 bg-v-gold text-v-black font-montserrat text-[0.6rem] font-bold uppercase tracking-[0.1em] hover:bg-v-white-off transition-all shadow-[0_0_15px_rgba(200,169,112,0.3)] disabled:opacity-70 flex justify-center items-center gap-2">
                {isGenerating ? <><Activity size={12} className="animate-spin" /> Sintetizando...</> : "Gerar Tática Letal"}
              </button>
            </div>
          </div>

          <div className="glass-panel border border-v-white-off/10 rounded-sm flex flex-col flex-1 overflow-hidden min-h-[200px]">
            <div className="p-4 border-b border-v-white-off/10 flex justify-between items-center bg-white/5 shrink-0">
              <h3 className="font-montserrat text-[0.6rem] font-bold uppercase tracking-widest text-gray-300 flex items-center gap-2">
                <PenTool size={12} className="text-v-gold" /> Arsenal (Ganchos)
              </h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {isLoadingDashboard ? (
                <p className="text-xs text-gray-500 mt-2 animate-pulse">Descriptografando...</p>
              ) : dashboardData?.arsenal?.length > 0 ? (
                dashboardData.arsenal.map((item: any, i: number) => (
                  <div key={i} className="group cursor-pointer">
                    <p className="font-abhaya text-sm text-v-white-off group-hover:text-v-gold transition-colors">"{item.hook}"</p>
                    <div className="w-full h-[1px] bg-v-white-off/10 mt-2 group-hover:bg-v-gold/50 transition-colors"></div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 font-montserrat mt-2">Nenhum gancho mapeado para este concorrente.</p>
              )}
            </div>
          </div>
        </div>

      </section>

      {/* 5. MATRIZ DE CONTEÚDO (Agora com dados do Apify) */}
      <section className="glass-panel border border-v-white-off/10 rounded-sm overflow-hidden">
        <div className="p-6 border-b border-v-white-off/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5">
          <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
            <TrendingUp size={14} className="text-v-gold" /> Matriz Analítica de Postagens
          </h3>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Buscar legenda..." className="w-full bg-v-black border border-v-white-off/20 rounded-sm py-2 pl-9 pr-4 text-xs font-montserrat text-v-white-off outline-none focus:border-v-gold transition-colors" />
            </div>
            <button className="p-2 border border-v-white-off/20 rounded-sm hover:border-v-gold text-gray-400 hover:text-v-gold transition-colors">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[250px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-v-black/80 border-b border-v-white-off/10 font-montserrat text-[0.65rem] uppercase tracking-widest text-gray-500">
                <th className="p-4 font-medium cursor-pointer hover:text-v-gold" onClick={() => handleSort('date')}>Data <ArrowUpDown size={12} className="inline" /></th>
                <th className="p-4 font-medium">Formato</th>
                <th className="p-4 font-medium min-w-50">Resumo da Legenda</th>
                <th className="p-4 font-medium cursor-pointer hover:text-v-gold" onClick={() => handleSort('reach')}><Eye size={12} className="inline"/> Alcance</th>
                <th className="p-4 font-medium cursor-pointer hover:text-v-gold" onClick={() => handleSort('engagement')}><Heart size={12} className="inline"/> Engaj.</th>
                <th className="p-4 font-medium cursor-pointer hover:text-v-gold" onClick={() => handleSort('saves')}><Bookmark size={12} className="inline"/> Saves</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="font-montserrat text-sm">
              {isLoadingDashboard ? (
                <tr><td colSpan={7} className="p-8 text-center text-v-gold text-xs animate-pulse">Sincronizando 30 posts recentes...</td></tr>
              ) : filteredAndSortedPosts.length > 0 ? (
                filteredAndSortedPosts.map((post) => (
                  <tr key={post.id} className="border-b border-v-white-off/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-400 text-xs">{post.date}</td>
                    <td className="p-4"><span className={`text-[0.6rem] uppercase tracking-widest px-2 py-1 rounded-sm border ${post.type.includes('Reels') || post.type.includes('Video') ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'}`}>{post.type}</span></td>
                    <td className="p-4 text-v-white-off">{post.hook}</td>
                    <td className="p-4 text-gray-300">{post.reach?.toLocaleString('pt-BR')}</td>
                    <td className="p-4 text-v-gold font-bold">{post.engagement}%</td>
                    <td className="p-4 text-gray-300">{post.saves?.toLocaleString('pt-BR')}</td>
                    <td className="p-4"><span className={`text-[0.6rem] uppercase tracking-widest font-bold px-2 py-1 rounded-sm bg-v-black/50 ${post.status === 'Viral' ? 'text-green-400 border border-green-500/20' : post.status === 'Baixo' ? 'text-red-400 border border-red-500/20' : 'text-gray-400 border border-gray-500/20'}`}>{post.status}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500 text-xs">Nenhum post coletado neste período.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* === MODAL DE IA (CMO) === */}
      {aiBriefing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-v-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="glass-panel max-w-3xl w-full p-8 md:p-10 border border-v-gold/40 rounded-sm relative shadow-[0_0_80px_rgba(200,169,112,0.15)] bg-v-black/90">
            <button onClick={() => setAiBriefing(null)} className="absolute top-6 right-6 text-gray-400 hover:text-v-white-off transition-all"><X size={24} /></button>
            <h2 className="font-abhaya text-3xl text-v-gold mb-8 flex items-center gap-3 border-b border-v-gold/10 pb-4"><BrainCircuit /> Tática de Guerrilha</h2>
            <div className="space-y-6 font-montserrat text-sm text-v-white-off">
              <div>
                <h4 className="text-[0.65rem] uppercase tracking-widest text-gray-500 mb-2">Gatilho Primário (Hook Letal)</h4>
                <p className="p-4 bg-white/5 border border-white/10 rounded-sm font-bold text-v-gold text-lg tracking-wide shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                  &quot;{aiBriefing.hook}&quot;
                </p>
              </div>
              <div>
                <h4 className="text-[0.65rem] uppercase tracking-widest text-gray-500 mb-2">Mecânica Psicológica</h4>
                <p className="p-4 bg-white/5 border border-white/10 rounded-sm leading-relaxed text-gray-300">{aiBriefing.strategy}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[0.65rem] uppercase tracking-widest text-gray-500 mb-2">Formato Ideal</h4>
                  <p className="p-4 bg-white/5 border border-white/10 rounded-sm"><Activity size={14} className="inline mr-2 text-v-gold" /> {aiBriefing.format}</p>
                </div>
                <div>
                  <h4 className="text-[0.65rem] uppercase tracking-widest text-gray-500 mb-2">Call to Action (CTA)</h4>
                  <p className="p-4 bg-white/5 border border-white/10 rounded-sm"><Zap size={14} className="inline mr-2 text-v-gold" /> {aiBriefing.call_to_action}</p>
                </div>
              </div>
            </div>
            <div className="mt-10"><button onClick={() => setAiBriefing(null)} className="w-full py-4 bg-v-gold text-v-black font-bold text-xs uppercase tracking-[0.1em] hover:bg-v-white-off transition-colors">Aprovar & Iniciar Produção</button></div>
          </div>
        </div>
      )}

      {/* === MODAL DE EDIÇÃO DE CLIENTE === */}
      {isEditClientModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-v-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="glass-panel w-full max-w-2xl bg-v-black/95 border border-v-gold/40 rounded-sm relative shadow-[0_0_80px_rgba(200,169,112,0.2)] flex flex-col max-h-[90vh]">
            <button onClick={() => setIsEditClientModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-v-white-off hover:rotate-90 transition-all z-10"><X size={24} /></button>
            <div className="p-6 md:p-8 pb-4 shrink-0 border-b border-v-white-off/10">
              <h2 className="font-abhaya text-3xl text-v-white-off mb-2 flex items-center gap-3"><Edit3 className="text-v-gold" /> Ajustar Calibração IA</h2>
              <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest">Atualize as referências para melhorar a escuta do Scout</p>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-v-gold/20">
              <form className="space-y-5 font-montserrat">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Palavras-Chave (Para Melhorar o Scout)</label>
                  <textarea rows={3} value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} className="w-full bg-v-black border border-v-white-off/20 rounded-sm px-4 py-3 text-sm text-v-white-off focus:border-v-gold outline-none" />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Concorrentes Diretos (Para a Arena)</label>
                  <textarea rows={2} value={formData.competitors} onChange={e => setFormData({...formData, competitors: e.target.value})} className="w-full bg-v-black border border-v-white-off/20 rounded-sm px-4 py-3 text-sm text-v-white-off focus:border-v-gold outline-none" />
                </div>
                <div className="pt-6 border-t border-v-white-off/10 flex justify-end gap-4 mt-2">
                  <button type="button" onClick={() => setIsEditClientModalOpen(false)} className="px-6 py-3 text-xs font-bold text-gray-400 hover:text-v-white-off uppercase">Cancelar</button>
                  <button type="button" onClick={() => setIsEditClientModalOpen(false)} className="px-8 py-3 bg-v-gold text-v-black text-xs font-bold uppercase hover:bg-v-white-off transition-colors">Salvar Ajustes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE NOVO CLIENTE (RESTAURADO) */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-v-black/80 backdrop-blur-md animate-fade-in-up">
          <div className="glass-panel w-full max-w-2xl bg-v-black/95 border border-v-gold/40 rounded-sm relative shadow-[0_0_80px_rgba(200,169,112,0.2)] flex flex-col max-h-[90vh]">
            <button onClick={() => setIsNewClientModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-v-white-off hover:rotate-90 transition-all z-10"><X size={24} /></button>
            <div className="p-6 md:p-8 pb-4 shrink-0 border-b border-v-white-off/10">
              <h2 className="font-abhaya text-3xl text-v-white-off mb-2 flex items-center gap-3"><Plus className="text-v-gold" /> Adicionar Conta</h2>
              <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest">Ative um novo motor de inteligência</p>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-v-gold/20">
              <form onSubmit={handleCreateClient} className="space-y-5 font-montserrat">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Nome da Marca</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-v-black border border-v-white-off/20 rounded-sm px-4 py-3 text-sm text-v-white-off focus:border-v-gold outline-none transition-colors" placeholder="Ex: Lojas Renner" />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">@ do Instagram</label>
                    <input required type="text" value={formData.social_handle} onChange={e => setFormData({...formData, social_handle: e.target.value})} className="w-full bg-v-black border border-v-white-off/20 rounded-sm px-4 py-3 text-sm text-v-white-off focus:border-v-gold outline-none transition-colors" placeholder="Ex: @lojasrenner" />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Nicho de Mercado</label>
                  <select value={formData.niche} onChange={e => setFormData({...formData, niche: e.target.value})} className="w-full bg-v-black border border-v-white-off/20 rounded-sm px-4 py-3 text-sm text-gray-300 focus:border-v-gold outline-none cursor-pointer">
                    <option value="Moda & Vestuário">Moda & Vestuário</option>
                    <option value="Beleza & Cosmética">Beleza & Cosmética</option>
                    <option value="InfoProduto / Educação">InfoProduto / Educação</option>
                    <option value="Serviços Corporativos">Serviços Corporativos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Personas Alvo</label>
                  <textarea required rows={2} value={formData.personas} onChange={e => setFormData({...formData, personas: e.target.value})} className="w-full bg-v-black border border-v-white-off/20 rounded-sm px-4 py-3 text-sm text-v-white-off focus:border-v-gold outline-none transition-colors resize-none" placeholder="Ex: Jovem Geração Z, Mãe Corporativa" />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Palavras-Chave (Scout)</label>
                  <textarea required rows={2} value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} className="w-full bg-v-black border border-v-white-off/20 rounded-sm px-4 py-3 text-sm text-v-white-off focus:border-v-gold outline-none transition-colors resize-none" placeholder="Ex: alfaiataria feminina, moda inverno" />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Concorrentes Diretos</label>
                  <textarea required rows={2} value={formData.competitors} onChange={e => setFormData({...formData, competitors: e.target.value})} className="w-full bg-v-black border border-v-white-off/20 rounded-sm px-4 py-3 text-sm text-v-white-off focus:border-v-gold outline-none transition-colors resize-none" placeholder="Ex: @zara_brasil, @cea_brasil" />
                </div>
                <div className="pt-6 border-t border-v-white-off/10 flex justify-end gap-4 mt-2 shrink-0">
                  <button type="button" onClick={() => setIsNewClientModalOpen(false)} className="px-6 py-3 text-xs font-bold text-gray-400 hover:text-v-white-off uppercase tracking-widest transition-colors">Cancelar</button>
                  <button type="submit" disabled={isCreatingTenant} className="px-8 py-3 bg-v-gold text-v-black text-xs font-bold uppercase tracking-widest hover:bg-v-white-off transition-colors shadow-[0_0_15px_rgba(200,169,112,0.3)] disabled:opacity-50">{isCreatingTenant ? "Ativando..." : "Cadastrar"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBox({ title, value, trend, isPositive, icon, isLoading = false }: { title: string, value: string | undefined, trend: string, isPositive: boolean, icon: React.ReactNode, isLoading?: boolean }) {
  return (
    <div className="glass-panel p-5 border border-v-white-off/5 rounded-sm flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <p className="font-montserrat text-[0.6rem] uppercase tracking-widest text-gray-500">{title}</p>
        <div className="text-v-gold opacity-50">{icon}</div>
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

function TrendItem({ rank, topic, category, heat }: { rank: number, topic: string, category: string, heat: string }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-v-white-off/5 hover:bg-white/5 cursor-pointer transition-colors group">
      <div className="w-6 h-6 flex items-center justify-center font-abhaya text-lg font-bold text-gray-500 group-hover:text-v-gold">{rank}</div>
      <div className="flex-1">
        <p className="font-montserrat text-xs font-bold text-v-white-off group-hover:text-v-gold transition-colors">{topic}</p>
        <p className="font-montserrat text-[0.6rem] text-gray-500 uppercase tracking-widest mt-1">{category}</p>
      </div>
      <div className={`text-[0.6rem] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border ${heat === 'Extremo' ? 'bg-red-500/10 text-red-400 border-red-500/30' : heat === 'Alto' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>{heat}</div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { 
  Trophy, Star, Target, Zap, Flame, 
  CheckCircle2, Lock, Crown, ChevronRight, 
  RefreshCw, Medal, Swords
} from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";

// Leaderboard simulado para demonstrar o potencial multiplayer do SaaS
const mockLeaderboard = [
  { rank: 1, name: "Sofia Valentini", role: "Estrategista", xp: 12450, initials: "SV", trend: "up" },
  { rank: 2, name: "Você (Logado)", role: "Operador", xp: 9820, initials: "VC", trend: "up" },
  { rank: 3, name: "Ana P.", role: "Video Maker", xp: 8100, initials: "AP", trend: "down" },
];

export default function GamificationPage() {
  const { tenantInfo, toggleTenant } = useTenant();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // === ESTADOS LIGADOS AO BACKEND ===
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [campaignProgress, setCampaignProgress] = useState<{current: number, target: number, missing: number, percent: number} | null>(null);

  const loadGamificationData = async () => {
    setIsLoading(true);
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem("vrtice_token");
      
      // 1. Busca os dados do jogador (Independente do cliente)
      const gamiRes = await fetch("http://localhost:8000/api/gamification/dashboard", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (gamiRes.ok) {
        const gamiData = await gamiRes.json();
        setPlayerStats(gamiData.player);
        setQuests(gamiData.quests || []);
      }

      // 2. Busca a Barra de Progresso do Cliente Selecionado (Reaproveitando a rota Overview)
      if (tenantInfo?.id) {
        const dashRes = await fetch(`http://localhost:8000/api/dashboard/${tenantInfo.id}/overview`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setCampaignProgress(dashData.gamification);
        }
      }
      
    } catch (error) {
      console.error("Falha ao sincronizar Gamificação:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadGamificationData();
  }, [tenantInfo?.id]);

  const handleRefresh = () => {
    loadGamificationData();
  };

  // Simula a conclusão visual de uma missão (numa versão final, faria um POST para a API)
  const toggleQuest = (id: number) => {
    setQuests(quests.map(q => q.id === id ? { ...q, completed: !q.completed } : q));
  };

  // Cálculos visuais
  const displayXP = playerStats?.xp || 0;
  const currentLevel = displayXP > 10000 ? "Tier S" : displayXP > 5000 ? "Tier A" : "Tier B";
  const xpForNextLevel = displayXP > 10000 ? 15000 : displayXP > 5000 ? 10000 : 5000;
  const missingXP = xpForNextLevel - displayXP;

  // Substitui a linha "Você" no Leaderboard pelo XP real do usuário
  const activeLeaderboard = mockLeaderboard.map(user => {
    if (user.initials === "VC") return { ...user, xp: displayXP };
    return user;
  }).sort((a, b) => b.xp - a.xp); // Re-ordena baseado no novo XP
  
  // Atualiza os ranks
  activeLeaderboard.forEach((user, index) => user.rank = index + 1);

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      
      {/* 1. CABEÇALHO TÁTICO */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-v-white-off/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-v-gold animate-pulse shadow-[0_0_10px_#C8A970]"></span>
            <span className="font-montserrat text-[0.65rem] text-v-gold uppercase tracking-widest border border-v-gold/30 px-2 py-1 bg-v-gold/10">
              Protocolo de Engajamento Ativo
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-v-white-off tracking-wide">
            Metas & <span className="text-gold-gradient">Gamificação</span>
          </h1>
          <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest mt-2">
            Nível de Operação, Missões e Ranking da Equipa
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 bg-white/5 border border-v-white-off/10 p-2 rounded-sm backdrop-blur-sm">
            <div className="w-10 h-10 bg-v-blue-navy rounded-sm flex items-center justify-center font-abhaya text-v-gold text-xl border border-v-gold/20">
              {tenantInfo?.initials || "-"}
            </div>
            <div className="pr-2 hidden sm:block">
              <p className="font-montserrat text-[0.6rem] text-gray-500 uppercase tracking-widest">Esquadrão Ativo</p>
              <p className="font-montserrat text-sm font-bold text-v-white-off">{tenantInfo?.name || "Carregando..."}</p>
            </div>
            <button 
              onClick={toggleTenant}
              className="px-3 py-2 text-[0.65rem] font-bold text-v-black bg-v-gold uppercase tracking-widest hover:bg-v-white-off transition-colors rounded-sm"
            >
              Trocar
            </button>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-v-gold/10 hover:text-v-gold transition-colors ${isRefreshing ? 'animate-spin text-v-gold border-v-gold' : 'text-gray-400'}`}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* 2. STATUS DO JOGADOR (KPIs Gamificados Reais) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBox title="Nível Atual" value={isLoading ? "..." : currentLevel} subtitle="Mestre em Retenção" icon={<Crown size={16} />} color="text-v-gold" />
        <MetricBox title="Experiência (XP)" value={isLoading ? "..." : displayXP.toLocaleString('pt-BR')} subtitle={`Faltam ${missingXP} para Rank Up`} icon={<Star size={16} />} color="text-blue-400" />
        <MetricBox title="Sequência (Streak)" value={isLoading ? "..." : `${playerStats?.streak || 0} Dias`} subtitle="Acesso contínuo" icon={<Flame size={16} />} color="text-orange-500" />
        <MetricBox title="Taxa de Vitória" value="88%" subtitle="Metas batidas no mês" icon={<Target size={16} />} color="text-green-500" />
      </section>

      {/* 3. O CAMPO DE BATALHA */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA (Span 2): Missões e Progresso Macro */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 3A. Progresso Macro (O Grande Objetivo) */}
          <div className="glass-panel border border-v-gold/30 rounded-sm p-8 bg-v-gold/5 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none p-4"><Trophy size={180} className="text-v-gold" /></div>
            <div className="relative z-10">
              <h3 className="font-montserrat text-[0.65rem] font-bold uppercase tracking-widest text-v-gold flex items-center gap-2 mb-6">
                <Target size={14} /> Campanha Macro do Trimestre
              </h3>
              
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="font-abhaya text-3xl font-bold text-v-white-off">Marco de Ouro</p>
                  <p className="font-montserrat text-xs text-gray-400 mt-1">Atingir {campaignProgress?.target?.toLocaleString('pt-BR') || "10.000"} Seguidores</p>
                </div>
                <div className="text-right">
                  <p className="font-montserrat text-2xl font-bold text-v-white-off">{campaignProgress?.percent || 0}%</p>
                </div>
              </div>
              
              {/* Barra de Progresso Luxuosa */}
              <div className="w-full h-4 bg-v-black border border-v-white-off/10 rounded-full overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                <div 
                  className="h-full bg-linear-to-r from-v-brown-earth via-v-gold to-[#FFE5A3] relative shadow-[0_0_15px_rgba(200,169,112,0.5)] transition-all duration-1000"
                  style={{ width: `${campaignProgress?.percent || 0}%` }}
                >
                  <div className="absolute top-0 right-0 w-2 h-full bg-white/50 animate-pulse"></div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between text-[0.65rem] font-montserrat uppercase tracking-widest text-gray-500">
                <span>Atual: {campaignProgress?.current?.toLocaleString('pt-BR') || 0}</span>
                <span>Faltam: {campaignProgress?.missing?.toLocaleString('pt-BR') || 0}</span>
              </div>
            </div>
          </div>

          {/* 3B. Quests Diárias (Missões Operacionais da API) */}
          <div className="glass-panel border border-v-white-off/10 rounded-sm flex flex-col h-[350px]">
            <div className="p-6 border-b border-v-white-off/10 flex justify-between items-center bg-white/5 shrink-0">
              <h3 className="font-montserrat text-[0.65rem] font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
                <Swords size={14} className="text-v-gold" /> Missões Táticas (Hoje)
              </h3>
              <span className="text-[0.6rem] text-gray-400 font-montserrat">Reset à Meia-Noite</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-thin scrollbar-thumb-v-gold/20">
              {isLoading ? (
                 <div className="text-center py-10 text-v-gold animate-pulse font-montserrat text-xs uppercase tracking-widest">Aguardando ordens do comando...</div>
              ) : quests.length > 0 ? (
                quests.map(quest => (
                  <div 
                    key={quest.id} 
                    onClick={() => toggleQuest(quest.id)}
                    className={`p-4 rounded-sm border cursor-pointer transition-all flex items-center gap-4 ${
                      quest.completed 
                        ? 'bg-v-gold/5 border-v-gold/30' 
                        : 'bg-v-black/50 border-v-white-off/5 hover:border-v-white-off/20'
                    }`}
                  >
                    <div className={`shrink-0 transition-colors ${quest.completed ? 'text-v-gold' : 'text-gray-600'}`}>
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-montserrat text-sm font-bold transition-colors ${quest.completed ? 'text-v-white-off line-through opacity-70' : 'text-v-white-off'}`}>
                        {quest.task}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-sm ${quest.completed ? 'bg-v-gold text-v-black' : 'bg-white/5 text-v-gold border border-v-gold/20'}`}>
                      +{quest.xp} XP
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 font-montserrat text-xs">
                  A Central de Comando não gerou missões para si hoje. O Vórtex gerará missões ao identificar alvos.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (Span 1): Leaderboard e Badges */}
        <div className="grid grid-rows-2 gap-6 h-full">
          
          {/* Leaderboard da Equipa */}
          <div className="glass-panel border border-v-white-off/10 rounded-sm flex flex-col">
            <div className="p-4 border-b border-v-white-off/10 flex justify-between items-center bg-white/5">
              <h3 className="font-montserrat text-[0.6rem] font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
                <Medal size={12} className="text-v-gold" /> Ranking da Equipa
              </h3>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-center space-y-4">
              {activeLeaderboard.map((user, idx) => (
                <div key={user.rank} className="flex items-center gap-4 p-2 rounded-sm hover:bg-white/5 transition-colors">
                  <div className={`w-6 font-abhaya text-xl font-bold flex justify-center ${idx === 0 ? 'text-v-gold' : idx === 1 ? 'text-gray-300' : 'text-[#cd7f32]'}`}>
                    #{user.rank}
                  </div>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[0.6rem] font-bold text-v-white-off ${user.initials === 'VC' ? 'bg-v-gold/20 border-v-gold' : 'bg-v-black border-v-white-off/20'}`}>
                    {user.initials}
                  </div>
                  <div className="flex-1">
                    <p className={`font-montserrat text-xs font-bold ${user.initials === 'VC' ? 'text-v-gold' : 'text-v-white-off'}`}>{user.name}</p>
                    <p className="font-montserrat text-[0.55rem] text-gray-500 uppercase tracking-widest">{user.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs text-v-gold">{user.xp.toLocaleString('pt-BR')}</p>
                    <p className="text-[0.5rem] uppercase text-gray-500">XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges / Conquistas */}
          <div className="glass-panel border border-v-white-off/10 rounded-sm flex flex-col">
            <div className="p-4 border-b border-v-white-off/10 flex justify-between items-center bg-white/5">
              <h3 className="font-montserrat text-[0.6rem] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Star size={12} className="text-v-gold" /> Arsenal Desbloqueado
              </h3>
              <span className="text-[0.55rem] text-gray-500 uppercase tracking-widest">3 de 12</span>
            </div>
            <div className="flex-1 p-5 grid grid-cols-3 gap-3 place-content-center">
              
              {/* Badge Desbloqueado */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-v-gold/10 border-2 border-v-gold flex items-center justify-center shadow-[0_0_15px_rgba(200,169,112,0.3)] group-hover:scale-110 transition-transform">
                  <Flame className="text-v-gold" size={20} />
                </div>
                <span className="font-montserrat text-[0.5rem] uppercase tracking-widest text-v-white-off text-center">Viralizador</span>
              </div>

              {/* Badge Desbloqueado */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border-2 border-blue-400 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
                  <Target className="text-blue-400" size={20} />
                </div>
                <span className="font-montserrat text-[0.5rem] uppercase tracking-widest text-v-white-off text-center">Sniper</span>
              </div>

              {/* Badge Bloqueado */}
              <div className="flex flex-col items-center gap-2 opacity-40 grayscale">
                <div className="w-12 h-12 rounded-full bg-v-black border border-gray-600 flex items-center justify-center">
                  <Lock className="text-gray-500" size={20} />
                </div>
                <span className="font-montserrat text-[0.5rem] uppercase tracking-widest text-gray-500 text-center">Mestre IA</span>
              </div>

            </div>
          </div>
        </div>

      </section>
    </div>
  );
}

// Sub-componente da Caixa de Métrica
function MetricBox({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-panel p-5 border border-v-white-off/5 rounded-sm hover:border-v-gold/30 transition-colors flex flex-col justify-between h-32">
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
"use client";

import { useState, useEffect } from "react";
import { 
  Radar, AlertTriangle, Target, MessageSquare, 
  Sparkles, Filter, RefreshCw, BrainCircuit, CloudLightning, 
  ArrowRight, ShieldAlert, Crown, Zap 
} from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";

export default function ScoutPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // LIGANDO AO CÉREBRO GLOBAL
  const { tenantInfo, toggleTenant } = useTenant();
  
  // === ESTADO: DADOS REAIS DA API ===
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const carregarInsights = async () => {
    if (!tenantInfo?.id) return;
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const token = localStorage.getItem("vrtice_token");
      const res = await fetch(`http://localhost:8000/api/scout/social-listening/${tenantInfo.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        // Mapeia adicionando IDs e garantindo estrutura
        const formatados = data.insights.map((item: any, idx: number) => ({
          id: idx,
          platform: item.platform || "Web",
          time: "Recente", // Simplificado para a versão atual do Worker
          quote: item.quote,
          category: item.category,
          intensity: item.intensity || "Média"
        }));
        setInsights(formatados);
      } else {
        setInsights([]);
      }
    } catch (error) {
      console.error("Falha ao puxar dados reais:", error);
      setInsights([]);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // Quando o cliente for alterado, busca as novas dores
  useEffect(() => {
    carregarInsights();
  }, [tenantInfo?.id]);

  const handleRefresh = () => {
    carregarInsights();
  };

  // Cálculos dinâmicos para o Termômetro Emocional
  const totalInsights = insights.length;
  
  // Encontra a categoria mais comum (Sentimento Dominante)
  const categoryCounts = insights.reduce((acc: any, curr: any) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});
  let dominantCategory = "N/A";
  let maxCount = 0;
  for (const cat in categoryCounts) {
    if (categoryCounts[cat] > maxCount) {
      maxCount = categoryCounts[cat];
      dominantCategory = cat;
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      
      {/* 1. CABEÇALHO TÁTICO */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-v-white-off/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]"></span>
            <span className="font-montserrat text-[0.65rem] text-purple-400 uppercase tracking-widest border border-purple-500/30 px-2 py-1 bg-purple-500/10">
              Motor Psicográfico Ativo
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-v-white-off tracking-wide">
            Scout & <span className="text-gold-gradient">Tendências</span>
          </h1>
          <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest mt-2">
            Mapeamento de Dores, Medos e Aspirações em Tempo Real
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <div className="flex items-center gap-4 bg-white/5 border border-v-white-off/10 p-2 rounded-sm backdrop-blur-sm">
            <div className="w-10 h-10 bg-v-blue-navy rounded-sm flex items-center justify-center font-abhaya text-v-gold text-xl border border-v-gold/20">
              {tenantInfo?.initials || "-"}
            </div>
            <div className="pr-2 hidden sm:block">
              <p className="font-montserrat text-[0.6rem] text-gray-500 uppercase tracking-widest">Conta Monitorada</p>
              <p className="font-montserrat text-sm font-bold text-v-white-off">{tenantInfo?.name || "Carregando..."}</p>
            </div>
            <button 
              onClick={toggleTenant}
              className="px-3 py-2 text-[0.65rem] font-bold text-v-black bg-v-gold uppercase tracking-widest hover:bg-v-white-off transition-colors rounded-sm"
            >
              Trocar
            </button>
          </div>
        </div>
      </header>

      {/* FILTROS DA PERSONA */}
      <div className="flex items-center justify-between bg-white/5 border border-v-white-off/10 p-4 rounded-sm">
        <div className="flex items-center gap-3">
          <span className="font-montserrat text-[0.65rem] uppercase tracking-widest text-gray-500">Persona Alvo:</span>
          <select className="bg-transparent text-v-white-off text-sm font-bold font-montserrat outline-none cursor-pointer max-w-[200px] truncate">
            {tenantInfo?.personas && tenantInfo.personas.length > 0 ? (
              tenantInfo.personas.map((persona) => (
                <option key={persona} value={persona} className="bg-v-black">
                  {persona}
                </option>
              ))
            ) : (
              <option className="bg-v-black">Público Geral</option>
            )}
          </select>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`p-2 border border-white/10 rounded-sm hover:bg-v-gold/10 hover:text-v-gold transition-colors ${isRefreshing ? 'animate-spin text-v-gold border-v-gold' : 'text-gray-400 bg-v-black'}`}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* 2. TERMÔMETRO EMOCIONAL */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <EmotionBox 
          title="Sentimento Dominante" 
          value={isLoading ? "..." : dominantCategory} 
          subtitle="Volume alto nas escutas" 
          icon={<CloudLightning size={16} />} 
          color="text-red-400" 
        />
        <EmotionBox 
          title="Maior Aspiração" 
          value="Autoridade" 
          subtitle="Estimativa IA Baseada no Nicho" 
          icon={<Crown size={16} />} 
          color="text-v-gold" 
        />
        <EmotionBox 
          title="Nível de Intensidade" 
          value={insights.length > 0 ? insights[0].intensity : "N/A"} 
          subtitle="Das últimas interações" 
          icon={<Zap size={16} />} 
          color="text-blue-400" 
        />
        <EmotionBox 
          title="Volume Processado" 
          value={isLoading ? "..." : totalInsights.toString()} 
          subtitle="Comentários analisados hoje" 
          icon={<Radar size={16} />} 
          color="text-purple-400" 
        />
      </section>

      {/* 3. O GRID PRINCIPAL */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* COLUNA ESQUERDA: FEED DE DORES E MEDOS */}
        <div className="lg:col-span-2 glass-panel border border-v-white-off/10 rounded-sm flex flex-col h-[600px]">
          <div className="p-6 border-b border-v-white-off/10 flex justify-between items-center bg-white/5 shrink-0">
            <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
              <MessageSquare size={14} className="text-v-gold" /> Radar de Vulnerabilidade (Web)
            </h3>
            <button className="flex items-center gap-2 text-[0.65rem] text-gray-400 hover:text-v-gold uppercase tracking-widest font-bold transition-colors">
              <Filter size={12} /> Filtrar
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-v-gold/20">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-v-gold animate-pulse">
                <Radar size={32} className="mb-4" />
                <p className="font-montserrat text-sm uppercase tracking-widest">Escaneando a web...</p>
              </div>
            ) : insights.length > 0 ? (
              insights.map((insight) => (
                <div key={insight.id} className="bg-v-black/40 border border-v-white-off/5 p-5 rounded-sm hover:border-v-white-off/20 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <EmotionBadge category={insight.category} />
                      <span className="text-[0.6rem] text-gray-500 uppercase tracking-widest">{insight.platform} • {insight.time}</span>
                    </div>
                    <span className={`text-[0.55rem] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border ${insight.intensity.toLowerCase().includes('extrema') ? 'bg-red-500/10 text-red-400 border-red-500/30' : insight.intensity.toLowerCase().includes('alta') ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                      Intensidade: {insight.intensity}
                    </span>
                  </div>
                  <p className="font-montserrat text-sm text-gray-300 leading-relaxed italic group-hover:text-v-white-off transition-colors">
                    "{insight.quote}"
                  </p>
                  <div className="mt-4 flex justify-end">
                     <button className="text-[0.6rem] flex items-center gap-1 font-bold text-gray-500 uppercase tracking-widest hover:text-v-gold transition-colors">
                       Transformar em Hook <ArrowRight size={10} />
                     </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="font-montserrat text-sm uppercase tracking-widest">Nenhum dado capturado ainda.</p>
                <p className="font-montserrat text-xs mt-2">O Worker do YouTube rodará à noite para preencher esta lista.</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: CALIBRADOR DE TOM DE VOZ DA IA */}
        <div className="glass-panel border border-v-gold/30 rounded-sm flex flex-col h-[600px] bg-v-gold/5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-5 text-v-gold pointer-events-none"><BrainCircuit size={250} /></div>
          
          <div className="p-6 border-b border-v-gold/10 relative z-10 bg-v-black/20 shrink-0">
            <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-v-gold flex items-center gap-2">
              <Target size={14} /> Calibrador Brand Voice (IA)
            </h3>
          </div>
          
          <div className="flex-1 p-6 flex flex-col relative z-10 overflow-y-auto scrollbar-none">
            <p className="font-montserrat text-xs text-gray-400 mb-6 leading-relaxed">
              Baseado na categoria dominante (<strong className="text-v-gold">{dominantCategory}</strong>) detectada hoje, a IA ajustou a personalidade da sua marca para maximizar a conversão.
            </p>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[0.65rem] font-montserrat font-bold uppercase tracking-widest text-v-white-off mb-2">
                  <span>Empatia (Acolhimento)</span>
                  <span className="text-v-gold">Alto (85%)</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-v-brown-earth to-v-gold w-[85%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[0.65rem] font-montserrat font-bold uppercase tracking-widest text-v-white-off mb-2">
                  <span>Autoridade (Dureza)</span>
                  <span className="text-v-gold">Médio (40%)</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-v-brown-earth to-v-gold w-[40%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[0.65rem] font-montserrat font-bold uppercase tracking-widest text-v-white-off mb-2">
                  <span>Humor / Ironia</span>
                  <span className="text-v-gold">Baixo (15%)</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-v-brown-earth to-v-gold w-[15%]"></div>
                </div>
                <p className="text-[0.6rem] text-red-400 mt-2 font-montserrat italic">
                  *Atenção: A audiência relata dores profundas. Evite sarcasmo.
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-v-black/50 border border-v-white-off/10 rounded-sm">
              <h4 className="font-abhaya text-lg text-v-white-off mb-2 flex items-center gap-2">
                <Sparkles size={14} className="text-v-gold" /> Diretriz de Conteúdo
              </h4>
              <p className="font-montserrat text-[0.7rem] text-gray-300 leading-relaxed">
                "Posicione-se como um solucionador. Fale diretamente para o sentimento de '{dominantCategory}', entregando valor prático de forma acolhedora, mas mantendo a liderança."
              </p>
            </div>

            <div className="mt-auto pt-6">
              <button className="w-full py-4 bg-v-gold text-v-black font-montserrat text-[0.65rem] font-bold uppercase tracking-widest hover:bg-v-white-off transition-all shadow-[0_0_20px_rgba(200,169,112,0.2)] hover:scale-105 active:scale-95">
                Injetar Voz no Gerador
              </button>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}

function EmotionBox({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-panel p-5 border border-v-white-off/5 rounded-sm hover:border-v-gold/30 transition-colors flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <p className="font-montserrat text-[0.6rem] uppercase tracking-widest text-gray-500">{title}</p>
        <div className={`${color} opacity-80`}>{icon}</div>
      </div>
      <div>
        <div className={`font-abhaya text-3xl font-bold mb-1 ${color}`}>{value}</div>
        <div className="text-[0.6rem] text-gray-400 uppercase tracking-wide truncate">
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function EmotionBadge({ category }: { category: string }) {
  let bgColor = "bg-gray-500/10";
  let textColor = "text-gray-400";
  let borderColor = "border-gray-500/30";
  let Icon = AlertTriangle;

  const catLower = category.toLowerCase();

  if (catLower.includes("humilhação") || catLower.includes("dor")) {
    bgColor = "bg-red-500/10";
    textColor = "text-red-400";
    borderColor = "border-red-500/30";
    Icon = ShieldAlert;
  } else if (catLower.includes("medo") || catLower.includes("dúvida")) {
    bgColor = "bg-orange-500/10";
    textColor = "text-orange-400";
    borderColor = "border-orange-500/30";
    Icon = AlertTriangle;
  } else if (catLower.includes("aspiração") || catLower.includes("sonho")) {
    bgColor = "bg-v-gold/10";
    textColor = "text-v-gold";
    borderColor = "border-v-gold/30";
    Icon = Sparkles;
  }

  return (
    <span className={`flex items-center gap-1.5 text-[0.55rem] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border ${bgColor} ${textColor} ${borderColor}`}>
      <Icon size={10} />
      {category}
    </span>
  );
}
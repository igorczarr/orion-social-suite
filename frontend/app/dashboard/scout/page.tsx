"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Radar, AlertTriangle, Target, MessageSquare, 
  Sparkles, Filter, RefreshCw, BrainCircuit, CloudLightning, 
  ArrowRight, ShieldAlert, Crown, Zap, Search, Eye
} from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";

export default function ScoutPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { tenantInfo, toggleTenant } = useTenant();
  
  // === ESTADO: DADOS REAIS DA API ===
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // CONEXÃO SEGURA COM A NUVEM
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://orion-9pls.onrender.com";

  const carregarInsights = async () => {
    if (!tenantInfo?.id) return;
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const token = localStorage.getItem("orion_token");
      const res = await fetch(`${API_URL}/api/scout/social-listening/${tenantInfo.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        // Mapeia adicionando IDs e garantindo estrutura
        const formatados = data.insights.map((item: any, idx: number) => ({
          id: idx,
          platform: item.platform || "Web",
          time: "Recente", 
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

  useEffect(() => {
    carregarInsights();
  }, [tenantInfo?.id]);

  const handleRefresh = () => {
    carregarInsights();
  };

  // === CÁLCULOS DINÂMICOS (MATEMÁTICA DO OCEANO AZUL) ===
  const totalInsights = insights.length;
  
  // 1. Encontra a categoria mais comum (Sentimento Dominante)
  const categoryCounts = insights.reduce((acc: any, curr: any) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});
  
  let dominantCategory = "Buscando dados...";
  let maxCount = 0;
  for (const cat in categoryCounts) {
    if (categoryCounts[cat] > maxCount) {
      maxCount = categoryCounts[cat];
      dominantCategory = cat;
    }
  }

  // 2. Encontra a maior aspiração
  const aspirationInsights = insights.filter(i => i.category.toLowerCase().includes("aspiração"));
  const maxAspiration = aspirationInsights.length > 0 ? "Domínio/Crescimento" : "Estabilidade";

  // === MOTOR DE CALIBRAÇÃO DE VOZ (Lógica Real) ===
  const brandVoice = useMemo(() => {
    let empatia = 50;
    let autoridade = 50;
    let humor = 30;
    let aviso = "";
    let diretriz = "Aguardando volume de dados para traçar perfil psicológico.";

    if (totalInsights > 0) {
      const cat = dominantCategory.toLowerCase();
      
      if (cat.includes("dor") || cat.includes("medo") || cat.includes("vulnerabilidade")) {
        empatia = 85; autoridade = 60; humor = 5;
        aviso = "*Atenção: A audiência relata dores profundas. Risco de repulsa com ironia.";
        diretriz = `Posicione-se como um porto seguro. A categoria '${dominantCategory}' exige comunicação acolhedora, provando que você entende o problema antes de vender a solução.`;
      } 
      else if (cat.includes("demanda oculta") || cat.includes("aspiração")) {
        empatia = 40; autoridade = 90; humor = 20;
        aviso = "*Atenção: Público sedento por solução. Vá direto ao ponto.";
        diretriz = `A audiência está pronta para agir (Foco: '${dominantCategory}'). Use tom de liderança, mostre o caminho e posicione o produto como o veículo exclusivo para essa conquista.`;
      }
      else if (cat.includes("objeção") || cat.includes("dúvida")) {
        empatia = 60; autoridade = 80; humor = 10;
        aviso = "*Público cético. Necessidade de provas sociais e dados.";
        diretriz = `Destrua a '${dominantCategory}' através de dados, lógica e garantias inflexíveis. Assuma uma postura técnica e inquestionável.`;
      }
    }

    return { empatia, autoridade, humor, aviso, diretriz };
  }, [dominantCategory, totalInsights]);

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      
      {/* 1. CABEÇALHO TÁTICO */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]"></span>
            <span className="font-montserrat text-[0.65rem] text-purple-400 uppercase tracking-widest border border-purple-500/30 px-2 py-1 bg-purple-500/10 rounded-md">
              Motor Psicográfico (Oceano Azul)
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-v-white-off tracking-wide">
            Scout & <span className="text-[#d4af37]">Tendências</span>
          </h1>
          <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest mt-2">
            Mapeamento de Lacunas e Demanda Oculta
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-lg backdrop-blur-sm">
            <div className="w-10 h-10 bg-black/50 rounded-md flex items-center justify-center font-abhaya text-[#d4af37] text-xl border border-[#d4af37]/20">
              {tenantInfo?.initials || "-"}
            </div>
            <div className="pr-2 hidden sm:block">
              <p className="font-montserrat text-[0.6rem] text-gray-500 uppercase tracking-widest">Conta Monitorada</p>
              <p className="font-montserrat text-sm font-bold text-v-white-off">{tenantInfo?.name || "Carregando..."}</p>
            </div>
            <button 
              onClick={toggleTenant}
              className="px-3 py-2 text-[0.65rem] font-bold text-black bg-[#d4af37] uppercase tracking-widest hover:bg-[#b5952f] transition-colors rounded-md"
            >
              Trocar
            </button>
          </div>
        </div>
      </header>

      {/* FILTROS DA PERSONA */}
      <div className="flex items-center justify-between bg-black/40 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="font-montserrat text-[0.65rem] uppercase tracking-widest text-gray-500">Persona Alvo:</span>
          <select className="bg-transparent text-v-white-off text-sm font-bold font-montserrat outline-none cursor-pointer max-w-[200px] truncate">
            {tenantInfo?.personas && tenantInfo.personas.length > 0 ? (
              tenantInfo.personas.map((persona) => (
                <option key={persona} value={persona} className="bg-[#050505]">
                  {persona}
                </option>
              ))
            ) : (
              <option className="bg-[#050505]">Público Geral</option>
            )}
          </select>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`p-2 border border-white/10 rounded-md hover:bg-[#d4af37]/10 hover:text-[#d4af37] transition-colors ${isRefreshing ? 'animate-spin text-[#d4af37] border-[#d4af37]' : 'text-gray-400 bg-black'}`}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* 2. TERMÔMETRO EMOCIONAL */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <EmotionBox title="Sentimento Dominante" value={isLoading ? "..." : dominantCategory} subtitle="Frequência máxima" icon={<CloudLightning size={16} />} color="text-red-400" />
        <EmotionBox title="Maior Aspiração" value={isLoading ? "..." : maxAspiration} subtitle="Estimativa Comportamental" icon={<Crown size={16} />} color="text-[#d4af37]" />
        <EmotionBox title="Nível de Intensidade" value={insights.length > 0 ? insights[0].intensity : "N/A"} subtitle="Das interações recentes" icon={<Zap size={16} />} color="text-blue-400" />
        <EmotionBox title="Volume Processado" value={isLoading ? "..." : totalInsights.toString()} subtitle="Comentários no banco" icon={<Radar size={16} />} color="text-purple-400" />
      </section>

      {/* 3. O GRID PRINCIPAL */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* COLUNA ESQUERDA: FEED DE OCEANO AZUL */}
        <div className="lg:col-span-2 glass-panel border border-white/10 rounded-xl flex flex-col h-[600px] bg-black/20">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40 shrink-0">
            <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-v-white-off flex items-center gap-2">
              <MessageSquare size={14} className="text-[#d4af37]" /> Radar de Lacunas (Web)
            </h3>
            <button className="flex items-center gap-2 text-[0.65rem] text-gray-400 hover:text-[#d4af37] uppercase tracking-widest font-bold transition-colors">
              <Filter size={12} /> Filtrar
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-[#d4af37]/20">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-[#d4af37] animate-pulse">
                <Search size={32} className="mb-4 opacity-50" />
                <p className="font-montserrat text-sm uppercase tracking-widest">Escaneando a web...</p>
              </div>
            ) : insights.length > 0 ? (
              insights.map((insight) => (
                <div key={insight.id} className="bg-black/40 border border-white/5 p-5 rounded-xl hover:border-[#d4af37]/30 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <EmotionBadge category={insight.category} />
                      <span className="text-[0.6rem] text-gray-500 uppercase tracking-widest">{insight.platform} • {insight.time}</span>
                    </div>
                    <span className={`text-[0.55rem] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${insight.intensity.toLowerCase().includes('extrema') ? 'bg-red-500/10 text-red-400 border-red-500/30' : insight.intensity.toLowerCase().includes('alta') ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                      Intensidade: {insight.intensity}
                    </span>
                  </div>
                  <p className="font-montserrat text-sm text-gray-300 leading-relaxed italic group-hover:text-v-white-off transition-colors">
                    "{insight.quote}"
                  </p>
                  <div className="mt-4 flex justify-end">
                     <button className="text-[0.6rem] flex items-center gap-1 font-bold text-gray-500 uppercase tracking-widest hover:text-[#d4af37] transition-colors bg-white/5 px-2 py-1 rounded-md">
                       Transformar em Hook <ArrowRight size={10} />
                     </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="font-montserrat text-sm uppercase tracking-widest">Nenhuma demanda detectada.</p>
                <p className="font-montserrat text-xs mt-2 text-center max-w-sm">O motor está operando em background para preencher a base de dados com comentários cruciais da sua audiência.</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: CALIBRADOR DE TOM DE VOZ DA IA */}
        <div className="glass-panel border border-[#d4af37]/30 rounded-xl flex flex-col h-[600px] bg-[#d4af37]/5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-[0.03] text-[#d4af37] pointer-events-none"><BrainCircuit size={250} /></div>
          
          <div className="p-6 border-b border-[#d4af37]/10 relative z-10 bg-black/40 shrink-0">
            <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-[#d4af37] flex items-center gap-2">
              <Target size={14} /> Calibrador Brand Voice (IA)
            </h3>
          </div>
          
          <div className="flex-1 p-6 flex flex-col relative z-10 overflow-y-auto scrollbar-none">
            <p className="font-montserrat text-xs text-gray-400 mb-6 leading-relaxed">
              Baseado na lacuna <strong className="text-[#d4af37] uppercase">{dominantCategory}</strong>, a IA ajustou a personalidade da sua marca para máxima conversão.
            </p>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[0.65rem] font-montserrat font-bold uppercase tracking-widest text-v-white-off mb-2">
                  <span>Empatia (Acolhimento)</span>
                  <span className="text-[#d4af37]">{brandVoice.empatia}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-gray-700 to-[#d4af37]" style={{ width: `${brandVoice.empatia}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[0.65rem] font-montserrat font-bold uppercase tracking-widest text-v-white-off mb-2">
                  <span>Autoridade (Dureza)</span>
                  <span className="text-[#d4af37]">{brandVoice.autoridade}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-gray-700 to-[#d4af37]" style={{ width: `${brandVoice.autoridade}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[0.65rem] font-montserrat font-bold uppercase tracking-widest text-v-white-off mb-2">
                  <span>Humor / Ironia</span>
                  <span className="text-[#d4af37]">{brandVoice.humor}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-gray-700 to-[#d4af37]" style={{ width: `${brandVoice.humor}%` }}></div>
                </div>
                {brandVoice.aviso && (
                  <p className="text-[0.6rem] text-red-400 mt-2 font-montserrat italic bg-red-500/10 p-2 rounded-md border border-red-500/20">
                    {brandVoice.aviso}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 p-4 bg-black/50 border border-white/10 rounded-xl backdrop-blur-md shadow-lg">
              <h4 className="font-abhaya text-lg text-v-white-off mb-2 flex items-center gap-2">
                <Sparkles size={14} className="text-[#d4af37]" /> Diretriz de Conteúdo
              </h4>
              <p className="font-montserrat text-[0.7rem] text-gray-300 leading-relaxed italic">
                "{brandVoice.diretriz}"
              </p>
            </div>

            <div className="mt-auto pt-6">
              <button disabled={totalInsights === 0} className="w-full py-4 bg-[#d4af37] text-black font-montserrat text-[0.65rem] font-bold uppercase tracking-widest hover:bg-[#b5952f] transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
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
    <div className="glass-panel p-5 border border-white/5 rounded-xl hover:border-[#d4af37]/30 transition-colors flex flex-col justify-between h-32 bg-black/20">
      <div className="flex justify-between items-start">
        <p className="font-montserrat text-[0.6rem] uppercase tracking-widest text-gray-500">{title}</p>
        <div className={`${color} opacity-80`}>{icon}</div>
      </div>
      <div>
        <div className={`font-abhaya text-3xl font-bold mb-1 truncate ${color}`}>{value}</div>
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
  let Icon = Eye;

  const catLower = category.toLowerCase();

  // Cores alinhadas com o novo prompt de Oceano Azul
  if (catLower.includes("dor") || catLower.includes("medo")) {
    bgColor = "bg-red-500/10";
    textColor = "text-red-400";
    borderColor = "border-red-500/30";
    Icon = ShieldAlert;
  } else if (catLower.includes("demanda oculta")) {
    bgColor = "bg-purple-500/10";
    textColor = "text-purple-400";
    borderColor = "border-purple-500/30";
    Icon = Target;
  } else if (catLower.includes("aspiração")) {
    bgColor = "bg-[#d4af37]/10";
    textColor = "text-[#d4af37]";
    borderColor = "border-[#d4af37]/30";
    Icon = Sparkles;
  } else if (catLower.includes("objeção")) {
    bgColor = "bg-orange-500/10";
    textColor = "text-orange-400";
    borderColor = "border-orange-500/30";
    Icon = AlertTriangle;
  }

  return (
    <span className={`flex items-center gap-1.5 text-[0.55rem] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${bgColor} ${textColor} ${borderColor}`}>
      <Icon size={10} />
      {category}
    </span>
  );
}
"use client";

import { useState, useEffect } from "react";
import { 
  Clapperboard, Magnet, Zap, Flame, 
  Target, Calculator, ArrowRight, PlayCircle, 
  Activity, CheckCircle2, ShieldAlert, Crosshair, 
  Layers, RefreshCw, PenTool, BatteryCharging
} from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { motion, AnimatePresence } from "framer-motion";

// === DADOS MOCKADOS (Até a API do Pilar 5/6 estar finalizada no Backend) ===
const mockStoryboard = [
  { id: 1, ep: "Episódio 1", type: "Dopamina", title: "O grande inimigo do seu nicho", status: "Pronto", openLoop: "Revela um erro fatal, mas a solução é adiada." },
  { id: 2, ep: "Episódio 2", type: "Ocitocina", title: "Bastidores do meu maior fracasso", status: "Rascunho", openLoop: "Mostra vulnerabilidade, conecta a dor com o produto." },
  { id: 3, ep: "Episódio 3", type: "Serotonina", title: "Prova Social: Como o Cliente X venceu", status: "Em Produção", openLoop: "O gatilho de status que prepara o terreno para a oferta." },
];

export default function TheSyndicatePage() {
  const { tenantInfo, toggleTenant } = useTenant();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // === ESTADOS DO GRAND SLAM (PILAR 6) ===
  const [offerPromise, setOfferPromise] = useState(8); // Certeza de resultado (0-10)
  const [offerEffort, setOfferEffort] = useState(6); // Esforço exigido do cliente (0-10)
  const [isGeneratingOffer, setIsGeneratingOffer] = useState(false);

  const loadSyndicateData = async () => {
    setIsLoading(true);
    setIsRefreshing(true);
    try {
      // Simula a busca de dados dos Pilares 5 e 6
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Falha ao sincronizar o Sindicato:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSyndicateData();
  }, [tenantInfo?.id]);

  const handleRefresh = () => {
    loadSyndicateData();
  };

  const handleGenerateCopy = () => {
    setIsGeneratingOffer(true);
    setTimeout(() => {
      setIsGeneratingOffer(false);
      alert("Acesso ao Módulo de VSL restrito na versão atual de teste. A oferta precisa de um Esforço menor que 4 para aprovação automática da IA.");
    }, 2000);
  };

  // === CÁLCULO DA OFERTA (Hormozi) ===
  // Equação de Valor = (Promessa) / (Esforço/Tempo). Simplificado para demonstração UI.
  const offerScore = Math.min(Math.round((offerPromise * 10) / (offerEffort + 1)), 99);
  const isOfferReady = offerScore > 75;

  return (
    // NO-SCROLL CONTAINER
    <div className="relative h-full w-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto space-y-8 pb-32">
          
          {/* 1. CABEÇALHO TÁTICO */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-v-white-off/10 pb-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_#f97316]"></span>
                <span className="font-montserrat text-[0.65rem] text-orange-400 uppercase tracking-widest border border-orange-500/30 px-2 py-1 bg-orange-500/10 rounded-md shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                  Câmara de Ativação
                </span>
              </div>
              <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-v-white-off tracking-wide">
                O <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">Sindicato</span>
              </h1>
              <p className="font-montserrat text-xs text-gray-500 uppercase tracking-widest mt-2">
                Showrunning & Engenharia de Fechamento
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
              <div className="flex items-center gap-2 bg-black/60 border border-white/10 p-2 rounded-xl backdrop-blur-md shadow-2xl relative group hover:border-orange-500/30 transition-colors">
                <div className="w-10 h-10 bg-orange-900/20 rounded-lg flex items-center justify-center font-abhaya text-orange-500 text-xl border border-orange-500/40 shadow-[inset_0_0_15px_rgba(249,115,22,0.3)]">
                  {tenantInfo?.initials || "-"}
                </div>
                <div className="pr-2 hidden sm:block">
                  <p className="font-montserrat text-[0.6rem] text-gray-500 uppercase tracking-widest">A Produzir Para</p>
                  <p className="font-montserrat text-sm font-bold text-v-white-off">{tenantInfo?.name || "Carregando..."}</p>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTenant}
                  className="px-3 py-2 text-[0.65rem] font-bold text-black bg-orange-500 uppercase tracking-widest hover:bg-orange-400 transition-colors rounded-md shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                >
                  Trocar
                </motion.button>
              </div>

              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-3 bg-black border rounded-xl transition-all shadow-lg flex items-center justify-center ${isRefreshing ? 'border-orange-500 bg-orange-500/10 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'border-white/10 text-gray-400 hover:border-orange-500/50 hover:text-orange-400 hover:bg-orange-500/5'}`}
                title="Sincronizar Produção"
              >
                <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
              </motion.button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch relative z-10">
            
            {/* === COLUNA 1: O SHOWRUNNER (PILAR 5) === */}
            <section className="glass-panel border border-orange-500/20 rounded-xl flex flex-col h-[700px] relative overflow-hidden bg-[#050505] shadow-[0_0_40px_rgba(249,115,22,0.05)]">
              <div className="absolute -right-10 -top-10 opacity-[0.02] pointer-events-none text-orange-500">
                <Clapperboard size={300} />
              </div>
              
              <div className="p-6 border-b border-orange-500/20 flex justify-between items-center relative z-10 shrink-0 bg-black/80 backdrop-blur-md">
                <div>
                  <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-orange-500 flex items-center gap-2">
                    <Clapperboard size={16} /> Matriz de Retenção (A Série)
                  </h3>
                  <p className="text-[0.6rem] text-gray-500 font-montserrat uppercase tracking-widest mt-1">
                    Orquestrando Open Loops e Neuroquímica
                  </p>
                </div>
                <span className="text-[0.6rem] font-bold uppercase tracking-widest px-3 py-1 bg-orange-500/10 text-orange-400 rounded-md border border-orange-500/20 flex items-center gap-2 shadow-[inset_0_0_15px_rgba(249,115,22,0.2)]">
                  <Activity size={10} className="animate-pulse" /> IA Showrunner
                </span>
              </div>

              {/* Balança de Dopamina */}
              <div className="p-6 border-b border-white/5 bg-black/40 relative z-10 shrink-0">
                <div className="flex justify-between items-end mb-2">
                  <p className="font-montserrat text-[0.6rem] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <BatteryCharging size={12} className="text-orange-400" /> Balança Neuroquímica da Semana
                  </p>
                  <p className="font-montserrat text-[0.6rem] text-green-400 uppercase tracking-widest">Ideal</p>
                </div>
                <div className="w-full h-2 bg-black/80 rounded-full overflow-hidden border border-white/5 flex shadow-inner">
                  <div className="h-full bg-red-500 transition-all shadow-[0_0_10px_#ef4444]" style={{ width: `40%` }} title="Dopamina (Entretenimento/Choque)"></div>
                  <div className="h-full bg-blue-500 transition-all shadow-[0_0_10px_#3b82f6]" style={{ width: `30%` }} title="Ocitocina (Vulnerabilidade/Conexão)"></div>
                  <div className="h-full bg-green-500 transition-all shadow-[0_0_10px_#22c55e]" style={{ width: `30%` }} title="Serotonina (Status/Autoridade)"></div>
                </div>
                <div className="flex justify-between mt-2 text-[0.5rem] font-montserrat uppercase tracking-widest font-bold">
                  <span className="text-red-500">DOPAMINA</span>
                  <span className="text-blue-500">OCITOCINA</span>
                  <span className="text-green-500">SEROTONINA</span>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative z-10 bg-black/20">
                <div className="space-y-4">
                  {mockStoryboard.map((ep, idx) => (
                    <motion.div 
                      key={ep.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-black/60 border border-white/5 p-5 rounded-xl hover:border-orange-500/30 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[0.55rem] font-bold text-gray-500 uppercase tracking-widest">{ep.ep}</span>
                          <span className={`text-[0.55rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${ep.type === 'Dopamina' ? 'bg-red-500/10 text-red-400 border-red-500/30' : ep.type === 'Ocitocina' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                            {ep.type}
                          </span>
                        </div>
                        <span className={`text-[0.55rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${ep.status === 'Pronto' ? 'bg-green-500/5 border-green-500/20 text-green-500' : 'bg-gray-500/5 border-gray-500/20 text-gray-500'}`}>
                          {ep.status}
                        </span>
                      </div>
                      
                      <h4 className="font-abhaya text-xl text-v-white-off mb-2">{ep.title}</h4>
                      
                      <div className="mt-3 p-3 bg-orange-500/5 border border-orange-500/10 rounded-lg">
                        <p className="text-[0.6rem] font-montserrat font-bold text-orange-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Zap size={10}/> Open Loop</p>
                        <p className="text-xs text-gray-300 font-montserrat italic">{ep.openLoop}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 border-2 border-dashed border-white/10 rounded-xl p-4 flex items-center justify-center cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all text-gray-500 hover:text-orange-400 group">
                  <div className="text-center font-montserrat text-[0.65rem] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} className="group-hover:scale-110 transition-transform" /> 
                    <span>Adicionar Episódio (IA)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* === COLUNA 2: A MÁQUINA DE VENDAS (PILAR 6) === */}
            <section className="glass-panel border border-green-500/20 rounded-xl flex flex-col h-[700px] relative overflow-hidden bg-[#050505] shadow-[0_0_40px_rgba(34,197,94,0.05)]">
              <div className="absolute -right-10 -bottom-10 opacity-[0.02] pointer-events-none text-green-500">
                <Magnet size={300} />
              </div>

              <div className="p-6 border-b border-green-500/20 flex justify-between items-center relative z-10 shrink-0 bg-black/80 backdrop-blur-md">
                <div>
                  <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-green-400 flex items-center gap-2">
                    <Magnet size={16} /> Calculadora Grand Slam (Vendas)
                  </h3>
                  <p className="text-[0.6rem] text-gray-500 font-montserrat uppercase tracking-widest mt-1">
                    Equação de Valor & Risco Assimétrico
                  </p>
                </div>
              </div>

              <div className="flex-1 p-6 relative z-10 flex flex-col gap-6">
                
                {/* O Medidor de Risco/Oferta */}
                <div className="bg-black/60 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                  <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent ${isOfferReady ? 'via-green-500' : 'via-red-500'} to-transparent transition-colors duration-500`}></div>
                  
                  <p className="font-montserrat text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest mb-4">Índice de Irresistibilidade</p>
                  
                  <div className="flex items-end justify-center gap-2">
                    <span className={`font-abhaya text-7xl font-bold transition-colors duration-500 drop-shadow-md ${isOfferReady ? 'text-green-400' : 'text-red-500'}`}>
                      {offerScore}
                    </span>
                    <span className="font-montserrat text-sm text-gray-500 mb-2 uppercase font-bold tracking-widest">/ 100</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {isOfferReady ? (
                      <span className="text-[0.65rem] text-green-400 font-bold uppercase tracking-widest flex items-center gap-1 bg-green-500/10 px-3 py-1 rounded-md border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]"><CheckCircle2 size={12}/> Oferta Letal. Pronta para Escala.</span>
                    ) : (
                      <span className="text-[0.65rem] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1 bg-red-500/10 px-3 py-1 rounded-md border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]"><ShieldAlert size={12}/> Alto Atrito. A IA recusará gerar copy.</span>
                    )}
                  </div>
                </div>

                {/* Os Controlos da Equação (Sliders) */}
                <div className="space-y-6 flex-1">
                  <div className="space-y-2 group">
                    <div className="flex justify-between">
                      <label className="text-[0.65rem] font-montserrat font-bold text-gray-400 uppercase tracking-widest group-hover:text-v-white-off transition-colors">Resultado Prometido (Certeza)</label>
                      <span className="text-[0.65rem] font-mono text-green-400">{offerPromise}/10</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" 
                      value={offerPromise} onChange={(e) => setOfferPromise(parseInt(e.target.value))}
                      className="w-full accent-green-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[0.55rem] text-gray-500 font-montserrat">Quão rápido e garantido é o resultado principal?</p>
                  </div>

                  <div className="space-y-2 group">
                    <div className="flex justify-between">
                      <label className="text-[0.65rem] font-montserrat font-bold text-gray-400 uppercase tracking-widest group-hover:text-v-white-off transition-colors">Esforço Exigido (Fricção)</label>
                      <span className="text-[0.65rem] font-mono text-red-400">{offerEffort}/10</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" 
                      value={offerEffort} onChange={(e) => setOfferEffort(parseInt(e.target.value))}
                      className="w-full accent-red-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[0.55rem] text-gray-500 font-montserrat">Quanto tempo/dinheiro o cliente perde antes de ver valor?</p>
                  </div>
                </div>

                {/* Botão de Ativação */}
                <div className="mt-auto">
                  <motion.button 
                    whileTap={{ scale: isOfferReady ? 0.95 : 1 }}
                    onClick={handleGenerateCopy}
                    disabled={!isOfferReady || isGeneratingOffer}
                    className={`w-full py-4 font-montserrat text-[0.65rem] font-bold uppercase tracking-widest transition-all rounded-xl flex justify-center items-center gap-2 ${
                      isOfferReady 
                        ? 'bg-green-600 text-white shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:bg-green-500 cursor-pointer' 
                        : 'bg-black border border-white/5 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isGeneratingOffer ? (
                      <><Activity size={14} className="animate-spin" /> Aplicando Gatilhos de Cialdini...</>
                    ) : (
                      <><PenTool size={14} /> Gerar VSL & Sequência de Fechamento</>
                    )}
                  </motion.button>
                  {!isOfferReady && (
                    <p className="text-center text-[0.55rem] text-red-500/70 uppercase tracking-widest mt-3 font-montserrat font-bold">
                      Reduza o Esforço Exigido para desbloquear a Máquina.
                    </p>
                  )}
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
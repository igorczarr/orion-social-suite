"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { 
  Globe, DollarSign, Target, ShieldCheck, AlertTriangle, Play, FileText
} from "lucide-react";

// === MOCK DATA DE ALTA DENSIDADE (O VOSSO TRACKRECORD) ===
const globalMetrics = {
  contentProduced: "14.285",
  totalViews: "1.4B",
  managedAdSpend: "R$ 42.5M",
  globalRoas: "4.8x"
};

const organicData = [
  { label: "Vídeos Curtos (Reels/TikTok)", value: "8.402", growth: "+12%", share: 60, color: "bg-blue-500" },
  { label: "Long-Form (YouTube)", value: "1.240", growth: "+24%", share: 20, color: "bg-red-500" },
  { label: "Artigos & SEO Copy", value: "4.643", growth: "+8%", share: 20, color: "bg-[#d4af37]" }
];

const selfCritique = [
  { client: "Apex Aesthetics", issue: "Fadiga de Criativos (Ads)", impact: "CPA aumentou 14% em 72h", action: "Injetar novos ângulos do Showrunner", status: "Crítico" },
  { client: "Nexus Finance", issue: "Queda em Branded Search", impact: "Tráfego orgânico -5% (7d)", action: "Auditoria SEO / PR", status: "Alerta" }
];

const portfolioMatrix = [
  { id: "CL-01", name: "Alpha Health", niche: "Saúde & Estética", content: "2.1k", views: "45M", ads: "R$ 1.2M", roas: "5.2x", status: "Scaling" },
  { id: "CL-02", name: "Nexus Finance", niche: "Mercado Financeiro", content: "840", views: "12M", ads: "R$ 4.5M", roas: "3.8x", status: "Stable" },
  { id: "CL-03", name: "Lumina Wear", niche: "E-commerce (Moda)", content: "4.2k", views: "120M", ads: "R$ 8.2M", roas: "6.1x", status: "Scaling" },
  { id: "CL-04", name: "TechNova OS", niche: "SaaS B2B", content: "150", views: "800k", ads: "R$ 350k", roas: "8.5x", status: "Optimizing" },
];

export default function TrackrecordGodMode() {
  const [timeframe, setTimeframe] = useState("all-time");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      {/* =====================================================================
          1. HEADER TÁTICO & CONTROLES GLOBAIS
      ===================================================================== */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-pulse shadow-[0_0_8px_#d4af37]"></div>
            <span className="font-mono text-[9px] text-[#d4af37] uppercase tracking-widest font-bold">
              Painel de Autoavaliação & Monopólio
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-white tracking-wide">
            VRTICE <span className="text-gray-500">Trackrecord</span>
          </h1>
        </div>

        <div className="flex items-center bg-[#0a0a0a] border border-white/5 rounded-lg p-1 shadow-inner">
          <button onClick={() => setTimeframe('30d')} className={`px-4 py-1.5 text-[9px] uppercase font-bold tracking-widest rounded transition-all ${timeframe === '30d' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-600 hover:text-gray-300'}`}>30 Dias</button>
          <button onClick={() => setTimeframe('ytd')} className={`px-4 py-1.5 text-[9px] uppercase font-bold tracking-widest rounded transition-all ${timeframe === 'ytd' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-600 hover:text-gray-300'}`}>YTD</button>
          <button onClick={() => setTimeframe('all-time')} className={`px-4 py-1.5 text-[9px] uppercase font-bold tracking-widest rounded transition-all ${timeframe === 'all-time' ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'text-gray-600 hover:text-gray-300'}`}>All-Time</button>
        </div>
      </header>

      {/* =====================================================================
          2. THE HUD (KPIs Globais)
      ===================================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard 
          title="Peças de Conteúdo (Total)" 
          value={globalMetrics.contentProduced} 
          subtitle="Vídeos, Artigos, Copys" 
          icon={<FileText size={16} />} 
          color="text-[#d4af37]" 
        />
        <KPICard 
          title="Atenção Capturada (Views)" 
          value={globalMetrics.totalViews} 
          subtitle="Impacto Orgânico + Pago" 
          icon={<Globe size={16} />} 
          color="text-blue-400" 
        />
        <KPICard 
          title="Capital Gerido (Ad Spend)" 
          value={globalMetrics.managedAdSpend} 
          subtitle="Alocação em Mídia" 
          icon={<DollarSign size={16} />} 
          color="text-gray-300" 
        />
        <KPICard 
          title="Alpha Gerado (ROAS Médio)" 
          value={globalMetrics.globalRoas} 
          subtitle="Performance do Portfólio" 
          icon={<Target size={16} />} 
          color="text-[#10B981]" 
        />
      </section>

      {/* =====================================================================
          3. O CÉREBRO: DISTRIBUIÇÃO ORGÂNICA & A AUTO-CRÍTICA
      ===================================================================== */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Gráfico de Densidade de Produção */}
        <motion.div variants={itemVariants} className="xl:col-span-8 bg-[#050505]/80 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4 relative z-10">
            <h2 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold flex items-center gap-2">
              <Play size={14} className="text-blue-400" /> Distribuição de Conteúdo & Tráfego Orgânico
            </h2>
            <span className="text-[9px] font-mono text-gray-500">Volumetria de Assets</span>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6 relative z-10">
            {organicData.map((data, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-white">{data.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold text-white">{data.value}</span>
                    <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20">{data.growth}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${data.share}%` }} transition={{ duration: 1.5, delay: i * 0.2 }}
                    className={`h-full ${data.color} shadow-[0_0_10px_currentColor]`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* O Motor de Auto-Crítica */}
        <motion.div variants={itemVariants} className="xl:col-span-4 bg-red-950/10 backdrop-blur-xl border border-red-500/20 p-6 rounded-2xl shadow-[inset_0_0_30px_rgba(239,68,68,0.05)] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-red-500 shadow-[0_0_15px_#EF4444]"></div>
          
          <div className="flex justify-between items-center mb-6 border-b border-red-500/10 pb-4">
            <h2 className="text-[10px] text-red-500 uppercase tracking-widest font-bold flex items-center gap-2">
              <AlertTriangle size={14} /> Orion Self-Critique Engine
            </h2>
          </div>
          
          <p className="text-[10px] text-gray-400 leading-relaxed mb-4">
            Auditoria interna ativa. O sistema mapeou falhas ou quedas de performance na infraestrutura VRTICE que requerem intervenção imediata.
          </p>

          <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {selfCritique.map((critique, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-white/5 p-3 rounded-xl hover:border-red-500/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-white truncate max-w-[150px]">{critique.client}</span>
                  <span className={`text-[8px] font-mono uppercase tracking-widest font-bold px-1.5 py-0.5 rounded border ${critique.status === 'Crítico' ? 'text-red-400 bg-red-500/10 border-red-500/30' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'}`}>
                    {critique.status}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest">Problema: <strong className="text-gray-300 normal-case">{critique.issue}</strong></span>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest">Impacto: <strong className="text-gray-300 normal-case">{critique.impact}</strong></span>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5">
                  <span className="text-[9px] text-[#d4af37] font-mono uppercase tracking-widest block">Ação Recomendada:</span>
                  <span className="text-[10px] text-white font-bold leading-tight">{critique.action}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </section>

      {/* =====================================================================
          4. MATRIZ DE PORTFÓLIO (A LISTA DE CLIENTES)
      ===================================================================== */}
      <motion.section variants={itemVariants} className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-[#0a0a0a]">
          <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#10B981]" /> Client Portfolio Matrix (Live Data)
          </h2>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/80 text-[8px] uppercase tracking-[0.2em] text-gray-500 font-bold border-b border-white/5">
                <th className="p-4 whitespace-nowrap">ID / Entidade</th>
                <th className="p-4 whitespace-nowrap">Nicho (Mercado)</th>
                <th className="p-4 text-center whitespace-nowrap">Volume de Conteúdo</th>
                <th className="p-4 text-center whitespace-nowrap">Tráfego Gerado</th>
                <th className="p-4 text-center whitespace-nowrap">Ad Spend (Mídia)</th>
                <th className="p-4 text-center whitespace-nowrap">ROAS / Alpha</th>
                <th className="p-4 text-right pr-6 whitespace-nowrap">Status do Funil</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[10px] text-gray-300">
              {portfolioMatrix.map((client, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-default">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#121927] border border-white/10 flex items-center justify-center text-[9px] font-bold shadow-inner">
                      {client.id.split('-')[1]}
                    </div>
                    <span className="font-bold text-white text-xs font-sans tracking-wide group-hover:text-[#d4af37] transition-colors">{client.name}</span>
                  </td>
                  <td className="p-4 text-gray-500 font-sans text-[10px] font-bold tracking-widest uppercase">{client.niche}</td>
                  <td className="p-4 text-center text-white">{client.content}</td>
                  <td className="p-4 text-center font-bold text-blue-400">{client.views}</td>
                  <td className="p-4 text-center text-gray-400">{client.ads}</td>
                  <td className="p-4 text-center font-bold text-[#10B981] text-sm drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">{client.roas}</td>
                  <td className="p-4 text-right pr-6">
                    <span className={`inline-block px-2.5 py-1 rounded text-[8px] font-bold uppercase tracking-widest border shadow-inner ${
                      client.status === 'Scaling' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' : 
                      client.status === 'Optimizing' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 
                      'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

    </motion.div>
  );
}

// === WIDGET AUXILIAR: KPI CARD ===
function KPICard({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="bg-[#050505]/80 backdrop-blur-xl p-5 md:p-6 border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] group relative overflow-hidden flex flex-col justify-between h-36">
      <div className={`absolute -right-10 -top-10 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity bg-current ${color}`}></div>
      
      <div className="flex justify-between items-start relative z-10">
        <p className="font-montserrat text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold w-2/3 leading-relaxed">{title}</p>
        <div className={`p-2 rounded-lg bg-black/50 border border-white/5 ${color} opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-inner`}>
          {icon}
        </div>
      </div>
      
      <div className="relative z-10 mt-auto">
        <div className={`font-mono text-3xl md:text-4xl font-bold tracking-tight mb-1 truncate drop-shadow-md ${color}`}>{value}</div>
        <div className="text-[8px] text-gray-600 font-mono uppercase tracking-widest truncate">
          {subtitle}
        </div>
      </div>
    </motion.div>
  );
}
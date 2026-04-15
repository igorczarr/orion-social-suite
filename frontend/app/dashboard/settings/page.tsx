"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Settings, Key, Users, Shield, Database, Eye, EyeOff, 
  Save, Activity, Terminal, CheckCircle2, ServerCrash, 
  Skull, Plus, Fingerprint, Lock
} from "lucide-react";

// === MOCK DATA: CONFIGURAÇÕES E AUDITORIA ===
const mockClients = [
  { id: "CL-01", name: "Alpha Health", status: "Ativo", lastSync: "Hoje, 14:02", dataUsage: "4.2 GB", nodes: 12 },
  { id: "CL-02", name: "Nexus Finance", status: "Ativo", lastSync: "Hoje, 12:15", dataUsage: "8.1 GB", nodes: 24 },
  { id: "CL-03", name: "Lumina Wear", status: "Pausado", lastSync: "Ontem, 09:30", dataUsage: "1.5 GB", nodes: 4 },
  { id: "CL-04", name: "TechNova OS", status: "Ativo", lastSync: "Hoje, 08:00", dataUsage: "2.8 GB", nodes: 8 },
];

const auditLogs = [
  { time: "14:05:22", ip: "192.168.1.45", event: "Autenticação MFA Bem Sucedida (Admin)", status: "success" },
  { time: "13:12:05", ip: "10.0.0.102", event: "Alteração de Chave API (Gemini-Pro-1.5)", status: "warning" },
  { time: "09:45:11", ip: "172.16.254.1", event: "Disparo Manual de Scraper (CL-01)", status: "success" },
  { time: "02:33:01", ip: "45.22.11.99", event: "Tentativa de Acesso Bloqueada (Invalid AES Token)", status: "danger" },
  { time: "02:33:00", ip: "45.22.11.99", event: "Tentativa de Acesso Bloqueada (Invalid AES Token)", status: "danger" },
];

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<'apis' | 'entities' | 'security'>('apis');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [apiKeys, setApiKeys] = useState({
    gemini: "AIzaSyB_MockKey_789456123_SecureString_XX",
    apify: "apify_api_MockKey_WebScraper_Terminal",
    meta: ""
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("✅ Chaves criptográficas injetadas no cofre do sistema com sucesso.");
    }, 2000);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 h-full"
    >
      {/* =====================================================================
          1. CABEÇALHO TÁTICO
      ===================================================================== */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full shadow-[0_0_8px_#6b7280]"></div>
            <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest font-bold">
              Painel de Controlo Global
            </span>
          </div>
          <h1 className="font-abhaya text-4xl md:text-5xl font-bold text-white tracking-wide">
            System <span className="text-gray-500 drop-shadow-[0_0_15px_rgba(156,163,175,0.2)]">Config</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest bg-black border border-white/10 px-3 py-1.5 rounded shadow-inner">
            v2.4.0 (Orion Core)
          </span>
        </div>
      </header>

      {/* =====================================================================
          2. ESTRUTURA DE NAVEGAÇÃO E CONTEÚDO
      ===================================================================== */}
      <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden relative z-10 pb-10">
        
        {/* NAVEGAÇÃO LATERAL (MENU SETTINGS) */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('apis')}
            className={`flex items-center gap-3 px-4 py-4 rounded-xl font-mono text-[10px] uppercase tracking-widest font-bold transition-all relative overflow-hidden ${activeTab === 'apis' ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 shadow-[inset_0_0_15px_rgba(212,175,55,0.05)]' : 'bg-[#050505] text-gray-500 border border-white/5 hover:bg-white/5 hover:text-gray-300'}`}
          >
            {activeTab === 'apis' && <div className="absolute left-0 top-0 w-1 h-full bg-[#d4af37] shadow-[0_0_10px_#d4af37]"></div>}
            <Key size={16} /> Córtex & APIs
          </button>

          <button 
            onClick={() => setActiveTab('entities')}
            className={`flex items-center gap-3 px-4 py-4 rounded-xl font-mono text-[10px] uppercase tracking-widest font-bold transition-all relative overflow-hidden ${activeTab === 'entities' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-[inset_0_0_15px_rgba(59,130,246,0.05)]' : 'bg-[#050505] text-gray-500 border border-white/5 hover:bg-white/5 hover:text-gray-300'}`}
          >
            {activeTab === 'entities' && <div className="absolute left-0 top-0 w-1 h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>}
            <Users size={16} /> Client Roster
          </button>

          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-4 rounded-xl font-mono text-[10px] uppercase tracking-widest font-bold transition-all relative overflow-hidden ${activeTab === 'security' ? 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[inset_0_0_15px_rgba(239,68,68,0.05)]' : 'bg-[#050505] text-gray-500 border border-white/5 hover:bg-white/5 hover:text-gray-300'}`}
          >
            {activeTab === 'security' && <div className="absolute left-0 top-0 w-1 h-full bg-red-500 shadow-[0_0_10px_#ef4444]"></div>}
            <Shield size={16} /> Blindagem & Logs
          </button>
        </div>

        {/* ÁREA DE CONTEÚDO (TABS) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative">
          <AnimatePresence mode="wait">
            
            {/* === TAB 1: APIs & INTEGRAÇÕES === */}
            {activeTab === 'apis' && (
              <motion.div key="apis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Database size={250} className="text-[#d4af37]" /></div>
                  
                  <div className="mb-8 border-b border-white/5 pb-4 relative z-10">
                    <h2 className="text-[10px] text-[#d4af37] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                      <Key size={14} /> Integrações do Córtex (Chaves Mestras)
                    </h2>
                    <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-2">
                      Gestão de credenciais de Machine Learning e Web Scraping.
                    </p>
                  </div>

                  <form onSubmit={handleSave} className="space-y-6 relative z-10 max-w-3xl">
                    <div className="space-y-2 bg-[#0a0a0a] p-4 rounded-xl border border-white/5 shadow-inner">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Google Gemini Pro (API Key)</label>
                        <span className="flex items-center gap-1 text-[8px] font-bold font-mono text-[#10B981] uppercase tracking-widest bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20"><CheckCircle2 size={10}/> Ping: 12ms</span>
                      </div>
                      <div className="relative">
                        <input 
                          type={showKey ? "text" : "password"} 
                          value={apiKeys.gemini}
                          onChange={(e) => setApiKeys({...apiKeys, gemini: e.target.value})}
                          className="w-full bg-[#020202] border border-white/10 rounded-lg py-3 pl-4 pr-12 text-xs font-mono text-white focus:border-[#d4af37] outline-none transition-all shadow-inner" 
                        />
                        <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#d4af37] transition-colors p-1 bg-white/5 rounded">
                          {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 bg-[#0a0a0a] p-4 rounded-xl border border-white/5 shadow-inner">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Apify Scraper (API Token)</label>
                        <span className="flex items-center gap-1 text-[8px] font-bold font-mono text-[#10B981] uppercase tracking-widest bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20"><CheckCircle2 size={10}/> Ping: 45ms</span>
                      </div>
                      <div className="relative">
                        <input 
                          type={showKey ? "text" : "password"} 
                          value={apiKeys.apify}
                          onChange={(e) => setApiKeys({...apiKeys, apify: e.target.value})}
                          className="w-full bg-[#020202] border border-white/10 rounded-lg py-3 px-4 text-xs font-mono text-white focus:border-[#d4af37] outline-none transition-all shadow-inner" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2 bg-[#0a0a0a] p-4 rounded-xl border border-white/5 shadow-inner">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Meta Graph API (Ads Intel)</label>
                        <span className="flex items-center gap-1 text-[8px] font-bold font-mono text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20"><ServerCrash size={10}/> Não Configurado</span>
                      </div>
                      <div className="relative">
                        <input 
                          type={showKey ? "text" : "password"} 
                          value={apiKeys.meta}
                          onChange={(e) => setApiKeys({...apiKeys, meta: e.target.value})}
                          placeholder="Cole a chave de acesso do Meta Developer..."
                          className="w-full bg-[#020202] border border-red-500/30 rounded-lg py-3 px-4 text-xs font-mono text-white focus:border-red-500 outline-none transition-all shadow-inner placeholder-gray-700" 
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex justify-end">
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        disabled={isSaving}
                        type="submit"
                        className="px-8 py-3 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 font-bold text-[10px] uppercase tracking-widest hover:bg-[#d4af37] hover:text-black transition-all rounded-lg flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.15)] disabled:opacity-50"
                      >
                        {isSaving ? <><Activity size={14} className="animate-spin"/> Sincronizando Cofre...</> : <><Save size={14}/> Aplicar Criptografia</>}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* === TAB 2: ENTIDADES (CLIENTES) === */}
            {activeTab === 'entities' && (
              <motion.div key="entities" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col">
                  
                  <div className="p-6 border-b border-white/5 bg-[#0a0a0a] flex justify-between items-center">
                    <h2 className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                      <Users size={14} /> Entidades Monitorizadas (Client Roster)
                    </h2>
                    <button className="bg-blue-500 text-black px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 hover:bg-white transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                      <Plus size={12} strokeWidth={3} /> Nova Entidade
                    </button>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar p-6">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-black/60 text-[8px] uppercase tracking-[0.2em] text-gray-500 font-bold border-b border-white/10">
                          <th className="p-4 rounded-tl-lg">ID</th>
                          <th className="p-4">Entidade</th>
                          <th className="p-4 text-center">Última Varredura (OSINT)</th>
                          <th className="p-4 text-center">Data Lake Size</th>
                          <th className="p-4 text-right rounded-tr-lg pr-6">Status Operacional</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono text-[10px] text-gray-300">
                        {mockClients.map((client, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-default">
                            <td className="p-4 font-bold text-gray-500">{client.id}</td>
                            <td className="p-4 text-white font-bold tracking-wider font-sans group-hover:text-blue-400 transition-colors">{client.name}</td>
                            <td className="p-4 text-center text-gray-400">{client.lastSync}</td>
                            <td className="p-4 text-center text-blue-400">{client.dataUsage}</td>
                            <td className="p-4 text-right pr-6">
                              <span className={`inline-block px-2.5 py-1 rounded text-[8px] font-bold uppercase tracking-widest border shadow-inner ${
                                client.status === 'Ativo' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                              }`}>
                                {client.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* === TAB 3: BLINDAGEM E LOGS === */}
            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Status de Segurança */}
                  <div className="bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] hover:border-red-500/20 transition-colors">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 mb-6 flex items-center gap-2">
                      <Shield size={14} /> Status de Blindagem
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-[#0a0a0a] p-4 rounded-xl border border-white/5 shadow-inner">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2"><Fingerprint size={12}/> Autenticação MFA</span>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/20">Ativo (Escudo Nível 3)</span>
                      </div>
                      <div className="flex justify-between items-center bg-[#0a0a0a] p-4 rounded-xl border border-white/5 shadow-inner">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2"><Lock size={12}/> Sessões Ativas</span>
                        <span className="text-[10px] font-mono text-white font-bold bg-black px-3 py-1 rounded border border-gray-700">1 (Este dispositivo)</span>
                      </div>
                    </div>
                  </div>

                  {/* Kill Switch */}
                  <div className="bg-red-950/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 shadow-[inset_0_0_40px_rgba(239,68,68,0.05)] flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-red-500 opacity-50"></div>
                    <Skull size={32} className="text-red-500/40 mb-4" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 mb-2">Protocolo de Evacuação (Kill Switch)</h3>
                    <p className="text-[9px] font-mono text-gray-500 mb-6 max-w-sm leading-relaxed">
                      Exclui imediatamente todas as chaves API, purga os caches do Data Lake e encerra as sessões ativas globalmente.
                    </p>
                    <motion.button whileTap={{ scale: 0.95 }} className="px-8 py-3 bg-red-600/10 text-red-500 border border-red-500/30 font-bold text-[9px] uppercase tracking-widest rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                      Purgar Sistema Agora
                    </motion.button>
                  </div>
                </div>

                {/* Audit Logs Terminal */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                      <Terminal size={12} /> System Audit Logs
                    </h3>
                    <div className="flex gap-1.5 items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-1.5 font-mono text-[10px] h-64 overflow-y-auto custom-scrollbar bg-[#020202]">
                    {auditLogs.map((log, i) => (
                      <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 py-1 border-b border-white/5 hover:bg-white/[0.02] px-2 transition-colors">
                        <span className="text-gray-600 shrink-0">[{log.time}]</span>
                        <span className="text-gray-500 shrink-0 w-28">IP: {log.ip}</span>
                        <span className="text-gray-300 flex-1 truncate">{log.event}</span>
                        <span className={`uppercase font-bold tracking-widest shrink-0 ${log.status === 'success' ? 'text-[#10B981]' : log.status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`}>
                          {log.status}
                        </span>
                      </div>
                    ))}
                    <div className="text-gray-600 pt-2 animate-pulse">&gt; Aguardando novos eventos...</div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </motion.div>
  );
}
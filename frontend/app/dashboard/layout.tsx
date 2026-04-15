"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Radar, BrainCircuit, Swords, Fingerprint, Trophy,
  ChevronLeft, ChevronRight, LogOut, Settings, Bell, Mic, Search, Command
} from "lucide-react";
import { useTenant, TenantProvider } from "@/contexts/TenantContext";

// Blindagem do Contexto na Raiz do Dashboard
export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <DashboardChassis>{children}</DashboardChassis>
    </TenantProvider>
  );
}

function DashboardChassis({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMode, setActiveMode] = useState<'god' | 'sales' | 'brand'>('god');
  const pathname = usePathname();
  const router = useRouter();
  const { tenantInfo } = useTenant();

  const handleLogout = () => {
    localStorage.removeItem("orion_token");
    router.replace("/");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#020202] text-gray-300 font-montserrat">
      
      {/* =========================================================
          1. SIDEBAR (NAVEGAÇÃO TÁTICA E 6 PILARES)
      ========================================================= */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} border-r border-white/5 flex flex-col justify-between relative z-40 transition-all duration-500 ease-in-out shrink-0 bg-[#050505] shadow-[5px_0_30px_rgba(0,0,0,0.8)]`}>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-[#0a0a0a] border border-white/10 text-gray-500 rounded-full p-1 hover:bg-[#d4af37]/20 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all z-50 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-6 flex ${isCollapsed ? 'justify-center' : 'justify-start'} border-b border-white/5 h-20 items-center overflow-hidden shrink-0`}>
          <div className="flex items-center gap-3">
            {/* Ícone Geométrico VRTICE Simplificado */}
            <div className="w-6 h-6 border border-[#d4af37] bg-[#d4af37]/10 flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.3)] shrink-0">
              <div className="w-2 h-2 bg-[#d4af37]"></div>
            </div>
            {!isCollapsed && <span className="font-abhaya text-lg font-bold tracking-widest text-white whitespace-nowrap">ORION OS</span>}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {!isCollapsed && <p className="text-[9px] text-gray-600 uppercase tracking-[0.3em] mb-4 pl-3 font-bold">Pilares Operacionais</p>}
          
          <NavItem href="/dashboard" icon={<LayoutDashboard size={16} />} label="Trackrecord" collapsed={isCollapsed} active={pathname === "/dashboard"} />
          <NavItem href="/dashboard/scout" icon={<Radar size={16} />} label="Scout & Persona" collapsed={isCollapsed} active={pathname === "/dashboard/scout"} />
          <NavItem href="/dashboard/branding" icon={<Fingerprint size={16} />} label="Brand Equity" collapsed={isCollapsed} active={pathname === "/dashboard/branding"} />
          <NavItem href="/dashboard/competitors" icon={<Swords size={16} />} label="Arena (Auditoria)" collapsed={isCollapsed} active={pathname === "/dashboard/competitors"} />
          <NavItem href="/dashboard/oracle" icon={<BrainCircuit size={16} />} label="Oracle (Quant Feed)" collapsed={isCollapsed} active={pathname === "/dashboard/oracle"} />
          <NavItem href="/dashboard/showrunner" icon={<Trophy size={16} />} label="Showrunner" collapsed={isCollapsed} active={pathname === "/dashboard/showrunner"} />
          <NavItem href="/dashboard/conversion" icon={<BrainCircuit size={16} />} label="O Fechador (Ads)" collapsed={isCollapsed} active={pathname === "/dashboard/conversion"} />
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1 bg-[#0a0a0a] shrink-0">
          <NavItem href="/settings" icon={<Settings size={16} />} label="System Config" collapsed={isCollapsed} active={pathname === "/settings"} />
          <button onClick={handleLogout} className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all font-mono text-[10px] group`}>
            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
            {!isCollapsed && <span className="font-bold tracking-widest uppercase">Evacuar Sistema</span>}
          </button>
        </div>
      </aside>

      {/* =========================================================
          2. ÁREA PRINCIPAL (TOPBAR + CANVAS DE CONTEÚDO)
      ========================================================= */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        
        {/* Luzes de Fundo (Wall Street Depth) */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#d4af37]/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>

        {/* TOPBAR & THE OMNICOMMAND */}
        <header className="h-20 border-b border-white/5 bg-[#050505]/90 backdrop-blur-2xl flex items-center justify-between px-6 shrink-0 relative z-30 shadow-sm">
          
          <div className="flex items-center bg-[#0a0a0a] border border-white/5 p-1 rounded-lg shadow-inner">
            <button onClick={() => setActiveMode('god')} className={`px-4 py-1.5 text-[9px] uppercase font-bold tracking-widest rounded transition-all ${activeMode === 'god' ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'text-gray-600 hover:text-gray-300'}`}>God Mode</button>
            <button onClick={() => setActiveMode('sales')} className={`px-4 py-1.5 text-[9px] uppercase font-bold tracking-widest rounded transition-all ${activeMode === 'sales' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'text-gray-600 hover:text-gray-300'}`}>Sales Activation</button>
            <button onClick={() => setActiveMode('brand')} className={`px-4 py-1.5 text-[9px] uppercase font-bold tracking-widest rounded transition-all ${activeMode === 'brand' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-gray-600 hover:text-gray-300'}`}>Brand Building</button>
          </div>

          {/* OMNICOMMAND (A Barra do Jarvis) */}
          <div className="flex-1 max-w-2xl mx-8 relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={14} className="text-gray-500 group-focus-within:text-[#d4af37] transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Orion, inicie o mapeamento de sombra no mercado imobiliário..."
              className="w-full bg-[#0a0a0a] border border-white/5 text-white text-[11px] font-mono py-3 pl-10 pr-28 rounded-xl outline-none focus:border-[#d4af37]/50 focus:bg-black focus:shadow-[inset_0_0_20px_rgba(212,175,55,0.05)] transition-all placeholder-gray-600 shadow-inner"
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-2">
              <div className="flex items-center gap-1 text-gray-500 bg-white/5 px-2 py-1 rounded text-[9px] font-mono border border-white/5 shadow-sm">
                <Command size={10} /> <span>K</span>
              </div>
              <button className="w-7 h-7 rounded-md bg-[#d4af37]/10 flex items-center justify-center border border-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-colors shadow-[0_0_10px_rgba(212,175,55,0.2)] group-focus-within:animate-pulse">
                <Mic size={12} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative w-10 h-10 rounded-full bg-[#0a0a0a] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#d4af37]/50 transition-colors shadow-inner">
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#050505] shadow-[0_0_8px_#EF4444] animate-pulse"></span>
            </button>
            
            <div className="w-px h-8 bg-white/5"></div>
            
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold text-white group-hover:text-[#d4af37] transition-colors">{tenantInfo?.name || "Global"}</span>
                <span className="text-[9px] font-mono text-[#d4af37] uppercase tracking-widest flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-pulse"></div> Nível Alfa
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white/5 p-0.5 overflow-hidden group-hover:border-[#d4af37]/50 transition-colors shadow-sm">
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                  IC
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* CANVAS DE RENDERIZAÇÃO DAS ABAS */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-20">
          <div className="w-full h-full p-6 md:p-8 mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}

// Subcomponente de Navegação
function NavItem({ href, icon, label, collapsed, active }: { href: string, icon: React.ReactNode, label: string, collapsed: boolean, active: boolean }) {
  return (
    <Link 
      href={href} 
      title={collapsed ? label : ""}
      className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-3 rounded-lg font-mono text-[10px] transition-all duration-300 group relative overflow-hidden ${
        active 
          ? "text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/20 shadow-[inset_0_0_15px_rgba(212,175,55,0.05)]" 
          : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"
      }`}
    >
      {active && <div className="absolute left-0 top-0 w-1 h-full bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.8)]"></div>}
      <span className={`relative z-10 transition-transform ${active ? "scale-110 drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]" : "group-hover:scale-110"}`}>
        {icon}
      </span>
      {!collapsed && <span className={`relative z-10 font-bold uppercase tracking-widest transition-colors ${active ? "text-[#d4af37]" : "group-hover:text-white"}`}>{label}</span>}
    </Link>
  );
}
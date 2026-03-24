// app/dashboard/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, Radar, Target, Trophy, Settings, 
  LogOut, ChevronLeft, ChevronRight, BrainCircuit, Swords,
  Moon, Sun, Droplet, Fingerprint, Hexagon
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TenantProvider } from "@/contexts/TenantContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // === MOTOR DE TEMA ===
  const [activeTheme, setActiveTheme] = useState("navy"); 

  const changeTheme = (theme: string) => {
    setActiveTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("orion_theme", theme);
  };

  // === VALIDAÇÃO DE SEGURANÇA (Route Guard) ===
  useEffect(() => {
    const savedTheme = localStorage.getItem("orion_theme") || "navy";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setActiveTheme(savedTheme);
    
    // VERIFICAÇÃO CRÍTICA DE ACESSO
    const token = localStorage.getItem("orion_token");
    
    if (!token) {
      console.warn("🔒 Acesso Bloqueado: Nenhuma credencial encontrada. Evacuando...");
      router.replace("/login"); 
    } else {
      // Simula um delay ultra-rápido apenas para o efeito de "Boot" cinematográfico
      setTimeout(() => setIsAuthenticating(false), 800);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("orion_token");
    router.replace("/login");
  };

  // TELA DE BLINDAGEM (BOOT SEQUENCE)
  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] flex-col relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-[500px] h-[500px] border border-[#d4af37]/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute w-[300px] h-[300px] border border-[#d4af37]/20 rounded-full animate-[spin_5s_linear_infinite_reverse]"></div>
        </div>
        
        <div className="relative flex flex-col items-center justify-center z-10">
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute w-16 h-16 border border-[#d4af37]/40 rounded-full animate-ping"></div>
            <div className="absolute w-20 h-20 border border-[#d4af37]/10 rounded-full animate-pulse"></div>
            <Hexagon size={40} className="text-[#d4af37] animate-[pulse_2s_ease-in-out_infinite]" />
          </div>
          
          <div className="text-center font-mono">
            <p className="text-[#d4af37] text-xs tracking-[0.4em] uppercase mb-2">ORION SYSTEM</p>
            <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase animate-pulse">
              Validando Chaves Criptográficas...
            </p>
          </div>
          
          <div className="mt-8 w-48 h-[1px] bg-white/10 relative overflow-hidden">
             <div className="absolute top-0 left-0 h-full w-1/3 bg-[#d4af37] animate-[translateX_1s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TenantProvider>
      <div className="flex h-screen overflow-hidden text-v-white-off font-montserrat transition-colors duration-300 bg-[#050505]">
        
        {/* SIDEBAR RETRÁTIL DE ELITE */}
        <aside className={`${isCollapsed ? 'w-20' : 'w-72'} border-r border-white/5 flex flex-col justify-between relative z-20 transition-all duration-500 ease-in-out shrink-0 bg-black/60 backdrop-blur-xl shadow-[5px_0_30px_rgba(0,0,0,0.5)]`}>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-8 bg-black border border-white/10 text-gray-400 rounded-full p-1.5 hover:bg-[#d4af37]/10 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all z-30 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Topo: Logo */}
          <div className={`p-6 flex ${isCollapsed ? 'justify-center' : 'justify-start'} border-b border-white/5 transition-all duration-500 overflow-hidden h-24 items-center`}>
            {isCollapsed ? (
              <div className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="/logo-vrtice.png" alt="VRTICE" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]" />
              </div>
            ) : (
              <div className="w-32 h-auto shrink-0 hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all">
                <img src="/logo-vrtice.png" alt="VRTICE" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          {/* Navegação Principal */}
          <nav className="flex-1 py-8 px-3 space-y-2 overflow-y-auto custom-scrollbar">
            {!isCollapsed && (
              <p className="text-[0.6rem] text-gray-600 uppercase tracking-[0.3em] mb-4 px-3 font-bold">
                Operação & Tática
              </p>
            )}
            
            <NavItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Centro de Comando" collapsed={isCollapsed} active={pathname === "/dashboard"} />
            <NavItem href="/dashboard/scout" icon={<Radar size={18} />} label="Scout & Tendências" collapsed={isCollapsed} active={pathname === "/dashboard/scout"} />
            <NavItem href="/dashboard/competitors" icon={<Swords size={18} />} label="Arena (Concorrentes)" collapsed={isCollapsed} active={pathname === "/dashboard/competitors"} />
            <NavItem href="/dashboard/oracle" icon={<BrainCircuit size={18} />} label="Predições (Oráculo)" collapsed={isCollapsed} active={pathname === "/dashboard/oracle"} />
            <NavItem href="/dashboard/vortex" icon={<Fingerprint size={18} />} label="Vórtex (Infiltração)" collapsed={isCollapsed} active={pathname === "/dashboard/vortex"} />
            <NavItem href="/dashboard/gamification" icon={<Trophy size={18} />} label="Metas & Gamificação" collapsed={isCollapsed} active={pathname === "/dashboard/gamification"} />
          </nav>

          {/* Rodapé: Temas e Configurações */}
          <div className="p-4 border-t border-white/5 space-y-2 bg-black/40">
            
            {/* SELETOR DE TEMAS */}
            {!isCollapsed && (
              <div className="flex justify-between bg-black/60 border border-white/5 p-1 rounded-lg mb-4 shadow-inner">
                <button onClick={() => changeTheme("dark")} className={`flex-1 flex justify-center p-2 rounded-md transition-all ${activeTheme === 'dark' ? 'bg-white/10 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]' : 'text-gray-600 hover:text-gray-400'}`} title="Dark Theme">
                  <Moon size={14} />
                </button>
                <button onClick={() => changeTheme("navy")} className={`flex-1 flex justify-center p-2 rounded-md transition-all ${activeTheme === 'navy' ? 'bg-blue-500/20 text-blue-400 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]' : 'text-gray-600 hover:text-gray-400'}`} title="Navy Theme">
                  <Droplet size={14} />
                </button>
                <button onClick={() => changeTheme("light")} className={`flex-1 flex justify-center p-2 rounded-md transition-all ${activeTheme === 'light' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-gray-400'}`} title="Light Theme">
                  <Sun size={14} />
                </button>
              </div>
            )}

            <NavItem href="/settings" icon={<Settings size={18} />} label="Configurações do Sistema" collapsed={isCollapsed} active={pathname === "/settings"} />
            
            {/* Botão de Logout Funcional */}
            <button 
              onClick={handleLogout}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 font-montserrat text-sm group border border-transparent hover:border-red-500/20`}
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              {!isCollapsed && <span className="font-bold tracking-wide text-xs uppercase">Desconectar</span>}
            </button>
          </div>
        </aside>

        {/* ÁREA CENTRAL E AMBIENTE 3D */}
        <main className="flex-1 relative overflow-y-auto transition-colors duration-300 custom-scrollbar bg-[url('/grid-pattern.svg')] bg-repeat bg-center">
          {/* Efeitos de Iluminação Imersiva (Glassmorphism Environment) */}
          <div className="fixed top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-[#d4af37]/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
          <div className="fixed bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>
          
          <div className="p-8 md:p-12 w-full max-w-[1600px] mx-auto relative z-10 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </TenantProvider>
  );
}

// COMPONENTE DE NAVEGAÇÃO DE ELITE
function NavItem({ href, icon, label, collapsed, active }: { href: string, icon: React.ReactNode, label: string, collapsed: boolean, active: boolean }) {
  return (
    <Link 
      href={href} 
      title={collapsed ? label : ""}
      className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-4 px-4 py-3.5 rounded-xl font-montserrat text-sm transition-all duration-300 group relative overflow-hidden ${
        active 
          ? "text-[#d4af37] bg-gradient-to-r from-[#d4af37]/10 to-transparent border border-[#d4af37]/20 shadow-[inset_0_0_20px_rgba(212,175,55,0.05)]" 
          : "text-gray-500 hover:text-v-white-off hover:bg-white/5 border border-transparent"
      }`}
    >
      {/* Indicador de Rota Ativa (Borda Dourada Esquerda) */}
      {active && (
        <div className="absolute left-0 top-0 w-1 h-full bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.8)]"></div>
      )}
      
      <span className={`relative z-10 transition-transform ${active ? "scale-110 drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]" : "group-hover:scale-110"}`}>
        {icon}
      </span>
      
      {!collapsed && (
        <span className={`relative z-10 font-bold tracking-widest text-[0.7rem] uppercase transition-colors ${active ? "text-[#d4af37]" : "group-hover:text-v-white-off"}`}>
          {label}
        </span>
      )}
    </Link>
  );
}
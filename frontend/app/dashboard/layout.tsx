"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, Radar, Target, Trophy, Settings, 
  LogOut, ChevronLeft, ChevronRight, BrainCircuit, Swords,
  Moon, Sun, Droplet, Fingerprint
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
  const [activeTheme, setActiveTheme] = useState("dark");

  const changeTheme = (theme: string) => {
    setActiveTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  // === VALIDAÇÃO DE SEGURANÇA E INICIALIZAÇÃO ===
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    
    // Verifica se o usuário tem a chave de acesso (Token)
    const token = localStorage.getItem("orion_token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticating(false);
    }
  }, [router]);

  // Função para Desconectar
  const handleLogout = () => {
    localStorage.removeItem("orion_token");
    router.push("/login");
  };

  // Tela de transição enquanto verifica a segurança (Evita o flash da tela com mocks)
  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-v-black flex-col">
        <div className="w-8 h-8 border-2 border-v-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] text-v-gold tracking-[0.2em] uppercase">Autenticando Sessão...</p>
      </div>
    );
  }

  return (
    <TenantProvider>
      {/* O bg-v-black agora é mutável graças ao CSS! */}
      <div className="flex h-screen overflow-hidden bg-v-black text-v-white-off font-montserrat transition-colors duration-300">
        
        {/* SIDEBAR RETRÁTIL */}
        <aside className={`${isCollapsed ? 'w-20' : 'w-72'} glass-panel border-y-0 border-l-0 border-r border-v-white-off/10 flex flex-col justify-between relative z-20 transition-all duration-500 ease-in-out shrink-0`}>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-8 bg-v-black border border-v-gold text-v-gold rounded-full p-1 hover:bg-v-gold hover:text-v-black transition-colors z-30"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Topo: Logo Corrigida (Apontando para a pasta public) */}
          <div className={`p-6 flex ${isCollapsed ? 'justify-center' : 'justify-start'} border-b border-v-white-off/5 transition-all duration-500 overflow-hidden h-24 items-center`}>
            {isCollapsed ? (
              <div className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="/logo-vrtice.png" alt="VRTICE" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-32 h-auto shrink-0">
                <img src="/logo-vrtice.png" alt="VRTICE" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          {/* Navegação Principal */}
          <nav className="flex-1 py-8 px-3 space-y-2 overflow-y-auto scrollbar-none">
            {!isCollapsed && (
              <p className="text-[0.65rem] text-gray-500 uppercase tracking-widest mb-4 px-3 font-bold">
                Inteligência & Operação
              </p>
            )}
            
            <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Centro de Comando" collapsed={isCollapsed} active={pathname === "/dashboard"} />
            <NavItem href="/dashboard/scout" icon={<Radar size={20} />} label="Scout & Tendências" collapsed={isCollapsed} active={pathname === "/dashboard/scout"} />
            <NavItem href="/dashboard/competitors" icon={<Swords size={20} />} label="Arena (Concorrentes)" collapsed={isCollapsed} active={pathname === "/dashboard/competitors"} />
            <NavItem href="/dashboard/oracle" icon={<BrainCircuit size={20} />} label="Predições (Oráculo)" collapsed={isCollapsed} active={pathname === "/dashboard/oracle"} />
            
            {/* O NOVO ITEM DO VÓRTEX AQUI */}
            <NavItem href="/dashboard/vortex" icon={<Fingerprint size={20} />} label="Vórtex (Infiltração)" collapsed={isCollapsed} active={pathname === "/dashboard/vortex"} />
            
            <NavItem href="/dashboard/gamification" icon={<Trophy size={20} />} label="Metas & Gamificação" collapsed={isCollapsed} active={pathname === "/dashboard/gamification"} />
          </nav>

          {/* Rodapé: Temas e Configurações */}
          <div className="p-3 border-t border-v-white-off/5 space-y-2">
            
            {/* SELETOR DE TEMAS */}
            {!isCollapsed && (
              <div className="flex justify-between bg-v-black/50 border border-v-white-off/10 p-1 rounded-sm mb-4">
                <button onClick={() => changeTheme("dark")} className={`flex-1 flex justify-center p-2 rounded-sm transition-colors ${activeTheme === 'dark' ? 'bg-v-white-off/10 text-v-white-off' : 'text-gray-500 hover:text-v-white-off'}`} title="Dark Theme">
                  <Moon size={14} />
                </button>
                <button onClick={() => changeTheme("navy")} className={`flex-1 flex justify-center p-2 rounded-sm transition-colors ${activeTheme === 'navy' ? 'bg-v-white-off/10 text-v-white-off' : 'text-gray-500 hover:text-v-white-off'}`} title="Navy Theme">
                  <Droplet size={14} />
                </button>
                <button onClick={() => changeTheme("light")} className={`flex-1 flex justify-center p-2 rounded-sm transition-colors ${activeTheme === 'light' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-v-white-off'}`} title="Light Theme">
                  <Sun size={14} />
                </button>
              </div>
            )}

            <NavItem href="/settings" icon={<Settings size={20} />} label="Configurações" collapsed={isCollapsed} active={pathname === "/settings"} />
            
            {/* Botão de Logout Funcional */}
            <button 
              onClick={handleLogout}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-sm transition-all duration-300 font-montserrat text-sm group`}
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              {!isCollapsed && <span>Desconectar</span>}
            </button>
          </div>
        </aside>

        {/* ÁREA CENTRAL */}
        <main className="flex-1 relative overflow-y-auto bg-v-black transition-colors duration-300">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-v-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="p-8 md:p-12 w-full mx-auto relative z-10 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </TenantProvider>
  );
}

function NavItem({ href, icon, label, collapsed, active }: { href: string, icon: React.ReactNode, label: string, collapsed: boolean, active: boolean }) {
  return (
    <Link 
      href={href} 
      title={collapsed ? label : ""}
      className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-3 rounded-sm font-montserrat text-sm transition-all duration-300 group ${
        active 
          ? "bg-v-gold/10 text-v-gold border-r-2 border-v-gold shadow-[inset_2px_0_10px_rgba(200,169,112,0.05)]" 
          : "text-gray-400 hover:text-v-white-off hover:bg-v-white-off/5 border-r-2 border-transparent"
      }`}
    >
      <span className={`${active ? "animate-pulse-slow" : "group-hover:scale-110 transition-transform"}`}>{icon}</span>
      {!collapsed && <span className="font-medium tracking-wide whitespace-nowrap">{label}</span>}
    </Link>
  );
}
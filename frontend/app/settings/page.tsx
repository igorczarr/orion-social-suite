// frontend/app/settings/page.tsx
"use client";

import { Shield, Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#050505] p-10 text-v-white-off">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="text-v-gold" size={28} />
        <h1 className="text-3xl font-abhaya tracking-wide">Configurações do Sistema</h1>
      </div>
      
      <div className="glass-panel p-8 border border-v-gold/20 rounded-xl bg-black/40">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-v-gold/70" size={20} />
          <h2 className="text-lg font-montserrat tracking-widest uppercase text-gray-400">Painel em Construção</h2>
        </div>
        <p className="text-sm text-gray-500 font-montserrat leading-relaxed">
          Esta área será destinada às configurações da sua conta, chaves de API e gestão do plano.
        </p>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, Activity, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // CONEXÃO COM A NUVEM: Puxa a URL do ambiente (Vercel) ou usa local para dev
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://orion-9pls.onrender.com";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    console.log("🚀 Iniciando tentativa de login...");
    console.log("📡 Conectando em:", `${API_URL}/login`);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      console.log("📥 Resposta recebida. Status:", response.status);

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Falha na autenticação:", data.detail);
        throw new Error(data.detail || "Credenciais inválidas.");
      }

      console.log("🔑 Token gerado com sucesso! Salvando...");
      localStorage.setItem("orion_token", data.access_token);
      
      console.log("✈️ Redirecionando para Dashboard...");
      window.location.href = "/dashboard"; // Força bruta para garantir a navegação
      
    } catch (err: any) {
      console.error("💥 ERRO NO PROCESSO:", err);
      setError(err.message || "Erro de conexão. O servidor pode estar acordando...");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Efeito de Atmosfera Imersiva */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-v-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-v-white-off/5 blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full glass-panel p-10 border border-v-gold/20 rounded-xl relative overflow-hidden shadow-2xl backdrop-blur-md bg-black/40"
      >
        
        {/* Detalhe de topo da UI Sênior */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-v-gold to-transparent opacity-70"></div>
        
        <div className="text-center mb-10 relative z-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-16 h-16 bg-black/80 border border-v-gold/50 flex items-center justify-center mx-auto mb-6 rounded-lg shadow-[0_0_30px_rgba(212,175,55,0.15)] relative"
          >
            <Shield className="text-v-gold absolute opacity-20 w-full h-full p-2" strokeWidth={1} />
            <Lock className="text-v-gold relative z-10" size={24} strokeWidth={1.5} />
          </motion.div>
          <h1 className="font-abhaya text-4xl text-v-white-off mb-2 tracking-wide">Orion Suite</h1>
          <p className="font-montserrat text-[10px] uppercase tracking-[0.3em] text-v-gold/70">
            Acesso Criptografado
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="mb-8 p-4 bg-red-900/20 border border-red-500/20 flex items-center gap-3 rounded-lg backdrop-blur-sm"
          >
            <AlertCircle className="text-red-400 shrink-0" size={18} />
            <p className="text-xs text-red-200 font-montserrat leading-relaxed">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div className="group">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3 group-focus-within:text-v-gold transition-colors">
              Credencial Operacional
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-v-gold transition-colors" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-4 pl-12 pr-4 text-sm text-v-white-off focus:border-v-gold/50 focus:ring-1 focus:ring-v-gold/30 outline-none transition-all placeholder:text-gray-700"
                placeholder="operador@vrtice.com"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3 group-focus-within:text-v-gold transition-colors">
              Código de Acesso
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-v-gold transition-colors" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-4 pl-12 pr-4 text-sm text-v-white-off focus:border-v-gold/50 focus:ring-1 focus:ring-v-gold/30 outline-none transition-all placeholder:text-gray-700 tracking-widest"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-v-gold text-black font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#c9a128] transition-all rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.2)] mt-8 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <><Activity size={18} className="animate-spin" /> Estabelecendo Conexão...</>
            ) : (
              <>Autorizar Entrada <Shield size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" /></>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
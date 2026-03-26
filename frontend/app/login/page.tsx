"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, Activity, Shield, Fingerprint } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // CONEXÃO COM A NUVEM: Puxa a URL do ambiente (Vercel) ou usa local para dev
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://httpbin.org/post";

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
      setError(err.message || "Erro de conexão. O servidor de segurança bloqueou o acesso.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🛡️ CORREÇÃO DE TYPESCRIPT: 
  // O uso de 'Variants' força o TypeScript a entender que 'transition' é uma propriedade válida do framer-motion.
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 relative overflow-hidden font-montserrat selection:bg-[#d4af37] selection:text-black">
      
      {/* === BACKGROUND CINEMATOGRÁFICO === */}
      {/* Nebulosas de Cor */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#d4af37]/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Geometria Abstrata Giratória (Efeito Cofre/Cofre) */}
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 150, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/[0.02] rounded-full pointer-events-none"
      />
      <motion.div 
        animate={{ rotate: -360 }} 
        transition={{ repeat: Infinity, duration: 100, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#d4af37]/5 rounded-full pointer-events-none border-dashed"
      />
      
      {/* Scanline Overlay Sutil */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

      {/* === O CONTAINER PRINCIPAL DO COFRE === */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full relative z-10"
      >
        <div className="glass-panel p-10 sm:p-12 border border-[#d4af37]/20 rounded-2xl relative overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] backdrop-blur-xl bg-[#050505]/80">
          
          {/* Efeito de Vidro Sênior (Borda Superior Brilhante) */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/80 to-transparent"></div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            {/* CABEÇALHO DO LOGIN */}
            <motion.div variants={itemVariants} className="text-center mb-10">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 bg-black border border-[#d4af37]/40 flex items-center justify-center mx-auto mb-6 rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.15)] relative overflow-hidden group cursor-default"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Shield className="text-[#d4af37] absolute opacity-10 w-full h-full p-2 scale-110" strokeWidth={1} />
                {isLoading ? (
                   <Fingerprint className="text-[#d4af37] relative z-10 animate-pulse" size={28} strokeWidth={1.5} />
                ) : (
                   <Lock className="text-[#d4af37] relative z-10 group-hover:text-white transition-colors" size={26} strokeWidth={1.5} />
                )}
              </motion.div>
              
              <h1 className="font-abhaya text-4xl text-white mb-2 tracking-wide drop-shadow-md">
                Orion <span className="text-[#d4af37]">OS</span>
              </h1>
              <p className="font-montserrat text-[0.6rem] uppercase tracking-[0.4em] text-[#d4af37]/70 font-bold">
                Terminal de Segurança
              </p>
            </motion.div>

            {/* MENSAGEM DE ERRO COM ANIMAÇÃO */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                  animate={{ opacity: 1, height: "auto", marginBottom: 24 }} 
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="p-4 bg-red-950/30 border border-red-500/30 flex items-start gap-3 rounded-xl backdrop-blur-sm overflow-hidden shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]"
                >
                  <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                  <p className="text-[0.7rem] text-red-200/90 font-montserrat leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FORMULÁRIO */}
            <form onSubmit={handleLogin} className="space-y-6">
              
              <motion.div variants={itemVariants} className="group">
                <label className="block text-[0.6rem] uppercase tracking-[0.2em] font-bold text-gray-500 mb-3 group-focus-within:text-[#d4af37] transition-colors ml-1">
                  Credencial Operacional
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#d4af37] transition-colors z-10" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#d4af37]/70 focus:bg-black outline-none transition-all placeholder:text-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                    placeholder="operador@vrtice.com"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="group">
                <label className="block text-[0.6rem] uppercase tracking-[0.2em] font-bold text-gray-500 mb-3 group-focus-within:text-[#d4af37] transition-colors ml-1">
                  Chave de Acesso
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#d4af37] transition-colors z-10" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#d4af37]/70 focus:bg-black outline-none transition-all placeholder:text-gray-700 tracking-[0.2em] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:shadow-[0_0_15px_rgba(212,175,55,0.15)] font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-4 bg-[#d4af37] text-black font-bold text-[0.7rem] uppercase tracking-[0.2em] hover:bg-[#ebd074] transition-all rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.25)] hover:shadow-[0_0_35px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  {/* Efeito de Reflexo no Botão */}
                  <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>
                  
                  {isLoading ? (
                    <>
                      <Activity size={16} className="animate-spin text-black/70" /> 
                      <span>Decodificando...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar Sessão</span>
                      <Shield size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </motion.button>
              </motion.div>
              
            </form>
          </motion.div>
          
          {/* Badge de Sistema de Fundo */}
          <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none opacity-20">
             <p className="font-mono text-[0.45rem] tracking-[0.3em] text-[#d4af37]">VRTICE INTELLIGENCE DIVISION</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
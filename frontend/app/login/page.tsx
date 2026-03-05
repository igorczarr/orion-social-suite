"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, Activity } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. O FastAPI exige URLSearchParams (Form Data) e 'username' em vez de 'email'
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      // 2. Dispara direto para a porta 8000
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Credenciais inválidas.");
      }

      // 3. Salva a Chave Mestra EXATAMENTE com o nome que a api.ts procura
      localStorage.setItem("vrtice_token", data.access_token);
      
      // 4. Força o redirecionamento limpo para o Dashboard
      window.location.href = "/dashboard";
      
    } catch (err: any) {
      console.error("Erro no Login:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-v-black flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 border border-v-gold/30 rounded-sm relative overflow-hidden">
        
        {/* Efeitos de Luz */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-v-gold to-transparent opacity-50"></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="w-16 h-16 bg-v-black border border-v-gold flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(200,169,112,0.2)]">
            <Lock className="text-v-gold" size={24} />
          </div>
          <h1 className="font-abhaya text-4xl text-v-white-off mb-2">Orion Suite</h1>
          <p className="font-montserrat text-xs uppercase tracking-widest text-gray-500">
            Acesso Restrito
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 flex items-center gap-3 rounded-sm">
            <AlertCircle className="text-red-400" size={16} />
            <p className="text-xs text-red-400 font-montserrat">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div>
            <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Credencial (Email)</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-v-black border border-v-white-off/20 rounded-sm py-3 pl-12 pr-4 text-sm text-v-white-off focus:border-v-gold outline-none transition-colors"
                placeholder="admin@vrtice.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.65rem] uppercase tracking-widest text-gray-400 mb-2">Código de Acesso</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-v-black border border-v-white-off/20 rounded-sm py-3 pl-12 pr-4 text-sm text-v-white-off focus:border-v-gold outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-v-gold text-v-black font-bold text-xs uppercase tracking-[0.1em] hover:bg-v-white-off transition-all shadow-[0_0_15px_rgba(200,169,112,0.3)] mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <><Activity size={16} className="animate-spin" /> Autenticando...</> : "Entrar na Sala de Comando"}
          </button>
        </form>
      </div>
    </div>
  );
}
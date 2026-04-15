"use client";

import { useState, useEffect, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Activity, KeyRound, Fingerprint, ScanLine, Lock, Cpu } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function OrionSecurityTerminal() {
  const router = useRouter();

  // === STATE MACHINE: BOOT -> AUTH ===
  const [appState, setAppState] = useState<'booting' | 'auth'>('booting');
  const [logs, setLogs] = useState<string[]>([]);
  
  // === ESTADOS DO AUTENTICADOR (6 Dígitos) ===
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // =========================================================================
  // 1. COREOGRAFIA DE BOOT CINEMATOGRÁFICO (EFEITO JARVIS)
  // =========================================================================
  useEffect(() => {
    if (appState !== 'booting') return;

    let isMounted = true;
    const activeTimeouts: NodeJS.Timeout[] = [];

    const bootSequence = [
      { text: "> ESTABELECENDO HANDSHAKE CRIPTOGRÁFICO...", delay: 600 },
      { text: "> SINCRONIZANDO CÓRTEX DO ANTROPÓLOGO (PILAR 1)...", delay: 1800 },
      { text: "> INICIALIZANDO AUDITOR CORPORATIVO (PILAR 3)...", delay: 3000 },
      { text: "> CARREGANDO DADOS DO ORÁCULO ALPHA...", delay: 4200 },
      { text: "> SISTEMA OPERACIONAL VRTICE ORION ONLINE.", delay: 5500 },
      { text: "> EXIGINDO TOKEN DE AUTENTICAÇÃO MFA.", delay: 6200 }
    ];

    bootSequence.forEach(({ text, delay }) => {
      const t = setTimeout(() => {
        if (isMounted) setLogs(prev => prev.includes(text) ? prev : [...prev, text]);
      }, delay);
      activeTimeouts.push(t);
    });

    const bootTimer = setTimeout(() => {
      if (isMounted) setAppState('auth');
    }, 7500); 
    activeTimeouts.push(bootTimer);

    return () => {
      isMounted = false;
      activeTimeouts.forEach(clearTimeout); 
    };
  }, [appState]);

  // =========================================================================
  // 2. LÓGICA DE HARDWARE (INPUTS DO AUTENTICADOR)
  // =========================================================================
  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; 
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== "" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6).replace(/\D/g, "");
    if (!pastedData) return;
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) newOtp[i] = pastedData[i];
    setOtp(newOtp);
    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  const verifyToken = async () => {
    const token = otp.join("");
    if (token.length < 6) return;

    setIsVerifying(true);
    setError("");

    try {
      // Simulação Sênior de tempo de resposta da API
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (token === "000000") { 
        throw new Error("Token Expirado ou Desincronizado. Gere um novo código no seu app.");
      }

      setAuthSuccess(true);
      localStorage.setItem("orion_token", "encrypted_master_key");
      
      setTimeout(() => {
        router.push("/dashboard"); // Roteamento para a Nave-Mãe
      }, 1000);

    } catch (err: any) {
      setError(err.message || "Falha na decodificação AES-256. Acesso negado.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setIsVerifying(false);
    }
  };

  // =========================================================================
  // 3. ANIMAÇÕES DE VETOR (O SEU LOGOTIPO ENTRA AQUI)
  // =========================================================================
  const svgVariants: Variants = {
    hidden: { pathLength: 0, fill: "rgba(212, 175, 55, 0)", strokeOpacity: 0 },
    visible: { 
      pathLength: 1, 
      fill: "rgba(212, 175, 55, 1)", 
      strokeOpacity: 1,
      transition: { 
        pathLength: { duration: 3.5, ease: "easeInOut" },
        fill: { duration: 1.5, delay: 3.5, ease: "easeIn" },
        strokeOpacity: { duration: 0.5, ease: "easeOut" }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center relative overflow-hidden font-montserrat selection:bg-[#d4af37] selection:text-black">
      
      {/* === BACKGROUND: THE GRID === */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_15%,transparent_100%)] pointer-events-none"></div>
      
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#d4af37]/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/5 blur-[150px] rounded-full pointer-events-none"></div>

      <AnimatePresence mode="wait">
        
        {/* === FASE 1: O PRE-LOADER CINEMATOGRÁFICO === */}
        {appState === 'booting' && (
          <motion.div
            key="preloader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center relative z-50 w-full max-w-2xl px-6"
          >
            {/* ⚠️ O VOSSO LOGOTIPO VRTICE ANIMADO A LASER ⚠️ */}
            <div className="w-48 h-48 md:w-64 md:h-64 relative drop-shadow-[0_0_40px_rgba(212,175,55,0.3)] mb-16">
              <svg 
                version="1.1" 
                id="vrtice-loader-svg" 
                xmlns="http://www.w3.org/2000/svg" 
                xmlnsXlink="http://www.w3.org/1999/xlink" 
                x="0px" 
                y="0px"
                viewBox="0 0 1080 1080" 
                xmlSpace="preserve"
                className="w-full h-full overflow-visible"
              >
                <g>
                  <motion.path 
                    variants={svgVariants} 
                    initial="hidden" 
                    animate="visible"
                    stroke="#d4af37" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="vrtice-vector"
                    d="M595.5,666.5L583.7,646h15.5l-52.8-92c-1.8-3.1-4.9-4.9-8.4-4.9c-3.6,0-6.7,1.9-8.5,5l-51.8,92h14.9
                       l-11.5,20.5h-72.8c-8.7,0-16.8-3.3-22.4-9.1l-0.3-0.3l-0.2-0.2c-9.1-9.7-10.6-24.5-3.8-36.7l19.2-34.2l125.4-223.7
                       c0.5-0.8,1.3-1.3,2.3-1.3l16.3,0.5c0.9,0,1.7,0.5,2.2,1.3l151.8,262.8c5.6,9.8,5,22-1.5,30.4l-0.3,0.3l-0.2,0.2
                       c-5,6.2-13,10-21.5,10H595.5z M544.3,503.8c1.2,0,2.3,0.7,2.9,1.8l76.9,133.2l4.3,7.2h27.9c5.2,0,9.9-2.7,12.5-7.2
                       c2.6-4.5,2.6-9.9,0-14.5L549.3,415.8c-2.6-4.6-7.3-7.3-12.6-7.3c-5.3,0-10,2.7-12.6,7.3L406.7,624.3c-2.2,3.9-2.5,8.6-0.7,12.8v1.1
                       l1.3,1.4c2.7,4,7.3,6.5,12.1,6.5h29.6l4.2-6.1l0.1-0.4c0.1-0.3,0.2-0.5,0.3-0.7l74.9-133.6c0.6-1.1,1.8-1.8,3-1.8L544.3,503.8z"
                  />
                  <motion.polygon 
                    variants={svgVariants} 
                    initial="hidden" 
                    animate="visible"
                    stroke="#d4af37" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="vrtice-vector"
                    points="483.8,719 536.4,625.2 539.3,625.3 593.4,719"
                  />
                </g>
              </svg>
            </div>
            
            <div className="w-full flex flex-col items-center">
              <div className="h-24 w-full flex flex-col justify-end items-center gap-2 overflow-hidden mb-5">
                <AnimatePresence mode="popLayout">
                  {logs.map((log, i) => (
                    <motion.div 
                      key={`log-${i}`}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className={`font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold ${i === logs.length - 1 ? 'text-[#d4af37] drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'text-gray-600'}`}
                    >
                      {log}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="w-full max-w-[300px] h-px bg-white/10 rounded-full overflow-hidden relative shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 7, ease: "circInOut" }} className="absolute left-0 top-0 h-full bg-[#d4af37] shadow-[0_0_15px_#d4af37]"/>
              </div>
            </div>
          </motion.div>
        )}

        {/* === FASE 2: O COFRE DE AUTENTICAÇÃO TÁTICA === */}
        {appState === 'auth' && (
          <motion.div 
            key="auth"
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md w-full relative z-10 px-4"
          >
            <div className="bg-[#050505]/90 p-8 sm:p-10 border border-white/5 rounded-2xl relative shadow-[0_30px_100px_-15px_rgba(0,0,0,1)] backdrop-blur-xl">
              
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"></div>
              
              <div className="text-center mb-10 relative z-10">
                <div className="w-16 h-16 bg-[#020202] border border-white/10 flex items-center justify-center mx-auto mb-6 rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.1)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#d4af37]/5 animate-pulse"></div>
                  <KeyRound className="text-[#d4af37] relative z-10" size={24} strokeWidth={1.5} />
                </div>
                <h1 className="font-abhaya text-3xl text-white mb-2 tracking-widest drop-shadow-md">VRTICE ORION</h1>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#d4af37]/70 font-bold flex items-center justify-center gap-2">
                  <ScanLine size={10} className="text-[#d4af37]"/> Área Classificada
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                    animate={{ opacity: 1, height: "auto", marginBottom: 24 }} 
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="p-4 bg-red-950/20 border border-red-500/30 flex items-start gap-3 rounded-lg overflow-hidden"
                  >
                    <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={14} />
                    <p className="text-[9px] text-red-200/90 font-mono tracking-widest uppercase leading-relaxed">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-8 relative z-10">
                <div className="flex flex-col items-center">
                  <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-4 text-center">
                    Token de Acesso (MFA)
                  </label>
                  <div className="flex justify-between w-full gap-2 sm:gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        onPaste={handlePaste}
                        disabled={isVerifying || authSuccess}
                        className="w-10 h-12 sm:w-12 sm:h-14 bg-[#0a0a0a] border border-white/10 rounded-lg text-center text-xl font-mono text-white focus:border-[#d4af37] focus:bg-[#020202] outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] focus:shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-50"
                      />
                    ))}
                  </div>
                </div>

                <motion.button 
                  whileTap={{ scale: 0.96 }}
                  onClick={verifyToken}
                  disabled={isVerifying || authSuccess || otp.join("").length < 6}
                  className={`w-full py-4 font-bold text-[9px] uppercase tracking-[0.2em] transition-all rounded-xl flex items-center justify-center gap-3 disabled:cursor-not-allowed group relative overflow-hidden ${authSuccess ? 'bg-[#10B981] text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-[#d4af37] text-black hover:bg-[#ebd074] shadow-[0_0_30px_rgba(212,175,55,0.2)] disabled:opacity-40'}`}
                >
                  {!authSuccess && <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>}
                  {authSuccess ? (
                    <><Lock size={14} className="opacity-80" /> <span>Acesso Concedido</span></>
                  ) : isVerifying ? (
                    <><Activity size={14} className="animate-spin text-black" /> <span>Validando Assinatura...</span></>
                  ) : (
                    <><Fingerprint size={14} className="opacity-80" /> <span>Desbloquear Sistema</span></>
                  )}
                </motion.button>
              </div>
              
              <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[8px] font-mono text-gray-600 uppercase tracking-widest">
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#10B981] rounded-full shadow-[0_0_5px_#10B981]"></div> Sys: Online</div>
                <div className="flex items-center gap-1.5"><Lock size={10} /> AES-256</div>
                <div className="flex items-center gap-1.5"><Cpu size={10} /> Lat: 12ms</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
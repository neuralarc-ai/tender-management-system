'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function PinAuthPage() {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { login, authState } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated) {
      router.push(authState.role === 'client' ? '/client' : '/admin');
    }
  }, [authState, router]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);
    setError(false);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    const pinString = newPin.join('');
    if (index === 3 && value) {
      checkPin(pinString);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Quick test shortcuts
    if (e.key === '1' && e.ctrlKey) {
      e.preventDefault();
      setPin(['1','1','1','1']);
    }
    if (e.key === '2' && e.ctrlKey) {
      e.preventDefault();
      setPin(['2','2','2','2']);
    }
  };

  const checkPin = async (pinString: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    if (pinString === '1111') {
      login('client');
    } else if (pinString === '2222') {
      login('admin');
    } else {
      setError(true);
      setLoading(false);
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-screen text-white antialiased selection:bg-white/20 selection:text-white" style={{fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji'}}>
      
      {/* Solid Black Background Base to prevent white bleed-through */}
      <div className="fixed inset-0 -z-20 bg-black"></div>

      {/* UnicornStudio Background */}
      <div 
        suppressHydrationWarning
        className="aura-background-component fixed top-0 w-full h-screen -z-10 saturate-0 brightness-50" 
        data-alpha-mask="80" 
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)'
        }}
      >
        <div data-us-project="bmaMERjX2VZDtPrh4Zwx" className="absolute w-full h-full left-0 top-0 -z-10"></div>
      </div>
      
      {/* Script injection handled via useEffect or Next.js Script component */}
      <script 
        dangerouslySetInnerHTML={{
          __html: `!function(){if(!window.UnicornStudio){window.UnicornStudio={isInitialized:!1};var i=document.createElement("script");i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.34/dist/unicornStudio.umd.js",i.onload=function(){window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)},(document.head || document.body).appendChild(i)}}();`
        }}
      />

      {/* Main */}
      <main className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 z-10 overflow-hidden">
        <div className="w-full max-w-5xl mx-auto my-8 relative">
          
          {/* Outer circuit-style nodes with lines connected to card */}
          <div className="pointer-events-none hidden md:block absolute top-0 right-0 bottom-0 left-0">
            {/* Left upper node */}
            <div className="absolute left-4 top-1/4 flex items-center gap-2 text-neutral-700">
              <div className="h-px flex-1 bg-neutral-800 translate-x-2"></div>
              <div className="relative h-9 w-16 rounded-xl bg-neutral-900/80 shadow-[0_0_0_1px_rgba(82,82,91,0.4)] flex items-center justify-center">
                <div className="h-1 w-10 rounded-full bg-neutral-700"></div>
                {/* Pulsing chip dots */}
                <span className="absolute -left-1 h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.65)] animate-pulse"></span>
              </div>
              {/* Line to card */}
              <div className="h-px w-12 bg-neutral-800"></div>
            </div>

            {/* Left bottom node */}
            <div className="absolute left-10 bottom-10 flex items-center gap-2 text-neutral-700">
              <div className="h-px flex-1 bg-neutral-800 translate-x-2"></div>
              <div className="relative h-9 w-20 rounded-xl bg-neutral-900/80 shadow-[0_0_0_1px_rgba(82,82,91,0.4)] flex items-center justify-center">
                <div className="flex gap-1">
                  <span className="h-1 w-2 rounded bg-neutral-700"></span>
                  <span className="h-1 w-2 rounded bg-neutral-700/60"></span>
                  <span className="h-1 w-2 rounded bg-neutral-700/40"></span>
                </div>
                {/* Pulsing chip dots */}
                <span className="absolute -left-1 h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.65)] animate-pulse"></span>
              </div>
              {/* Line to card */}
              <div className="h-px w-16 bg-neutral-800"></div>
            </div>

            {/* Right upper node */}
            <div className="absolute right-4 top-1/5 flex items-center gap-2 text-neutral-700">
              {/* Line to card (now pointing left) */}
              <div className="h-px w-16 bg-neutral-800"></div>
              <div className="relative h-9 w-20 rounded-xl bg-neutral-900/80 shadow-[0_0_0_1px_rgba(82,82,91,0.4)] flex items-center justify-center">
                <div className="flex gap-1">
                  <span className="h-1 w-6 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.65)]"></span>
                </div>
                {/* Pulsing chip dots */}
                <span className="absolute -right-1 h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.65)] animate-pulse"></span>
              </div>
              <div className="h-px flex-1 bg-neutral-800 -translate-x-2"></div>
            </div>

            {/* Right bottom node */}
            <div className="absolute right-8 bottom-16 flex items-center gap-2 text-neutral-700">
              {/* Line to card (now pointing left) */}
              <div className="h-px w-10 bg-neutral-800"></div>
              <div className="relative h-9 w-16 rounded-xl bg-neutral-900/80 shadow-[0_0_0_1px_rgba(82,82,91,0.4)] flex items-center justify-center">
                <div className="h-1 w-8 rounded-full bg-neutral-700"></div>
                {/* Pulsing chip dots */}
                <span className="absolute -right-1 h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.65)] animate-pulse"></span>
              </div>
              <div className="h-px flex-1 bg-neutral-800 -translate-x-2"></div>
            </div>
          </div>

          {/* Card */}
          <div className={`sm:px-10 sm:py-10 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-800 max-w-md border-neutral-800 border rounded-3xl mr-auto ml-auto pt-8 pr-6 pb-8 pl-6 relative shadow-xl ${error ? 'animate-shake' : ''}`}>
            {/* Top glow dots */}
            <div className="absolute left-10 top-5 hidden h-1.5 w-16 rounded-full bg-neutral-700/60 sm:block"></div>
            <div className="absolute right-10 top-5 hidden h-1.5 w-10 rounded-full bg-neutral-700/30 sm:block"></div>

            {/* Logo (simplified green glow) */}
            <div className="flex justify-center">
              <div className="flex bg-neutral-900 w-14 h-14 rounded-2xl relative shadow-[0_0_0_1px_rgba(82,82,91,0.7)] items-center justify-center">
                <div className="flex bg-neutral-950 w-10 h-10 rounded-2xl relative items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{width: '24px', height: '24px', color: 'rgb(52, 211, 153)'}} className="w-[24px] h-[24px]" aria-hidden="true" role="img" strokeWidth="2">
                    <path fill="#34d399" d="M2.535 11.916c0 5.267 4.238 9.537 9.465 9.537s9.465-4.27 9.465-9.537a9.54 9.54 0 0 0-5.335-8.584a.776.776 0 0 1-.355-1.033a.765.765 0 0 1 1.026-.358A11.09 11.09 0 0 1 23 11.916C23 18.038 18.075 23 12 23S1 18.038 1 11.916C1 6.548 4.787 2.073 9.815 1.051c1.689-.343 2.952 1.104 2.952 2.617v2.134c1.894.364 3.326 2.05 3.326 4.076V14c0 2.291-1.832 4.148-4.093 4.148c-2.26 0-4.093-1.857-4.093-4.148V9.878c0-2.025 1.432-3.711 3.326-4.075V3.668c0-.766-.588-1.208-1.115-1.101c-4.326.879-7.583 4.732-7.583 9.35" opacity=".5"></path>
                    <path fill="#34d399" d="M7.907 13.954c0 2.29 1.833 4.148 4.093 4.148s4.093-1.857 4.093-4.148v-3.37H7.907zm4.861-4.616h3.253c-.312-1.667-1.608-3.292-3.253-3.609zm-1.535 0V5.73c-1.645.317-2.942 1.942-3.254 3.61z"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="mt-6 text-center">
              <h1 className="text-[26px] leading-tight tracking-tight font-bold text-neutral-50">
                Axis
              </h1>
              <p className="mt-2 text-sm font-medium text-neutral-400 tracking-wide">
                Core of Intelligent Execution
              </p>
            </div>

            {/* Form */}
            <form className="mt-10 space-y-6" onSubmit={(e) => { e.preventDefault(); if(pin.join('').length === 4) checkPin(pin.join('')); }}>
              <div className="flex justify-center gap-4">
                {pin.map((digit, index) => (
                  <div key={index} className="relative group">
                    <input
                      ref={el => { inputRefs.current[index] = el; }}
                      type="password"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      disabled={loading}
                      autoComplete="off"
                      className={`
                        w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-neutral-800 bg-neutral-950/80 
                        text-center text-2xl sm:text-3xl font-bold text-neutral-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]
                        focus:border-emerald-500/50 focus:bg-neutral-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 
                        transition-all duration-200
                        ${error ? 'border-red-500/50 text-red-400 bg-red-950/10 focus:ring-red-500/20' : ''}
                      `}
                    />
                    {/* Active glow effect */}
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-white/5 pointer-events-none"></div>
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-center text-red-400 text-sm animate-pulse">
                  Access Denied. Invalid PIN Code.
                </p>
              )}

              {loading && (
                <div className="flex justify-center mt-6">
                  <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
              )}


            </form>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}

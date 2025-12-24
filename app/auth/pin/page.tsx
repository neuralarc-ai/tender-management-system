'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { RiArrowRightLine, RiShieldKeyholeLine } from 'react-icons/ri';
import { LiquidGlassCard } from '@/components/ui/liquid-glass';

export default function PinAuthPage() {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { login, authState } = useAuth();

  useEffect(() => {
    if (authState.isAuthenticated) {
      router.push(authState.role === 'client' ? '/client' : '/admin');
    }
  }, [authState, router]);

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
  };

  const checkPin = async (pinString: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    if (pinString === '7531') {
      login('client', '11111111-1111-1111-1111-111111111111', 'partner@dcs.com', 'DCS Corporation');
    } else if (pinString === '1978') {
      login('admin', '22222222-2222-2222-2222-222222222222', 'admin@neuralarc.com', 'Neural Arc Inc.');
    } else {
      setError(true);
      setLoading(false);
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Full Page Background Image - Covers entire screen including footer */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url("/Neural_Arc_VECTOR_TENDER_PORTAL_--ar_169_--sref_httpss.mj.run_62839520-e672-43da-ba5d-e0bdb87365cf_3.png")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Overlay for better contrast */}
      <div className="fixed inset-0 bg-black/20 z-0" />

      {/* Login Card - Left Side */}
      <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center p-8 h-full">
        <LiquidGlassCard 
          glowIntensity="md" 
          shadowIntensity="lg" 
          borderRadius="32px" 
          blurIntensity="lg"
          className="p-8 w-full max-w-md"
        >
          <div className="relative z-30">
            {/* Logo */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center shadow-lg p-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256" fill="none">
                    <path d="M 128 192 L 0 256 L 0 192 L 128 128 Z M 256 192 L 128 256 L 128 192 L 256 128 Z M 128 64 L 128 128 L 0 64 L 0 0 Z M 256 64 L 256 128 L 128 64 L 128 0 Z" fill="rgb(84, 84, 84)"></path>
                  </svg>
                </div>
                <span className="text-3xl font-black text-white tracking-tight drop-shadow-lg">VECTOR</span>
              </div>
              <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-white/30 to-transparent mb-6" />
            </div>

            {/* Heading */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
                Welcome Back
              </h1>
              <p className="text-white/90 text-sm font-medium drop-shadow-md">
                Enter your secure PIN to access the platform
              </p>
            </div>

            {/* PIN Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); if(pin.join('').length === 4) checkPin(pin.join('')); }}>
              <div className="mb-6">
                <label className="text-xs font-bold text-white uppercase tracking-wider mb-3 block drop-shadow-md">
                  Security PIN
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { inputRefs.current[index] = el; }}
                      type="password"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      disabled={loading}
                      autoComplete="off"
                      className={`
                        w-full aspect-square h-16 rounded-2xl border-2 bg-white/20 backdrop-blur-md
                        text-center text-2xl font-bold text-white drop-shadow-lg
                        focus:border-white focus:outline-none focus:ring-4 focus:ring-white/30 focus:bg-white/30
                        transition-all duration-300
                      ${error ? 'border-passion bg-passion/30 text-passion animate-shake' : 'border-white/30'}
                      ${digit ? 'border-white ring-4 ring-white/30 bg-white/40 scale-105' : 'hover:border-white/60 hover:bg-white/25'}
                      ${loading ? 'opacity-50' : ''}
                      `}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 text-white text-sm font-semibold bg-passion/30 backdrop-blur-md px-4 py-3 rounded-2xl border border-passion/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  <span className="drop-shadow-md">Invalid PIN. Please try again.</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={pin.join('').length !== 4 || loading}
                className="w-full h-14 bg-white/20 backdrop-blur-md border-2 border-white/30 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 hover:bg-white/30 hover:border-white/50 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Access Platform</span>
                    <RiArrowRightLine className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer hint */}
            <div className="mt-8 text-center text-xs text-white/70 drop-shadow-md">
              <p>Powered by <span className="font-bold text-white">Neural Arc Inc.</span></p>
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Simple Liquid Glass Footer for PIN Page */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-transparent backdrop-blur-xl py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-3">
            {/* Product Name & Copyright */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-white drop-shadow-lg">
              <span className="font-black tracking-tight">VECTOR</span>
              <span className="text-white/40">•</span>
              <span className="text-white/90">© {new Date().getFullYear()}</span>
              <span className="text-white/90">All rights reserved by</span>
              <span className="font-bold">Neural Arc Inc.</span>
            </div>

            {/* Divider for desktop */}
            <div className="hidden md:block w-px h-4 bg-white/20"></div>

            {/* Product info */}
            <div className="text-xs text-white/80 font-medium drop-shadow-lg">
              Tender Management System
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}

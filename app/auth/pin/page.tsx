'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { RiArrowRightLine } from 'react-icons/ri';

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

    if (pinString === '1111') {
      login('client', 'user-client-001', 'partner@dcs.com', 'DCS Corporation');
    } else if (pinString === '2222') {
      login('admin', 'user-admin-001', 'admin@neuralarc.com', 'Neural Arc Inc.');
    } else {
      setError(true);
      setLoading(false);
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex font-sans relative overflow-hidden">
      {/* Full Screen Neural Arc Background - PNG (No Overlay!) */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url("/Neural_Arc_something_special_--ar_21_--sref_httpss.mj.runOq08_0708aaa1-9b75-4ee2-8fe1-93ea00a92302_3.png")`
        }}
      />

      {/* Left Side - Glassmorphism Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        {/* Perfect Glassmorphism Container */}
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-3xl p-8 rounded-[36px] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-white/20 relative">
          {/* Glass reflection effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent pointer-events-none rounded-[36px]" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-[36px]" />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Logo */}
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-passion to-aurora rounded-xl flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="text-white drop-shadow-lg">
                    <path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
                  </svg>
                </div>
                <span className="text-xl font-black text-white tracking-tight drop-shadow-lg">VECTOR</span>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
                Welcome back
              </h1>
              <p className="text-white/90 text-sm font-medium drop-shadow-md">
                Enter your secure PIN to access the platform
              </p>
            </div>

            {/* PIN Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); if(pin.join('').length === 4) checkPin(pin.join('')); }}>
              <div className="mb-6">
                <label className="text-xs font-bold text-neural uppercase tracking-wider mb-3 block drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">
                  Security PIN
                </label>
                <div className="grid grid-cols-4 gap-2.5">
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
                        w-full aspect-square h-14 rounded-2xl border-2 bg-white/20 backdrop-blur-md
                        text-center text-xl font-bold text-white drop-shadow-lg
                        focus:border-white focus:outline-none focus:ring-4 focus:ring-white/30 focus:bg-white/30
                        transition-all duration-300
                        ${error ? 'border-passion bg-passion/30 text-passion animate-shake' : 'border-white/30'}
                        ${digit ? 'border-white shadow-xl ring-4 ring-white/30 bg-white/40 scale-105' : 'hover:border-white/60 hover:bg-white/25'}
                        ${loading ? 'opacity-50' : ''}
                      `}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 text-white text-sm font-semibold bg-passion/30 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/30 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  <span className="drop-shadow-md">Invalid PIN. Please try again.</span>
                </div>
              )}

              {/* Glassmorphism Button */}
              <button
                type="submit"
                disabled={pin.join('').length !== 4 || loading}
                className="w-full h-12 bg-white/20 backdrop-blur-md border-2 border-white/30 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/30 hover:border-white/50 hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl drop-shadow-lg"
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

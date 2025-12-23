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
    <div className="min-h-screen flex font-sans">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="text-white">
                  <path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
                </svg>
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent tracking-tight">VECTOR</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome back
            </h1>
            <p className="text-gray-600 text-base">
              Enter your secure PIN to access the platform
            </p>
          </div>

          {/* PIN Input */}
          <form onSubmit={(e) => { e.preventDefault(); if(pin.join('').length === 4) checkPin(pin.join('')); }}>
            <div className="mb-6">
              <label className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3 block">
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
                      w-full aspect-square h-16 rounded-2xl border-2 bg-white
                      text-center text-2xl font-bold text-gray-900
                      focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100
                      transition-all duration-200
                      ${error ? 'border-red-500 bg-red-50 text-red-500 animate-shake' : 'border-orange-200'}
                      ${digit ? 'border-orange-400 shadow-sm ring-2 ring-orange-100' : ''}
                      ${loading ? 'opacity-50' : ''}
                    `}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 px-4 py-3 rounded-2xl border border-red-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                <span>Invalid PIN. Please try again.</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={pin.join('').length !== 4 || loading}
              className="w-full h-14 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:from-orange-700 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mb-6"
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

      {/* Right Side - Visual */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Professional Business Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(249, 115, 22, 0.7) 0%, rgba(251, 146, 60, 0.65) 50%, rgba(253, 186, 116, 0.6) 100%), 
            url("/login-background.png")`
          }}
        />

        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-transparent to-amber-500/10" />

        {/* Content */}
        <div className="relative h-full flex flex-col items-start justify-start p-12 text-white">
          {/* Status Badge */}
          <div className="mb-4 text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-full mb-4 shadow-lg">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-xs font-bold uppercase tracking-widest">System Operational</span>
            </div>

            <h2 className="text-5xl font-black mb-6 leading-tight drop-shadow-lg">
              Intelligent<br />
              Tender Management
            </h2>
            <p className="text-lg text-white/90 max-w-md leading-relaxed font-medium drop-shadow">
              AI-powered platform for seamless proposal workflows<br />and real-time collaboration.
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl"></div>
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

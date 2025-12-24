'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Image as ImageIcon, 
  Brain, 
  Shield, 
  Clock, 
  Building2,
  UserCircle
} from 'lucide-react';

export default function PinScreen() {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

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
      router.push('/client');
    } else if (pinString === '2222') {
      router.push('/admin');
    } else {
      setError(true);
      setLoading(false);
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-neural text-white antialiased selection:bg-white/20 selection:text-white font-sans">
      {/* Background from the template */}
      <div className="fixed inset-0 -z-10">
        <img 
          src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/22df5474-7a3a-4fea-b5c6-e2980964892d_3840w.jpg" 
          alt="" 
          className="h-full w-full object-cover object-center opacity-100" 
        />
      </div>

      {/* Main */}
      <main className="relative flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="relative z-10 w-full max-w-3xl">
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/40 ring-1 ring-white/10 transition-all duration-300 hover:border-white/20 hover:ring-white/20 shadow-[0_0_40px_rgba(249,115,22,0.35)] hover:shadow-[0_0_64px_rgba(0,0,0,0.55)]">
            
            {/* Top hairline */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="relative flex flex-col sm:flex-row">
              {/* Image (Left) */}
              <div className="relative w-full sm:w-1/2 h-48 sm:h-auto">
                <img 
                  src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bc0e3057-c73b-46a1-a617-dceb564857f0_800w.jpg" 
                  alt="Futuristic render" 
                  className="absolute inset-0 h-full w-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-white/10 bg-neural/30 px-3 py-2 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-xs text-white/75">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Visual channel
                  </div>
                  <span className="text-[11px] text-white/60">1:1 layout</span>
                </div>
              </div>

              {/* Details (Right) */}
              <div className="p-6 sm:p-8 w-full sm:w-1/2">
                <div className="mb-6 flex items-center justify-between">
                  {/* Logo */}
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center shadow-black/30 text-white/90 bg-stone-400/20 border-white/15 border rounded-xl shadow-sm">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm tracking-widest text-white/60">NA</div>
                      <div className="text-[22px] tracking-tight font-semibold">Neural Arc</div>
                    </div>
                  </div>
                  <div className="text-xs text-white/50">v2.0</div>
                </div>

                <div className="mb-8">
                  <h1 className="text-[26px] font-semibold tracking-tight">System Access</h1>
                  <p className="mt-1.5 text-sm text-white/60">Enter your secure PIN to continue.</p>
                </div>

                {/* PIN Form */}
                <div className="space-y-6">
                  <div className="flex justify-center gap-3 my-6">
                    {pin.map((digit, index) => (
                      <div key={index} className="relative group">
                        <input
                          ref={el => { inputRefs.current[index] = el; }}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleChange(index, e.target.value)}
                          onKeyDown={e => handleKeyDown(index, e)}
                          disabled={loading}
                          className={`
                            w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-bold text-white 
                            focus:outline-none focus:border-passion/50 focus:bg-white/10 focus:ring-1 focus:ring-passion/25 transition-all duration-200
                            ${error ? 'border-passion/50 text-passion-light animate-shake' : ''}
                          `}
                        />
                      </div>
                    ))}
                  </div>

                  {error && (
                    <p className="text-center text-passion text-xs font-medium animate-pulse -mt-4">
                      Access Denied. Invalid Credentials.
                    </p>
                  )}

                  {/* Portals Hint */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setPin(['1','1','1','1'])}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 group"
                    >
                      <Building2 className="h-4 w-4 text-white/40 group-hover:text-orange-400 mb-1 transition-colors" />
                      <span className="text-xs font-medium text-white/60 group-hover:text-white">Client</span>
                      <span className="text-[10px] text-white/30 font-mono">1111</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPin(['2','2','2','2'])}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 group"
                    >
                      <UserCircle className="h-4 w-4 text-white/40 group-hover:text-orange-400 mb-1 transition-colors" />
                      <span className="text-xs font-medium text-white/60 group-hover:text-white">Admin</span>
                      <span className="text-[10px] text-white/30 font-mono">2222</span>
                    </button>
                  </div>

                  {loading && (
                    <div className="flex justify-center mt-4">
                      <div className="w-5 h-5 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-[11px] text-white/55">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Secure Environment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Real-time Sync</span>
                  </div>
                </div>
              </div>
            </div>
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



'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RiLock2Line, RiShieldUserLine, RiBuilding4Line, RiLoader4Line } from 'react-icons/ri';

export default function Home() {
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
    await new Promise(resolve => setTimeout(resolve, 1000));

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
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Neon Grid Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-violet-500/20 via-transparent to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-blue-500/10 via-transparent to-transparent blur-3xl"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 relative overflow-hidden group">
          
          {/* Moving Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
          
          <div className="flex flex-col items-center">
            
            {/* Icon Container */}
            <div className={`mb-8 p-4 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-gray-700 shadow-lg relative transition-all duration-300 ${error ? 'border-red-500/50 shadow-red-500/20' : 'border-gray-700'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-blue-500/20 blur-xl opacity-50"></div>
              {loading ? (
                <RiLoader4Line className="w-8 h-8 text-violet-400 animate-spin relative z-10" />
              ) : (
                <RiLock2Line className={`w-8 h-8 relative z-10 transition-colors ${error ? 'text-red-400' : 'text-white'}`} />
              )}
            </div>

            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-2">
              System Access
            </h1>
            <p className="text-gray-400 text-sm mb-10 text-center max-w-[240px]">
              Enter your authentication PIN to access the secure portal
            </p>

            {/* PIN Inputs */}
            <div className="flex gap-4 mb-10">
              {pin.map((digit, index) => (
                <div key={index} className="relative group">
                  <div className={`absolute -inset-0.5 rounded-lg blur opacity-20 group-hover:opacity-60 transition duration-200 ${error ? 'bg-red-500' : 'bg-violet-500'}`}></div>
                  <input
                    ref={el => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    disabled={loading}
                    className={`
                      relative w-14 h-16 bg-black border rounded-lg text-center text-2xl font-bold text-white 
                      focus:outline-none focus:ring-2 transition-all duration-200
                      ${error 
                        ? 'border-red-500/50 focus:ring-red-500/20 animate-shake' 
                        : 'border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20'
                      }
                      ${digit ? 'border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : ''}
                    `}
                  />
                </div>
              ))}
            </div>

            {/* Hint Section */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/30 hover:bg-white/10 transition-all duration-300 cursor-help group/item">
                <RiBuilding4Line className="w-5 h-5 text-gray-500 group-hover/item:text-violet-400 mb-1 transition-colors" />
                <span className="text-xs text-gray-500">Client Portal</span>
                <span className="text-sm font-mono font-bold text-gray-300 group-hover/item:text-white transition-colors">1111</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-300 cursor-help group/item">
                <RiShieldUserLine className="w-5 h-5 text-gray-500 group-hover/item:text-blue-400 mb-1 transition-colors" />
                <span className="text-xs text-gray-500">Admin Portal</span>
                <span className="text-sm font-mono font-bold text-gray-300 group-hover/item:text-white transition-colors">2222</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
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

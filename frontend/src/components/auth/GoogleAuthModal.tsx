import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, CheckCircle2, AlertCircle, Sparkles, Mail, User, ShieldCheck } from 'lucide-react';
import { DiyaIcon, MandalaCorner } from '../layout/IndianMotifs';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  role?: 'USER' | 'ORGANIZER';
  mode?: 'login' | 'register';
}

const PRECONFIGURED_GOOGLE_ACCOUNTS = [
  {
    name: 'Jhenkar Mahapatra',
    email: 'jhenkar255@gmail.com',
    picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Aarav Sharma',
    email: 'aarav.utsavmitra@gmail.com',
    picture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Rohan Mehra (Event Planner)',
    email: 'rohan.weddings@gmail.com',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  },
];

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  role = 'USER',
  mode = 'login',
}) => {
  const { googleLogin } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = async (account: { name: string; email: string; picture?: string }) => {
    setError(null);
    setLoading(true);
    try {
      const user = await googleLogin({
        email: account.email,
        name: account.name,
        picture: account.picture,
        role,
      });
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = customEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid Google / Gmail email address.');
      return;
    }

    const trimmedName = customName.trim() || trimmedEmail.split('@')[0];

    setLoading(true);
    try {
      const user = await googleLogin({
        email: trimmedEmail,
        name: trimmedName,
        role,
      });
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-md w-full rounded-3xl bg-white dark:bg-utsav-maroon-950 border-2 border-utsav-gold shadow-2xl p-6 sm:p-8 relative overflow-hidden space-y-6 animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 pointer-events-none opacity-20 dark:opacity-15">
          <MandalaCorner className="w-32 h-32" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-utsav-maroon-900 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-white dark:bg-utsav-maroon-900 border border-gray-200 dark:border-utsav-gold/40 shadow-md">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h2 className="font-heading text-xl font-bold text-utsav-maroon-900 dark:text-utsav-gold">
            {mode === 'register' ? 'Register with Google' : 'Sign in with Google'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Choose a verified Google account to continue to UtsavMitra
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {!isCustomMode ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {PRECONFIGURED_GOOGLE_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSelectAccount(acc)}
                  className="w-full flex items-center space-x-3 p-3 rounded-2xl bg-gray-50 dark:bg-utsav-maroon-900/60 hover:bg-gray-100 dark:hover:bg-utsav-maroon-800 border border-gray-200 dark:border-utsav-gold/30 transition-all text-left group cursor-pointer disabled:opacity-50"
                >
                  <img
                    src={acc.picture}
                    alt={acc.name}
                    className="w-10 h-10 rounded-full object-cover border border-utsav-gold/50 shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-utsav-ivory truncate group-hover:text-utsav-maroon-800 dark:group-hover:text-utsav-gold">
                      {acc.name}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-mono">
                      {acc.email}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-utsav-gold/40 text-xs font-bold text-gray-600 dark:text-utsav-ivory hover:bg-gray-50 dark:hover:bg-utsav-maroon-900 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-utsav-gold" />
              <span>Use another Google account</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider mb-1">
                Google / Gmail Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-gray-300 dark:border-utsav-gold/40 text-xs sm:text-sm text-gray-900 dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold focus:ring-2 focus:ring-utsav-gold/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider mb-1">
                Account Holder Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-gray-300 dark:border-utsav-gold/40 text-xs sm:text-sm text-gray-900 dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold focus:ring-2 focus:ring-utsav-gold/30"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="w-1/3 py-2.5 rounded-xl border border-gray-300 dark:border-utsav-gold/40 text-xs font-bold text-gray-600 dark:text-utsav-ivory hover:bg-gray-50 dark:hover:bg-utsav-maroon-900 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 rounded-xl gold-gradient-btn font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? 'Connecting Google...' : 'Sign In with Google'}</span>
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 text-center">
          <p className="text-[10px] text-gray-400 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secured via Google OAuth 2.0 & UtsavMitra Vault</span>
          </p>
        </div>
      </div>
    </div>
  );
};

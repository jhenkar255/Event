import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import {
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Shield,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      const adminUser = await adminLogin(trimmedEmail, password);
      setSuccessMessage(`Admin authenticated: Welcome, ${adminUser.name}!`);

      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 500);
    } catch (err: any) {
      setPassword('');
      setError(err.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative bg-gradient-to-br from-utsav-maroon-950 via-black to-utsav-maroon-950 text-utsav-ivory">
      {/* Decorative Indian Architectural Glow Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-radial from-utsav-gold/20 to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-radial from-red-800/25 to-transparent blur-3xl" />
      </div>

      <div className="max-w-md w-full rounded-3xl bg-utsav-maroon-950/90 border-2 border-utsav-gold/70 shadow-2xl p-6 sm:p-8 relative overflow-hidden space-y-6 backdrop-blur-md">
        {/* Subtle Decorative Mandala Corners */}
        <div className="absolute top-0 right-0 pointer-events-none opacity-20">
          <MandalaCorner className="w-36 h-36" />
        </div>
        <div className="absolute bottom-0 left-0 pointer-events-none opacity-20 rotate-180">
          <MandalaCorner className="w-36 h-36" />
        </div>

        {/* Exclusive Admin Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-red-900 to-utsav-maroon-950 border-2 border-amber-400 shadow-xl">
            <ShieldCheck className="w-9 h-9 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-red-900/80 text-amber-300 border border-amber-400/60 inline-block mb-1">
              Executive Governance
            </span>
            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-utsav-gold">
              UTSAVMITRA
            </h1>
            <h2 className="font-heading text-lg sm:text-xl font-extrabold tracking-wide text-white">
              ADMIN CONTROL CENTER
            </h2>
          </div>
          <p className="text-[11px] text-gray-400 font-medium tracking-wide">
            Master platform management, escrow audits & system security.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/80 text-red-300 text-xs font-medium border border-red-500/60 flex items-center space-x-2 animate-in fade-in duration-150 relative z-10">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Toast */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 text-emerald-300 text-xs font-medium border border-emerald-500/60 flex items-center space-x-2 animate-in fade-in duration-150 relative z-10">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Admin Login Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-utsav-gold uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-black/60 border border-utsav-gold/50 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 shadow-inner transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-utsav-gold uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/admin/forgot-password"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-black/60 border border-utsav-gold/50 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 shadow-inner transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-amber-400 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Secure Admin Login Button */}
          <button
            type="submit"
            disabled={isLoading || !!successMessage}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-800 via-utsav-maroon-800 to-red-900 hover:from-red-700 hover:to-red-800 text-amber-300 border-2 border-amber-400/70 font-bold text-sm shadow-2xl flex items-center justify-center space-x-2 disabled:opacity-50 hover:scale-[1.01] transition-all cursor-pointer tracking-wider uppercase"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>{isLoading ? 'Authenticating...' : 'Secure Login'}</span>
          </button>
        </form>

        {/* Security Notice Footer */}
        <div className="pt-3 border-t border-utsav-gold/20 text-center relative z-10">
          <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
            🔒 Authorized Personnel Only
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            All administrative access and activities are logged for security audits.
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export const AdminForgotPasswordPage: React.FC = () => {
  const { adminForgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoToken, setDemoToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminForgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
      if (res.resetToken) {
        setDemoToken(res.resetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to process administrator password recovery.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative bg-gradient-to-br from-utsav-maroon-950 via-black to-utsav-maroon-950 text-utsav-ivory">
      <div className="max-w-md w-full rounded-3xl bg-utsav-maroon-950/90 border-2 border-utsav-gold/70 shadow-2xl p-6 sm:p-8 relative overflow-hidden space-y-6 backdrop-blur-md">
        <div className="absolute top-0 right-0 pointer-events-none opacity-20">
          <MandalaCorner className="w-36 h-36" />
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-red-900 to-utsav-maroon-950 border-2 border-amber-400 shadow-xl">
            <ShieldCheck className="w-9 h-9 text-amber-400" />
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-utsav-gold">
            Admin Recovery
          </h1>
          <p className="text-xs text-gray-400">
            Authorized administrator credential restoration.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/80 text-red-300 text-xs font-medium border border-red-500/60 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-semibold leading-relaxed">
                If an authorized admin account with <strong>{email}</strong> exists, recovery instructions have been initiated.
              </p>
            </div>

            {demoToken && (
              <div className="p-3.5 rounded-xl bg-black/60 border border-amber-400/40 text-left space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Direct Recovery Link:
                </span>
                <Link
                  to={`/admin/reset-password?token=${demoToken}`}
                  className="block text-xs font-bold text-amber-300 underline break-all"
                >
                  Click here to set your new Admin password →
                </Link>
              </div>
            )}

            <Link
              to="/admin/login"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-400 hover:underline pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Control Center</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-utsav-gold uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-black/60 border border-utsav-gold/50 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-800 via-utsav-maroon-800 to-red-900 hover:from-red-700 hover:to-red-800 text-amber-300 border-2 border-amber-400/70 font-bold text-sm shadow-2xl tracking-wider uppercase cursor-pointer"
            >
              <span>{loading ? 'Processing...' : 'Send Recovery Link'}</span>
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/admin/login"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-400 hover:text-amber-400"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Admin Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

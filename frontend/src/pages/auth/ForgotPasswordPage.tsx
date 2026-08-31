import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoToken, setDemoToken] = useState<string | null>(null);

  useEffect(() => {
    const paramEmail = searchParams.get('email');
    if (paramEmail) {
      setEmail(paramEmail);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(trimmedEmail);
      setSubmitted(true);
      if (res.resetToken) {
        setDemoToken(res.resetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 relative">
      <div className="max-w-md w-full rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-950 border-2 border-utsav-gold/60 shadow-2xl p-6 sm:p-8 relative overflow-hidden space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 pointer-events-none opacity-20 dark:opacity-15">
          <MandalaCorner className="w-32 h-32" />
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-utsav-maroon-800 to-utsav-maroon-900 border border-utsav-gold shadow-lg">
            <KeyRound className="w-8 h-8 text-utsav-gold" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-utsav-maroon-800 dark:text-utsav-gold">
            Reset Password
          </h1>
          <p className="text-xs text-utsav-brown-600 dark:text-utsav-ivory-300 font-medium">
            Enter your registered email address to receive secure recovery instructions.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="text-xs font-semibold leading-relaxed">
                If an account with <strong>{email}</strong> exists, a password reset link has been dispatched.
              </p>
            </div>

            {demoToken && (
              <div className="p-3.5 rounded-xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-left space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-utsav-gold">
                  Direct Reset Link:
                </span>
                <Link
                  to={`/reset-password?token=${demoToken}`}
                  className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold underline break-all"
                >
                  Click here to set your new password →
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold hover:underline pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl maroon-gradient-btn font-bold text-sm shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 hover:scale-[1.01] transition-transform text-utsav-gold cursor-pointer"
            >
              <span>{loading ? 'Sending Instructions...' : 'Send Recovery Link'}</span>
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-utsav-gold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Check, X, ShieldCheck } from 'lucide-react';

export const AdminResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { adminResetPassword } = useAuth();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordRules = useMemo(() => {
    return {
      hasMinLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
    };
  }, [newPassword]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordRules.hasMinLength) score++;
    if (passwordRules.hasUpper) score++;
    if (passwordRules.hasLower) score++;
    if (passwordRules.hasNumber) score++;
    return score;
  }, [passwordRules]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('Please provide a valid administrator reset token.');
      return;
    }

    if (strengthScore < 4) {
      setError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await adminResetPassword(token.trim(), newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/login', { replace: true });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update administrator password.');
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
            Set Admin Password
          </h1>
          <p className="text-xs text-gray-400">
            Establish new executive credentials for Admin Control Center.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/80 text-red-300 text-xs font-medium border border-red-500/60 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-300">Admin Password Updated!</h3>
            <p className="text-xs text-emerald-400">Redirecting to Admin Control Center...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!searchParams.get('token') && (
              <div>
                <label className="block text-xs font-bold text-utsav-gold uppercase tracking-wider mb-1">
                  Recovery Token
                </label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste admin recovery token here"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-utsav-gold/50 text-xs text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-utsav-gold uppercase tracking-wider mb-1">
                New Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/60 border border-utsav-gold/50 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-amber-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-utsav-gold uppercase tracking-wider mb-1">
                Confirm Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/60 border border-utsav-gold/50 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>
            </div>

            {newPassword && (
              <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400 pt-1">
                <span className={`flex items-center space-x-1 ${passwordRules.hasMinLength ? 'text-emerald-400 font-bold' : ''}`}>
                  {passwordRules.hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>8+ characters</span>
                </span>
                <span className={`flex items-center space-x-1 ${passwordRules.hasUpper ? 'text-emerald-400 font-bold' : ''}`}>
                  {passwordRules.hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>1 uppercase</span>
                </span>
                <span className={`flex items-center space-x-1 ${passwordRules.hasLower ? 'text-emerald-400 font-bold' : ''}`}>
                  {passwordRules.hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>1 lowercase</span>
                </span>
                <span className={`flex items-center space-x-1 ${passwordRules.hasNumber ? 'text-emerald-400 font-bold' : ''}`}>
                  {passwordRules.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>1 number</span>
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-800 via-utsav-maroon-800 to-red-900 hover:from-red-700 hover:to-red-800 text-amber-300 border-2 border-amber-400/70 font-bold text-sm shadow-2xl tracking-wider uppercase cursor-pointer"
            >
              <span>{loading ? 'Updating Credentials...' : 'Save New Admin Password'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

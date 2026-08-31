import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import { GoogleAuthModal } from '../../components/auth/GoogleAuthModal';
import { triggerGoogleOAuthPopup } from '../../utils/googleAuth';
import {
  Mail,
  Lock,
  LogIn,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname;

  const handleAuthSuccess = (authUser: any) => {
    setSuccessMessage(`Welcome back, ${authUser.name || 'Celebration Host'}!`);
    setTimeout(() => {
      if (from) {
        navigate(from, { replace: true });
      } else if (authUser.role === 'ORGANIZER') {
        navigate('/organizer/dashboard', { replace: true });
      } else if (authUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }, 500);
  };

  const handleGoogleClick = async () => {
    setError(null);
    try {
      await triggerGoogleOAuthPopup({
        onSuccess: async (profile) => {
          try {
            const authUser = await googleLogin({
              email: profile.email,
              name: profile.name,
              picture: profile.picture,
              role: 'USER',
            });
            handleAuthSuccess(authUser);
          } catch (loginErr: any) {
            setError(loginErr.message || 'Google authentication failed');
          }
        },
        onError: (err) => {
          console.warn('Google popup trigger:', err);
          setIsGoogleModalOpen(true);
        },
      });
    } catch {
      setIsGoogleModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      // Authenticate against database via backend
      const authUser = await login(trimmedEmail, password, rememberMe);
      handleAuthSuccess(authUser);
    } catch (err: any) {
      // Clear password on error and show security error message
      setPassword('');
      setError(err.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 relative">
      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleAuthSuccess}
        mode="login"
      />

      {/* Background Indian Cultural Motifs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-20">
        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-radial from-utsav-gold/30 to-transparent blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-radial from-utsav-maroon-800/40 to-transparent blur-2xl" />
      </div>

      <div className="max-w-md w-full rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-950 border-2 border-utsav-gold/60 shadow-2xl p-6 sm:p-8 relative overflow-hidden space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Subtle Decorative Mandala Corner */}
        <div className="absolute top-0 right-0 pointer-events-none opacity-20 dark:opacity-15">
          <MandalaCorner className="w-32 h-32" />
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-utsav-maroon-800 to-utsav-maroon-900 border border-utsav-gold shadow-lg group hover:scale-105 transition-transform duration-300">
            <DiyaIcon className="w-8 h-8" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-utsav-maroon-800 dark:text-utsav-gold">
              UTSAV<span className="text-utsav-saffron-500">MITRA</span>
            </h1>
            <p className="text-xs text-utsav-brown-600 dark:text-utsav-ivory-300 font-medium tracking-wider mt-0.5">
              Plan. Celebrate. Remember.
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
            Sign in to access your wedding, ceremony, or organizer dashboard.
          </p>
        </div>

        {/* Google One-Click Sign In */}
        <button
          type="button"
          onClick={handleGoogleClick}
          className="w-full py-3 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-gray-300 dark:border-utsav-gold/40 hover:border-utsav-gold text-xs sm:text-sm font-bold text-gray-700 dark:text-utsav-ivory flex items-center justify-center space-x-3 shadow-md hover:bg-gray-50 dark:hover:bg-utsav-maroon-800 transition-all cursor-pointer group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
          <span>Sign in with Google account</span>
        </button>

        {/* Or Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-utsav-gold/30"></div>
          <span className="flex-shrink mx-3 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
            or sign in with email
          </span>
          <div className="flex-grow border-t border-utsav-gold/30"></div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800 flex items-center space-x-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Toast / Notification */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold focus:ring-2 focus:ring-utsav-gold/30 shadow-inner transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-utsav-maroon-800 dark:text-utsav-gold hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold focus:ring-2 focus:ring-utsav-gold/30 shadow-inner transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-utsav-gold transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-utsav-maroon-800 border-utsav-gold/60 rounded focus:ring-utsav-gold dark:bg-utsav-maroon-900 accent-utsav-maroon-800 cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs text-utsav-brown-700 dark:text-utsav-ivory-300 font-medium cursor-pointer">
              Remember me for 30 days
            </label>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !!successMessage}
            className="w-full py-3.5 rounded-xl maroon-gradient-btn font-bold text-sm shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 hover:scale-[1.01] transition-transform text-utsav-gold cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-3 border-t border-utsav-gold/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Don't have an account?</span>
          <Link
            to="/register"
            className="font-bold text-utsav-maroon-800 dark:text-utsav-gold hover:underline flex items-center space-x-1"
          >
            <span>Register Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

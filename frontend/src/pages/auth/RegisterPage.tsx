import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import {
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  Users,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isLoading } = useAuth();

  const initialRole = searchParams.get('role')?.toUpperCase() === 'ORGANIZER' ? 'ORGANIZER' : 'USER';
  const [role, setRole] = useState<'USER' | 'ORGANIZER'>(initialRole);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Organizer Fields
  const [organizationName, setOrganizationName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Full Event Planning & Coordination');
  const [city, setCity] = useState('Jaipur');
  const [state, setState] = useState('Rajasthan');
  const [experience, setExperience] = useState('3-5 Years');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password Strength Evaluation
  const passwordRules = useMemo(() => {
    return {
      hasMinLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordRules.hasMinLength) score++;
    if (passwordRules.hasUpper) score++;
    if (passwordRules.hasLower) score++;
    if (passwordRules.hasNumber) score++;
    return score;
  }, [passwordRules]);

  const strengthLabel = useMemo(() => {
    if (!password) return '';
    if (strengthScore <= 2) return 'Weak';
    if (strengthScore === 3) return 'Medium';
    return 'Strong';
  }, [password, strengthScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    if (strengthScore < 4) {
      setError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    try {
      const newUser = await register({
        fullName: fullName.trim(),
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        role, // 'USER' or 'ORGANIZER'
        city,
        state,
        organizationName: role === 'ORGANIZER' ? organizationName : undefined,
        businessCategory: role === 'ORGANIZER' ? businessCategory : undefined,
        experience: role === 'ORGANIZER' ? experience : undefined,
      });

      setSuccessMessage(`Account created successfully! Welcome, ${newUser.name}.`);

      setTimeout(() => {
        if (role === 'ORGANIZER') {
          navigate('/organizer/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 relative">
      <div className="max-w-lg w-full rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-950 border-2 border-utsav-gold/60 shadow-2xl p-6 sm:p-8 relative overflow-hidden space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 pointer-events-none opacity-20 dark:opacity-15">
          <MandalaCorner className="w-32 h-32" />
        </div>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-utsav-maroon-800 to-utsav-maroon-900 border border-utsav-gold shadow-lg hover:scale-105 transition-transform duration-300">
            <DiyaIcon className="w-8 h-8" />
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-utsav-maroon-800 dark:text-utsav-gold">
            Create Your Account
          </h1>
          <p className="text-xs text-utsav-brown-600 dark:text-utsav-ivory-300 font-medium">
            Join UtsavMitra to organize auspicious celebrations or coordinate vendor teams.
          </p>
        </div>

        {/* Role Type Selector (Client vs Organizer - ADMIN is NEVER shown) */}
        <div>
          <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider mb-2">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-900/80 border border-utsav-gold/40">
            <button
              type="button"
              onClick={() => setRole('USER')}
              className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                role === 'USER'
                  ? 'bg-utsav-maroon-800 text-utsav-gold shadow-md border border-utsav-gold'
                  : 'text-utsav-brown dark:text-utsav-ivory hover:bg-white/60 dark:hover:bg-utsav-maroon-950'
              }`}
            >
              <Users className="w-4 h-4 text-utsav-gold" />
              <span>Client / Host</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('ORGANIZER')}
              className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                role === 'ORGANIZER'
                  ? 'bg-utsav-maroon-800 text-utsav-gold shadow-md border border-utsav-gold'
                  : 'text-utsav-brown dark:text-utsav-ivory hover:bg-white/60 dark:hover:bg-utsav-maroon-950'
              }`}
            >
              <Briefcase className="w-4 h-4 text-utsav-saffron" />
              <span>Event Organizer</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800 flex items-center space-x-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Toast */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === 'ORGANIZER' ? 'Rohan Mehra' : 'Aarav Sharma'}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold focus:ring-2 focus:ring-utsav-gold/30 shadow-inner"
              />
            </div>
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider mb-1">
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Organizer Specific Fields */}
          {role === 'ORGANIZER' && (
            <div className="p-3.5 rounded-2xl bg-utsav-beige-100/70 dark:bg-utsav-maroon-900/60 border border-utsav-gold/40 space-y-3 animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider mb-1">
                  Organization / Agency Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Shubh Utsav Wedding Planners"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider mb-1">
                    Experience
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory"
                  >
                    <option value="1-2 Years">1-2 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5-10 Years">5-10 Years</option>
                    <option value="10+ Years">10+ Years</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold shadow-inner"
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

            <div>
              <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="p-3 rounded-xl bg-white dark:bg-utsav-maroon-900/60 border border-utsav-gold/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Password Strength:</span>
                <span
                  className={`font-bold ${
                    strengthLabel === 'Strong'
                      ? 'text-emerald-600'
                      : strengthLabel === 'Medium'
                      ? 'text-amber-500'
                      : 'text-red-500'
                  }`}
                >
                  {strengthLabel}
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex gap-1">
                <div className={`h-full flex-1 rounded-full ${strengthScore >= 1 ? (strengthScore >= 4 ? 'bg-emerald-500' : strengthScore >= 3 ? 'bg-amber-500' : 'bg-red-500') : 'bg-transparent'}`} />
                <div className={`h-full flex-1 rounded-full ${strengthScore >= 2 ? (strengthScore >= 4 ? 'bg-emerald-500' : strengthScore >= 3 ? 'bg-amber-500' : 'bg-red-500') : 'bg-transparent'}`} />
                <div className={`h-full flex-1 rounded-full ${strengthScore >= 3 ? (strengthScore >= 4 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-transparent'}`} />
                <div className={`h-full flex-1 rounded-full ${strengthScore >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} />
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500 pt-1">
                <span className={`flex items-center space-x-1 ${passwordRules.hasMinLength ? 'text-emerald-600 font-bold' : ''}`}>
                  {passwordRules.hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>8+ characters</span>
                </span>
                <span className={`flex items-center space-x-1 ${passwordRules.hasUpper ? 'text-emerald-600 font-bold' : ''}`}>
                  {passwordRules.hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>1 uppercase letter</span>
                </span>
                <span className={`flex items-center space-x-1 ${passwordRules.hasLower ? 'text-emerald-600 font-bold' : ''}`}>
                  {passwordRules.hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>1 lowercase letter</span>
                </span>
                <span className={`flex items-center space-x-1 ${passwordRules.hasNumber ? 'text-emerald-600 font-bold' : ''}`}>
                  {passwordRules.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>1 number</span>
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !!successMessage}
            className="w-full py-3.5 rounded-xl maroon-gradient-btn font-bold text-sm shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 hover:scale-[1.01] transition-transform text-utsav-gold cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Creating Account...' : `Register as ${role === 'ORGANIZER' ? 'Organizer' : 'Client'}`}</span>
          </button>
        </form>

        {/* Footer */}
        <div className="pt-3 border-t border-utsav-gold/20 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Already have an account?</span>
          <Link
            to="/login"
            className="font-bold text-utsav-maroon-800 dark:text-utsav-gold hover:underline flex items-center space-x-1"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

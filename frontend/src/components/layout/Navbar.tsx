import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { DiyaIcon } from './IndianMotifs';
import {
  Sparkles,
  Calendar,
  MapPin,
  Utensils,
  Flower2,
  Music,
  Radio,
  Bell,
  Sun,
  Moon,
  PlusCircle,
  User,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { api } from '../../api/client';

interface NavbarProps {
  onOpenAiWizard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAiWizard }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'ADMIN';
  const isProfilePage = location.pathname === '/profile';

  // Automatically close all dropdowns & mobile menu on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setServicesDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdowns on scroll, touchmove, click outside, or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target as Node)) {
        setServicesDropdownOpen(false);
      }
    };

    const handleScrollOrTouch = () => {
      setUserDropdownOpen(false);
      setServicesDropdownOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserDropdownOpen(false);
        setServicesDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrTouch, { passive: true });
    window.addEventListener('touchmove', handleScrollOrTouch, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrTouch);
      window.removeEventListener('touchmove', handleScrollOrTouch);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      api
        .get<{ success: boolean; unreadCount: number }>('/notifications')
        .then((res) => {
          if (res.success) setUnreadNotifications(res.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  // Authenticated workspace tabs (shown after login on dashboard and app pages)
  const authenticatedNavLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Events', path: '/events', icon: Calendar },
    { label: 'Venues', path: '/venues', icon: MapPin },
    { label: 'AI Planner', path: '/ai-planner', icon: Sparkles, badge: 'Smart' },
    { label: 'Live Events', path: '/events', icon: Radio },
  ];

  const serviceLinks = [
    { label: 'Decorations & Mandaps', path: '/decorations', icon: Flower2 },
    { label: 'Catering & Feasts', path: '/catering', icon: Utensils },
    { label: 'Entertainment & Photos', path: '/entertainment', icon: Music },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-utsav-ivory/95 dark:bg-utsav-maroon-950/95 backdrop-blur-md border-b border-utsav-gold/30 shadow-sm transition-colors duration-200">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-20 gap-1.5 sm:gap-2">
          {/* Logo & Brand Identity */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2 sm:space-x-2.5 group shrink-0">
            <div className="relative flex items-center justify-center p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-utsav-maroon-800 to-utsav-maroon-900 border border-utsav-gold/60 shadow-md group-hover:shadow-utsav-gold/40 transition-all duration-300">
              <DiyaIcon className="w-5 h-5 sm:w-6 sm:h-6 xl:w-7 xl:h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-heading text-lg sm:text-xl xl:text-2xl font-bold tracking-tight text-utsav-maroon-800 dark:text-utsav-gold">
                  UTSAV<span className="text-utsav-saffron-500">MITRA</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-1 py-0.2 rounded bg-utsav-saffron-100 text-utsav-maroon-900 dark:bg-utsav-gold/20 dark:text-utsav-gold border border-utsav-gold/40">
                  AI
                </span>
              </div>
              <p className="hidden sm:block text-[9px] xl:text-[10px] tracking-wider text-utsav-brown-600 dark:text-utsav-ivory-300 font-medium">
                Plan. Celebrate. Remember.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links - Rendered After Login */}
          {isAuthenticated ? (
            <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1.5 animate-in fade-in duration-200">
              {authenticatedNavLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`flex items-center space-x-1 px-2 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                      isActive
                        ? 'bg-utsav-maroon-800 text-utsav-gold shadow-sm border border-utsav-gold/40'
                        : 'text-utsav-brown-800 dark:text-utsav-ivory-200 hover:bg-utsav-beige-200 dark:hover:bg-utsav-maroon-900/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-utsav-saffron-500 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="hidden xl:inline text-[9px] px-1.5 py-0.2 rounded-full bg-utsav-saffron text-utsav-maroon-950 font-bold uppercase shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Services Dropdown */}
              <div className="relative" ref={servicesDropdownRef}>
                <button
                  onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                  className="flex items-center space-x-1 px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium text-utsav-brown-800 dark:text-utsav-ivory-200 hover:bg-utsav-beige-200 dark:hover:bg-utsav-maroon-900/60 transition-colors whitespace-nowrap"
                >
                  <span>Services</span>
                  <ChevronDown className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-utsav-gold shrink-0" />
                </button>

                {servicesDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-utsav-ivory dark:bg-utsav-maroon-900 rounded-xl shadow-xl border border-utsav-gold/40 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {serviceLinks.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sub.label}
                          to={sub.path}
                          onClick={() => setServicesDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3.5 py-2 text-xs xl:text-sm text-utsav-brown-800 dark:text-utsav-ivory hover:bg-utsav-saffron-50 dark:hover:bg-utsav-maroon-800/80 transition-colors"
                        >
                          <SubIcon className="w-3.5 h-3.5 text-utsav-saffron shrink-0" />
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          ) : (
            /* Unauthenticated Minimal Header */
            <div className="hidden lg:flex items-center space-x-4 text-xs font-semibold text-utsav-brown-600 dark:text-utsav-ivory-300">
              <span className="flex items-center space-x-1 text-utsav-gold font-serif italic">
                <span>|| श्री गणेशाय नमः ||</span>
              </span>
            </div>
          )}

          {/* Action Buttons & Profile Controls */}
          <div className="hidden lg:flex items-center space-x-1.5 xl:space-x-2.5 shrink-0">
            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-1.5 xl:p-2 rounded-lg text-utsav-brown-700 dark:text-utsav-gold hover:bg-utsav-beige-200 dark:hover:bg-utsav-maroon-900 transition-colors shrink-0"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 xl:w-5 xl:h-5" /> : <Moon className="w-4 h-4 xl:w-5 xl:h-5" />}
            </button>

            {/* Notifications (Logged In Only) */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-1.5 xl:p-2 rounded-lg text-utsav-brown-700 dark:text-utsav-ivory hover:bg-utsav-beige-200 dark:hover:bg-utsav-maroon-900 transition-colors shrink-0"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 xl:w-5 xl:h-5 text-utsav-gold" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex items-center justify-center w-3.5 h-3.5 xl:w-4 xl:h-4 bg-utsav-saffron text-utsav-maroon-950 font-bold text-[9px] xl:text-[10px] rounded-full shadow">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            )}

            {/* Create Event Action (Only for Clients & Hosts; hidden for Admin & on Profile Page) */}
            {isAuthenticated && !isProfilePage && !isAdmin && (
              <Link
                to="/events/create"
                className="flex items-center space-x-1 px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-xl maroon-gradient-btn font-semibold text-xs xl:text-sm shadow-md text-utsav-gold hover:scale-105 transition-transform shrink-0 whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                <span className="hidden xl:inline">+ Create Event</span>
                <span className="xl:hidden">Create</span>
              </Link>
            )}

            {/* Combined Admin & User Profile Dropdown */}
            {isAuthenticated && user ? (
              <div className="relative shrink-0" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center space-x-1.5 py-1 px-2 xl:px-2.5 rounded-full transition-all cursor-pointer shrink-0 ${
                    isAdmin
                      ? 'bg-gradient-to-r from-red-950 via-utsav-maroon-900 to-black border border-amber-400/80 shadow-md hover:ring-2 hover:ring-amber-400/50'
                      : 'border border-utsav-gold/60 hover:ring-2 hover:ring-utsav-gold/40'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={
                        user.profilePhoto ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={user.name}
                      className="w-7 h-7 xl:w-8 xl:h-8 rounded-full object-cover border border-amber-400 shrink-0"
                    />
                    {isAdmin && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 bg-red-600 rounded-full border border-utsav-gold shadow">
                        <ShieldCheck className="w-2.5 h-2.5 text-utsav-gold" />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col text-left shrink-0">
                    <span className="text-[11px] xl:text-xs font-bold text-utsav-brown dark:text-utsav-ivory max-w-[70px] sm:max-w-[85px] xl:max-w-[110px] truncate leading-tight">
                      {user.name.split(' ')[0]}
                    </span>
                    {isAdmin ? (
                      <span className="text-[8px] xl:text-[9px] font-extrabold uppercase tracking-wider text-amber-500 dark:text-amber-400">
                        👑 Admin
                      </span>
                    ) : (
                      <span className="text-[8px] xl:text-[9px] text-gray-500 dark:text-gray-400 capitalize">
                        {user.role.toLowerCase()}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-utsav-gold shrink-0" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-utsav-ivory dark:bg-utsav-maroon-950 rounded-2xl shadow-2xl border-2 border-utsav-gold/60 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* User & Admin Header */}
                    <div className="px-4 py-2.5 border-b border-utsav-gold/20">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-utsav-brown dark:text-utsav-ivory truncate">{user.name}</p>
                        {isAdmin && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950 text-amber-400 border border-amber-400/50 shrink-0">
                            👑 Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-utsav-brown-400 dark:text-utsav-ivory-400 truncate">{user.email}</p>
                    </div>

                    {/* Admin Direct Command Portal Banner (Combined in Profile) */}
                    {isAdmin && (
                      <div className="p-2.5 mx-2 my-1 rounded-xl bg-gradient-to-r from-red-950 to-utsav-maroon-900 border border-amber-400/40">
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-red-900/60 hover:bg-red-800/80 text-amber-300 text-xs font-bold transition-all shadow-sm group"
                        >
                          <div className="flex items-center space-x-2">
                            <ShieldCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                            <span>Admin Command Center</span>
                          </div>
                          <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-mono">
                            GO →
                          </span>
                        </Link>
                      </div>
                    )}

                    {/* Organizer Direct Studio Link */}
                    {user?.role === 'ORGANIZER' && (
                      <div className="p-2.5 mx-2 my-1 rounded-xl bg-gradient-to-r from-utsav-maroon-900 to-utsav-saffron-900 border border-utsav-gold/40">
                        <Link
                          to="/organizer/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-utsav-maroon-800 text-utsav-gold text-xs font-bold transition-all shadow-sm"
                        >
                          <span>Organizer Studio</span>
                          <span className="text-[10px] bg-utsav-gold text-black px-1.5 py-0.2 rounded font-mono">
                            GO →
                          </span>
                        </Link>
                      </div>
                    )}

                    <div className="py-1">
                      <Link
                        to={user?.role === 'ORGANIZER' ? '/organizer/dashboard' : '/dashboard'}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs xl:text-sm text-utsav-brown hover:bg-utsav-saffron-50 dark:text-utsav-ivory dark:hover:bg-utsav-maroon-900"
                      >
                        <LayoutDashboard className="w-4 h-4 text-utsav-gold" />
                        <span>{user?.role === 'ORGANIZER' ? 'Organizer Dashboard' : 'Host Dashboard'}</span>
                      </Link>
                      <Link
                        to="/events"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs xl:text-sm text-utsav-brown hover:bg-utsav-saffron-50 dark:text-utsav-ivory dark:hover:bg-utsav-maroon-900"
                      >
                        <Calendar className="w-4 h-4 text-utsav-gold" />
                        <span>My Celebrations</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs xl:text-sm text-utsav-brown hover:bg-utsav-saffron-50 dark:text-utsav-ivory dark:hover:bg-utsav-maroon-900"
                      >
                        <User className="w-4 h-4 text-utsav-gold" />
                        <span>My Profile & Settings</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-utsav-gold/20 px-3">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs xl:text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Link
                  to="/login"
                  className="px-2.5 sm:px-3 py-1.5 text-xs xl:text-sm font-semibold text-utsav-maroon-800 dark:text-utsav-gold hover:underline"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-3.5 py-1.5 rounded-xl gold-gradient-btn text-xs font-bold shadow-sm whitespace-nowrap"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-1 sm:space-x-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg text-utsav-brown-700 dark:text-utsav-gold"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-lg text-utsav-maroon-800 dark:text-utsav-gold focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-utsav-gold/30 bg-utsav-ivory dark:bg-utsav-maroon-950 px-4 pt-3 pb-6 space-y-3">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-950 to-utsav-maroon-900 border border-amber-400 text-amber-300 text-sm font-bold shadow-md"
                >
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <span>👑 Admin Command Center</span>
                  </div>
                  <span>→</span>
                </Link>
              )}

              <div className="grid grid-cols-2 gap-2">
                {authenticatedNavLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 p-2.5 rounded-lg bg-utsav-beige-100 dark:bg-utsav-maroon-900/60 text-sm font-semibold text-utsav-brown dark:text-utsav-ivory"
                    >
                      <Icon className="w-4 h-4 text-utsav-saffron" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-utsav-gold/20 flex flex-col space-y-2">
                {!isProfilePage && !isAdmin && (
                  <Link
                    to="/events/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl maroon-gradient-btn font-bold text-sm text-utsav-gold"
                  >
                    + Create New Celebration
                  </Link>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-semibold text-utsav-maroon-800 dark:text-utsav-gold"
                  >
                    Profile ({user?.name})
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="text-xs text-red-600 font-bold"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center rounded-xl bg-utsav-gold/20 text-sm font-bold text-utsav-brown dark:text-utsav-gold border border-utsav-gold"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center rounded-xl maroon-gradient-btn text-sm font-bold text-utsav-gold"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

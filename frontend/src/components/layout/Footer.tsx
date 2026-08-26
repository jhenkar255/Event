import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DiyaIcon, MarigoldGarland } from './IndianMotifs';
import { Sparkles, MapPin, Heart, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { INDIAN_CITIES } from '@shared/constants';

export const Footer: React.FC = () => {
  const location = useLocation();
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail) {
      setIsSubscribed(true);
      setSubscribedEmail('');
    }
  };

  // Check if current page is the main landing page
  const isMainLandingPage = location.pathname === '/';

  // For Login, Register, Dashboard, Event Wizard, Admin, and all internal pages:
  // Show clean, simple, lightweight footer
  if (!isMainLandingPage) {
    return (
      <footer className="bg-utsav-maroon-950 text-utsav-ivory border-t border-utsav-gold/40 py-4 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-utsav-ivory/70">
          <div className="flex items-center space-x-2.5">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 rounded-lg bg-utsav-maroon-900 border border-utsav-gold/60 group-hover:border-utsav-gold transition-colors">
                <DiyaIcon className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-sm text-utsav-gold">
                UTSAV<span className="text-utsav-saffron">MITRA</span>
              </span>
            </Link>
            <span className="hidden sm:inline text-gray-600">•</span>
            <span className="hidden sm:inline text-[11px] text-gray-400 font-medium">
              Plan. Celebrate. Remember.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Verified Platform</span>
            </span>
            <span className="text-gray-600">•</span>
            <div className="flex items-center space-x-1 text-utsav-gold/80">
              <span>Crafted with</span>
              <DiyaIcon className="w-3.5 h-3.5 inline-block" />
              <span>for auspicious celebrations</span>
            </div>
            <span className="text-gray-600">•</span>
            <span>© {new Date().getFullYear()} UtsavMitra</span>
          </div>
        </div>
      </footer>
    );
  }

  // Full Rich Footer for Main Landing Page ('/')
  return (
    <footer className="bg-utsav-maroon-950 text-utsav-ivory border-t-2 border-utsav-gold/50 relative overflow-hidden">
      {/* Decorative Marigold Garland Banner */}
      <MarigoldGarland className="w-full py-2 bg-black/20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Sanskrit Shloka */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-utsav-maroon-900 border border-utsav-gold">
                <DiyaIcon className="w-8 h-8" />
              </div>
              <span className="font-heading text-2xl font-bold text-utsav-gold">
                UTSAV<span className="text-utsav-saffron">MITRA</span>
              </span>
            </div>

            <p className="text-utsav-gold/90 font-serif italic text-xs tracking-wider border-l-2 border-utsav-gold pl-3 py-1">
              "सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके | शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते"
            </p>

            <p className="text-sm text-utsav-ivory/80 leading-relaxed">
              India's premier AI-powered cultural event planning ecosystem. From royal heritage weddings to sacred housewarmings, manage venues, 2D mandap designs, regional catering, signed QR passes, and live command centers from a unified platform.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="pt-2">
              <p className="text-xs font-semibold text-utsav-gold uppercase tracking-wider mb-2">
                Join our Auspicious Muhurtham & Trends Gazette
              </p>
              {isSubscribed ? (
                <div className="p-2.5 rounded-xl bg-utsav-gold/20 text-utsav-gold text-xs font-bold border border-utsav-gold/40 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-utsav-saffron" />
                  <span>Dhanyawad! You are now subscribed to festive updates.</span>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="email"
                    required
                    value={subscribedEmail}
                    onChange={(e) => setSubscribedEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-utsav-maroon-900/80 border border-utsav-gold/40 text-sm text-utsav-ivory placeholder-utsav-ivory/40 focus:outline-none focus:border-utsav-gold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-bold text-utsav-gold uppercase tracking-wider mb-4 border-b border-utsav-gold/30 pb-1">
              Celebration Suites
            </h4>
            <ul className="space-y-2 text-sm text-utsav-ivory/80">
              <li>
                <Link to="/ai-planner" className="hover:text-utsav-gold transition-colors flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-utsav-saffron" />
                  <span>AI Cultural Planner</span>
                </Link>
              </li>
              <li>
                <Link to="/venues" className="hover:text-utsav-gold transition-colors">
                  Heritage Venues & Forts
                </Link>
              </li>
              <li>
                <Link to="/decorations" className="hover:text-utsav-gold transition-colors">
                  Mandaps & Floral Decor
                </Link>
              </li>
              <li>
                <Link to="/catering" className="hover:text-utsav-gold transition-colors">
                  Regional Gastronomy & Feasts
                </Link>
              </li>
              <li>
                <Link to="/entertainment" className="hover:text-utsav-gold transition-colors">
                  Shehnai, Dhol & Live Bands
                </Link>
              </li>
              <li>
                <Link to="/events/create" className="hover:text-utsav-gold transition-colors">
                  Digital Indian E-Invitations
                </Link>
              </li>
            </ul>
          </div>

          {/* Event Categories */}
          <div>
            <h4 className="font-heading text-sm font-bold text-utsav-gold uppercase tracking-wider mb-4 border-b border-utsav-gold/30 pb-1">
              Traditions & Events
            </h4>
            <ul className="space-y-2 text-sm text-utsav-ivory/80">
              <li>
                <Link to="/events" className="hover:text-utsav-gold transition-colors">
                  Royal Rajasthani Weddings
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-utsav-gold transition-colors">
                  South Indian Muhurthams
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-utsav-gold transition-colors">
                  Punjabi Sangeet & Dhol Nights
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-utsav-gold transition-colors">
                  Griha Pravesh & Pujas
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-utsav-gold transition-colors">
                  Baby Showers & Naming Rites
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-utsav-gold transition-colors">
                  Corporate Conclaves & Galas
                </Link>
              </li>
            </ul>
          </div>

          {/* Major Indian Cities */}
          <div>
            <h4 className="font-heading text-sm font-bold text-utsav-gold uppercase tracking-wider mb-4 border-b border-utsav-gold/30 pb-1">
              Top Destination Cities
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {INDIAN_CITIES.slice(0, 10).map((city) => (
                <Link
                  key={city}
                  to={`/venues?city=${city}`}
                  className="px-2 py-1 rounded bg-utsav-maroon-900/80 border border-utsav-gold/20 text-xs text-utsav-ivory/90 hover:border-utsav-gold hover:text-utsav-gold transition-all"
                >
                  {city}
                </Link>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-utsav-maroon-900/60 border border-utsav-gold/30 space-y-1">
              <div className="flex items-center space-x-1 text-xs text-utsav-gold font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Verified Vendors</span>
              </div>
              <p className="text-[11px] text-utsav-ivory/70">
                Razorpay escrow protected booking with instant GST invoicing.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-6 border-t border-utsav-gold/20 flex flex-col sm:flex-row items-center justify-between text-xs text-utsav-ivory/60 space-y-3 sm:space-y-0">
          <p>© {new Date().getFullYear()} UtsavMitra Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center space-x-1 text-utsav-gold">
            <span>Crafted with</span>
            <DiyaIcon className="w-4 h-4 inline-block" />
            <span>for auspicious celebrations across Bharat & Worldwide.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

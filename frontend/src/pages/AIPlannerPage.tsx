import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { INDIAN_TRADITIONS, INDIAN_EVENT_TYPES, INDIAN_CITIES } from '@shared/constants';
import { DiyaIcon, MandalaCorner, MarigoldGarland } from '../components/layout/IndianMotifs';
import {
  Sparkles,
  Calendar,
  Clock,
  IndianRupee,
  Utensils,
  Flower2,
  CheckSquare,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AIPlannerPage: React.FC = () => {
  const navigate = useNavigate();

  const [eventType, setEventType] = useState('WEDDING');
  const [tradition, setTradition] = useState('Rajasthani');
  const [guestCount, setGuestCount] = useState(350);
  const [budget, setBudget] = useState(1200000);
  const [city, setCity] = useState('Jaipur');
  const [customNotes, setCustomNotes] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [planResult, setPlanResult] = useState<any>(null);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await api.post<{ success: boolean; plan: any }>('/ai/plan', {
        eventType,
        culturalTradition: tradition,
        guestCount: Number(guestCount),
        budget: Number(budget),
        city,
        customRequirements: customNotes,
      });

      if (res.success && res.plan) {
        setPlanResult(res.plan);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C9A227', '#F4A340', '#7A1F2B'],
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate cultural AI plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToWizard = () => {
    if (!planResult) return;
    navigate('/events/create', {
      state: {
        prefillData: {
          name: `${tradition} ${eventType.toLowerCase()} Celebration`,
          eventType,
          culturalTradition: tradition,
          guestCount,
          budget,
          city,
        },
      },
    });
  };

  const selectedTraditionObj = INDIAN_TRADITIONS.find((t) => t.name === tradition);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-utsav-maroon-900 via-utsav-maroon-800 to-utsav-maroon-950 text-utsav-ivory border-2 border-utsav-gold/60 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 pointer-events-none opacity-20">
          <MandalaCorner className="w-36 h-36" />
        </div>

        <div className="space-y-2 text-center md:text-left z-10">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <DiyaIcon className="w-6 h-6" />
            <span className="text-xs font-bold text-utsav-gold uppercase tracking-widest">
              Culture-Aware Event Intelligence
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight">
            Indian Cultural AI Planner & Advisor
          </h1>
          <p className="text-xs sm:text-sm text-utsav-ivory/80 max-w-xl font-light">
            Generate auspicious Muhurtham schedules, authentic regional menus, 5-category budget allocations, and ceremony checklists tailored to 12 regional traditions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Form */}
        <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl space-y-4 h-fit">
          <h2 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold border-b border-utsav-gold/20 pb-2">
            Configure Event Parameters
          </h2>

          <form onSubmit={handleGeneratePlan} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                Celebration Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
              >
                {INDIAN_EVENT_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.icon} {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                Regional Indian Tradition
              </label>
              <select
                value={tradition}
                onChange={(e) => setTradition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
              >
                {INDIAN_TRADITIONS.map((trad) => (
                  <option key={trad.id} value={trad.name}>
                    {trad.name} Tradition
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                  Guests
                </label>
                <input
                  type="number"
                  min={10}
                  max={5000}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                  Budget (₹)
                </label>
                <input
                  type="number"
                  step={50000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                Destination City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
              >
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                Special Rituals or Preferences
              </label>
              <textarea
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Pure Jain satvik catering, sunset havan, live shehnai at baraat..."
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 rounded-xl gold-gradient-btn text-xs sm:text-sm font-bold shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-utsav-maroon-950" />
              <span>{isGenerating ? 'AI Generating Plan...' : 'Generate Auspicious AI Blueprint'}</span>
            </button>
          </form>
        </div>

        {/* Right: AI Output Display */}
        <div className="lg:col-span-2 space-y-6">
          {planResult ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Cultural Overview Card */}
              <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-utsav-gold/20 pb-3">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                      {planResult.summary?.title || `${tradition} Celebration Plan`}
                    </h3>
                    <p className="text-xs text-gray-500 font-serif italic text-utsav-gold">
                      {planResult.summary?.shloka || selectedTraditionObj?.shloka || '|| शुभ लाभ ||'}
                    </p>
                  </div>

                  <button
                    onClick={handleApplyToWizard}
                    className="px-4 py-2 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold shadow-md flex items-center space-x-1.5 self-start sm:self-auto"
                  >
                    <span>Create Event from Blueprint</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory leading-relaxed">
                  {planResult.summary?.description || selectedTraditionObj?.description}
                </p>
              </div>

              {/* Ceremony Schedule & Muhurtham */}
              {planResult.schedule && (
                <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl space-y-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-utsav-saffron" />
                    <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                      Ceremonial Muhurtham & Ritual Schedule
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {planResult.schedule.map((item: any, i: number) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 flex items-start space-x-3 text-xs">
                        <span className="px-2 py-1 rounded-lg bg-utsav-maroon-800 text-utsav-gold font-mono font-bold shrink-0">
                          {item.time || `0${9 + i}:00 AM`}
                        </span>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">{item.title}</h4>
                          <p className="text-gray-500">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget Optimizer Breakdown */}
              {planResult.budgetBreakdown && (
                <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl space-y-4">
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="w-5 h-5 text-utsav-saffron" />
                    <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                      AI Budget Allocation & Escrow Breakdown
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {Object.entries(planResult.budgetBreakdown).map(([cat, amt]: [string, any]) => (
                      <div key={cat} className="p-3 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 flex justify-between items-center">
                        <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{cat}</span>
                        <span className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                          ₹{typeof amt === 'number' ? amt.toLocaleString('en-IN') : amt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regional Menu Delicacies */}
              {planResult.recommendedMenu && (
                <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl space-y-3">
                  <div className="flex items-center space-x-2">
                    <Utensils className="w-5 h-5 text-utsav-saffron" />
                    <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                      Curated Regional Menu & Live Food Counters
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {planResult.recommendedMenu.map((dish: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-white dark:bg-utsav-maroon-950 text-xs font-semibold text-utsav-brown dark:text-utsav-ivory border border-utsav-gold/30 shadow-sm">
                        🍛 {dish}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-utsav-beige-100/70 dark:bg-utsav-maroon-900/60 border-2 border-dashed border-utsav-gold/40 text-center space-y-4 flex flex-col items-center justify-center min-h-[400px]">
              <DiyaIcon className="w-16 h-16" />
              <h3 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                Select Tradition & Generate Plan
              </h3>
              <p className="text-xs text-gray-500 max-w-md">
                Our cultural AI engine will tailor rituals, auspicious timelines, budget breakdowns, and satvik menus specifically for your celebration.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

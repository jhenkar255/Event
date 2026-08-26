import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Wand2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';
import { DiyaIcon } from '../layout/IndianMotifs';

interface AIEventWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIEventWizardModal: React.FC<AIEventWizardModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [promptText, setPromptText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  if (!isOpen) return null;

  const samplePrompts = [
    'Plan a grand South Indian wedding for 350 guests in Bangalore with ₹10 lakh budget.',
    'I want to organize a 200-person Royal Rajasthani Engagement ceremony in Jaipur with ₹6 Lakhs.',
    'Plan a Punjabi Birthday Party for 80 guests in Delhi with live DJ and tandoor catering.',
    'Traditional Griha Pravesh Housewarming for 120 guests in Mumbai with satvik feast.',
  ];

  const handleParse = async (textToParse?: string) => {
    const text = textToParse || promptText;
    if (!text.trim()) return;

    setIsParsing(true);
    try {
      const res = await api.post<{ success: boolean; parsed: any }>('/ai/parse-prompt', {
        prompt: text,
      });

      if (res.success && res.parsed) {
        setParsedData(res.parsed);
      }
    } catch (err) {
      console.error('AI parsing error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleProceed = () => {
    onClose();
    navigate('/events/create', {
      state: { prefillData: parsedData, rawPrompt: promptText },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-utsav-ivory dark:bg-utsav-maroon-950 w-full max-w-xl rounded-3xl shadow-2xl border-2 border-utsav-gold/60 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-utsav-maroon-900 to-utsav-maroon-800 text-utsav-ivory border-b border-utsav-gold/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-utsav-maroon-950 border border-utsav-gold">
              <DiyaIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-utsav-gold">
                Create Celebration with AI
              </h3>
              <p className="text-xs text-utsav-ivory/80">
                Describe your dream event in simple words — AI will configure your plan!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-utsav-ivory/70 hover:text-utsav-gold hover:bg-utsav-maroon-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider mb-2">
              Describe your celebration
            </label>
            <textarea
              rows={3}
              value={promptText}
              onChange={(e) => {
                setPromptText(e.target.value);
                setParsedData(null);
              }}
              placeholder="e.g., I am planning a 300-person Rajasthani wedding in Jaipur with ₹12 lakh budget and traditional catering..."
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/50 text-sm text-utsav-brown dark:text-utsav-ivory placeholder-utsav-brown-400 focus:outline-none focus:border-utsav-gold shadow-inner"
            />
          </div>

          {/* Sample Prompts */}
          <div>
            <span className="text-[11px] font-semibold text-utsav-brown-600 dark:text-utsav-ivory-400">
              💡 Or pick a popular Indian celebration template:
            </span>
            <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
              {samplePrompts.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPromptText(sample);
                    handleParse(sample);
                  }}
                  className="w-full text-left p-2 rounded-xl bg-utsav-beige-100 dark:bg-utsav-maroon-900/60 hover:bg-utsav-saffron-100 dark:hover:bg-utsav-maroon-800 text-xs text-utsav-brown-800 dark:text-utsav-ivory border border-utsav-gold/30 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{sample}</span>
                  <Wand2 className="w-3.5 h-3.5 text-utsav-gold group-hover:text-utsav-saffron shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* AI Parsing Preview */}
          {parsedData && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI Detected Parameters Successfully:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white/80 dark:bg-utsav-maroon-900 p-2 rounded-xl border border-emerald-400/30">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Type</span>
                  <span className="font-bold text-utsav-brown dark:text-utsav-ivory">{parsedData.eventType}</span>
                </div>
                <div className="bg-white/80 dark:bg-utsav-maroon-900 p-2 rounded-xl border border-emerald-400/30">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Tradition</span>
                  <span className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">{parsedData.culturalTradition}</span>
                </div>
                <div className="bg-white/80 dark:bg-utsav-maroon-900 p-2 rounded-xl border border-emerald-400/30">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block">City</span>
                  <span className="font-bold text-utsav-brown dark:text-utsav-ivory">{parsedData.city}</span>
                </div>
                <div className="bg-white/80 dark:bg-utsav-maroon-900 p-2 rounded-xl border border-emerald-400/30">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Budget</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{(parsedData.budget / 100000).toFixed(1)} Lakhs</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-utsav-beige-100 dark:bg-utsav-maroon-900 border-t border-utsav-gold/30 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-utsav-brown-600 dark:text-utsav-ivory-300 hover:underline"
          >
            Cancel
          </button>

          {parsedData ? (
            <button
              type="button"
              onClick={handleProceed}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl gold-gradient-btn text-sm font-bold shadow-md"
            >
              <span>Proceed to Wizard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleParse()}
              disabled={isParsing || !promptText.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl maroon-gradient-btn text-sm font-bold shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-utsav-gold" />
              <span>{isParsing ? 'Analyzing with AI...' : 'Parse & Generate Plan'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

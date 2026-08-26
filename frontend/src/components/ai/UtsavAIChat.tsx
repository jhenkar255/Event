import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageCircle, X, Send, Bot, User, CornerDownLeft, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';
import { DiyaIcon } from '../layout/IndianMotifs';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface UtsavAIChatProps {
  eventContext?: {
    name?: string;
    type?: string;
    budget?: number;
    spentBudget?: number;
    guestCount?: number;
    culturalTradition?: string;
    city?: string;
  };
}

export const UtsavAIChat: React.FC<UtsavAIChatProps> = ({ eventContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: `Namaste! 🙏 I am **Utsav AI** (powered by Grok), your dedicated cultural planning copilot for **UtsavMitra**.\n\nI can assist you exclusively with what this website creates: **AI Cultural Planning**, **2D Mandap Blueprints**, **Royal Seating Layouts**, **Regional Feasts**, **Heritage Venues**, and **Cryptographic QR Gate Passes**!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'What does this website create?',
    'How does the 2D Mandap Studio work?',
    'How do QR Gate Passes work?',
    'Suggest wedding venue in Jaipur',
    'What food menu is suitable for 300 guests?',
    'What is my remaining budget?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post<{ success: boolean; reply: string }>('/ai/chat', {
        message: textToSend,
        eventContext,
      });

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.reply || 'I am happy to assist you with your celebration planning.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: `Apologies, I encountered an issue: ${err.message || 'Please try again.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center space-x-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full gold-gradient-btn shadow-2xl hover:scale-105 transition-all duration-300 group border-2 border-utsav-maroon-800 cursor-pointer select-none max-w-[calc(100vw-2rem)]"
          aria-label="Open Utsav AI Assistant"
        >
          <div className="relative shrink-0">
            <DiyaIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-utsav-saffron opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-utsav-maroon-800"></span>
            </span>
          </div>
          <div className="flex flex-col text-left shrink-0">
            <span className="font-heading font-bold text-xs sm:text-sm tracking-wide text-utsav-brown-950">
              Ask Utsav AI
            </span>
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase text-utsav-maroon-900 tracking-wider">
              ⚡ Grok AI Connected
            </span>
          </div>
        </button>
      )}

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] max-w-[calc(100vw-2rem)] bg-utsav-ivory dark:bg-utsav-maroon-950 rounded-3xl shadow-2xl border-2 border-utsav-gold/60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-utsav-maroon-900 to-utsav-maroon-800 text-utsav-ivory border-b border-utsav-gold/40 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-xl bg-utsav-maroon-950 border border-utsav-gold/50 shadow">
                <DiyaIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-heading text-sm font-bold text-utsav-gold">
                    Utsav AI Copilot
                  </h3>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-utsav-gold/20 text-utsav-gold font-bold uppercase border border-utsav-gold/40">
                    Grok AI
                  </span>
                </div>
                <p className="text-[11px] text-utsav-ivory/70">
                  {eventContext?.name ? `Context: ${eventContext.name}` : 'Website Creation Intelligence'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-utsav-ivory/70 hover:text-utsav-gold hover:bg-utsav-maroon-700/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-utsav-beige-50/50 dark:bg-utsav-maroon-900/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-2 ${
                  msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-utsav-saffron text-utsav-maroon-950 font-bold'
                      : 'bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold/40'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-utsav-maroon-800 text-utsav-ivory font-medium rounded-tr-none'
                      : 'bg-white dark:bg-utsav-maroon-900 text-utsav-brown dark:text-utsav-ivory border border-utsav-gold/30 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 ${
                      msg.sender === 'user' ? 'text-utsav-gold/80 text-right' : 'text-utsav-brown-400 dark:text-utsav-ivory-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-utsav-gold font-medium p-2 rounded-xl bg-utsav-gold/10 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Consulting cultural event wisdom...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2 bg-utsav-ivory dark:bg-utsav-maroon-950 border-t border-utsav-gold/20 flex overflow-x-auto space-x-1.5 scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-utsav-brown dark:text-utsav-gold hover:bg-utsav-saffron hover:text-utsav-maroon-950 transition-colors border border-utsav-gold/30 shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-utsav-ivory dark:bg-utsav-maroon-950 border-t border-utsav-gold/30 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. menu, decor, budget)..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory placeholder-utsav-brown-400 dark:placeholder-utsav-ivory-400 focus:outline-none focus:border-utsav-gold shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl maroon-gradient-btn disabled:opacity-50 transition-all text-utsav-gold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

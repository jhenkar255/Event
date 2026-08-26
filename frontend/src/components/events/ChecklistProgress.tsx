import React, { useState } from 'react';
import { CheckCircle, Circle, CheckSquare, Sparkles, Filter } from 'lucide-react';
import { IChecklistItem } from '@shared/types';
import { api } from '../../api/client';

interface ChecklistProgressProps {
  eventId: string;
  checklist: IChecklistItem[];
  onUpdate?: (updated: IChecklistItem[]) => void;
}

export const ChecklistProgress: React.FC<ChecklistProgressProps> = ({ eventId, checklist, onUpdate }) => {
  const [items, setItems] = useState<IChecklistItem[]>(checklist || []);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];

  const toggleCheck = async (id: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, isCompleted: !i.isCompleted } : i));
    setItems(updated);
    if (onUpdate) onUpdate(updated);

    try {
      await api.put(`/events/${eventId}/checklist`, { checklist: updated });
    } catch (err) {
      console.error('Failed to update checklist:', err);
    }
  };

  const completedCount = items.filter((i) => i.isCompleted).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const filteredItems = activeCategory === 'All' ? items : items.filter((i) => i.category === activeCategory);

  return (
    <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl space-y-4">
      {/* Header & Progress Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/20 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-utsav-saffron" />
            <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Smart Auspicious Checklist
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Auto-configured for your cultural ceremonies and vendor milestones.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              {completedCount} / {items.length} Done
            </span>
            <span className="text-xs text-gray-500 block">{progressPercent}% Completed</span>
          </div>

          <div className="w-12 h-12 rounded-full border-4 border-utsav-gold flex items-center justify-center font-bold text-xs bg-utsav-gold/10 text-utsav-maroon-900 dark:text-utsav-gold">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex overflow-x-auto space-x-1.5 pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-utsav-maroon-800 text-utsav-ivory shadow-sm'
                : 'bg-utsav-beige-100 dark:bg-utsav-maroon-950 text-utsav-brown dark:text-utsav-ivory border border-utsav-gold/30 hover:border-utsav-gold'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Checklist items */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleCheck(item.id)}
            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              item.isCompleted
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/40 text-gray-500 line-through'
                : 'bg-white dark:bg-utsav-maroon-950 border-utsav-gold/30 hover:border-utsav-gold text-utsav-brown dark:text-utsav-ivory shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-3">
              {item.isCompleted ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-utsav-gold shrink-0 hover:text-utsav-saffron" />
              )}
              <span className="text-xs sm:text-sm font-semibold">{item.title}</span>
            </div>

            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-utsav-maroon-900 dark:text-utsav-gold shrink-0">
              {item.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

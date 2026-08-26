import React, { useState, useRef, useEffect } from 'react';
import {
  Save,
  RotateCw,
  Trash2,
  Plus,
  RefreshCcw,
  Sparkles,
  Move,
  Layers,
  Palette,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../api/client';
import { DiyaIcon } from '../layout/IndianMotifs';

interface DesignElement {
  id: string;
  type: 'mandap' | 'stage' | 'entrance' | 'rangoli' | 'table' | 'chair' | 'lighting' | 'photo_booth';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color?: string;
  label?: string;
}

interface Interactive2DDesignerProps {
  eventId: string;
}

export const Interactive2DDesigner: React.FC<Interactive2DDesignerProps> = ({ eventId }) => {
  const [elements, setElements] = useState<DesignElement[]>([
    { id: 'el-1', type: 'mandap', x: 450, y: 80, width: 300, height: 200, rotation: 0, color: '#C9A227', label: 'Grand Mandap' },
    { id: 'el-2', type: 'stage', x: 450, y: 340, width: 300, height: 120, rotation: 0, color: '#7A1F2B', label: 'Varmala Stage' },
    { id: 'el-3', type: 'entrance', x: 500, y: 640, width: 200, height: 80, rotation: 0, color: '#F4A340', label: 'Royal Arch Entrance' },
    { id: 'el-4', type: 'rangoli', x: 550, y: 530, width: 100, height: 100, rotation: 0, color: '#FFB800', label: 'Marigold Rangoli' },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [themeName, setThemeName] = useState('Royal Rajputana Gold & Crimson');
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eventId) {
      api
        .get<{ success: boolean; design: any }>(`/events/${eventId}/design`)
        .then((res) => {
          if (res.success && res.design?.elements?.length) {
            setElements(res.design.elements);
            if (res.design.themeName) setThemeName(res.design.themeName);
          }
        })
        .catch(() => {});
    }
  }, [eventId]);

  const elementTypes = [
    { type: 'mandap', label: 'Mandap', defaultWidth: 260, defaultHeight: 180, color: '#C9A227' },
    { type: 'stage', label: 'Main Stage', defaultWidth: 280, defaultHeight: 120, color: '#7A1F2B' },
    { type: 'entrance', label: 'Entrance Toran', defaultWidth: 180, defaultHeight: 70, color: '#F4A340' },
    { type: 'rangoli', label: 'Rangoli Mandala', defaultWidth: 90, defaultHeight: 90, color: '#FFB800' },
    { type: 'table', label: 'Dining Table', defaultWidth: 80, defaultHeight: 80, color: '#2B2118' },
    { type: 'lighting', label: 'Fairy Light Truss', defaultWidth: 140, defaultHeight: 30, color: '#FFD700' },
    { type: 'photo_booth', label: 'Photo Booth', defaultWidth: 120, defaultHeight: 90, color: '#9E1F33' },
  ];

  const handleAddElement = (tpl: (typeof elementTypes)[0]) => {
    const newEl: DesignElement = {
      id: `el-${Date.now()}`,
      type: tpl.type as any,
      x: 350 + Math.floor(Math.random() * 80),
      y: 200 + Math.floor(Math.random() * 80),
      width: tpl.defaultWidth,
      height: tpl.defaultHeight,
      rotation: 0,
      color: tpl.color,
      label: tpl.label,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);

    const el = elements.find((item) => item.id === id);
    if (el && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - el.x,
        y: e.clientY - rect.top - el.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(rect.width - 50, e.clientX - rect.left - dragOffset.x));
    const newY = Math.max(0, Math.min(rect.height - 50, e.clientY - rect.top - dragOffset.y));

    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, x: Math.round(newX), y: Math.round(newY) } : el))
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotateSelected = () => {
    if (!selectedId) return;
    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, rotation: (el.rotation + 45) % 360 } : el))
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  const handleResetLayout = () => {
    setElements([
      { id: 'el-1', type: 'mandap', x: 450, y: 80, width: 300, height: 200, rotation: 0, color: '#C9A227', label: 'Grand Mandap' },
      { id: 'el-2', type: 'stage', x: 450, y: 340, width: 300, height: 120, rotation: 0, color: '#7A1F2B', label: 'Varmala Stage' },
      { id: 'el-3', type: 'entrance', x: 500, y: 640, width: 200, height: 80, rotation: 0, color: '#F4A340', label: 'Royal Arch Entrance' },
      { id: 'el-4', type: 'rangoli', x: 550, y: 530, width: 100, height: 100, rotation: 0, color: '#FFB800', label: 'Marigold Rangoli' },
    ]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post(`/events/${eventId}/design`, {
        elements,
        canvasWidth: 1200,
        canvasHeight: 800,
        themeName,
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.error('Failed to save design:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              2D Cultural Venue & Mandap Studio
            </h3>
            <p className="text-xs text-utsav-brown-600 dark:text-utsav-ivory-300">
              Drag, rotate, and arrange Mandap, Stage, Rangoli, and Seating layouts.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {savedNotice && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Design Saved!</span>
            </div>
          )}

          <button
            onClick={handleResetLayout}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-utsav-brown dark:text-utsav-ivory text-xs font-semibold hover:bg-utsav-beige-300"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl maroon-gradient-btn text-xs sm:text-sm font-bold shadow-md"
          >
            <Save className="w-4 h-4 text-utsav-gold" />
            <span>{isSaving ? 'Saving...' : 'Save Blueprint'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Palette */}
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-md space-y-3">
            <h4 className="font-heading text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
              Add Cultural Elements
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {elementTypes.map((tpl) => (
                <button
                  key={tpl.type}
                  onClick={() => handleAddElement(tpl)}
                  className="p-2.5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 hover:border-utsav-gold text-xs font-semibold text-utsav-brown dark:text-utsav-ivory text-left flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tpl.color }} />
                    <Plus className="w-3.5 h-3.5 text-utsav-gold group-hover:scale-125 transition-transform" />
                  </div>
                  <span className="truncate">{tpl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Element Controls */}
          {selectedElement && (
            <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-md space-y-3 animate-in fade-in duration-150">
              <h4 className="font-heading text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
                Selected: {selectedElement.label}
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Label</label>
                <input
                  type="text"
                  value={selectedElement.label || ''}
                  onChange={(e) =>
                    setElements((prev) =>
                      prev.map((el) => (el.id === selectedId ? { ...el, label: e.target.value } : el))
                    )
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleRotateSelected}
                  className="flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-xs font-bold text-utsav-brown dark:text-utsav-ivory hover:bg-utsav-saffron hover:text-utsav-maroon-950"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate 45°</span>
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2D Canvas Area */}
        <div className="lg:col-span-3">
          <div
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={() => setSelectedId(null)}
            className="relative w-full h-[600px] bg-[#FAF5EE] dark:bg-[#1A0E12] rounded-3xl border-2 border-dashed border-utsav-gold/60 shadow-2xl overflow-hidden cursor-crosshair select-none"
            style={{
              backgroundImage:
                'radial-gradient(rgba(201, 162, 39, 0.25) 1px, transparent 1px), radial-gradient(rgba(201, 162, 39, 0.25) 1px, #FAF5EE 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* Stage/Backdrop Axis Guidelines */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-utsav-maroon-800/80 text-utsav-gold font-heading text-[10px] tracking-widest uppercase border border-utsav-gold/40">
              NORTH / MAIN STAGE AXIS
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-utsav-maroon-800/80 text-utsav-gold font-heading text-[10px] tracking-widest uppercase border border-utsav-gold/40">
              SOUTH / MAIN GUEST ENTRANCE
            </div>

            {/* Elements Layer */}
            {elements.map((el) => {
              const isSelected = el.id === selectedId;
              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDown(e, el.id)}
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    transform: `rotate(${el.rotation}deg)`,
                    backgroundColor: el.color || '#C9A227',
                  }}
                  className={`absolute rounded-2xl p-2 cursor-grab active:cursor-grabbing shadow-lg transition-shadow flex flex-col items-center justify-center text-center text-white ${
                    isSelected ? 'ring-4 ring-utsav-saffron ring-offset-2 scale-[1.02] shadow-2xl z-30' : 'z-10'
                  }`}
                >
                  <span className="font-heading text-xs font-bold drop-shadow-md">{el.label}</span>
                  <span className="text-[10px] opacity-80 uppercase tracking-wider">{el.type}</span>
                  {el.type === 'mandap' && (
                    <div className="mt-1 flex space-x-1">
                      <span className="w-2 h-2 rounded-full bg-amber-300" />
                      <span className="w-2 h-2 rounded-full bg-amber-300" />
                      <span className="w-2 h-2 rounded-full bg-amber-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

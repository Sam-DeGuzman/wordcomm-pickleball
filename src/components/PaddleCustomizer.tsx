import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Player, PaddleConfig } from '../types';
import { Paddle } from './Paddle';
import { PADDLE_COLOR_PRESETS, GRIP_COLOR_PRESETS } from '../data/initialData';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { Palette, Check, Upload, Image as ImageIcon, RotateCcw, X, Shield, Award } from 'lucide-react';

interface PaddleCustomizerProps {
  currentUser: Player;
  onSavePaddleConfig: (newConfig: PaddleConfig) => void;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
];

export const PaddleCustomizer: React.FC<PaddleCustomizerProps> = ({
  currentUser,
  onSavePaddleConfig,
  onClose,
}) => {
  // Disable background page scrolling while modal is open
  useBodyScrollLock(true);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [config, setConfig] = useState<PaddleConfig>({ ...currentUser.paddleConfig });
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [activeTab, setActiveTab] = useState<'avatar' | 'colors' | 'patterns'>('avatar');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setConfig((prev) => ({ ...prev, avatarUrl: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSavePaddleConfig(config);
    onClose();
  };

  return (
    <div
      id="paddle-customizer-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="w-full max-w-4xl bg-[#121822] rounded-3xl border-2 border-[#26374D] shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#202B3C] flex items-center justify-between bg-[#0E131C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1F5B73] border border-[#347895] flex items-center justify-center text-[#F4E022]">
              <Palette className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-black text-lg sm:text-xl text-white uppercase tracking-tight">
                Paddle Studio & Profile Avatar
              </h3>
              <p className="text-xs text-slate-400">
                Attach your player avatar directly onto the paddle face sweet-spot & customize your racket.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1A2330] hover:bg-[#253245] text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 sm:p-6">
          {/* Left Column: Interactive 3D Paddle Live Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-[#0B0E14] rounded-2xl border border-[#1E2938] relative overflow-hidden">
            {/* Ambient glow behind paddle */}
            <div
              className="absolute w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: config.faceColor }}
            />

            <span className="text-[10px] font-['Outfit'] font-black tracking-widest text-[#F4E022] uppercase mb-4">
              RACK SWEET-SPOT PREVIEW
            </span>

            {/* Render Paddle with Live Config */}
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="my-2"
            >
              <Paddle
                config={config}
                playerName={currentUser.name}
                dupr={currentUser.duprRating}
                size="lg"
                isCurrentUser={true}
                interactive={false}
              />
            </motion.div>

            {/* Paddle Specs Card */}
            <div className="w-full mt-4 p-3 bg-[#131B26] rounded-xl border border-[#222E3E] text-xs space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Core Surface:</span>
                <span className="font-bold text-white uppercase font-['Outfit']">
                  {config.pattern.replace('-', ' ')}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Color Signature:</span>
                <span className="font-bold text-[#F4E022]">{config.faceColorName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Club Specs:</span>
                <span className="font-bold text-white">USAPA Approved 16mm</span>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            {/* Customizer Tabs */}
            <div className="flex items-center gap-2 p-1 bg-[#0B0E14] rounded-xl border border-[#1E2938]">
              <button
                onClick={() => setActiveTab('avatar')}
                className={`flex-1 py-2 rounded-lg font-['Outfit'] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === 'avatar'
                    ? 'bg-[#1F5B73] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                1. Attached Avatar
              </button>
              <button
                onClick={() => setActiveTab('colors')}
                className={`flex-1 py-2 rounded-lg font-['Outfit'] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === 'colors'
                    ? 'bg-[#1F5B73] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                2. Palette Skins
              </button>
              <button
                onClick={() => setActiveTab('patterns')}
                className={`flex-1 py-2 rounded-lg font-['Outfit'] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === 'patterns'
                    ? 'bg-[#1F5B73] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                3. Texture & Grip
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="space-y-4">
              {activeTab === 'avatar' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-['Outfit'] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Upload Custom Player Photo
                    </label>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#293A4F] hover:border-[#F4E022] rounded-2xl bg-[#0B0E14] cursor-pointer group transition-colors">
                      <Upload className="w-6 h-6 text-[#F4E022] mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-['Outfit'] font-bold text-white">
                        Click to Choose Photo File
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        JPG, PNG, or WEBP (Automatically framed on paddle sweet spot)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="text-xs font-['Outfit'] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Or Choose Club Member Avatar Preset
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      {AVATAR_PRESETS.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setConfig((prev) => ({ ...prev, avatarUrl: url }))}
                          className={`relative rounded-full p-0.5 transition-all cursor-pointer ${
                            config.avatarUrl === url
                              ? 'ring-4 ring-[#F4E022] scale-110'
                              : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={url}
                            alt="Preset"
                            className="w-12 h-12 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {config.avatarUrl === url && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F4E022] text-[#0B0E14] flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'colors' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-['Outfit'] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Wordcomm Paddle Face Color
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PADDLE_COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.hex}
                          onClick={() =>
                            setConfig((prev) => ({
                              ...prev,
                              faceColor: preset.hex,
                              faceColorName: preset.name,
                            }))
                          }
                          className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                            config.faceColor === preset.hex
                              ? 'border-[#F4E022] bg-[#1C2736] shadow-md'
                              : 'border-[#202B3B] bg-[#0E141D] hover:bg-[#151D28]'
                          }`}
                        >
                          <span
                            className="w-6 h-6 rounded-lg shadow-inner border border-white/20"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <div className="text-left">
                            <div className="text-xs font-['Outfit'] font-bold text-white">
                              {preset.name}
                            </div>
                            <div className="text-[10px] text-slate-400">{preset.tag}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-['Outfit'] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Edge Guard Color
                    </label>
                    <div className="flex items-center gap-2">
                      {['#FFFFFF', '#F4E022', '#E07137', '#0B0E14'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setConfig((prev) => ({ ...prev, edgeGuardColor: color }))}
                          className={`w-8 h-8 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-center ${
                            config.edgeGuardColor === color
                              ? 'border-[#F4E022] scale-110'
                              : 'border-[#29374B]'
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {config.edgeGuardColor === color && (
                            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'patterns' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-['Outfit'] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Surface Pattern & Core
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { id: 'honeycomb', name: 'Polymer Honeycomb' },
                          { id: 'carbon-weave', name: 'Raw Carbon Weave' },
                          { id: 'retro-lines', name: 'Club Speed Stripes' },
                          { id: 'classic', name: 'Classic Matte' },
                        ] as const
                      ).map((pat) => (
                        <button
                          key={pat.id}
                          onClick={() => setConfig((prev) => ({ ...prev, pattern: pat.id }))}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            config.pattern === pat.id
                              ? 'border-[#F4E022] bg-[#1A2534]'
                              : 'border-[#1E2938] bg-[#0E141D] hover:bg-[#151D28]'
                          }`}
                        >
                          <div className="text-xs font-['Outfit'] font-bold text-white">
                            {pat.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-['Outfit'] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Contoured Grip Tape Color
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {GRIP_COLOR_PRESETS.map((grip) => (
                        <button
                          key={grip.hex}
                          onClick={() => setConfig((prev) => ({ ...prev, gripColor: grip.hex }))}
                          className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                            config.gripColor === grip.hex
                              ? 'border-[#F4E022] bg-[#1A2433]'
                              : 'border-[#202B3B] bg-[#0E141D]'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: grip.hex }}
                          />
                          <span className="text-[11px] font-['Outfit'] font-semibold text-slate-300 truncate">
                            {grip.name.replace(' Grip', '')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1E2938]">
              <button
                onClick={() => setConfig({ ...currentUser.paddleConfig })}
                className="px-3 py-2 rounded-xl bg-[#17202C] hover:bg-[#202C3D] text-slate-400 hover:text-white font-['Outfit'] font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-[#F4E022] hover:bg-[#E5CF15] text-[#0B0E14] font-['Outfit'] font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Equip & Update Paddle in Rack
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

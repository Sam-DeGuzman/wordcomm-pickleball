import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Player, Quest, Badge } from '../types';
import { Paddle } from './Paddle';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import {
  Flame,
  Award,
  Trophy,
  Shield,
  Zap,
  Palette,
  CheckCircle2,
  X,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface ProfileModalProps {
  player: Player;
  isCurrentUser: boolean;
  quests: Quest[];
  onClaimQuest: (questId: string) => void;
  onOpenPaddleCustomizer: () => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  player,
  isCurrentUser,
  quests,
  onClaimQuest,
  onOpenPaddleCustomizer,
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

  const winRate =
    player.matchesPlayed > 0
      ? Math.round((player.wins / player.matchesPlayed) * 100)
      : 0;

  const xpPercentage = Math.min(100, Math.round((player.xp / player.xpToNextLevel) * 100));

  const handleClaim = (questId: string) => {
    onClaimQuest(questId);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F4E022', '#10B981', '#E07137'],
      });
    } catch {
      // Ignore
    }
  };

  return (
    <div
      id="profile-modal-backdrop"
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
        className="w-full max-w-3xl bg-[#121822] rounded-3xl border-2 border-[#243447] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
      >
        {/* Header Hero Banner with Palette Court Net Texture */}
        <div className="relative p-6 bg-gradient-to-r from-[#182636] via-[#1F3347] to-[#121822] border-b border-[#233346] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Player Avatar */}
            <div className="relative">
              <img
                src={player.avatarUrl}
                alt={player.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#F4E022] shadow-xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-[#E07137] text-white font-['Outfit'] font-black text-[10px] uppercase shadow">
                Lvl {player.level}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-['Outfit'] font-black text-white tracking-tight">
                  {player.name}
                </h3>
                {isCurrentUser && (
                  <span className="px-2 py-0.5 rounded-full bg-[#F4E022] text-[#0B0E14] font-['Outfit'] font-black text-[10px] uppercase">
                    You
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span>{player.handle}</span>
                <span>•</span>
                <span className="text-[#F4E022] font-semibold">{player.preferredPlayStyle || 'All-Rounder'}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0B0E14] border border-[#2B3B4F] text-[#F4E022] font-['Outfit'] font-black text-xs">
                  DUPR {player.duprRating.toFixed(2)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#1F5B73] text-white text-[11px] font-semibold">
                  {player.skillTier} Tier
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1A2330] hover:bg-[#253245] text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E07137]/20 border border-[#E07137]/50 text-[#E07137]">
              <Flame className="w-4 h-4 fill-current animate-bounce" />
              <span className="font-['Outfit'] font-black text-sm text-white">
                {player.streakDays} Day Streak
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {/* Level Progress & DUPR Milestone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gamified Level & XP */}
            <div className="p-4 rounded-2xl bg-[#0B0E14] border border-[#1E2938]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-['Outfit'] font-bold text-xs text-slate-400 uppercase tracking-wider">
                  Club Experience (XP)
                </span>
                <span className="text-xs font-mono text-[#F4E022]">
                  {player.xp} / {player.xpToNextLevel} XP
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#182332] overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#F4E022] to-[#E07137] transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">
                {player.xpToNextLevel - player.xp} XP until Level {player.level + 1} Perk Unlock
              </span>
            </div>

            {/* DUPR Rating Progress */}
            <div className="p-4 rounded-2xl bg-[#0B0E14] border border-[#1E2938]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-['Outfit'] font-bold text-xs text-slate-400 uppercase tracking-wider">
                  DUPR Rating Benchmark
                </span>
                <span className="text-xs font-mono text-[#10B981]">
                  Target: 4.00 Pro
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#182332] overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-[#10B981]"
                  style={{ width: `${Math.min(100, (player.duprRating / 4.0) * 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                <span>Current: {player.duprRating.toFixed(2)}</span>
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +0.08 this week
                </span>
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#0E141E] border border-[#1D2736] text-center">
              <span className="text-[10px] font-['Outfit'] font-bold text-slate-400 uppercase">
                Matches
              </span>
              <div className="font-['Outfit'] font-black text-xl text-white mt-0.5">
                {player.matchesPlayed}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#0E141E] border border-[#1D2736] text-center">
              <span className="text-[10px] font-['Outfit'] font-bold text-slate-400 uppercase">
                Win Rate
              </span>
              <div className="font-['Outfit'] font-black text-xl text-[#F4E022] mt-0.5">
                {winRate}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#0E141E] border border-[#1D2736] text-center">
              <span className="text-[10px] font-['Outfit'] font-bold text-slate-400 uppercase">
                Victories
              </span>
              <div className="font-['Outfit'] font-black text-xl text-[#10B981] mt-0.5">
                {player.wins}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#0E141E] border border-[#1D2736] text-center">
              <span className="text-[10px] font-['Outfit'] font-bold text-slate-400 uppercase">
                Court Defeats
              </span>
              <div className="font-['Outfit'] font-black text-xl text-slate-400 mt-0.5">
                {player.losses}
              </div>
            </div>
          </div>

          {/* Player's Custom Paddle Showcase */}
          <div className="p-4 rounded-2xl bg-[#0B0E14] border border-[#1E2938] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Paddle
                config={player.paddleConfig}
                playerName={player.name}
                dupr={player.duprRating}
                size="sm"
                isCurrentUser={isCurrentUser}
                interactive={false}
              />
              <div>
                <span className="text-[10px] font-['Outfit'] font-bold text-[#F4E022] uppercase tracking-wider">
                  Equipped Paddle in Rack
                </span>
                <h4 className="font-['Outfit'] font-black text-white text-base">
                  {player.paddleConfig.paddleBrandName}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {player.paddleConfig.faceColorName} • {player.paddleConfig.pattern} face with attached profile image
                </p>
              </div>
            </div>

            {isCurrentUser && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPaddleCustomizer();
                }}
                className="px-4 py-2 rounded-xl bg-[#1F5B73] hover:bg-[#286F8B] text-white font-['Outfit'] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow whitespace-nowrap"
              >
                <Palette className="w-3.5 h-3.5 text-[#F4E022]" />
                Modify Paddle Face
              </button>
            )}
          </div>

          {/* Gamified Quests (If Current User) */}
          {isCurrentUser && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#F4E022]" />
                  <h4 className="font-['Outfit'] font-black text-sm text-white uppercase tracking-wider">
                    Court Quests & Rewards
                  </h4>
                </div>
                <span className="text-xs text-slate-400">Refreshes Daily</span>
              </div>

              <div className="space-y-2.5">
                {quests.map((quest) => (
                  <div
                    key={quest.id}
                    className="p-3 rounded-xl bg-[#0E141E] border border-[#1D2838] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-['Outfit'] font-bold text-xs text-white">
                          {quest.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F4E022]/10 text-[#F4E022] font-semibold">
                          +{quest.xpReward} XP
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{quest.description}</p>
                    </div>

                    {quest.completed ? (
                      <button
                        onClick={() => handleClaim(quest.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-['Outfit'] font-black text-xs cursor-pointer shadow flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Claim
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-slate-500">
                        {quest.current}/{quest.target}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges Cabinet */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-[#E07137]" />
              <h4 className="font-['Outfit'] font-black text-sm text-white uppercase tracking-wider">
                Earned Badges ({player.badges.filter((b) => b.unlocked).length}/{player.badges.length})
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {player.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between ${
                    badge.unlocked
                      ? 'bg-[#0E1520] border-[#2A3B4F]'
                      : 'bg-[#0A0D12] border-[#161D26] opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        badge.unlocked
                          ? 'bg-[#F4E022] text-[#0B0E14]'
                          : 'bg-[#151D28] text-slate-500'
                      }`}
                    >
                      ★
                    </span>
                    <span className="font-['Outfit'] font-bold text-xs text-white leading-tight">
                      {badge.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-snug">
                    {badge.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

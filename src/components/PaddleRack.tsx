import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player } from '../types';
import { Paddle } from './Paddle';
import {
  Plus,
  Trash2,
  Play,
  Users,
  Zap,
  ChevronRight,
  LayoutList,
  SlidersHorizontal,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  Shield,
  X,
} from 'lucide-react';

interface PaddleRackProps {
  rackPlayers: Player[];
  currentUser: Player;
  onAddCurrentUser: () => void;
  onRemoveCurrentUser: () => void;
  onAddSimulatedPlayer: () => void;
  onSelectPlayer: (player: Player) => void;
  onTriggerMatch: () => void;
  onClearRack: () => void;
  isUserInRack: boolean;
  isHost?: boolean;
  onMovePlayerInRack?: (fromIndex: number, toIndex: number) => void;
  onHostRemovePlayer?: (playerId: string) => void;
  onHostPromotePlayer?: (playerId: string) => void;
}

export const PaddleRack: React.FC<PaddleRackProps> = ({
  rackPlayers,
  currentUser,
  onAddCurrentUser,
  onRemoveCurrentUser,
  onAddSimulatedPlayer,
  onSelectPlayer,
  onTriggerMatch,
  onClearRack,
  isUserInRack,
  isHost = false,
  onMovePlayerInRack,
  onHostRemovePlayer,
  onHostPromotePlayer,
}) => {
  const [viewMode, setViewMode] = useState<'rack' | 'lineup'>('rack');

  const totalSlots = Math.max(8, rackPlayers.length + 2);
  const nextUpPlayers = rackPlayers.slice(0, 4);
  const onDeckPlayers = rackPlayers.slice(4);
  const canStartMatch = rackPlayers.length >= 4;

  return (
    <div className="w-full bg-[#121822] rounded-3xl border border-[#222E3E] p-3.5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Background Court Net Grid Pattern watermark */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 20px), repeating-linear-gradient(-45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 20px)`,
        }}
      />

      {/* Rack Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#202B3B]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F4E022] text-[#0B0E14] font-black text-xs font-['Outfit'] flex-shrink-0">
              4s
            </span>
            <h2 className="text-lg sm:text-2xl font-['Outfit'] font-black text-white tracking-tight uppercase truncate">
              Wordcomm Paddle Rack
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#1F5B73] text-[#F4E022] border border-[#2A7594] whitespace-nowrap">
              {rackPlayers.length} Queued
            </span>
            {isHost && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E07137]/20 text-[#E07137] border border-[#E07137]/40 flex items-center gap-1.5 whitespace-nowrap shadow-sm">
                <Shield className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Host Queue Arbitrator</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official club queue. First 4 paddles take the next open court for doubles play.
          </p>
        </div>

        {/* View Mode Toggle & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Mobile View Toggle */}
          <div className="flex items-center p-1 bg-[#0A0E14] rounded-xl border border-[#1E2838] self-start sm:self-auto">
            <button
              onClick={() => setViewMode('rack')}
              className={`px-3 py-1.5 rounded-lg text-xs font-['Outfit'] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                viewMode === 'rack'
                  ? 'bg-[#1F5B73] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Rack Rail</span>
            </button>
            <button
              onClick={() => setViewMode('lineup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-['Outfit'] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                viewMode === 'lineup'
                  ? 'bg-[#1F5B73] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Lineup</span>
            </button>
          </div>

          {/* Action Controls */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            {!isUserInRack ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAddCurrentUser}
                className="col-span-1 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#F4E022] to-[#E5CF15] text-[#0B0E14] font-['Outfit'] font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-[#F4E022]/20 flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-105 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Drop Paddle</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRemoveCurrentUser}
                className="col-span-1 px-3 py-2 rounded-xl bg-[#202B3B] hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-[#2F3E54] hover:border-rose-700/50 font-['Outfit'] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Pull Paddle</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddSimulatedPlayer}
              className="col-span-1 px-3 py-2 rounded-xl bg-[#1A2330] hover:bg-[#222D3E] text-slate-200 border border-[#273446] font-['Outfit'] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              title="Invite club player to queue"
            >
              <Users className="w-3.5 h-3.5 text-[#F4E022]" />
              <span>+ Member</span>
            </motion.button>

            {canStartMatch && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onTriggerMatch}
                className="col-span-2 sm:col-span-1 px-3.5 py-2 rounded-xl bg-[#E07137] hover:bg-[#EB7B41] text-white font-['Outfit'] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-[#E07137]/30 cursor-pointer animate-pulse whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Call Next Match</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Next 4 Up Spotlight Banner (if 4+ players queued) */}
      {canStartMatch && (
        <div className="relative z-10 mt-3 p-3 bg-gradient-to-r from-[#182838] via-[#1A2536] to-[#121822] rounded-2xl border border-[#2A6178] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F4E022] text-[#0B0E14] flex-shrink-0">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="font-['Outfit'] font-black text-xs sm:text-sm text-white flex items-center gap-1.5">
                <span>NEXT 4 UP: READY FOR COURT</span>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping flex-shrink-0" />
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                {nextUpPlayers.map((p) => p.name.split(' ')[0]).join(' • ')}
              </div>
            </div>
          </div>
          <button
            onClick={onTriggerMatch}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[#F4E022] text-[#0B0E14] font-['Outfit'] font-black text-xs flex items-center justify-center gap-1.5 hover:brightness-110 cursor-pointer shadow flex-shrink-0"
          >
            <span>Assign Court Now</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* VIEW MODE 1: PHYSICAL PADDLE RACK RAIL */}
      {viewMode === 'rack' && (
        <div className="relative z-10 mt-4">
          {/* Priority Deck Status Callout on Mobile & Desktop */}
          {rackPlayers.length > 0 && (
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4E022]/15 border border-[#F4E022]/40 text-[#F4E022] font-['Outfit'] font-black text-[10px] tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F4E022] animate-pulse" />
                  Priority Deck • Slots 1–4 Court Ready
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 sm:hidden">
                Swipe queue →
              </span>
            </div>
          )}

          {/* Real-life Rack Top Wood / Metal Bar (Responsive & Non-wrapping) */}
          <div className="relative min-h-[34px] py-1.5 bg-gradient-to-b from-[#324258] via-[#212C3C] to-[#161D27] rounded-xl border border-[#445873] shadow-md flex items-center justify-between px-3 sm:px-4 gap-2 overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#E07137] shadow flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-['Outfit'] font-black tracking-wider text-slate-200 uppercase truncate">
                <span className="sm:hidden">RACK RAIL • WORDCOMM</span>
                <span className="hidden sm:inline">PADDLE SADDLE RACK RAIL • WORDCOMM CLUB</span>
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-[#F4E022] bg-[#0A0D12]/80 px-2 py-0.5 rounded border border-white/10 whitespace-nowrap flex-shrink-0">
              SLOTS 1 - {totalSlots}
            </span>
          </div>

          {/* The Rack Slots & Paddles Scrollable Container */}
          <div className="relative mt-2 pb-3 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x">
            {/* Paddle Grid / Flex Row with safe padding */}
            <div className="flex items-end gap-3 sm:gap-4 pt-4 pb-2 px-2 min-w-max">
              <AnimatePresence mode="popLayout">
                {rackPlayers.map((player, index) => {
                  const slotNum = index + 1;
                  const isNext4 = slotNum <= 4;
                  const isUser = player.id === currentUser.id;

                  return (
                    <motion.div
                      key={player.id}
                      layout
                      initial={{ opacity: 0, y: -40, scale: 0.8, rotate: -5 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotate: 0,
                        transition: { type: 'spring', stiffness: 350, damping: 25 },
                      }}
                      exit={{ opacity: 0, y: -60, scale: 0.6, transition: { duration: 0.25 } }}
                      className="relative flex flex-col items-center"
                    >
                      {/* Paddle Component with attached profile image */}
                      <Paddle
                        config={player.paddleConfig}
                        playerName={player.name}
                        dupr={player.duprRating}
                        size="md"
                        isCurrentUser={isUser}
                        isHighlighted={isNext4}
                        slotNumber={slotNum}
                        onClick={() => onSelectPlayer(player)}
                      />

                      {/* Slot Base Cradle / Clip with Court-Ready highlight */}
                      <div
                        className={`w-18 h-5 -mt-1 rounded-b-lg border-x border-b flex items-center justify-center shadow-inner transition-colors ${
                          isNext4
                            ? 'bg-gradient-to-b from-[#1C2838] to-[#121A26] border-[#F4E022]/40 text-[#F4E022]'
                            : 'bg-gradient-to-b from-[#1C2533] to-[#121822] border-[#2C3B4E] text-slate-400'
                        }`}
                      >
                        <span className="text-[9px] font-['Outfit'] font-bold">
                          Slot {slotNum}
                        </span>
                      </div>

                      {/* Host Mini-Controls if isHost is true */}
                      {isHost && (
                        <div
                          className="mt-2 flex items-center gap-1 bg-[#0D131C] p-1 rounded-lg border border-[#233346] shadow-md z-20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Move Left */}
                          <button
                            type="button"
                            title="Move Left in Queue"
                            disabled={index === 0}
                            onClick={() => onMovePlayerInRack?.(index, index - 1)}
                            className={`p-1 rounded text-xs transition-colors ${
                              index === 0
                                ? 'text-slate-600 cursor-not-allowed opacity-40'
                                : 'text-slate-300 hover:text-white hover:bg-[#1E2B3D] cursor-pointer'
                            }`}
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>

                          {/* Promote to Priority Slot 1 */}
                          <button
                            type="button"
                            title="Promote to Slot #1 (Priority Deck)"
                            disabled={index === 0}
                            onClick={() => onHostPromotePlayer?.(player.id)}
                            className={`p-1 rounded text-xs transition-colors ${
                              index === 0
                                ? 'text-slate-600 cursor-not-allowed opacity-40'
                                : 'text-[#F4E022] hover:bg-[#F4E022]/20 cursor-pointer'
                            }`}
                          >
                            <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                          </button>

                          {/* Move Right */}
                          <button
                            type="button"
                            title="Move Right in Queue"
                            disabled={index === rackPlayers.length - 1}
                            onClick={() => onMovePlayerInRack?.(index, index + 1)}
                            className={`p-1 rounded text-xs transition-colors ${
                              index === rackPlayers.length - 1
                                ? 'text-slate-600 cursor-not-allowed opacity-40'
                                : 'text-slate-300 hover:text-white hover:bg-[#1E2B3D] cursor-pointer'
                            }`}
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          {/* Remove from Rack */}
                          <button
                            type="button"
                            title="Host Eject from Queue"
                            onClick={() => onHostRemovePlayer?.(player.id)}
                            className="p-1 rounded text-xs text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 cursor-pointer transition-colors"
                          >
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Empty Slots to illustrate realistic open rack capacity */}
              {Array.from({ length: Math.max(2, 6 - rackPlayers.length) }).map((_, idx) => {
                const emptySlotNumber = rackPlayers.length + idx + 1;
                return (
                  <div
                    key={`empty-${emptySlotNumber}`}
                    className="flex flex-col items-center justify-end h-[190px] w-20 sm:w-22"
                  >
                    <button
                      onClick={onAddCurrentUser}
                      disabled={isUserInRack}
                      className={`w-16 h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition-all ${
                        !isUserInRack
                          ? 'border-[#334255] hover:border-[#F4E022] hover:bg-[#F4E022]/5 text-slate-400 hover:text-[#F4E022] cursor-pointer'
                          : 'border-[#1E2836] text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <span className="font-['Outfit'] font-bold text-xs text-slate-500">
                        #{emptySlotNumber}
                      </span>
                      {!isUserInRack ? (
                        <>
                          <Plus className="w-4 h-4 my-1" />
                          <span className="text-[9px] font-semibold leading-tight">Drop Paddle</span>
                        </>
                      ) : (
                        <span className="text-[9px] text-slate-600 mt-2">Open Slot</span>
                      )}
                    </button>

                    <div className="w-16 h-5 mt-1 bg-[#141B24] rounded-b-lg border-x border-b border-[#202B3B] flex items-center justify-center">
                      <span className="text-[8px] font-mono text-slate-600">Empty</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: MOBILE-OPTIMIZED LINEUP BREAKDOWN */}
      {viewMode === 'lineup' && (
        <div className="relative z-10 mt-4 space-y-4">
          {/* Next 4 Up: Doubles Match Preview */}
          <div className="p-4 rounded-2xl bg-[#0F151F] border border-[#233346]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1A2534]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#F4E022] text-[#0B0E14] font-['Outfit'] font-black text-[10px] uppercase">
                  Court Ready
                </span>
                <span className="font-['Outfit'] font-bold text-sm text-white">
                  Next Up (Slots 1–4)
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {nextUpPlayers.length}/4 Players
              </span>
            </div>

            {nextUpPlayers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Team Alpha (Slots 1 & 2) */}
                <div className="p-3 rounded-xl bg-[#141C28] border border-[#202D3E]">
                  <div className="text-[10px] font-['Outfit'] font-bold text-[#F4E022] uppercase tracking-wider mb-2">
                    Team Alpha (Slots 1 & 2)
                  </div>
                  <div className="space-y-2">
                    {nextUpPlayers.slice(0, 2).map((p, i) => {
                      const globalIndex = rackPlayers.findIndex((item) => item.id === p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => onSelectPlayer(p)}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#0E131C] border border-[#1A2330] hover:border-[#F4E022]/40 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-[#F4E022] text-[#0B0E14] font-black text-[10px] flex items-center justify-center font-['Outfit'] flex-shrink-0">
                              #{i + 1}
                            </span>
                            <img
                              src={p.avatarUrl}
                              alt={p.name}
                              className="w-7 h-7 rounded-full object-cover border border-[#F4E022]/50 flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-['Outfit'] font-bold text-xs text-white truncate">
                              {p.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] font-mono font-bold text-[#F4E022] bg-black/40 px-1.5 py-0.5 rounded">
                              {p.duprRating.toFixed(2)}
                            </span>
                            {isHost && (
                              <div
                                className="flex items-center gap-1 pl-1 border-l border-[#202D3E]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {globalIndex > 0 && (
                                  <button
                                    type="button"
                                    title="Promote to Slot #1"
                                    onClick={() => onHostPromotePlayer?.(p.id)}
                                    className="p-1 rounded bg-[#1A2433] hover:bg-[#F4E022]/20 text-[#F4E022] cursor-pointer transition-colors"
                                  >
                                    <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                                  </button>
                                )}
                                {globalIndex > 0 && (
                                  <button
                                    type="button"
                                    title="Move Left in Queue"
                                    onClick={() => onMovePlayerInRack?.(globalIndex, globalIndex - 1)}
                                    className="p-1 rounded bg-[#1A2433] hover:bg-[#2A3B4E] text-slate-300 cursor-pointer transition-colors"
                                  >
                                    <ArrowLeft className="w-3 h-3" />
                                  </button>
                                )}
                                {globalIndex < rackPlayers.length - 1 && (
                                  <button
                                    type="button"
                                    title="Move Right in Queue"
                                    onClick={() => onMovePlayerInRack?.(globalIndex, globalIndex + 1)}
                                    className="p-1 rounded bg-[#1A2433] hover:bg-[#2A3B4E] text-slate-300 cursor-pointer transition-colors"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  title="Host Eject from Queue"
                                  onClick={() => onHostRemovePlayer?.(p.id)}
                                  className="p-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 cursor-pointer transition-colors"
                                >
                                  <X className="w-3 h-3 stroke-[2.5]" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {nextUpPlayers.length < 2 && (
                      <div className="p-2 rounded-lg border border-dashed border-slate-700 text-center text-xs text-slate-500">
                        Waiting for Slot #2...
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Bravo (Slots 3 & 4) */}
                <div className="p-3 rounded-xl bg-[#141C28] border border-[#202D3E]">
                  <div className="text-[10px] font-['Outfit'] font-bold text-[#E07137] uppercase tracking-wider mb-2">
                    Team Bravo (Slots 3 & 4)
                  </div>
                  <div className="space-y-2">
                    {nextUpPlayers.slice(2, 4).map((p, i) => {
                      const globalIndex = rackPlayers.findIndex((item) => item.id === p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => onSelectPlayer(p)}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#0E131C] border border-[#1A2330] hover:border-[#E07137]/40 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-[#E07137] text-white font-black text-[10px] flex items-center justify-center font-['Outfit'] flex-shrink-0">
                              #{i + 3}
                            </span>
                            <img
                              src={p.avatarUrl}
                              alt={p.name}
                              className="w-7 h-7 rounded-full object-cover border border-[#E07137]/50 flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-['Outfit'] font-bold text-xs text-white truncate">
                              {p.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] font-mono font-bold text-[#F4E022] bg-black/40 px-1.5 py-0.5 rounded">
                              {p.duprRating.toFixed(2)}
                            </span>
                            {isHost && (
                              <div
                                className="flex items-center gap-1 pl-1 border-l border-[#202D3E]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {globalIndex > 0 && (
                                  <button
                                    type="button"
                                    title="Promote to Slot #1"
                                    onClick={() => onHostPromotePlayer?.(p.id)}
                                    className="p-1 rounded bg-[#1A2433] hover:bg-[#F4E022]/20 text-[#F4E022] cursor-pointer transition-colors"
                                  >
                                    <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                                  </button>
                                )}
                                {globalIndex > 0 && (
                                  <button
                                    type="button"
                                    title="Move Left in Queue"
                                    onClick={() => onMovePlayerInRack?.(globalIndex, globalIndex - 1)}
                                    className="p-1 rounded bg-[#1A2433] hover:bg-[#2A3B4E] text-slate-300 cursor-pointer transition-colors"
                                  >
                                    <ArrowLeft className="w-3 h-3" />
                                  </button>
                                )}
                                {globalIndex < rackPlayers.length - 1 && (
                                  <button
                                    type="button"
                                    title="Move Right in Queue"
                                    onClick={() => onMovePlayerInRack?.(globalIndex, globalIndex + 1)}
                                    className="p-1 rounded bg-[#1A2433] hover:bg-[#2A3B4E] text-slate-300 cursor-pointer transition-colors"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  title="Host Eject from Queue"
                                  onClick={() => onHostRemovePlayer?.(p.id)}
                                  className="p-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 cursor-pointer transition-colors"
                                >
                                  <X className="w-3 h-3 stroke-[2.5]" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {nextUpPlayers.length < 4 && (
                      <div className="p-2 rounded-lg border border-dashed border-slate-700 text-center text-xs text-slate-500">
                        Waiting for {4 - nextUpPlayers.length} more players...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No players queued yet. Drop a paddle to start!
              </div>
            )}
          </div>

          {/* On Deck (Slots 5+) */}
          {onDeckPlayers.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#0F151F] border border-[#233346]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1A2534]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#1F5B73] text-[#F4E022] font-['Outfit'] font-black text-[10px] uppercase">
                    On Deck
                  </span>
                  <span className="font-['Outfit'] font-bold text-sm text-white">
                    Next in Rotation
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {onDeckPlayers.length} Waiting
                </span>
              </div>

              <div className="space-y-2">
                {onDeckPlayers.map((p, idx) => {
                  const globalIndex = rackPlayers.findIndex((item) => item.id === p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectPlayer(p)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#141C28] border border-[#1E2838] hover:border-slate-600 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-[#1D2736] text-slate-300 font-mono text-xs flex items-center justify-center font-bold flex-shrink-0">
                          #{idx + 5}
                        </span>
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#2A3B4E] flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="font-['Outfit'] font-bold text-xs text-white truncate">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {p.skillTier} • ~{(idx + 1) * 12}m wait
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-mono font-bold text-[#F4E022]">
                          DUPR {p.duprRating.toFixed(2)}
                        </span>
                        {isHost && (
                          <div
                            className="flex items-center gap-1 pl-1 border-l border-[#202D3E]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              title="Promote to Slot #1 (Priority Deck)"
                              onClick={() => onHostPromotePlayer?.(p.id)}
                              className="px-2 py-1 rounded bg-[#1D2B3A] hover:bg-[#F4E022]/20 text-[#F4E022] border border-[#2B3E54] flex items-center gap-1 text-[10px] font-['Outfit'] font-bold transition-colors cursor-pointer"
                            >
                              <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                              <span className="hidden sm:inline">Slot #1</span>
                            </button>
                            {globalIndex > 0 && (
                              <button
                                type="button"
                                title="Move Left in Queue"
                                onClick={() => onMovePlayerInRack?.(globalIndex, globalIndex - 1)}
                                className="p-1 rounded bg-[#141F2D] hover:bg-[#233346] text-slate-300 border border-[#233346] transition-colors cursor-pointer"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {globalIndex < rackPlayers.length - 1 && (
                              <button
                                type="button"
                                title="Move Right in Queue"
                                onClick={() => onMovePlayerInRack?.(globalIndex, globalIndex + 1)}
                                className="p-1 rounded bg-[#141F2D] hover:bg-[#233346] text-slate-300 border border-[#233346] transition-colors cursor-pointer"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              type="button"
                              title="Host Eject from Queue"
                              onClick={() => onHostRemovePlayer?.(p.id)}
                              className="p-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition-colors cursor-pointer"
                            >
                              <X className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rack Footer / Legend */}
      <div className="mt-4 pt-3 border-t border-[#1C2534] flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F4E022]" />
            <span className="text-[11px] text-slate-300">Slots 1-4 Priority Call</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F5B73] border border-[#F4E022]" />
            <span className="text-[11px] text-slate-300">Your Paddle</span>
          </div>
        </div>
        {rackPlayers.length > 0 && (
          <button
            onClick={onClearRack}
            className="text-[11px] text-slate-500 hover:text-rose-400 cursor-pointer transition-colors"
          >
            Reset Queue
          </button>
        )}
      </div>
    </div>
  );
};

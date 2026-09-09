import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Court, Player } from '../types';
import {
  overrideCourtScore,
  setCourtGamePoint,
  swapCourtPlayer,
  forceEndCourtMatch,
} from '../utils/courtOperations';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import {
  Shield,
  X,
  Trophy,
  Users,
  Check,
  Plus,
  Minus,
  Zap,
  ArrowLeftRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export interface HostCourtModalProps {
  court: Court;
  availableBenchPlayers?: Player[];
  onSave: (updatedCourt: Court) => void;
  onClose: () => void;
}

export const HostCourtModal: React.FC<HostCourtModalProps> = ({
  court,
  availableBenchPlayers = [],
  onSave,
  onClose,
}) => {
  useBodyScrollLock(true);

  const [editingCourt, setEditingCourt] = useState<Court>(court);

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

  // Adjust Score
  const handleScoreChange = (team: 'A' | 'B', delta: number) => {
    const newScoreA = team === 'A' ? editingCourt.scoreA + delta : editingCourt.scoreA;
    const newScoreB = team === 'B' ? editingCourt.scoreB + delta : editingCourt.scoreB;
    setEditingCourt((prev) => overrideCourtScore(prev, newScoreA, newScoreB));
  };

  const handleScoreInput = (team: 'A' | 'B', value: string) => {
    const parsed = parseInt(value, 10);
    const scoreVal = isNaN(parsed) ? 0 : Math.max(0, parsed);
    if (team === 'A') {
      setEditingCourt((prev) => overrideCourtScore(prev, scoreVal, prev.scoreB));
    } else {
      setEditingCourt((prev) => overrideCourtScore(prev, prev.scoreA, scoreVal));
    }
  };

  // Set Game Point
  const handleGamePointSelect = (pts: number) => {
    setEditingCourt((prev) => setCourtGamePoint(prev, pts));
  };

  // Quick Declare Winner
  const handleDeclareWinner = (winner: 'A' | 'B') => {
    setEditingCourt((prev) => forceEndCourtMatch(prev, winner));
  };

  // Substitute Player
  const handleSubstitute = (oldPlayerId: string, newPlayerId: string) => {
    if (!newPlayerId) return;
    const replacement = availableBenchPlayers.find((p) => p.id === newPlayerId);
    if (replacement) {
      setEditingCourt((prev) => swapCourtPlayer(prev, oldPlayerId, replacement));
    }
  };

  const handleSave = () => {
    onSave(editingCourt);
    onClose();
  };

  // List of candidate bench players excluding players already on the court
  const currentCourtPlayerIds = new Set([
    ...editingCourt.teamA.map((p) => p.id),
    ...editingCourt.teamB.map((p) => p.id),
  ]);

  const candidateBenchPlayers = availableBenchPlayers.filter(
    (p) => !currentCourtPlayerIds.has(p.id)
  );

  return (
    <div
      id="host-court-modal-backdrop"
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
        className="w-full max-w-2xl bg-[#121822] rounded-3xl border-2 border-[#243447] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-[#182636] via-[#1F3347] to-[#121822] border-b border-[#233346] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E07137]/20 border border-[#E07137]/50 flex items-center justify-center text-[#E07137] shadow-inner">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-['Outfit'] font-black text-white tracking-tight uppercase">
                  Host Court Arbitrator
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#E07137]/20 border border-[#E07137]/40 text-[#E07137] text-[10px] font-['Outfit'] font-bold uppercase">
                  Host Controls
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                <span className="font-semibold text-white">{editingCourt.name}</span>
                <span>•</span>
                <span className="text-slate-400">{editingCourt.type}</span>
                <span>•</span>
                <span
                  className={`capitalize font-medium ${
                    editingCourt.status === 'in-progress'
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {editingCourt.status}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1A2330] hover:bg-[#253245] text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {/* Section 1: Score Management & Override */}
          <div className="p-4 rounded-2xl bg-[#0B0E14] border border-[#1E2938] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A2332]">
              <span className="font-['Outfit'] font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#F4E022] fill-current" />
                Score Override & Live Adjustments
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Target: {editingCourt.gamePoint} Pts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Team Alpha Score Card */}
              <div className="p-3.5 rounded-xl bg-[#142333] border border-[#1E3752] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-['Outfit'] font-black text-xs text-[#F4E022] uppercase">
                    Team Alpha
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {editingCourt.teamA.length} Players
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleScoreChange('A', -1)}
                    disabled={editingCourt.scoreA <= 0}
                    className="w-9 h-9 rounded-xl bg-[#0E1722] hover:bg-[#182638] disabled:opacity-40 text-white font-bold flex items-center justify-center border border-[#233549] cursor-pointer transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="number"
                    min="0"
                    value={editingCourt.scoreA}
                    onChange={(e) => handleScoreInput('A', e.target.value)}
                    className="w-16 h-12 text-center text-2xl font-['Outfit'] font-black text-white bg-[#0B0E14] border-2 border-[#1F5B73] rounded-xl focus:outline-none focus:border-[#F4E022]"
                  />

                  <button
                    type="button"
                    onClick={() => handleScoreChange('A', 1)}
                    className="w-9 h-9 rounded-xl bg-[#F4E022] hover:bg-[#E5CF15] text-[#0B0E14] font-bold flex items-center justify-center shadow cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              {/* Team Bravo Score Card */}
              <div className="p-3.5 rounded-xl bg-[#182330] border border-[#233549] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-['Outfit'] font-black text-xs text-[#E07137] uppercase">
                    Team Bravo
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {editingCourt.teamB.length} Players
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleScoreChange('B', -1)}
                    disabled={editingCourt.scoreB <= 0}
                    className="w-9 h-9 rounded-xl bg-[#0E1722] hover:bg-[#182638] disabled:opacity-40 text-white font-bold flex items-center justify-center border border-[#233549] cursor-pointer transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="number"
                    min="0"
                    value={editingCourt.scoreB}
                    onChange={(e) => handleScoreInput('B', e.target.value)}
                    className="w-16 h-12 text-center text-2xl font-['Outfit'] font-black text-white bg-[#0B0E14] border-2 border-[#E07137] rounded-xl focus:outline-none focus:border-[#F4E022]"
                  />

                  <button
                    type="button"
                    onClick={() => handleScoreChange('B', 1)}
                    className="w-9 h-9 rounded-xl bg-[#E07137] hover:bg-[#D46025] text-white font-bold flex items-center justify-center shadow cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Game Point & Quick Result Arbitration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Game Point Selector */}
            <div className="p-4 rounded-2xl bg-[#0B0E14] border border-[#1E2938] space-y-2.5">
              <span className="text-[11px] font-['Outfit'] font-bold text-slate-400 uppercase tracking-wider block">
                Target Game Point
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[11, 15, 21].map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => handleGamePointSelect(pts)}
                    className={`py-2 px-2.5 rounded-xl font-['Outfit'] font-black text-xs flex flex-col items-center justify-center cursor-pointer transition-all ${
                      editingCourt.gamePoint === pts
                        ? 'bg-[#1F5B73] text-[#F4E022] border border-[#3A89AA] shadow-md'
                        : 'bg-[#151D28] text-slate-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <span className="text-sm">{pts} Pts</span>
                    <span className="text-[9px] font-sans opacity-70">
                      {pts === 11 ? 'Standard' : pts === 15 ? 'Extended' : 'Long Set'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Declare Winner */}
            <div className="p-4 rounded-2xl bg-[#0B0E14] border border-[#1E2938] space-y-2.5">
              <span className="text-[11px] font-['Outfit'] font-bold text-slate-400 uppercase tracking-wider block">
                Force Declare Winner
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDeclareWinner('A')}
                  className="py-2.5 px-3 rounded-xl bg-[#F4E022]/15 hover:bg-[#F4E022]/25 text-[#F4E022] border border-[#F4E022]/40 font-['Outfit'] font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Alpha Won
                </button>
                <button
                  type="button"
                  onClick={() => handleDeclareWinner('B')}
                  className="py-2.5 px-3 rounded-xl bg-[#E07137]/15 hover:bg-[#E07137]/25 text-[#E07137] border border-[#E07137]/40 font-['Outfit'] font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Bravo Won
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Player Substitutions */}
          <div className="p-4 rounded-2xl bg-[#0B0E14] border border-[#1E2938] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A2332]">
              <span className="font-['Outfit'] font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#E07137]" />
                Player Substitutions & Lineup Management
              </span>
              <span className="text-[11px] text-slate-400">
                {candidateBenchPlayers.length} Bench Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Team Alpha Lineup & Subs */}
              <div className="space-y-2">
                <span className="text-[11px] font-['Outfit'] font-bold text-[#F4E022] uppercase tracking-wider">
                  Team Alpha Lineup
                </span>
                {editingCourt.teamA.length > 0 ? (
                  editingCourt.teamA.map((player) => (
                    <div
                      key={player.id}
                      className="p-2.5 rounded-xl bg-[#141F2D] border border-[#1E2D3E] flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={player.avatarUrl}
                            alt={player.name}
                            className="w-7 h-7 rounded-lg object-cover border border-[#F4E022]/40 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="font-['Outfit'] font-bold text-xs text-white truncate">
                              {player.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              DUPR {player.duprRating.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {candidateBenchPlayers.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 border-t border-[#1C2838]">
                          <ArrowLeftRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <select
                            onChange={(e) => handleSubstitute(player.id, e.target.value)}
                            defaultValue=""
                            className="w-full bg-[#0B0E14] border border-[#233346] rounded-lg px-2 py-1 text-[11px] text-slate-300 font-['Outfit'] focus:outline-none focus:border-[#F4E022]"
                          >
                            <option value="" disabled>
                              Swap with Bench Member...
                            </option>
                            {candidateBenchPlayers.map((bench) => (
                              <option key={bench.id} value={bench.id}>
                                {bench.name} (DUPR {bench.duprRating.toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-3 text-center">
                    No players currently on Team Alpha
                  </div>
                )}
              </div>

              {/* Team Bravo Lineup & Subs */}
              <div className="space-y-2">
                <span className="text-[11px] font-['Outfit'] font-bold text-[#E07137] uppercase tracking-wider">
                  Team Bravo Lineup
                </span>
                {editingCourt.teamB.length > 0 ? (
                  editingCourt.teamB.map((player) => (
                    <div
                      key={player.id}
                      className="p-2.5 rounded-xl bg-[#141F2D] border border-[#1E2D3E] flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={player.avatarUrl}
                            alt={player.name}
                            className="w-7 h-7 rounded-lg object-cover border border-[#E07137]/40 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="font-['Outfit'] font-bold text-xs text-white truncate">
                              {player.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              DUPR {player.duprRating.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {candidateBenchPlayers.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 border-t border-[#1C2838]">
                          <ArrowLeftRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <select
                            onChange={(e) => handleSubstitute(player.id, e.target.value)}
                            defaultValue=""
                            className="w-full bg-[#0B0E14] border border-[#233346] rounded-lg px-2 py-1 text-[11px] text-slate-300 font-['Outfit'] focus:outline-none focus:border-[#E07137]"
                          >
                            <option value="" disabled>
                              Swap with Bench Member...
                            </option>
                            {candidateBenchPlayers.map((bench) => (
                              <option key={bench.id} value={bench.id}>
                                {bench.name} (DUPR {bench.duprRating.toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-3 text-center">
                    No players currently on Team Bravo
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#0D121A] border-t border-[#1E2938] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#1A2330] hover:bg-[#253245] text-slate-300 font-['Outfit'] font-bold text-xs cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#1F5B73] hover:bg-[#276F8D] text-white font-['Outfit'] font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Check className="w-4 h-4 text-[#F4E022] stroke-[3]" />
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

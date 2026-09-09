import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Court, Player } from '../types';
import { Paddle } from './Paddle';
import { HostCourtModal } from './HostCourtModal';
import {
  Trophy,
  Clock,
  CheckCircle2,
  RotateCcw,
  Zap,
  Award,
  Shield,
  SlidersHorizontal,
  Minus,
  Plus,
} from 'lucide-react';

export interface CourtsViewProps {
  courts: Court[];
  currentUser: Player;
  onUpdateScore: (courtId: string, team: 'A' | 'B') => void;
  onFinishMatch: (courtId: string) => void;
  onResetCourt: (courtId: string) => void;
  onSelectPlayer: (player: Player) => void;
  isHost?: boolean;
  availableBenchPlayers?: Player[];
  onHostSaveCourt?: (updatedCourt: Court) => void;
}

export const CourtsView: React.FC<CourtsViewProps> = ({
  courts,
  currentUser,
  onUpdateScore,
  onFinishMatch,
  onResetCourt,
  onSelectPlayer,
  isHost = false,
  availableBenchPlayers = [],
  onHostSaveCourt,
}) => {
  const [activeHostModalCourt, setActiveHostModalCourt] = useState<Court | null>(null);

  const handleHostSave = (updatedCourt: Court) => {
    if (onHostSaveCourt) {
      onHostSaveCourt(updatedCourt);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-['Outfit'] font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>Wordcomm Courts</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1F5B73] text-[#F4E022] font-mono font-bold">
                {courts.filter((c) => c.status === 'in-progress').length} Live Matches
              </span>
            </h2>
            {isHost && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E07137]/20 text-[#E07137] border border-[#E07137]/40 flex items-center gap-1.5 whitespace-nowrap shadow-sm">
                <Shield className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Host Arbitration Active</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Interactive digital court boards. Live scoreboard, Kitchen NVZ lines, and paddle positions.
          </p>
        </div>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courts.map((court) => {
          const isLive = court.status === 'in-progress';
          const hasTeams = court.teamA.length > 0 && court.teamB.length > 0;
          const isGameOver =
            (court.scoreA >= court.gamePoint || court.scoreB >= court.gamePoint) &&
            Math.abs(court.scoreA - court.scoreB) >= 2;

          const teamAWon = isGameOver && court.scoreA > court.scoreB;
          const teamBWon = isGameOver && court.scoreB > court.scoreA;

          return (
            <div
              key={court.id}
              className="bg-[#121822] rounded-3xl border border-[#212C3D] p-5 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              {/* Court Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2838]">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isLive ? 'bg-[#10B981] animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  <span className="font-['Outfit'] font-black text-sm text-white tracking-wide uppercase">
                    {court.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0B0E14] text-slate-400 border border-[#202A38]">
                    {court.type}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isHost && (
                    <button
                      onClick={() => setActiveHostModalCourt(court)}
                      className="px-2.5 py-1 rounded-xl bg-[#E07137]/20 hover:bg-[#E07137]/30 text-[#E07137] border border-[#E07137]/40 font-['Outfit'] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      title="Host Court Arbitration Controls"
                    >
                      <Shield className="w-3 h-3 stroke-[2.5]" />
                      <span>Host Arbitrate</span>
                    </button>
                  )}

                  {isLive && (
                    <span className="text-xs font-mono text-[#F4E022] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> LIVE
                    </span>
                  )}
                  {!isLive && (
                    <span className="text-xs font-['Outfit'] font-semibold text-slate-500">
                      Court Idle
                    </span>
                  )}
                </div>
              </div>

              {/* Court Arena Visual Layout (Modeled with real pickleball court proportions!) */}
              <div className="my-4 relative bg-[#0D1824] rounded-2xl border-2 border-[#1E334D] p-3 overflow-hidden shadow-inner">
                {/* Court Net in Center (slanted/divided like Wordcomm logo) */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 z-20 flex flex-col items-center justify-center">
                  <div className="w-1.5 h-full bg-[#FFFFFF] shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                  <span className="absolute top-1 px-1 rounded bg-[#0B0E14] text-[8px] font-['Outfit'] font-black text-white uppercase tracking-wider border border-white/40">
                    NET
                  </span>
                </div>

                {/* Left Side: Team A */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Team A Half Court */}
                  <div className="relative p-2 rounded-xl bg-[#142333]/80 border border-[#1E3752] min-h-[190px] flex flex-col justify-between">
                    {/* Kitchen Line / Non-Volley Zone */}
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-[#E07137]/15 border-l border-dashed border-[#E07137]/40 flex items-center justify-center pointer-events-none">
                      <span className="text-[8px] font-['Outfit'] font-bold text-[#E07137]/70 rotate-90 whitespace-nowrap">
                        KITCHEN
                      </span>
                    </div>

                    <div className="flex items-center justify-between z-10">
                      <span className="font-['Outfit'] font-black text-xs text-[#F4E022] uppercase">
                        Team Alpha {teamAWon && '🏆'}
                      </span>
                      <span className="font-['Outfit'] font-black text-2xl text-white">
                        {court.scoreA}
                      </span>
                    </div>

                    {/* Paddles on Court Team A */}
                    <div className="flex items-center justify-start gap-3 my-auto z-10">
                      {court.teamA.length > 0 ? (
                        court.teamA.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => onSelectPlayer(p)}
                            className="cursor-pointer transition-transform hover:scale-105"
                          >
                            <Paddle
                              config={p.paddleConfig}
                              playerName={p.name}
                              dupr={p.duprRating}
                              size="sm"
                              isCurrentUser={p.id === currentUser.id}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="w-full text-center py-8 text-xs text-slate-500 font-['Outfit']">
                          Empty Court Half
                        </div>
                      )}
                    </div>

                    {isLive && !isGameOver && (
                      <div className="z-10 w-full flex items-center gap-1.5">
                        <button
                          onClick={() => onUpdateScore(court.id, 'A')}
                          className="flex-1 py-1.5 rounded-lg bg-[#F4E022] hover:bg-[#E5CF15] text-[#0B0E14] font-['Outfit'] font-black text-xs uppercase tracking-wider cursor-pointer shadow flex items-center justify-center gap-1"
                        >
                          <Zap className="w-3 h-3 fill-current" /> +1 Alpha
                        </button>
                        {isHost && onHostSaveCourt && (
                          <button
                            type="button"
                            onClick={() => {
                              if (court.scoreA > 0) {
                                onHostSaveCourt({
                                  ...court,
                                  scoreA: court.scoreA - 1,
                                });
                              }
                            }}
                            disabled={court.scoreA <= 0}
                            className="px-2 py-1.5 rounded-lg bg-[#0E1722] hover:bg-[#182638] disabled:opacity-40 text-slate-300 border border-[#233549] text-xs font-bold cursor-pointer transition-colors"
                            title="Host Quick -1 Point Alpha"
                          >
                            -1
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Team B Half Court */}
                  <div className="relative p-2 rounded-xl bg-[#182330]/80 border border-[#233549] min-h-[190px] flex flex-col justify-between">
                    {/* Kitchen Line / Non-Volley Zone */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#E07137]/15 border-r border-dashed border-[#E07137]/40 flex items-center justify-center pointer-events-none">
                      <span className="text-[8px] font-['Outfit'] font-bold text-[#E07137]/70 -rotate-90 whitespace-nowrap">
                        KITCHEN
                      </span>
                    </div>

                    <div className="flex items-center justify-between z-10">
                      <span className="font-['Outfit'] font-black text-2xl text-white">
                        {court.scoreB}
                      </span>
                      <span className="font-['Outfit'] font-black text-xs text-[#E07137] uppercase">
                        {teamBWon && '🏆'} Team Bravo
                      </span>
                    </div>

                    {/* Paddles on Court Team B */}
                    <div className="flex items-center justify-end gap-3 my-auto z-10">
                      {court.teamB.length > 0 ? (
                        court.teamB.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => onSelectPlayer(p)}
                            className="cursor-pointer transition-transform hover:scale-105"
                          >
                            <Paddle
                              config={p.paddleConfig}
                              playerName={p.name}
                              dupr={p.duprRating}
                              size="sm"
                              isCurrentUser={p.id === currentUser.id}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="w-full text-center py-8 text-xs text-slate-500 font-['Outfit']">
                          Empty Court Half
                        </div>
                      )}
                    </div>

                    {isLive && !isGameOver && (
                      <div className="z-10 w-full flex items-center gap-1.5">
                        {isHost && onHostSaveCourt && (
                          <button
                            type="button"
                            onClick={() => {
                              if (court.scoreB > 0) {
                                onHostSaveCourt({
                                  ...court,
                                  scoreB: court.scoreB - 1,
                                });
                              }
                            }}
                            disabled={court.scoreB <= 0}
                            className="px-2 py-1.5 rounded-lg bg-[#0E1722] hover:bg-[#182638] disabled:opacity-40 text-slate-300 border border-[#233549] text-xs font-bold cursor-pointer transition-colors"
                            title="Host Quick -1 Point Bravo"
                          >
                            -1
                          </button>
                        )}
                        <button
                          onClick={() => onUpdateScore(court.id, 'B')}
                          className="flex-1 py-1.5 rounded-lg bg-[#E07137] hover:bg-[#D46025] text-white font-['Outfit'] font-black text-xs uppercase tracking-wider cursor-pointer shadow flex items-center justify-center gap-1"
                        >
                          <Zap className="w-3 h-3 fill-current" /> +1 Bravo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Status & Control Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1C2534]">
                {isGameOver ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#F4E022]" />
                      <span className="font-['Outfit'] font-black text-xs text-white">
                        Match Concluded! {teamAWon ? 'Team Alpha' : 'Team Bravo'} Victorious ({court.scoreA} - {court.scoreB})
                      </span>
                    </div>

                    <button
                      onClick={() => onFinishMatch(court.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-['Outfit'] font-black text-xs uppercase tracking-wider shadow cursor-pointer flex items-center gap-1"
                    >
                      <Award className="w-3 h-3" /> Record & Award XP
                    </button>
                  </div>
                ) : isLive ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] text-slate-400">
                      Rule: Target {court.gamePoint} pts, win by 2
                    </span>
                    <button
                      onClick={() => onResetCourt(court.id)}
                      className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Concede / Reset
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full text-xs text-slate-400">
                    <span>Court is currently open for the next 4 in rack.</span>
                    <span className="text-[10px] text-[#F4E022] font-semibold">Ready for Queue</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Host Arbitrate Modal */}
      {activeHostModalCourt && (
        <HostCourtModal
          court={activeHostModalCourt}
          availableBenchPlayers={availableBenchPlayers}
          onSave={handleHostSave}
          onClose={() => setActiveHostModalCourt(null)}
        />
      )}
    </div>
  );
};

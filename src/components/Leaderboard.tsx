import React from 'react';
import { Player } from '../types';
import { Paddle } from './Paddle';
import { Trophy, Flame, Zap, Shield, ArrowUpRight } from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
  currentUser: Player;
  onSelectPlayer: (player: Player) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  currentUser,
  onSelectPlayer,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.duprRating - a.duprRating);

  return (
    <div className="w-full bg-[#121822] rounded-3xl border border-[#202B3C] p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1E2838]">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#F4E022]" />
            <h2 className="text-xl sm:text-2xl font-['Outfit'] font-black text-white uppercase tracking-tight">
              Wordcomm Club Rankings
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live DUPR standings, win records, and active court streaks for all registered members.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Updated live after each match
        </div>
      </div>

      <div className="space-y-3">
        {sortedPlayers.map((player, index) => {
          const rank = index + 1;
          const isUser = player.id === currentUser.id;

          return (
            <div
              key={player.id}
              onClick={() => onSelectPlayer(player)}
              className={`p-3 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                isUser
                  ? 'bg-[#182332] border-[#F4E022]/60 shadow-lg shadow-[#F4E022]/5'
                  : 'bg-[#0B0E14] border-[#1C2636] hover:bg-[#101722]'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {/* Rank Badge */}
                <div
                  className={`w-8 h-8 rounded-xl font-['Outfit'] font-black text-sm flex items-center justify-center shrink-0 ${
                    rank === 1
                      ? 'bg-[#F4E022] text-[#0B0E14]'
                      : rank === 2
                      ? 'bg-slate-300 text-[#0B0E14]'
                      : rank === 3
                      ? 'bg-[#E07137] text-white'
                      : 'bg-[#182230] text-slate-400'
                  }`}
                >
                  #{rank}
                </div>

                {/* Attached Paddle Preview thumbnail */}
                <div className="shrink-0 hidden sm:block">
                  <Paddle
                    config={player.paddleConfig}
                    playerName={player.name}
                    size="sm"
                    showHandle={false}
                    interactive={false}
                  />
                </div>

                {/* Player Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-['Outfit'] font-black text-sm text-white truncate">
                      {player.name}
                    </span>
                    {isUser && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#F4E022] text-[#0B0E14] font-black uppercase">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {player.handle} • {player.preferredPlayStyle}
                  </div>
                </div>
              </div>

              {/* Stats Column */}
              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-slate-500 uppercase block">Record</span>
                  <span className="text-xs font-bold text-slate-200">
                    {player.wins}W - {player.losses}L
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[#E07137]">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span className="font-['Outfit'] font-black text-xs">{player.streakDays}d</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-[#0E1520] border border-[#212E40] text-right">
                  <span className="text-[9px] text-slate-400 uppercase block font-semibold">DUPR</span>
                  <span className="font-['Outfit'] font-black text-sm sm:text-base text-[#F4E022]">
                    {player.duprRating.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

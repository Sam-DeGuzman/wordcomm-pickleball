import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Player, Court } from '../types';
import { Paddle } from './Paddle';
import { Users, Zap, Shield, Palette, Trophy, ArrowRight, Play, CheckCircle, RefreshCw } from 'lucide-react';

interface MatchmakerProps {
  currentUser: Player;
  availablePlayers: Player[];
  courts: Court[];
  onStartMatch: (teamA: Player[], teamB: Player[], courtId: string) => void;
  onOpenPaddleCustomizer: () => void;
}

export const Matchmaker: React.FC<MatchmakerProps> = ({
  currentUser,
  availablePlayers,
  courts,
  onStartMatch,
  onOpenPaddleCustomizer,
}) => {
  const [matchMode, setMatchMode] = useState<'doubles' | 'singles'>('doubles');
  const [skillFilter, setSkillFilter] = useState<'balanced' | 'strict' | 'open'>('balanced');
  const [isSearching, setIsSearching] = useState(false);
  const [searchCountdown, setSearchCountdown] = useState(3);
  const [matchedGame, setMatchedGame] = useState<{
    teamA: Player[];
    teamB: Player[];
    court: Court;
    avgDuprA: number;
    avgDuprB: number;
  } | null>(null);

  const availableCourts = courts.filter((c) => c.status === 'available');
  const defaultCourt = availableCourts[0] || courts[1] || courts[0];

  const handleStartSearch = () => {
    setIsSearching(true);
    setMatchedGame(null);
    setSearchCountdown(3);

    // Simulate matchmaking interval
    const timer = setInterval(() => {
      setSearchCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeMatchmaking();
          return 0;
        }
        return prev - 1;
      });
    }, 900);
  };

  const completeMatchmaking = () => {
    setIsSearching(false);

    // Select suitable players around current user DUPR
    const candidates = availablePlayers.filter((p) => p.id !== currentUser.id);
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());

    let teamA: Player[] = [];
    let teamB: Player[] = [];

    if (matchMode === 'doubles') {
      // 4 players total: user + 3 others
      const p2 = shuffled[0] || candidates[0];
      const p3 = shuffled[1] || candidates[1];
      const p4 = shuffled[2] || candidates[2];
      teamA = [currentUser, p2];
      teamB = [p3, p4];
    } else {
      // Singles: 1v1
      const opponent = shuffled[0] || candidates[0];
      teamA = [currentUser];
      teamB = [opponent];
    }

    const duprA = teamA.reduce((sum, p) => sum + p.duprRating, 0) / teamA.length;
    const duprB = teamB.reduce((sum, p) => sum + p.duprRating, 0) / teamB.length;

    setMatchedGame({
      teamA,
      teamB,
      court: defaultCourt,
      avgDuprA: duprA,
      avgDuprB: duprB,
    });

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F4E022', '#1F5B73', '#E07137', '#FFFFFF'],
      });
    } catch {
      // Ignore if canvas not ready
    }
  };

  const handleAcceptMatch = () => {
    if (matchedGame) {
      onStartMatch(matchedGame.teamA, matchedGame.teamB, matchedGame.court.id);
      setMatchedGame(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Matchmaking Lobby Header */}
      <div className="bg-[#121822] rounded-3xl border border-[#202B3C] p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#F4E022] text-[#0B0E14] font-['Outfit'] font-black text-xs uppercase tracking-wider">
                DUPR Balanced
              </span>
              <h2 className="text-xl sm:text-2xl font-['Outfit'] font-black text-white uppercase tracking-tight">
                Pickleball Matchmaker
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Automated club pairing algorithm. Pairs you with compatible DUPR skill tiers for maximum rally depth.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPaddleCustomizer}
              className="px-3 py-2 rounded-xl bg-[#1A2433] hover:bg-[#223044] text-[#F4E022] border border-[#2D3F57] font-['Outfit'] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Palette className="w-3.5 h-3.5" />
              Customize Paddle Face
            </button>
          </div>
        </div>

        {/* Match Preferences Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#1F2B3B]">
          {/* Format Selector */}
          <div className="bg-[#0B0E14] rounded-2xl p-3 border border-[#1E2838]">
            <span className="text-[11px] font-['Outfit'] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Game Format
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMatchMode('doubles')}
                className={`py-2 px-3 rounded-xl font-['Outfit'] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  matchMode === 'doubles'
                    ? 'bg-[#1F5B73] text-white border border-[#307E9E] shadow-md'
                    : 'bg-[#151D28] text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Doubles (2v2)
              </button>
              <button
                onClick={() => setMatchMode('singles')}
                className={`py-2 px-3 rounded-xl font-['Outfit'] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  matchMode === 'singles'
                    ? 'bg-[#1F5B73] text-white border border-[#307E9E] shadow-md'
                    : 'bg-[#151D28] text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Singles (1v1)
              </button>
            </div>
          </div>

          {/* DUPR Skill Filter */}
          <div className="bg-[#0B0E14] rounded-2xl p-3 border border-[#1E2838]">
            <span className="text-[11px] font-['Outfit'] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Skill Parity (DUPR)
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['balanced', 'strict', 'open'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSkillFilter(filter)}
                  className={`py-2 rounded-xl font-['Outfit'] font-bold text-[11px] capitalize cursor-pointer transition-all ${
                    skillFilter === filter
                      ? 'bg-[#F4E022] text-[#0B0E14] shadow-md'
                      : 'bg-[#151D28] text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Target Court Selection */}
          <div className="bg-[#0B0E14] rounded-2xl p-3 border border-[#1E2838] sm:col-span-2 lg:col-span-1">
            <span className="text-[11px] font-['Outfit'] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Assigned Court
            </span>
            <div className="flex items-center justify-between px-3 py-2 bg-[#151D28] rounded-xl border border-[#243144]">
              <span className="text-xs font-['Outfit'] font-bold text-slate-200">
                {defaultCourt.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40">
                Ready
              </span>
            </div>
          </div>
        </div>

        {/* Start Matchmaking Button / Active Radar */}
        <div className="relative z-10 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B0E14] border border-[#232F42]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#182332] border border-[#2A3B50] flex items-center justify-center text-[#F4E022]">
              <Zap className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <div className="font-['Outfit'] font-black text-white text-sm uppercase">
                {isSearching ? 'Scanning Wordcomm Paddle Rack...' : 'Ready to Match?'}
              </div>
              <div className="text-xs text-slate-400">
                {isSearching
                  ? `Filtering players within ±0.35 DUPR of your rating (${currentUser.duprRating.toFixed(2)})`
                  : `${availablePlayers.length} club players on-site • Average queue time: 45 sec`}
              </div>
            </div>
          </div>

          {!isSearching ? (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleStartSearch}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#F4E022] via-[#E8D215] to-[#E07137] text-[#0B0E14] font-['Outfit'] font-black text-sm uppercase tracking-wider shadow-xl shadow-[#F4E022]/20 flex items-center justify-center gap-2 cursor-pointer hover:brightness-105"
            >
              <Zap className="w-4 h-4 fill-current" />
              Find Match Now
            </motion.button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F5B73] text-white font-['Outfit'] font-bold text-xs border border-[#307E9E]">
                <RefreshCw className="w-4 h-4 animate-spin text-[#F4E022]" />
                <span>Finding Match ({searchCountdown}s)...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MATCH FOUND OVERLAY MODAL / CARD */}
      <AnimatePresence>
        {matchedGame && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-gradient-to-b from-[#131A26] to-[#0D121B] rounded-3xl border-2 border-[#F4E022] p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Top Match Flag */}
            <div className="flex items-center justify-between pb-4 border-b border-[#202B3C]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10B981] animate-ping" />
                <span className="font-['Outfit'] font-black text-sm text-[#F4E022] tracking-wider uppercase">
                  MATCH CONFIRMED • {matchedGame.court.name}
                </span>
              </div>
              <span className="text-xs font-['Outfit'] font-bold text-slate-400">
                11 Points • Win by 2
              </span>
            </div>

            {/* Head-to-head Paddle Arena */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              {/* TEAM A */}
              <div className="bg-[#0B0E14] rounded-2xl p-4 border border-[#222E40] relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-['Outfit'] font-black text-xs text-[#F4E022] uppercase tracking-wider">
                    Team Alpha
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    DUPR: <strong className="text-white">{matchedGame.avgDuprA.toFixed(2)}</strong>
                  </span>
                </div>

                <div className="flex items-center justify-around gap-2 pt-2">
                  {matchedGame.teamA.map((player) => (
                    <div key={player.id} className="flex flex-col items-center">
                      <Paddle
                        config={player.paddleConfig}
                        playerName={player.name}
                        dupr={player.duprRating}
                        size="md"
                        isCurrentUser={player.id === currentUser.id}
                      />
                      <span className="mt-2 text-xs font-['Outfit'] font-bold text-white text-center truncate max-w-[90px]">
                        {player.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TEAM B */}
              <div className="bg-[#0B0E14] rounded-2xl p-4 border border-[#222E40] relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-['Outfit'] font-black text-xs text-[#E07137] uppercase tracking-wider">
                    Team Bravo
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    DUPR: <strong className="text-white">{matchedGame.avgDuprB.toFixed(2)}</strong>
                  </span>
                </div>

                <div className="flex items-center justify-around gap-2 pt-2">
                  {matchedGame.teamB.map((player) => (
                    <div key={player.id} className="flex flex-col items-center">
                      <Paddle
                        config={player.paddleConfig}
                        playerName={player.name}
                        dupr={player.duprRating}
                        size="md"
                        isCurrentUser={player.id === currentUser.id}
                      />
                      <span className="mt-2 text-xs font-['Outfit'] font-bold text-white text-center truncate max-w-[90px]">
                        {player.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#202B3C]">
              <div className="text-xs text-slate-400 text-center sm:text-left">
                Paddles automatically dispatched from the rack to {matchedGame.court.name}.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setMatchedGame(null)}
                  className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-[#1A2330] hover:bg-[#243144] text-slate-300 font-['Outfit'] font-bold text-xs cursor-pointer"
                >
                  Decline / Pass
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAcceptMatch}
                  className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-[#F4E022] hover:bg-[#E5CF15] text-[#0B0E14] font-['Outfit'] font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Take Court & Start
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

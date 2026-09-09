/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  CURRENT_USER,
  INITIAL_PLAYERS,
  INITIAL_COURTS,
  INITIAL_QUESTS,
} from './data/initialData';
import { Player, Court, PaddleConfig, Quest } from './types';
import { ClubLogo } from './components/ClubLogo';
import { PaddleRack } from './components/PaddleRack';
import { Matchmaker } from './components/Matchmaker';
import { CourtsView } from './components/CourtsView';
import { Leaderboard } from './components/Leaderboard';
import { PaddleCustomizer } from './components/PaddleCustomizer';
import { ProfileModal } from './components/ProfileModal';
import {
  Layers,
  Zap,
  LayoutGrid,
  Trophy,
  Palette,
  Flame,
  User,
  Plus,
  Play,
  CheckCircle2,
  Bell,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Player>(CURRENT_USER);
  const [allPlayers, setAllPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  // Default queue: User + 3 club members are slotted in the rack
  const [rackPlayers, setRackPlayers] = useState<Player[]>([
    CURRENT_USER,
    INITIAL_PLAYERS[1],
    INITIAL_PLAYERS[2],
    INITIAL_PLAYERS[3],
    INITIAL_PLAYERS[4],
  ]);
  const [courts, setCourts] = useState<Court[]>(INITIAL_COURTS);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);

  const [activeTab, setActiveTab] = useState<'rack' | 'matchmaking' | 'courts' | 'leaderboard'>('rack');
  const [inspectPlayer, setInspectPlayer] = useState<Player | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const isUserInRack = rackPlayers.some((p) => p.id === currentUser.id);
  const userRackPosition = rackPlayers.findIndex((p) => p.id === currentUser.id) + 1;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Add current user to paddle rack
  const handleAddCurrentUserToRack = () => {
    if (!isUserInRack) {
      setRackPlayers((prev) => [...prev, currentUser]);
      showToast(`Paddle placed in Rack Slot #${rackPlayers.length + 1}!`);
      try {
        confetti({
          particleCount: 30,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#F4E022', '#E07137'],
        });
      } catch {
        // Ignore
      }
    }
  };

  // Remove current user from paddle rack
  const handleRemoveCurrentUserFromRack = () => {
    setRackPlayers((prev) => prev.filter((p) => p.id !== currentUser.id));
    showToast('Pulled paddle from rack queue.');
  };

  // Add a simulated club player to rack
  const handleAddSimulatedPlayer = () => {
    const existingIds = new Set(rackPlayers.map((p) => p.id));
    const available = allPlayers.filter((p) => !existingIds.has(p.id));

    if (available.length > 0) {
      const nextPlayer = available[0];
      setRackPlayers((prev) => [...prev, nextPlayer]);
      showToast(`${nextPlayer.name} placed paddle in rack!`);
    } else {
      // Create guest player
      const guestNum = rackPlayers.length + 1;
      const guest: Player = {
        id: `guest_${Date.now()}`,
        name: `Guest Member #${guestNum}`,
        handle: `@guest${guestNum}`,
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (guestNum * 123456) % 1000000}?w=200&auto=format&fit=crop&q=80`,
        duprRating: Number((3.4 + Math.random() * 0.8).toFixed(2)),
        skillTier: 'Intermediate',
        level: 8,
        xp: 800,
        xpToNextLevel: 1200,
        streakDays: 2,
        matchesPlayed: 14,
        wins: 8,
        losses: 6,
        badges: [],
        paddleConfig: {
          faceColor: '#1F5B73',
          faceColorName: 'Wordcomm Petrol',
          gripColor: '#E07137',
          edgeGuardColor: '#F4E022',
          pattern: 'honeycomb',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
          paddleBrandName: 'WORDCOMM CLUB',
          surfaceFinish: 'textured-grit',
        },
      };
      setAllPlayers((prev) => [...prev, guest]);
      setRackPlayers((prev) => [...prev, guest]);
      showToast(`${guest.name} joined the paddle rack!`);
    }
  };

  // Call Next Match from rack (dispatches top 4 paddles to available court)
  const handleTriggerMatchFromRack = () => {
    if (rackPlayers.length < 4) {
      showToast('Need at least 4 paddles in the rack to start a doubles match!');
      return;
    }

    const next4 = rackPlayers.slice(0, 4);
    const remaining = rackPlayers.slice(4);

    // Find available court
    const targetCourtIndex = courts.findIndex((c) => c.status === 'available');
    const courtIdx = targetCourtIndex !== -1 ? targetCourtIndex : 1;
    const court = courts[courtIdx];

    const teamA = [next4[0], next4[1]];
    const teamB = [next4[2], next4[3]];

    setCourts((prev) =>
      prev.map((c, i) =>
        i === courtIdx
          ? {
              ...c,
              status: 'in-progress',
              teamA,
              teamB,
              scoreA: 0,
              scoreB: 0,
              timeStarted: Date.now(),
            }
          : c
      )
    );

    setRackPlayers(remaining);
    setActiveTab('courts');
    showToast(`Next 4 paddles assigned to ${court.name}!`);

    try {
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { y: 0.5 },
        colors: ['#F4E022', '#1F5B73', '#E07137', '#FFFFFF'],
      });
    } catch {
      // Ignore
    }
  };

  // Matchmaker starts match
  const handleStartMatchFromMatchmaker = (
    teamA: Player[],
    teamB: Player[],
    courtId: string
  ) => {
    setCourts((prev) =>
      prev.map((c) =>
        c.id === courtId
          ? {
              ...c,
              status: 'in-progress',
              teamA,
              teamB,
              scoreA: 0,
              scoreB: 0,
              timeStarted: Date.now(),
            }
          : c
      )
    );

    // Remove participating players from rack
    const matchedIds = new Set([...teamA, ...teamB].map((p) => p.id));
    setRackPlayers((prev) => prev.filter((p) => !matchedIds.has(p.id)));

    setActiveTab('courts');
    showToast('Match dispatched to court! Game on!');
  };

  // Court point update
  const handleUpdateCourtScore = (courtId: string, team: 'A' | 'B') => {
    setCourts((prev) =>
      prev.map((c) => {
        if (c.id === courtId) {
          const newScoreA = team === 'A' ? c.scoreA + 1 : c.scoreA;
          const newScoreB = team === 'B' ? c.scoreB + 1 : c.scoreB;
          return {
            ...c,
            scoreA: newScoreA,
            scoreB: newScoreB,
          };
        }
        return c;
      })
    );
  };

  // Finish match on court & award XP/DUPR
  const handleFinishMatch = (courtId: string) => {
    const court = courts.find((c) => c.id === courtId);
    if (!court) return;

    const teamAWon = court.scoreA > court.scoreB;
    const isUserPlaying = [...court.teamA, ...court.teamB].some(
      (p) => p.id === currentUser.id
    );
    const userInTeamA = court.teamA.some((p) => p.id === currentUser.id);
    const userWon = (userInTeamA && teamAWon) || (!userInTeamA && !teamAWon);

    if (isUserPlaying) {
      const xpGained = userWon ? 200 : 100;
      const duprDelta = userWon ? 0.04 : -0.02;

      setCurrentUser((prev) => ({
        ...prev,
        xp: prev.xp + xpGained,
        duprRating: Number(Math.max(2.0, prev.duprRating + duprDelta).toFixed(2)),
        matchesPlayed: prev.matchesPlayed + 1,
        wins: userWon ? prev.wins + 1 : prev.wins,
        losses: !userWon ? prev.losses + 1 : prev.losses,
        streakDays: userWon ? prev.streakDays + 1 : prev.streakDays,
      }));

      showToast(
        userWon
          ? `Victory on ${court.name}! +${xpGained} XP & +${duprDelta.toFixed(2)} DUPR!`
          : `Match concluded on ${court.name}! +${xpGained} XP earned.`
      );

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F4E022', '#10B981', '#E07137'],
        });
      } catch {
        // Ignore
      }
    } else {
      showToast(`Match concluded on ${court.name}. Court is now open!`);
    }

    // Reset court to open
    setCourts((prev) =>
      prev.map((c) =>
        c.id === courtId
          ? {
              ...c,
              status: 'available',
              teamA: [],
              teamB: [],
              scoreA: 0,
              scoreB: 0,
            }
          : c
      )
    );
  };

  const handleResetCourt = (courtId: string) => {
    setCourts((prev) =>
      prev.map((c) =>
        c.id === courtId
          ? {
              ...c,
              status: 'available',
              teamA: [],
              teamB: [],
              scoreA: 0,
              scoreB: 0,
            }
          : c
      )
    );
    showToast('Court cleared and ready for new match.');
  };

  // Update paddle config (syncs with user and all rack items)
  const handleSavePaddleConfig = (newConfig: PaddleConfig) => {
    const updatedUser = {
      ...currentUser,
      paddleConfig: newConfig,
      avatarUrl: newConfig.avatarUrl || currentUser.avatarUrl,
    };
    setCurrentUser(updatedUser);

    // Sync in all players list
    setAllPlayers((prev) =>
      prev.map((p) => (p.id === currentUser.id ? updatedUser : p))
    );

    // Sync in paddle rack
    setRackPlayers((prev) =>
      prev.map((p) => (p.id === currentUser.id ? updatedUser : p))
    );

    showToast('Paddle customized! Profile image attached to sweet spot.');
  };

  // Claim Quest XP
  const handleClaimQuest = (questId: string) => {
    const q = quests.find((item) => item.id === questId);
    if (!q) return;

    setCurrentUser((prev) => ({
      ...prev,
      xp: prev.xp + q.xpReward,
    }));

    setQuests((prev) =>
      prev.map((item) =>
        item.id === questId ? { ...item, completed: false, current: item.target } : item
      )
    );

    showToast(`Claimed +${q.xpReward} XP for "${q.title}"!`);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col selection:bg-[#F4E022] selection:text-black">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#1F5B73] border border-[#F4E022] shadow-2xl flex items-center gap-2.5 text-xs font-['Outfit'] font-bold text-white"
          >
            <span className="w-2 h-2 rounded-full bg-[#F4E022] animate-ping" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP NAVIGATION / CLUB HEADER */}
      <header className="sticky top-0 z-40 bg-[#0E131C]/95 backdrop-blur-md border-b border-[#1D2736] px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand matching the image */}
          <div
            onClick={() => setActiveTab('rack')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <ClubLogo size="sm" showText={false} />
            <div className="flex flex-col">
              <span className="font-['Outfit'] font-black tracking-widest text-white text-base sm:text-lg leading-tight group-hover:text-[#F4E022] transition-colors">
                WORDCOMM
              </span>
              <span className="font-['Outfit'] font-extrabold tracking-wider text-[#F4E022] text-[10px] sm:text-xs leading-none">
                PICKLEBALL CLUB
              </span>
            </div>
          </div>

          {/* User Quick Gamification Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Paddle Customizer Quick Action */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsCustomizerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#1A2534] hover:bg-[#233144] border border-[#2D4057] text-[#F4E022] font-['Outfit'] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
              title="Customize Paddle Skin & Profile Avatar"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paddle Studio</span>
            </motion.button>

            {/* User Profile Pill */}
            <div
              onClick={() => setInspectPlayer(currentUser)}
              className="flex items-center gap-2 p-1 sm:pr-3 rounded-2xl bg-[#131A24] border border-[#222E3E] hover:border-[#F4E022]/60 cursor-pointer transition-all"
            >
              <div className="relative">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-xl object-cover border border-[#F4E022]"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#E07137] border border-black flex items-center justify-center text-[7px] font-bold text-white">
                  ★
                </span>
              </div>

              <div className="hidden sm:flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-['Outfit'] font-bold text-xs text-white leading-tight">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#F4E022] text-[#0B0E14] font-black">
                    {currentUser.duprRating.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Flame className="w-3 h-3 text-[#E07137] fill-current" />
                  <span>{currentUser.streakDays}d streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* QUICK STATUS BAR (If queued or courts live) */}
      <div className="bg-[#111722] border-b border-[#1C2534] px-3 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            {isUserInRack ? (
              <span className="flex items-center gap-1.5 text-[#F4E022] font-semibold text-[11px] sm:text-xs">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping flex-shrink-0" />
                You are in Slot #{userRackPosition} on the Paddle Rack
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px] sm:text-xs">
                <span className="w-2 h-2 rounded-full bg-slate-500 flex-shrink-0" />
                Not currently in queue
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {!isUserInRack ? (
              <button
                onClick={handleAddCurrentUserToRack}
                className="font-['Outfit'] font-bold text-[#F4E022] hover:underline flex items-center gap-1 cursor-pointer text-xs"
              >
                <Plus className="w-3 h-3" /> Quick Drop Paddle
              </button>
            ) : (
              <button
                onClick={handleRemoveCurrentUserFromRack}
                className="font-['Outfit'] text-slate-400 hover:text-rose-400 cursor-pointer text-xs"
              >
                Pull Paddle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center justify-start gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-[#121822] rounded-2xl border border-[#212C3D] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('rack')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-['Outfit'] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'rack'
                ? 'bg-[#1F5B73] text-white shadow-lg border border-[#317997]'
                : 'text-slate-400 hover:text-white hover:bg-[#18212E]'
            }`}
          >
            <Layers className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#F4E022]" />
            <span className="sm:hidden">Rack ({rackPlayers.length})</span>
            <span className="hidden sm:inline">Paddle Rack ({rackPlayers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('matchmaking')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-['Outfit'] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'matchmaking'
                ? 'bg-[#1F5B73] text-white shadow-lg border border-[#317997]'
                : 'text-slate-400 hover:text-white hover:bg-[#18212E]'
            }`}
          >
            <Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#F4E022]" />
            <span className="sm:hidden">Matchmaker</span>
            <span className="hidden sm:inline">DUPR Matchmaker</span>
          </button>

          <button
            onClick={() => setActiveTab('courts')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-['Outfit'] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'courts'
                ? 'bg-[#1F5B73] text-white shadow-lg border border-[#317997]'
                : 'text-slate-400 hover:text-white hover:bg-[#18212E]'
            }`}
          >
            <LayoutGrid className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#F4E022]" />
            <span className="sm:hidden">Courts ({courts.filter((c) => c.status === 'in-progress').length})</span>
            <span className="hidden sm:inline">Courts ({courts.filter((c) => c.status === 'in-progress').length} Live)</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-['Outfit'] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'bg-[#1F5B73] text-white shadow-lg border border-[#317997]'
                : 'text-slate-400 hover:text-white hover:bg-[#18212E]'
            }`}
          >
            <Trophy className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#F4E022]" />
            <span className="sm:hidden">Standings</span>
            <span className="hidden sm:inline">Club Standings</span>
          </button>
        </div>
      </div>

      {/* CONTENT BODY */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 flex-1">
        {activeTab === 'rack' && (
          <div className="space-y-6">
            <PaddleRack
              rackPlayers={rackPlayers}
              currentUser={currentUser}
              onAddCurrentUser={handleAddCurrentUserToRack}
              onRemoveCurrentUser={handleRemoveCurrentUserFromRack}
              onAddSimulatedPlayer={handleAddSimulatedPlayer}
              onSelectPlayer={(p) => setInspectPlayer(p)}
              onTriggerMatch={handleTriggerMatchFromRack}
              onClearRack={() => {
                setRackPlayers([]);
                showToast('Paddle queue reset.');
              }}
              isUserInRack={isUserInRack}
            />

            {/* Quick Tips & Real-life Pickleball Rack etiquette banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#121822] border border-[#1E2838]">
                <div className="flex items-center gap-2 mb-1.5 text-[#F4E022]">
                  <Layers className="w-4 h-4" />
                  <h4 className="font-['Outfit'] font-black text-xs uppercase tracking-wider text-white">
                    Physical Paddle Saddle
                  </h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In pickleball open-play tradition, players stack paddles side-by-side. The leftmost 4 paddles step on the next available court.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#121822] border border-[#1E2838]">
                <div className="flex items-center gap-2 mb-1.5 text-[#E07137]">
                  <Palette className="w-4 h-4" />
                  <h4 className="font-['Outfit'] font-black text-xs uppercase tracking-wider text-white">
                    Custom Paddle Faces
                  </h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your profile image is printed on your racket's sweet spot. Change colors, edge guards, and textures in the Paddle Studio.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#121822] border border-[#1E2838]">
                <div className="flex items-center gap-2 mb-1.5 text-[#34D399]">
                  <Trophy className="w-4 h-4" />
                  <h4 className="font-['Outfit'] font-black text-xs uppercase tracking-wider text-white">
                    DUPR Rating Balance
                  </h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every match played updates your official club rating. Strive for balanced doubles games and climb to 4.0 Pro tier!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matchmaking' && (
          <Matchmaker
            currentUser={currentUser}
            availablePlayers={allPlayers}
            courts={courts}
            onStartMatch={handleStartMatchFromMatchmaker}
            onOpenPaddleCustomizer={() => setIsCustomizerOpen(true)}
          />
        )}

        {activeTab === 'courts' && (
          <CourtsView
            courts={courts}
            currentUser={currentUser}
            onUpdateScore={handleUpdateCourtScore}
            onFinishMatch={handleFinishMatch}
            onResetCourt={handleResetCourt}
            onSelectPlayer={(p) => setInspectPlayer(p)}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard
            players={allPlayers}
            currentUser={currentUser}
            onSelectPlayer={(p) => setInspectPlayer(p)}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#1C2534] bg-[#0A0D12] py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F4E022]" />
            <span className="font-['Outfit'] font-bold text-slate-400">
              WORDCOMM PICKLEBALL CLUB • OPEN PLAY MATCHMAKING PROTOTYPE
            </span>
          </div>
          <div>Inspired by Wordcomm branding • USAPA standard 11-point match play</div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Profile / Inspect Modal */}
      {inspectPlayer && (
        <ProfileModal
          player={inspectPlayer}
          isCurrentUser={inspectPlayer.id === currentUser.id}
          quests={quests}
          onClaimQuest={handleClaimQuest}
          onOpenPaddleCustomizer={() => setIsCustomizerOpen(true)}
          onClose={() => setInspectPlayer(null)}
        />
      )}

      {/* 2. Paddle Customizer Studio */}
      {isCustomizerOpen && (
        <PaddleCustomizer
          currentUser={currentUser}
          onSavePaddleConfig={handleSavePaddleConfig}
          onClose={() => setIsCustomizerOpen(false)}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Crown,
  Clock,
  ShieldCheck,
  Eye,
  ArrowLeftRight,
  Radio,
  Calendar,
} from 'lucide-react';
import { PlaySchedule, Player } from '../types';
import { formatScheduleRemainingTime } from '../utils/hostPermissions';

export interface SessionHostBannerProps {
  schedule: PlaySchedule;
  hostPlayer?: Player | null;
  isHost: boolean;
  onToggleHostRole?: () => void;
  className?: string;
}

export const SessionHostBanner: React.FC<SessionHostBannerProps> = ({
  schedule,
  hostPlayer,
  isHost,
  onToggleHostRole,
  className = '',
}) => {
  const [remainingTime, setRemainingTime] = useState<string>(() =>
    formatScheduleRemainingTime(schedule.endTime)
  );

  useEffect(() => {
    // Refresh remaining time periodically
    setRemainingTime(formatScheduleRemainingTime(schedule.endTime));
    const interval = setInterval(() => {
      setRemainingTime(formatScheduleRemainingTime(schedule.endTime));
    }, 10000);

    return () => clearInterval(interval);
  }, [schedule.endTime]);

  const isActive = schedule.status === 'active';
  const hostName = hostPlayer?.name || (hostPlayer?.id === schedule.hostPlayerId ? 'Host Player' : 'Assigned Host');

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full rounded-2xl bg-gradient-to-r from-[#121822] via-[#16202E] to-[#121822] border border-[#212C3D] p-4 sm:p-5 shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Background ambient glow matching Wordcomm brand */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#1F5B73]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-40 h-40 bg-[#E07137]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Schedule Details & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#1F5B73]/30 border border-[#1F5B73] flex items-center justify-center shrink-0 text-[#F4E022] shadow-inner">
            <Calendar className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-['Outfit'] font-black text-base sm:text-lg text-white tracking-wide">
                {schedule.title}
              </h3>

              {/* Status Pill */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-700/40 text-slate-400 border border-slate-600/40'
                }`}
              >
                {isActive && <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />}
                {schedule.status}
              </span>
            </div>

            {/* Time & Duration row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-mono text-[#F4E022] bg-[#0B0E14]/70 px-2 py-0.5 rounded-md border border-[#212C3D]">
                <Clock className="w-3.5 h-3.5 text-[#F4E022]" />
                <span>{remainingTime}</span>
              </div>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-sans">
                {schedule.durationHours}h Block
              </span>
              {schedule.allocatedCourtIds?.length > 0 && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-sans">
                    {schedule.allocatedCourtIds.length} Courts Allocated
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Host Identity, Current Mode & Role Switcher */}
        <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#1E2838]">
          {/* Designated Host Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B0E14] border border-[#212C3D] shadow-inner">
            <Crown className="w-4 h-4 text-[#F4E022]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Designated Host
              </span>
              <span className="text-xs font-bold text-white font-['Outfit']">
                {hostName}
              </span>
            </div>
          </div>

          {/* Mode Indicator Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-['Outfit'] text-xs font-bold transition-colors ${
              isHost
                ? 'bg-[#1F5B73]/30 border-[#1F5B73] text-[#F4E022] shadow-[0_0_12px_rgba(31,91,115,0.4)]'
                : 'bg-[#121822] border-[#2A3B52] text-slate-300'
            }`}
          >
            {isHost ? (
              <>
                <ShieldCheck className="w-4 h-4 text-[#F4E022]" />
                <span>Session Host (Arbitration Active)</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-slate-400" />
                <span>Member View (Read Only)</span>
              </>
            )}
          </div>

          {/* Role Switcher Button */}
          {onToggleHostRole && (
            <button
              onClick={onToggleHostRole}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-['Outfit'] transition-all duration-200 bg-[#E07137]/20 hover:bg-[#E07137]/30 text-[#E07137] border border-[#E07137]/40 hover:border-[#E07137] active:scale-95 cursor-pointer"
              title="Toggle between Host arbitration view and Player view"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{isHost ? 'Simulate Player View' : 'Simulate Host View'}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

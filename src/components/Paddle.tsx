import React from 'react';
import { motion } from 'motion/react';
import { PaddleConfig } from '../types';

interface PaddleProps {
  config: PaddleConfig;
  playerName?: string;
  dupr?: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  isHighlighted?: boolean;
  isCurrentUser?: boolean;
  slotNumber?: number;
  statusBadge?: string;
  onClick?: () => void;
  className?: string;
  showHandle?: boolean;
  interactive?: boolean;
}

export const Paddle: React.FC<PaddleProps> = ({
  config,
  playerName = 'Player',
  dupr,
  size = 'md',
  isHighlighted = false,
  isCurrentUser = false,
  slotNumber,
  statusBadge,
  onClick,
  className = '',
  showHandle = true,
  interactive = true,
}) => {
  // Dimensions per size preset
  const dimensions = {
    sm: {
      faceWidth: 64,
      faceHeight: 84,
      handleWidth: 16,
      handleHeight: 46,
      avatarSize: 34,
      fontSize: 'text-[9px]',
      duprSize: 'text-[8px]',
      radius: 'rounded-xl',
      borderW: 'border-2',
    },
    md: {
      faceWidth: 84,
      faceHeight: 110,
      handleWidth: 20,
      handleHeight: 58,
      avatarSize: 44,
      fontSize: 'text-[11px]',
      duprSize: 'text-[10px]',
      radius: 'rounded-2xl',
      borderW: 'border-[2.5px]',
    },
    lg: {
      faceWidth: 128,
      faceHeight: 168,
      handleWidth: 30,
      handleHeight: 86,
      avatarSize: 66,
      fontSize: 'text-sm',
      duprSize: 'text-xs',
      radius: 'rounded-3xl',
      borderW: 'border-4',
    },
    hero: {
      faceWidth: 160,
      faceHeight: 210,
      handleWidth: 38,
      handleHeight: 105,
      avatarSize: 84,
      fontSize: 'text-base',
      duprSize: 'text-xs',
      radius: 'rounded-3xl',
      borderW: 'border-4',
    },
  }[size];

  const avatar = config.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';

  return (
    <motion.div
      whileHover={interactive ? { y: -6, scale: 1.03 } : undefined}
      whileTap={interactive ? { scale: 0.97 } : undefined}
      onClick={onClick}
      className={`relative flex flex-col items-center select-none cursor-pointer ${className} ${
        isHighlighted ? 'filter drop-shadow-[0_0_18px_rgba(244,224,34,0.55)]' : ''
      }`}
      style={{ minWidth: dimensions.faceWidth }}
    >
      {/* Top Slot or Status Badge */}
      {(slotNumber !== undefined || statusBadge) && (
        <div className="absolute -top-3 z-30 flex items-center gap-1">
          {slotNumber !== undefined && (
            <span
              className={`px-2 py-0.5 rounded-full font-['Outfit'] font-black text-[10px] tracking-wider uppercase shadow-md ${
                slotNumber <= 4
                  ? 'bg-[#F4E022] text-[#0B0E14] ring-2 ring-[#0B0E14]'
                  : 'bg-[#18202C] text-slate-300 border border-[#2B384B]'
              }`}
            >
              #{slotNumber} {slotNumber <= 4 && '⚡ UP'}
            </span>
          )}
          {statusBadge && (
            <span className="px-2 py-0.5 rounded-full font-bold text-[9px] bg-[#E07137] text-white shadow">
              {statusBadge}
            </span>
          )}
        </div>
      )}

      {/* Main Paddle Face */}
      <div
        className={`relative ${dimensions.radius} ${dimensions.borderW} overflow-hidden flex flex-col items-center justify-between p-1.5 transition-shadow shadow-xl`}
        style={{
          width: dimensions.faceWidth,
          height: dimensions.faceHeight,
          backgroundColor: config.faceColor || '#1F5B73',
          borderColor: isCurrentUser ? '#F4E022' : config.edgeGuardColor || '#FFFFFF',
          boxShadow: isCurrentUser
            ? '0 0 0 2px #F4E022, 0 10px 25px -5px rgba(0,0,0,0.8)'
            : '0 8px 20px -4px rgba(0,0,0,0.6)',
        }}
      >
        {/* Surface Pattern Texture Overlay */}
        {config.pattern === 'honeycomb' && (
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#ffffff 1.5px, transparent 1.5px)`,
              backgroundSize: '10px 10px',
            }}
          />
        )}
        {config.pattern === 'carbon-weave' && (
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)`,
              backgroundSize: '8px 8px',
            }}
          />
        )}
        {config.pattern === 'retro-lines' && (
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, #ffffff, #ffffff 2px, transparent 2px, transparent 8px)`,
            }}
          />
        )}

        {/* Gloss / 3D Specular Highlight Sweep */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-xl" />

        {/* Paddle Top Branding / Club Stamp */}
        <div className="z-10 w-full flex items-center justify-between px-1">
          <span className="font-['Outfit'] font-black uppercase tracking-wider text-[7.5px] text-white/80 whitespace-nowrap overflow-hidden text-ellipsis max-w-[82%]">
            {config.paddleBrandName ? config.paddleBrandName.split(' ')[0] : 'WORDCOMM'}
          </span>
          {isCurrentUser && (
            <span className="w-2 h-2 rounded-full bg-[#F4E022] animate-pulse ring-2 ring-black/40 flex-shrink-0" title="Your Paddle" />
          )}
        </div>

        {/* SWEET SPOT: ATTACHED PROFILE IMAGE */}
        <div className="z-10 relative flex flex-col items-center justify-center my-auto">
          {/* Circular frame with court ring styling */}
          <div
            className="relative rounded-full p-0.5 transition-transform"
            style={{
              boxShadow: `0 0 0 2px ${isCurrentUser ? '#F4E022' : 'rgba(255,255,255,0.7)'}`,
              backgroundColor: '#0B0E14',
            }}
          >
            <img
              src={avatar}
              alt={playerName}
              className="rounded-full object-cover shadow-inner"
              style={{
                width: dimensions.avatarSize,
                height: dimensions.avatarSize,
              }}
              referrerPolicy="no-referrer"
            />
            {/* Pickleball mini icon badge in corner of avatar */}
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#F4E022] border border-[#0B0E14] flex items-center justify-center shadow">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0B0E14]" />
            </div>
          </div>
        </div>

        {/* Paddle Sweet Spot Lower: Player Name & DUPR Pill */}
        <div className="z-10 w-full flex flex-col items-center pb-0.5">
          <span
            className={`font-['Outfit'] font-bold text-white tracking-tight truncate max-w-[95%] text-center ${dimensions.fontSize} drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]`}
          >
            {playerName.split(' ')[0]}
          </span>

          {dupr !== undefined && (
            <div className="flex items-center gap-0.5 bg-[#0B0E14]/85 px-1.5 py-0.5 rounded-full border border-white/20 mt-0.5">
              <span className="text-[7px] text-slate-300 uppercase font-semibold">DUPR</span>
              <span className={`font-['Outfit'] font-black text-[#F4E022] ${dimensions.duprSize}`}>
                {dupr.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Paddle Neck & Collar */}
      {showHandle && (
        <>
          <div
            className="relative z-10 transition-colors"
            style={{
              width: dimensions.handleWidth * 0.9,
              height: dimensions.handleHeight * 0.16,
              backgroundColor: '#18202C',
              borderLeft: '2px solid rgba(255,255,255,0.2)',
              borderRight: '2px solid rgba(255,255,255,0.2)',
            }}
          >
            {/* Edge guard transition tapers */}
            <div className="w-full h-full bg-gradient-to-b from-black/40 to-transparent" />
          </div>

          {/* Paddle Contoured Handle with Grip Tape Ridges */}
          <div
            className="relative rounded-b-md overflow-hidden shadow-lg"
            style={{
              width: dimensions.handleWidth,
              height: dimensions.handleHeight * 0.84,
              backgroundColor: config.gripColor || '#E07137',
              border: '2px solid rgba(0,0,0,0.4)',
              borderTop: 'none',
            }}
          >
            {/* Grip tape ridges (overlapping diagonal spirals) */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  135deg,
                  rgba(0,0,0,0.7),
                  rgba(0,0,0,0.7) 3px,
                  transparent 3px,
                  transparent 9px
                )`,
              }}
            />
            {/* Handle Butt Cap (Wordcomm Club bottom band) */}
            <div className="absolute bottom-0 inset-x-0 h-2 bg-[#0B0E14] border-t border-white/30 flex items-center justify-center">
              <div className="w-1.5 h-0.5 bg-[#F4E022] rounded-full" />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

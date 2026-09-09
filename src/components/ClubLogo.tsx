import React from 'react';

interface ClubLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const ClubLogo: React.FC<ClubLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
  };

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {showText && (
        <span className="font-['Outfit',sans-serif] font-black tracking-wider text-white uppercase text-xs sm:text-sm leading-none mb-1 text-center">
          WORDCOMM
        </span>
      )}
      <div className={`relative ${sizeMap[size]} flex items-center justify-center`}>
        <svg
          viewBox="0 0 160 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
        >
          {/* Main Rounded Box Border */}
          <rect
            x="4"
            y="4"
            width="152"
            height="112"
            rx="18"
            fill="#0B0E14"
            stroke="#FFFFFF"
            strokeWidth="5"
          />

          {/* Court Net Grid Lines (Slanted white net in background) */}
          <g opacity="0.95">
            {/* Top cable of net */}
            <line x1="8" y1="76" x2="152" y2="40" stroke="#FFFFFF" strokeWidth="4" />
            {/* Net mesh horizontals */}
            <line x1="8" y1="88" x2="152" y2="52" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="12" y1="100" x2="152" y2="64" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="20" y1="112" x2="152" y2="76" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="40" y1="114" x2="152" y2="88" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 2" />

            {/* Net mesh verticals */}
            <line x1="24" y1="72" x2="24" y2="114" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="44" y1="67" x2="44" y2="114" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="64" y1="62" x2="64" y2="114" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="84" y1="57" x2="84" y2="114" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="104" y1="52" x2="104" y2="114" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="124" y1="47" x2="124" y2="114" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="144" y1="42" x2="144" y2="108" stroke="#FFFFFF" strokeWidth="2" />
          </g>

          {/* Pickleball (Top Left - Yellow with holes) */}
          <g>
            <circle cx="36" cy="36" r="18" fill="#F4E022" />
            {/* Outer border for ball pop */}
            <circle cx="36" cy="36" r="18" stroke="#0B0E14" strokeWidth="2" />
            {/* Holes in pickleball */}
            <circle cx="36" cy="36" r="2.8" fill="#0B0E14" />
            <circle cx="36" cy="24" r="2.4" fill="#0B0E14" />
            <circle cx="36" cy="48" r="2.4" fill="#0B0E14" />
            <circle cx="24" cy="36" r="2.4" fill="#0B0E14" />
            <circle cx="48" cy="36" r="2.4" fill="#0B0E14" />
            <circle cx="28" cy="28" r="2.2" fill="#0B0E14" />
            <circle cx="44" cy="28" r="2.2" fill="#0B0E14" />
            <circle cx="28" cy="44" r="2.2" fill="#0B0E14" />
            <circle cx="44" cy="44" r="2.2" fill="#0B0E14" />
          </g>

          {/* Angled Pickleball Paddle */}
          <g transform="rotate(35 96 66)">
            {/* Paddle Handle (Orange / Terracotta) */}
            <rect
              x="90"
              y="74"
              width="12"
              height="36"
              rx="4"
              fill="#E07137"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            {/* Handle wrap diagonal lines */}
            <line x1="90" y1="84" x2="102" y2="88" stroke="#C85B23" strokeWidth="2" />
            <line x1="90" y1="94" x2="102" y2="98" stroke="#C85B23" strokeWidth="2" />
            <line x1="90" y1="102" x2="102" y2="106" stroke="#C85B23" strokeWidth="2" />

            {/* Paddle Neck Collar */}
            <path
              d="M87 72 C87 76, 105 76, 105 72 L103 64 L89 64 Z"
              fill="#18485C"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />

            {/* Paddle Face (Deep Petrol Teal/Navy) */}
            <rect
              x="70"
              y="14"
              width="52"
              height="58"
              rx="16"
              fill="#1F5B73"
              stroke="#FFFFFF"
              strokeWidth="3.5"
            />

            {/* Paddle subtle inner shine */}
            <path
              d="M74 24 C74 20, 78 18, 84 18 L108 18 C114 18, 118 20, 118 24 L118 36 C96 32, 80 44, 74 52 Z"
              fill="#FFFFFF"
              fillOpacity="0.12"
            />
          </g>
        </svg>
      </div>
      {showText && (
        <span className="font-['Outfit',sans-serif] font-extrabold tracking-wider text-white uppercase text-[10px] sm:text-xs leading-none mt-1 text-center">
          PICKLEBALL CLUB
        </span>
      )}
    </div>
  );
};

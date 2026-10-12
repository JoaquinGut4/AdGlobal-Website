import React from 'react';

interface AdGlobalLogoProps {
  className?: string;
  variant?: 'brand' | 'white' | 'dark';
  height?: number;
}

export const AdGlobalLogo: React.FC<AdGlobalLogoProps> = ({
  className = '',
  variant = 'brand',
  height = 36,
}) => {
  // Brand blue from user brief & logo image: #2B5C94
  // Navy corporate: #233A5E
  const fillColor =
    variant === 'white' ? '#FFFFFF' : variant === 'dark' ? '#0F1E36' : '#2B5C94';
  const accentColor = variant === 'white' ? '#FFFFFF' : '#3878BE';

  return (
    <div className={`inline-flex items-center select-none ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 460 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto block transition-colors duration-200"
        aria-label="AD GLOBAL Logo"
      >
        {/* Monogram A&D ligature */}
        <g>
          {/* Sweeping top aerodynamic curve above A and D */}
          <path
            d="M 68 18 C 95 18 128 23 148 40 C 132 30 102 24 74 24 C 62 24 50 25 38 27 L 43 19 C 51 18.3 59 18 68 18 Z"
            fill={accentColor}
          />

          {/* Left leg and apex of slanted A */}
          <path
            d="M 12 94 L 46 25 L 75 25 L 59 58 L 74 58 C 82 58 87 60 85 66 C 83 72 76 75 66 75 L 51 75 L 42 94 L 12 94 Z M 50 49 L 43 65 L 56 65 L 50 49 Z"
            fill={fillColor}
          />

          {/* Connected D bowl with dynamic italic slant and cutouts */}
          <path
            d="M 67 25 L 102 25 C 130 25 146 38 140 60 C 134 82 114 94 85 94 L 54 94 L 59 84 L 84 84 C 103 84 116 76 120 60 C 124 44 114 35 96 35 L 72 35 L 67 25 Z"
            fill={fillColor}
          />

          {/* Central & ligature element connecting A crossbar to D spine */}
          <path
            d="M 62 52 C 67 47 74 46 78 50 C 82 54 80 61 74 65 C 67 70 56 71 49 67 C 46 65 47 61 51 60 C 58 59 66 59 71 56 C 73 54 73 52 71 51 C 69 50 66 51 64 54 L 62 52 Z"
            fill={variant === 'white' ? '#FFFFFF' : '#1F4778'}
          />
        </g>

        {/* Wordmark "GLOBAL" in bold geometric sans grotesk */}
        <text
          x="162"
          y="88"
          fill={fillColor}
          fontFamily="system-ui, -apple-system, 'Space Grotesk', 'Plus Jakarta Sans', sans-serif"
          fontWeight="900"
          fontSize="72"
          letterSpacing="-1.5px"
        >
          GLOBAL
        </text>

        {/* Registered Trademark symbol ® */}
        <g transform="translate(438, 30)">
          <circle cx="9" cy="9" r="8" stroke={fillColor} strokeWidth="1.8" fill="none" />
          <text
            x="9"
            y="12.5"
            textAnchor="middle"
            fill={fillColor}
            fontFamily="sans-serif"
            fontSize="9"
            fontWeight="bold"
          >
            R
          </text>
        </g>
      </svg>
    </div>
  );
};

import React from 'react';
import { Operator, PaymentProvider } from '../types';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Authentic vector brand mark for MTN Côte d'Ivoire
 */
export const MtnLogo: React.FC<LogoProps> = ({ className = 'w-9 h-9 rounded-xl', size }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} shrink-0 shadow-sm`}
    style={size ? { width: size, height: size } : undefined}
    aria-label="MTN"
  >
    <rect width="100" height="100" rx="22" fill="#FFCC00" />
    <path
      d="M50 18 C 26 18, 12 32, 12 50 C 12 68, 26 82, 50 82 C 74 82, 88 68, 88 50 C 88 32, 74 18, 50 18 Z"
      fill="none"
      stroke="#000000"
      strokeWidth="6"
    />
    <text
      x="50"
      y="58"
      textAnchor="middle"
      fontFamily="system-ui, -apple-system, 'Arial Black', sans-serif"
      fontWeight="900"
      fontSize="26"
      letterSpacing="-1"
      fill="#000000"
    >
      MTN
    </text>
  </svg>
);

/**
 * Authentic vector brand mark for Orange Côte d'Ivoire
 */
export const OrangeLogo: React.FC<LogoProps> = ({ className = 'w-9 h-9 rounded-xl', size }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} shrink-0 shadow-sm`}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Orange"
  >
    <rect width="100" height="100" rx="22" fill="#FF7900" />
    <text
      x="50"
      y="62"
      textAnchor="middle"
      fontFamily="'Helvetica Neue', Arial, sans-serif"
      fontWeight="800"
      fontSize="21"
      letterSpacing="-0.5"
      fill="#FFFFFF"
    >
      orange
    </text>
  </svg>
);

/**
 * Authentic vector brand mark for Moov Africa Côte d'Ivoire
 */
export const MoovLogo: React.FC<LogoProps> = ({ className = 'w-9 h-9 rounded-xl', size }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} shrink-0 shadow-sm`}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Moov Africa"
  >
    <rect width="100" height="100" rx="22" fill="#005BAA" />
    {/* Stylized Moov curved arc */}
    <path
      d="M18 36 C 35 24, 65 24, 82 36"
      fill="none"
      stroke="#FF7900"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <text
      x="50"
      y="59"
      textAnchor="middle"
      fontFamily="'Arial Black', system-ui, sans-serif"
      fontWeight="900"
      fontSize="22"
      letterSpacing="-0.5"
      fill="#FFFFFF"
    >
      moov
    </text>
    <text
      x="50"
      y="75"
      textAnchor="middle"
      fontFamily="system-ui, sans-serif"
      fontWeight="800"
      fontSize="10"
      letterSpacing="2"
      fill="#FF7900"
    >
      AFRICA
    </text>
  </svg>
);

/**
 * Authentic vector brand mark for Wave Mobile Money
 */
export const WaveLogo: React.FC<LogoProps> = ({ className = 'w-9 h-9 rounded-xl', size }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} shrink-0 shadow-sm`}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Wave"
  >
    <rect width="100" height="100" rx="22" fill="#1EA6D6" />
    {/* Wave Penguin head */}
    <ellipse cx="50" cy="52" rx="26" ry="30" fill="#1A202C" />
    <ellipse cx="50" cy="56" rx="19" ry="24" fill="#FFFFFF" />
    {/* Penguin beak */}
    <polygon points="50,49 43,58 57,58" fill="#F6AD55" />
    {/* Penguin eyes */}
    <circle cx="42" cy="42" r="3" fill="#FFFFFF" />
    <circle cx="58" cy="42" r="3" fill="#FFFFFF" />
    <circle cx="43" cy="42" r="1.5" fill="#1A202C" />
    <circle cx="57" cy="42" r="1.5" fill="#1A202C" />
  </svg>
);

/**
 * Authentic vector brand mark for MTN Mobile Money (MoMo)
 */
export const MtnMoneyLogo: React.FC<LogoProps> = ({ className = 'w-9 h-9 rounded-xl', size }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} shrink-0 shadow-sm`}
    style={size ? { width: size, height: size } : undefined}
    aria-label="MTN Money"
  >
    <rect width="100" height="100" rx="22" fill="#FFCC00" />
    <circle cx="50" cy="40" r="18" fill="#004F71" />
    <text
      x="50"
      y="47"
      textAnchor="middle"
      fontFamily="'Arial Black', sans-serif"
      fontWeight="900"
      fontSize="14"
      fill="#FFCC00"
    >
      MoMo
    </text>
    <text
      x="50"
      y="76"
      textAnchor="middle"
      fontFamily="'Arial Black', sans-serif"
      fontWeight="900"
      fontSize="13"
      letterSpacing="-0.5"
      fill="#000000"
    >
      MTN
    </text>
  </svg>
);

/**
 * Authentic vector brand mark for Orange Money
 */
export const OrangeMoneyLogo: React.FC<LogoProps> = ({ className = 'w-9 h-9 rounded-xl', size }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} shrink-0 shadow-sm`}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Orange Money"
  >
    <rect width="100" height="100" rx="22" fill="#000000" />
    <rect x="14" y="14" width="72" height="72" rx="14" fill="#FF7900" />
    <path
      d="M32 50 C 32 40, 40 32, 50 32 C 60 32, 68 40, 68 50 C 68 60, 60 68, 50 68"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <circle cx="50" cy="50" r="6" fill="#FFFFFF" />
  </svg>
);

/**
 * Authentic vector brand mark for Moov Money
 */
export const MoovMoneyLogo: React.FC<LogoProps> = ({ className = 'w-9 h-9 rounded-xl', size }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} shrink-0 shadow-sm`}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Moov Money"
  >
    <rect width="100" height="100" rx="22" fill="#005BAA" />
    <text
      x="50"
      y="48"
      textAnchor="middle"
      fontFamily="'Arial Black', sans-serif"
      fontWeight="900"
      fontSize="18"
      fill="#FFFFFF"
    >
      moov
    </text>
    <rect x="22" y="55" width="56" height="18" rx="6" fill="#FF7900" />
    <text
      x="50"
      y="68"
      textAnchor="middle"
      fontFamily="system-ui, sans-serif"
      fontWeight="800"
      fontSize="11"
      fill="#FFFFFF"
    >
      MONEY
    </text>
  </svg>
);

/**
 * RechargeMe balance badge logo
 */
export const SoldeRechargeMeLogo: React.FC<LogoProps> = ({ className = 'w-9 h-9 rounded-xl', size }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} shrink-0 shadow-sm`}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Solde RechargeMe"
  >
    <rect width="100" height="100" rx="22" fill="#0F172A" />
    <circle cx="50" cy="50" r="22" fill="#4F46E5" />
    <circle cx="50" cy="50" r="10" fill="#FFFFFF" />
    <path d="M50 20 L50 28 M50 72 L50 80 M20 50 L28 50 M72 50 L80 50" stroke="#818CF8" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

/**
 * Helper to render operator logo
 */
export const OperatorLogo: React.FC<{ operator: Operator; className?: string; size?: number }> = ({
  operator,
  className,
  size,
}) => {
  switch (operator) {
    case 'MTN':
      return <MtnLogo className={className} size={size} />;
    case 'Orange':
      return <OrangeLogo className={className} size={size} />;
    case 'Moov':
      return <MoovLogo className={className} size={size} />;
  }
};

/**
 * Helper to render payment provider logo
 */
export const ProviderLogo: React.FC<{ provider: PaymentProvider; className?: string; size?: number }> = ({
  provider,
  className,
  size,
}) => {
  switch (provider) {
    case 'Wave':
      return <WaveLogo className={className} size={size} />;
    case 'MTN Money':
      return <MtnMoneyLogo className={className} size={size} />;
    case 'Orange Money':
      return <OrangeMoneyLogo className={className} size={size} />;
    case 'Moov Money':
      return <MoovMoneyLogo className={className} size={size} />;
    case 'Solde RechargeMe':
      return <SoldeRechargeMeLogo className={className} size={size} />;
  }
};

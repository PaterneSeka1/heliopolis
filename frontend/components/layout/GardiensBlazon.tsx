import React from 'react';

/** SVG blason "Les Gardiens de la Création — Route en Joie 2026" */
export function GardiensBlazon({ size = 140, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={size * 1.1}
      className={className}
      aria-label="Blason des Gardiens de la Création"
    >
      {/* Hexagone extérieur */}
      <polygon points="100,4 188,52 188,168 100,216 12,168 12,52" fill="#1F1B2E" />
      <polygon points="100,10 183,55 183,165 100,210 17,165 17,55" fill="#2a1f3a" />
      <polygon points="100,14 180,57 180,163 100,206 20,163 20,57" fill="none" stroke="#D9A441" strokeWidth="1.5" />

      {/* Ciel coucher de soleil */}
      <defs>
        <clipPath id="hex-clip">
          <polygon points="100,22 173,62 173,158 100,198 27,158 27,62" />
        </clipPath>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#FFD89A" />
          <stop offset="40%" stopColor="#F58A4B" />
          <stop offset="100%" stopColor="#E55A35" />
        </linearGradient>
      </defs>
      <g clipPath="url(#hex-clip)">
        <rect x="27" y="22" width="146" height="176" fill="url(#sky)" />
        {/* Soleil */}
        <circle cx="125" cy="92" r="20" fill="#FFE0A8" opacity=".95" />
        <circle cx="125" cy="92" r="14" fill="#FFF3D6" />
        {/* Montagnes */}
        <polygon points="27,140 60,95 85,115 110,80 135,110 160,90 173,115 173,160 27,160" fill="#7A2820" opacity=".85" />
        <polygon points="27,150 50,120 75,135 100,110 130,140 155,125 173,150 173,170 27,170" fill="#5A1818" opacity=".9" />
        {/* Route */}
        <path d="M 100 200 Q 90 175 105 160 Q 120 145 105 130 Q 90 115 100 100" stroke="#C62828" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M 100 200 Q 90 175 105 160 Q 120 145 105 130 Q 90 115 100 100" stroke="#FF8888" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".5" />
        {/* Scouts silhouettes */}
        <ellipse cx="68" cy="180" rx="14" ry="18" fill="#2a3d6b" />
        <circle cx="68" cy="158" r="9" fill="#5a3a28" />
        <rect x="60" y="166" width="16" height="4" fill="#C62828" />
        <ellipse cx="100" cy="185" rx="15" ry="20" fill="#2a3d6b" />
        <circle cx="100" cy="160" r="10" fill="#3a2a1c" />
        <rect x="91" y="169" width="18" height="4" fill="#C62828" />
        <ellipse cx="132" cy="180" rx="14" ry="18" fill="#2a3d6b" />
        <circle cx="132" cy="158" r="9" fill="#6a4a30" />
        <rect x="124" y="166" width="16" height="4" fill="#C62828" />
      </g>

      {/* Textes */}
      <text x="100" y="40" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#FFE8C8" letterSpacing="1">À LA QUÊTE DE LA NOUVELLE LIGNÉE</text>
      <text x="100" y="58" textAnchor="middle" fontSize="13" fontWeight="900" fontFamily="Georgia,serif" fill="#FFF5E0" fontStyle="italic">Des Gardiens</text>
      <text x="100" y="72" textAnchor="middle" fontSize="13" fontWeight="900" fontFamily="Georgia,serif" fill="#FFF5E0" fontStyle="italic">de la Création</text>
      <text x="100" y="83" textAnchor="middle" fontSize="5" fontWeight="700" fill="#FFE0A0" letterSpacing="2">ROUTE EN JOIE 2026</text>

      {/* Médaille fleur-de-lis */}
      <circle cx="100" cy="180" r="11" fill="#fff" stroke="#1F1B2E" strokeWidth="1" />
      <text x="100" y="184" textAnchor="middle" fontSize="11" fill="#1F1B2E">⚜</text>

      {/* Communauté */}
      <text x="100" y="20" textAnchor="middle" fontSize="4.5" fontWeight="700" fill="#FFE8C8" letterSpacing="2">COMMUNAUTÉ MAHATMA GANDHI</text>
    </svg>
  );
}

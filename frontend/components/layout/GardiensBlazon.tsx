import Image from 'next/image';

export function GardiensBlazon({ size = 140, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.jpeg"
      alt="Blason des Gardiens de la Création — Route en Joie 2026"
      width={size}
      height={size}
      className={`object-cover flex-shrink-0 p-2 ${className}`}
      priority
    />
  );
}

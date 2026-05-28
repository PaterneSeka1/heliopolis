import Link from 'next/link';
import { GardiensBlazon } from '@/components/layout/GardiensBlazon';
import { Stat, SectionTitle, Card } from '@/components/ui';
import { CampCard } from '@/components/camps/CampCard';
import { SmartBottomNav } from '@/components/layout/SmartBottomNav';
import { HomeBanner } from '@/components/auth/HomeBanner';
import { territoriesApi, campsApi } from '@/lib/api';
import type { Camp } from '@/types';

async function getData() {
  try {
    const [statsRes, campsRes] = await Promise.all([
      territoriesApi.stats(),
      campsApi.list({ statut: 'OUVERT' }),
    ]);
    return {
      stats: statsRes.data as {
        totalGardiens: number;
        campsOuverts: number;
        defisValides: number;
        doyennes: number;
      },
      camps: campsRes.data as Camp[],
    };
  } catch {
    return {
      stats: { totalGardiens: 847, campsOuverts: 12, defisValides: 156, doyennes: 7 },
      camps: [] as Camp[],
    };
  }
}

export default async function AccueilPage() {
  const { stats, camps } = await getData();

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Hero */}
          <div
            className="h-56 relative text-white overflow-hidden flex-shrink-0"
            style={{
              background:
                'linear-gradient(180deg,#FFB36B 0%,#F58A4B 40%,#E55A35 75%,#7A2820 100%)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 75% 25%, rgba(255,240,200,.45),transparent 35%), radial-gradient(circle at 30% 95%, rgba(31,27,46,.5),transparent 50%)',
              }}
            />
            <svg
              className="absolute bottom-0 left-0 right-0 w-full h-20"
              viewBox="0 0 390 80"
              preserveAspectRatio="none"
            >
              <polygon
                points="0,80 60,30 110,55 170,15 230,50 290,25 340,45 390,20 390,80"
                fill="#7A2820"
                opacity=".7"
              />
              <polygon
                points="0,80 40,50 100,65 160,40 220,60 280,45 340,60 390,40 390,80"
                fill="#3a0e0a"
                opacity=".85"
              />
            </svg>
            <div className="relative z-10 p-4 flex justify-between items-start">
              <div className="flex items-center gap-2">
                <GardiensBlazon size={34} />
                <div>
                  <div className="text-[9px] tracking-widest opacity-85">ROUTE EN JOIE 2026</div>
                  <div className="text-xs font-bold">Codex des Gardiens</div>
                </div>
              </div>
            </div>
            <div className="relative z-10 absolute bottom-6 left-4 right-4">
              <h2
                className="text-xl font-black leading-tight"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,.3)' }}
              >
                À la quête de la
                <br />
                Nouvelle Lignée.
              </h2>
              <p className="text-xs italic opacity-90 mt-1">
                Le camp est fini. La Route continue.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-[#fafafa]">
            {/* Banner adaptative invité/connecté */}
            <HomeBanner />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <Stat value={stats.campsOuverts} label="Camps actifs" variant="rouge" />
              <Stat value={stats.totalGardiens} label="Gardiens" variant="violet" />
              <Stat value={stats.defisValides} label="Défis validés" variant="or" />
              <Stat value={stats.doyennes} label="Doyennés" variant="vert" />
            </div>

            {/* Prochain camp */}
            <SectionTitle
              action={
                <Link href="/camps" className="text-xs text-[#C62828] font-semibold">
                  Voir tous →
                </Link>
              }
            >
              Prochain camp
            </SectionTitle>
            {camps.length > 0 ? (
              <CampCard camp={camps[0]} />
            ) : (
              <Card className="text-center text-sm text-[#6b6b78] py-6">
                Aucun camp ouvert pour le moment
              </Card>
            )}

            {/* Imaginaire */}
            <SectionTitle>L&apos;imaginaire</SectionTitle>
            <Card className="bg-gradient-to-r from-[#FFF1DC] to-white border-[#f0d98a]">
              <div className="flex gap-3 items-center">
                <GardiensBlazon size={54} className="flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm text-[#1F1B2E]">La Nouvelle Lignée</p>
                  <p className="text-xs text-[#6b6b78] leading-relaxed mt-1">
                    Héliopolis, la Route d&apos;Abay-Ka, les cinq règnes, les artefacts et la
                    mission des Gardiens de la Création.
                  </p>
                </div>
              </div>
            </Card>

            {/* Communauté */}
            <SectionTitle>Communauté</SectionTitle>
            <div
              className="rounded-2xl text-center px-4 py-5 text-white mb-4"
              style={{ background: 'linear-gradient(135deg,#1F1B2E,#3a1d4d)' }}
            >
              <div className="text-[10px] tracking-[3px] opacity-70 uppercase">Communauté</div>
              <div className="text-lg font-black mt-1 tracking-wide">Mahatma Gandhi</div>
              <div className="text-[11px] opacity-80 mt-1.5">
                Région d&apos;Abidjan · Route en Joie 2026
              </div>
            </div>
          </div>
        </div>
      </main>
      <SmartBottomNav />
    </div>
  );
}

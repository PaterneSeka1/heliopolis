import { notFound } from 'next/navigation';
import Link from 'next/link';
import { campsApi } from '@/lib/api';
import type { Camp } from '@/types';
import { Pill, Card, SectionTitle, InfoBanner } from '@/components/ui';
import { CampAuthCTA } from '@/components/camps/CampAuthCTA';

async function getCamp(id: string): Promise<Camp | null> {
  try {
    const { data } = await campsApi.get(id);
    return data as Camp;
  } catch {
    return null;
  }
}

export default async function CampDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const camp = await getCamp(id);
  if (!camp) notFound();

  const dateStr = `${new Date(camp.dateDebut).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  })} – ${new Date(camp.dateFin).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}`;

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      {/* Hero */}
      <div
        className="h-56 relative text-white overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg,#FFB36B 0%,#F58A4B 40%,#E55A35 70%,#7A2820 100%)',
        }}
      >
        {/* Sun */}
        <div
          className="absolute top-8 right-12 w-14 h-14 rounded-full"
          style={{
            background: 'radial-gradient(circle,#FFF3D6,#FFE0A8)',
            boxShadow: '0 0 40px rgba(255,224,168,.6)',
          }}
        />
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-24"
          viewBox="0 0 390 90"
          preserveAspectRatio="none"
        >
          <polygon
            points="0,90 70,30 130,55 200,20 260,45 320,25 390,50 390,90"
            fill="#7A2820"
            opacity=".75"
          />
          <polygon
            points="0,90 50,55 110,70 180,40 240,60 300,50 360,65 390,55 390,90"
            fill="#3a0e0a"
          />
        </svg>
        <Link
          href="/camps"
          className="absolute top-3 left-3.5 z-10 w-9 h-9 rounded-full flex items-center justify-center text-base bg-black/40"
        >
          ‹
        </Link>
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex gap-2 mb-2">
            <Pill variant="vert" solid>
              ✓ {camp.statut === 'OUVERT' ? 'Ouvert' : camp.statut}
            </Pill>
            <Pill variant="gris" solid>
              {camp.type}
            </Pill>
          </div>
          <h2
            className="text-xl font-black"
            style={{ textShadow: '0 2px 6px rgba(0,0,0,.4)' }}
          >
            {camp.nom}
          </h2>
          {camp.theme && <p className="text-xs opacity-90 mt-1">{camp.theme}</p>}
        </div>
      </div>

      <div className="p-4">
        {/* Meta stats */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="bg-white rounded-2xl p-3.5 border border-[#ececf0]">
            <div className="text-sm font-medium text-[#1F1B2E]">📅 {dateStr}</div>
            <div className="text-[11px] text-[#6b6b78] uppercase tracking-wide mt-0.5">
              Période
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3.5 border border-[#ececf0]">
            <div className="text-sm font-medium text-[#1F1B2E]">📍 {camp.lieu}</div>
            <div className="text-[11px] text-[#6b6b78] uppercase tracking-wide mt-0.5">Lieu</div>
          </div>
        </div>

        <InfoBanner icon="ℹ️">
          Sélection ouverte jusqu&apos;au 30 juin. Contacte ton Guide paroissial pour t&apos;inscrire.
        </InfoBanner>

        {/* Districts */}
        {camp.districts && camp.districts.length > 0 && (
          <>
            <SectionTitle>Districts concernés</SectionTitle>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {camp.districts.map(({ district }) => (
                <Pill key={district.id} variant="violet">
                  {district.nom}
                </Pill>
              ))}
            </div>
          </>
        )}

        {/* Description */}
        {camp.description && (
          <>
            <SectionTitle>Description</SectionTitle>
            <p className="text-sm text-[#6b6b78] leading-relaxed mb-4">{camp.description}</p>
          </>
        )}

        {/* Participants count */}
        {camp._count && (
          <Card className="text-center mb-4">
            <div className="text-2xl font-black text-[#6A1B9A]">
              {camp._count.participants}
            </div>
            <div className="text-xs text-[#6b6b78] uppercase tracking-wide mt-0.5">
              Participants sélectionnés
            </div>
          </Card>
        )}

        {/* CTA adaptatif selon le rôle */}
        <CampAuthCTA campId={camp.id} />
      </div>
    </div>
  );
}

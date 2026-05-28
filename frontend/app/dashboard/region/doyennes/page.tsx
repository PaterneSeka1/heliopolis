'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { territoriesApi, usersApi } from '@/lib/api';
import { Pill } from '@/components/ui';
import type { District, User } from '@/types';

export default function DoyennesPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [sentinelles, setSentinelles] = useState<User[]>([]);
  const [gardiens, setGardiens] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [d, s, g] = await Promise.all([
          territoriesApi.districts(),
          usersApi.list({ role: 'SENTINELLE' }),
          usersApi.list({ role: 'GARDIEN' }),
        ]);
        setDistricts(d.data);
        setSentinelles(s.data);
        setGardiens(g.data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const sentinelleByDistrict = new Map<string, User>();
  for (const s of sentinelles) {
    if (s.district?.id) sentinelleByDistrict.set(s.district.id, s);
  }

  const gardienCountByDistrict = new Map<string, number>();
  for (const g of gardiens) {
    if (g.district?.id) {
      gardienCountByDistrict.set(g.district.id, (gardienCountByDistrict.get(g.district.id) ?? 0) + 1);
    }
  }

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="px-6 py-4 flex justify-between items-center mb-5 border-b border-[#ececf0] bg-white -mx-6 -mt-6">
        <h1 className="text-2xl font-black text-[#1F1B2E]">🛡️ Doyennés</h1>
        <div className="text-sm text-[#6b6b78]">{districts.length} doyenné{districts.length > 1 ? 's' : ''}</div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-[#6b6b78] text-sm">Chargement…</div>
      )}

      {!loading && districts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-[#6b6b78]">
          <div className="text-5xl mb-3">🛡️</div>
          <p className="font-semibold">Aucun doyenné trouvé</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {districts.map(district => {
          const sentinelle = sentinelleByDistrict.get(district.id);
          const nbGardiens = gardienCountByDistrict.get(district.id) ?? 0;
          const nbParoisses = district._count?.parishes ?? 0;
          const hasResponsable = !!sentinelle;

          return (
            <div key={district.id} className="bg-white border border-[#ececf0] rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-[#1F1B2E]">{district.nom}</h2>
                  <p className="text-xs text-[#6b6b78] mt-0.5">{district.region.nom}</p>
                </div>
                {hasResponsable
                  ? <Pill variant="vert">✓ Actif</Pill>
                  : <Pill variant="or">⏳ Sans sentinelle</Pill>
                }
              </div>

              <div className="border-t border-[#f0f0f4] pt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6b6b78]">Sentinelle responsable</span>
                  <span className="font-semibold text-[#1F1B2E]">
                    {sentinelle ? `${sentinelle.prenoms} ${sentinelle.nom}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b6b78]">Paroisses</span>
                  <span className="font-semibold text-[#1F1B2E]">{nbParoisses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b6b78]">Gardiens</span>
                  <span className="font-semibold text-[#1F1B2E]">{nbGardiens}</span>
                </div>
              </div>

              <Link
                href={`/dashboard/region/paroisses?districtId=${district.id}`}
                className="mt-auto text-center text-xs border border-[#e6e6ea] text-[#1F1B2E] rounded-lg px-3 py-2 font-semibold hover:bg-[#f6f6fa] transition-colors">
                Voir paroisses →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

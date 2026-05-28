'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { codexApi } from '@/lib/api';
import { CodexItem } from '@/components/codex/CodexItem';
import type { Submission } from '@/types';

export default function GardienCodexPage() {
  const [posts, setPosts] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    codexApi.wall(1)
      .then(r => setPosts(r.data as Submission[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-gradient-to-br from-[#1F1B2E] to-[#2c1f4a] text-white px-4 pt-4 pb-4 flex-shrink-0">
        <h1 className="text-xl font-bold">Mur du Codex</h1>
        <p className="text-xs opacity-85 mt-0.5">Les actions des Gardiens de la Création</p>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 bg-[#f5eed8]">
        <div className="lg:max-w-3xl lg:mx-auto">
          {/* Bannière violette */}
          <div className="flex gap-2 items-start bg-[#EDE7F6] border border-[#6A1B9A]/30 rounded-xl p-3 mb-4 text-xs text-[#1F1B2E]">
            <span className="text-base flex-shrink-0">📜</span>
            <span>
              Soumets tes preuves depuis tes{' '}
              <Link href="/dashboard/gardien/missions" className="font-semibold text-[#6A1B9A] underline">
                Missions
              </Link>{' '}
              pour apparaître sur le Codex.
            </span>
          </div>

          {loading && (
            <div className="text-center py-10 text-[#6b6b78] text-sm">Chargement…</div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-10 text-[#6b6b78] text-sm">
              <div className="text-4xl mb-3">🪶</div>
              <p>Aucune publication pour le moment.</p>
              <p className="text-xs mt-1">Les premières actions des Gardiens apparaîtront ici.</p>
            </div>
          )}

          {posts.map(sub => (
            <CodexItem key={sub.id} submission={sub} />
          ))}
        </div>
      </div>
    </div>
  );
}

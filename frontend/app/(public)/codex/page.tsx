import { codexApi } from '@/lib/api';
import type { Submission } from '@/types';
import { CodexItem } from '@/components/codex/CodexItem';
import { CodexAuthBanner } from '@/components/codex/CodexAuthBanner';
import { CodexHeaderBadge } from '@/components/codex/CodexHeaderBadge';

async function getWall(): Promise<Submission[]> {
  try {
    const { data } = await codexApi.wall(1);
    return data as Submission[];
  } catch {
    return [];
  }
}

export default async function CodexPage() {
  const posts = await getWall();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-gradient-to-br from-[#1F1B2E] to-[#2c1f4a] text-white px-4 pt-4 pb-4 flex-shrink-0 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold">Mur du Codex</h1>
          <p className="text-xs opacity-85 mt-0.5">Les actions des Gardiens de la Création</p>
        </div>
        <CodexHeaderBadge />
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-[#f5eed8]">
        {/* Banner adaptative selon l'état d'authentification */}
        <CodexAuthBanner />

        {posts.length === 0 ? (
          <div className="text-center py-10 text-[#6b6b78] text-sm">
            <div className="text-4xl mb-3">🪶</div>
            <p>Aucune publication pour le moment.</p>
            <p className="text-xs mt-1">
              Les premières actions des Gardiens apparaîtront ici.
            </p>
          </div>
        ) : (
          posts.map((sub) => <CodexItem key={sub.id} submission={sub} />)
        )}
      </div>
    </div>
  );
}

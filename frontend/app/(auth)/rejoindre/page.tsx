'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GardiensBlazon } from '@/components/layout/GardiensBlazon';
import { Button, Input, Select, Card, SectionTitle } from '@/components/ui';
import { useAuthStore } from '@/store/auth';
import { getHomeForRole } from '@/lib/roles';

export default function RejoindreePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [prenom, setPrenom] = useState('');
  const [contact, setContact] = useState('');
  const [role, setRole] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) router.replace(getHomeForRole(user.role));
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header rouge */}
      <div className="bg-gradient-to-br from-[#C62828] to-[#8e1a1a] text-white px-4 pt-10 pb-5">
        <button onClick={() => router.back()} className="mb-3 text-sm opacity-80">
          ‹ Retour
        </button>
        <h1 className="text-xl font-bold">Rejoindre la Route</h1>
        <p className="text-xs opacity-85 mt-1">Trois façons de devenir Gardien</p>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* Blason central */}
        <div className="flex flex-col items-center py-4">
          <GardiensBlazon size={80} />
          <p className="font-black text-lg text-[#1F1B2E] mt-2">
            Tu es invité(e) à marcher avec nous
          </p>
          <p className="text-xs text-[#6b6b78] italic mt-1">
            « Le camp est fini. La Route continue. »
          </p>
        </div>

        {/* Option 1 */}
        <Card className="border-l-4 border-l-[#C62828] mb-3">
          <div className="flex gap-3">
            <span className="text-3xl">🛡️</span>
            <div className="flex-1">
              <p className="font-bold text-sm text-[#1F1B2E]">J&apos;ai déjà un matricule</p>
              <p className="text-xs text-[#6b6b78] mt-1 mb-2.5 leading-relaxed">
                Tu es déjà routier scout ? Active ton profil avec ton matricule national.
              </p>
              <Button
                variant="rouge"
                full={false}
                className="text-xs px-3.5 py-2"
                onClick={() => router.push('/activation')}
              >
                Activer mon profil →
              </Button>
            </div>
          </div>
        </Card>

        {/* Option 2 */}
        <Card className="border-l-4 border-l-[#6A1B9A] mb-3">
          <div className="flex gap-3">
            <span className="text-3xl">⛪</span>
            <div className="flex-1">
              <p className="font-bold text-sm text-[#1F1B2E]">Je veux rejoindre une paroisse</p>
              <p className="text-xs text-[#6b6b78] mt-1 mb-2.5 leading-relaxed">
                Tu n&apos;es pas encore inscrit ? Trouve une paroisse et contacte son Guide.
              </p>
              <Button variant="violet" full={false} className="text-xs px-3.5 py-2">
                Trouver une paroisse →
              </Button>
            </div>
          </div>
        </Card>

        {/* Option 3 */}
        <Card className="border-l-4 border-l-[#D9A441] mb-4">
          <div className="flex gap-3">
            <span className="text-3xl">📩</span>
            <div className="flex-1">
              <p className="font-bold text-sm text-[#1F1B2E]">J&apos;ai une question</p>
              <p className="text-xs text-[#6b6b78] mt-1 mb-2.5 leading-relaxed">
                Envoie un message au Conseil d&apos;Héliopolis. On te répond sous 48h.
              </p>
              <Button variant="or" full={false} className="text-xs px-3.5 py-2">
                Écrire au Conseil →
              </Button>
            </div>
          </div>
        </Card>

        {/* Contact form */}
        <SectionTitle>Ou laisse-nous un message</SectionTitle>
        {sent ? (
          <div className="bg-[#e1f4e3] rounded-xl p-4 text-center text-[#2E7D32] font-semibold text-sm">
            ✓ Message envoyé ! Nous te recontactons sous 48h.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F1B2E] mb-1.5">
                Ton prénom
              </label>
              <Input
                placeholder="Ex : Marie"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F1B2E] mb-1.5">
                Ton email ou téléphone
              </label>
              <Input
                placeholder="marie@example.com"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F1B2E] mb-1.5">
                Tu es…
              </label>
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Choisir…</option>
                <option>Un jeune intéressé(e) par le scoutisme</option>
                <option>Un parent</option>
                <option>Un ancien routier</option>
                <option>Un partenaire / autre</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F1B2E] mb-1.5">
                Ton message
              </label>
              <textarea
                className="w-full px-3.5 py-3 border border-[#e6e6ea] rounded-xl text-sm focus:outline-none focus:border-[#6A1B9A] resize-none"
                rows={3}
                placeholder="Quelques mots…"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
              />
            </div>
            <Button variant="rouge" onClick={() => setSent(true)}>
              📩 Envoyer
            </Button>
            <p className="text-[11px] text-[#6b6b78] text-center">
              Tes données ne seront utilisées que pour te recontacter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

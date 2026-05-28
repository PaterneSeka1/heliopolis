'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { messagingApi, contactsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { Conversation, ContactItem, ContactUser, Contact } from '@/types';

const CONV_ICON: Record<string, string> = {
  COMMUNAUTE: '🌍', REGION: '🗺️', DOYENNE: '🛡️', PAROISSE: '⛪', PRIVE: '🤝', GROUPE: '👥',
};
const CONV_GRADIENT: Record<string, string> = {
  COMMUNAUTE: 'from-[#F58A4B] to-[#C62828]',
  REGION:     'from-[#F58A4B] to-[#C62828]',
  DOYENNE:    'from-[#6A1B9A] to-[#3d1163]',
  PAROISSE:   'from-[#C62828] to-[#7a1717]',
  PRIVE:      'from-[#1F1B2E] to-[#3a1d4d]',
  GROUPE:     'from-[#2E7D32] to-[#1a5021]',
};
const CANAL_LABEL: Record<string, string> = {
  COMMUNAUTE: 'Communauté', REGION: 'Région', DOYENNE: 'Doyenné',
  PAROISSE: 'Paroisse', GROUPE: 'Groupe', PRIVE: 'Privé',
};

type Tab = 'messages' | 'contacts';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('messages');

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-white border-b border-[#ececf0] px-4 pt-4 pb-0 flex-shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#F58A4B] to-[#C62828] flex items-center justify-center font-bold text-base text-white flex-shrink-0">
            {user ? `${user.nom[0]}${user.prenoms[0]}`.toUpperCase() : '?'}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-black text-[#1F1B2E]">{user?.prenoms} {user?.nom}</h1>
            <p className="text-xs text-[#6b6b78]">💬 Messages · {user?.region?.nom ?? "Région d'Abidjan"}</p>
          </div>
        </div>

        <div className="flex">
          {(['messages', 'contacts'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors relative ${
                tab === t ? 'text-[#1F1B2E]' : 'text-[#6b6b78]'
              }`}
            >
              {t === 'messages' ? '💬 Messages' : '👥 Contacts'}
              {tab === t && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#C62828] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === 'messages' ? <MessagesTab /> : <ContactsTab />}
    </div>
  );
}

function MessagesTab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    messagingApi.conversations()
      .then(r => setConversations(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useCallback(
    (list: Conversation[]) =>
      search ? list.filter(c => c.nom?.toLowerCase().includes(search.toLowerCase())) : list,
    [search],
  );

  const pinned   = filtered(conversations.filter(c => c.isPinned));
  const channels = filtered(conversations.filter(c => !c.isPinned && c.type !== 'PRIVE'));
  const privates = filtered(conversations.filter(c => !c.isPinned && c.type === 'PRIVE'));
  const isEmpty  = !loading && conversations.length === 0;

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f7f7fb]">
      <div className="px-4 lg:px-8 pt-3 pb-2">
        <div className="relative lg:max-w-lg">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#6b6b78]">🔍</span>
          <input
            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#e6e6ea] rounded-xl text-sm outline-none focus:border-[#6A1B9A] transition-colors"
            placeholder="Rechercher un canal…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-[#6b6b78] text-sm">
          <div className="text-3xl mb-3 animate-pulse">💬</div>
          <p>Chargement…</p>
        </div>
      )}

      {pinned.length > 0 && (
        <Section label="📌 Épinglés">
          {pinned.map(conv => <ConvRow key={conv.id} conv={conv} />)}
        </Section>
      )}

      {channels.length > 0 && (
        <Section label="Canaux">
          {channels.map(conv => <ConvRow key={conv.id} conv={conv} />)}
        </Section>
      )}

      {privates.length > 0 && (
        <Section label="💬 Conversations privées">
          {privates.map(conv => <ConvRow key={conv.id} conv={conv} />)}
        </Section>
      )}

      {isEmpty && (
        <div className="px-4 mt-2">
          <div className="bg-[#EDE7F6] rounded-2xl p-4 mb-4 flex items-start gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-sm font-semibold text-[#4a1370]">Tes canaux arrivent bientôt</p>
              <p className="text-xs text-[#6b6b78] mt-1 leading-relaxed">
                Tu seras rattaché(e) aux canaux de ta paroisse, ton doyenné et ta région.
              </p>
            </div>
          </div>

          <SectionLabel>Canaux disponibles</SectionLabel>
          {[
            { type: 'COMMUNAUTE', label: 'Communauté', hint: 'Annonces générales' },
            { type: 'REGION',     label: 'Région d\'Abidjan', hint: 'Communications régionales' },
            { type: 'DOYENNE',    label: 'Doyenné', hint: 'Ton doyenné de rattachement' },
            { type: 'PAROISSE',   label: 'Paroisse', hint: 'Ta communauté locale' },
          ].map(ch => (
            <div key={ch.type}
              className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#ececf0] mb-2 opacity-55">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg text-white bg-gradient-to-br ${CONV_GRADIENT[ch.type]} flex-shrink-0`}>
                {CONV_ICON[ch.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#1F1B2E]">{ch.label}</div>
                <div className="text-xs text-[#6b6b78] mt-0.5">{ch.hint}</div>
              </div>
              <span className="text-[10px] bg-[#f3f3f5] text-[#6b6b78] px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                {CANAL_LABEL[ch.type]}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}

function ContactsTab() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [parish, setParish]       = useState<ContactUser[]>([]);
  const [accepted, setAccepted]   = useState<ContactItem[]>([]);
  const [received, setReceived]   = useState<Contact[]>([]);
  const [sent, setSent]           = useState<Contact[]>([]);
  const [searchQ, setSearchQ]     = useState('');
  const [searchRes, setSearchRes] = useState<ContactUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [dmLoading, setDmLoading] = useState<string | null>(null);
  const canSearch = searchQ.length >= 2;

  const handleDM = async (userId: string) => {
    setDmLoading(userId);
    try {
      const { data } = await messagingApi.createPrivate(userId);
      router.push(`/dashboard/admin/messages/${data.id}`);
    } catch { /* ignore */ }
    finally { setDmLoading(null); }
  };
  const visibleSearchRes = canSearch ? searchRes : [];

  const reload = useCallback(() => {
    Promise.all([
      contactsApi.parish(),
      contactsApi.list(),
      contactsApi.received(),
      contactsApi.sent(),
    ]).then(([p, a, r, s]) => {
      setParish(p.data);
      setAccepted(a.data);
      setReceived(r.data);
      setSent(s.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (!canSearch) return;
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await contactsApi.search(searchQ);
        setSearchRes(r.data);
      } catch {
        setSearchRes([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [canSearch, searchQ]);

  const handleAccept = async (id: string) => {
    await contactsApi.accept(id).catch(() => {});
    reload();
  };

  const handleDecline = async (id: string) => {
    await contactsApi.decline(id).catch(() => {});
    reload();
  };

  const handleRequest = async (userId: string) => {
    await contactsApi.request(userId).catch(() => {});
    reload();
    setSearchQ('');
    setSearchRes([]);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f7f7fb]">
        <div className="text-center text-[#6b6b78] text-sm">
          <div className="text-3xl mb-3 animate-pulse">👥</div>
          <p>Chargement des contacts…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f7f7fb]">
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#6b6b78]">🔍</span>
          <input
            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#e6e6ea] rounded-xl text-sm outline-none focus:border-[#6A1B9A] transition-colors"
            placeholder="Chercher un Gardien par nom ou matricule…"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
        </div>
      </div>

      {(visibleSearchRes.length > 0 || (canSearch && searching)) && (
        <div className="px-4 mb-3">
          <SectionLabel>Résultats</SectionLabel>
          {canSearch && searching && <div className="text-xs text-center text-[#6b6b78] py-3">Recherche…</div>}
          {visibleSearchRes.map(u => {
            const alreadySent = sent.some(c => c.receiver.id === u.id);
            const isContact   = accepted.some(c => c.user.id === u.id);
            return (
              <ContactRow
                key={u.id}
                user={u}
                action={
                  isContact ? (
                    <span className="text-[10px] bg-[#e8f5e9] text-[#2E7D32] px-2.5 py-1 rounded-full font-bold">Contact ✓</span>
                  ) : alreadySent ? (
                    <span className="text-[10px] bg-[#f3f3f5] text-[#6b6b78] px-2.5 py-1 rounded-full font-bold">Envoyé</span>
                  ) : (
                    <button
                      onClick={() => handleRequest(u.id)}
                      className="text-[11px] bg-[#6A1B9A] text-white px-3 py-1 rounded-full font-bold"
                    >
                      + Ajouter
                    </button>
                  )
                }
              />
            );
          })}
          {!searching && visibleSearchRes.length === 0 && canSearch && (
            <p className="text-xs text-center text-[#6b6b78] py-3">Aucun résultat pour « {searchQ} »</p>
          )}
        </div>
      )}

      {received.length > 0 && (
        <div className="px-4 mb-1">
          <SectionLabel>
            <span>🔔 Demandes reçues</span>
            <span className="ml-1.5 bg-[#C62828] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{received.length}</span>
          </SectionLabel>
          {received.map(c => (
            <ContactRow
              key={c.id}
              user={c.requester}
              action={
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleAccept(c.id)}
                    className="text-[11px] bg-[#2E7D32] text-white px-3 py-1 rounded-full font-bold"
                  >✓ Accepter</button>
                  <button
                    onClick={() => handleDecline(c.id)}
                    className="text-[11px] bg-white border border-[#e6e6ea] text-[#6b6b78] px-3 py-1 rounded-full font-bold"
                  >✕</button>
                </div>
              }
            />
          ))}
        </div>
      )}

      {parish.length > 0 && (
        <div className="px-4 mb-1">
          <SectionLabel>⛪ Ma paroisse — {user?.parish?.nom}</SectionLabel>
          <div className="bg-[#EDE7F6] rounded-2xl p-3 mb-2 flex items-center gap-2">
            <span className="text-base">ℹ️</span>
            <p className="text-xs text-[#4a1370] leading-relaxed">
              Les membres de ta paroisse sont automatiquement tes contacts.
            </p>
          </div>
          {parish.map(u => (
            <ContactRow
              key={u.id}
              user={u}
              action={
                <button
                  onClick={() => handleDM(u.id)}
                  disabled={dmLoading === u.id}
                  className="text-[11px] bg-[#6A1B9A] text-white px-3 py-1 rounded-full font-bold disabled:opacity-50"
                >
                  {dmLoading === u.id ? '…' : '💬'}
                </button>
              }
            />
          ))}
        </div>
      )}

      {accepted.length > 0 && (
        <div className="px-4 mb-1">
          <SectionLabel>🤝 Mes contacts</SectionLabel>
          {accepted.map(c => (
            <ContactRow
              key={c.contactId}
              user={c.user}
              sub={c.user.parish?.nom}
              action={
                <button
                  onClick={() => handleDM(c.user.id)}
                  disabled={dmLoading === c.user.id}
                  className="text-[11px] bg-[#1F1B2E] text-white px-3 py-1 rounded-full font-bold disabled:opacity-50"
                >
                  {dmLoading === c.user.id ? '…' : '💬'}
                </button>
              }
            />
          ))}
        </div>
      )}

      {sent.length > 0 && (
        <div className="px-4 mb-1">
          <SectionLabel>⏳ Envoyées</SectionLabel>
          {sent.map(c => (
            <ContactRow
              key={c.id}
              user={c.receiver}
              sub={c.receiver.parish?.nom}
              action={
                <button
                  onClick={() => handleDecline(c.id)}
                  className="text-[11px] bg-white border border-[#e6e6ea] text-[#6b6b78] px-3 py-1 rounded-full font-bold"
                >
                  Annuler
                </button>
              }
            />
          ))}
        </div>
      )}

      {parish.length === 0 && accepted.length === 0 && received.length === 0 && (
        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl border border-[#ececf0] p-6 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-sm font-semibold text-[#1F1B2E]">Aucun contact pour le moment</p>
            <p className="text-xs text-[#6b6b78] mt-1 leading-relaxed">
              Recherche un Gardien par son nom pour lui envoyer une demande.
            </p>
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 lg:px-8 mt-3">
      <SectionLabel>{label}</SectionLabel>
      <div className="lg:grid lg:grid-cols-2 lg:gap-3">
        {children}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] text-[#6b6b78] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
      {children}
    </div>
  );
}

function ConvRow({ conv }: { conv: Conversation }) {
  const icon     = CONV_ICON[conv.type] ?? '💬';
  const gradient = CONV_GRADIENT[conv.type] ?? 'from-[#6A1B9A] to-[#3d1163]';
  const lastMsg  = conv.messages?.[0];
  const timeStr  = conv.lastMessageAt
    ? new Date(conv.lastMessageAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <Link href={`/dashboard/admin/messages/${conv.id}`}
      className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#ececf0] mb-2 active:scale-[.98] transition-transform">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg text-white bg-gradient-to-br ${gradient} flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2">
          <span className="font-semibold text-sm text-[#1F1B2E] truncate">{conv.nom ?? 'Conversation'}</span>
          {timeStr && <span className="text-[10px] text-[#6b6b78] flex-shrink-0">{timeStr}</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[#6b6b78] truncate flex-1">
            {lastMsg?.contenu ?? 'Aucun message'}
          </span>
          <span className="text-[10px] bg-[#f3f3f5] text-[#6b6b78] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
            {CANAL_LABEL[conv.type] ?? conv.type}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ContactRow({
  user,
  sub,
  action,
}: {
  user: ContactUser;
  sub?: string;
  action: React.ReactNode;
}) {
  const initials = `${user.nom[0]}${user.prenoms[0]}`.toUpperCase();
  const colors = ['from-[#C62828] to-[#8e1a1a]', 'from-[#6A1B9A] to-[#4a1370]', 'from-[#2E7D32] to-[#1a5021]', 'from-[#1F1B2E] to-[#3a1d4d]'];
  const color   = colors[user.id.charCodeAt(0) % colors.length];

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#ececf0] mb-2">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${color} flex-shrink-0`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-[#1F1B2E] truncate">{user.prenoms} {user.nom}</div>
        <div className="text-xs text-[#6b6b78] mt-0.5 truncate">
          {sub ?? user.parish?.nom ?? user.district?.nom ?? user.role}
        </div>
      </div>
      <div className="flex-shrink-0">{action}</div>
    </div>
  );
}

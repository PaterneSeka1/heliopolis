'use client';
import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { messagingApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth';
import type { Conversation, Message } from '@/types';

const CONV_TYPE_HEADER: Record<string, { label: string; gradient: string }> = {
  COMMUNAUTE: { label: '🌍 Communauté Mahatma Gandhi', gradient: 'from-[#F58A4B] to-[#C62828]' },
  REGION:     { label: '🗺️ Région', gradient: 'from-[#F58A4B] to-[#C62828]' },
  DOYENNE:    { label: '🛡️ Doyenné', gradient: 'from-[#6A1B9A] to-[#3d1163]' },
  PAROISSE:   { label: '⛪ Paroisse', gradient: 'from-[#C62828] to-[#7a1717]' },
  PRIVE:      { label: '🤝 Conversation privée', gradient: 'from-[#1F1B2E] to-[#3a1d4d]' },
  GROUPE:     { label: '👥 Groupe', gradient: 'from-[#2E7D32] to-[#1a5021]' },
};

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [convType, setConvType] = useState('PRIVE');
  const [convNom, setConvNom] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagingApi.messages(id).then(r => {
      setMessages(r.data);
      messagingApi.conversations().then(cr => {
        const conv = (cr.data as Conversation[]).find(c => c.id === id);
        if (conv) { setConvType(conv.type); setConvNom(conv.nom ?? ''); }
      });
    }).catch(() => {});
    messagingApi.markRead(id).catch(() => {});
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!accessToken) return;
    const socket = getSocket(accessToken);
    socket.emit('join:conversation', id);

    socket.on('new:message', (msg: Message) => {
      // Déduplique si le message a déjà été ajouté après l'envoi REST
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
    });

    return () => {
      socket.emit('leave:conversation', id);
      socket.off('new:message');
    };
  }, [id, accessToken]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input;
    setInput('');
    setSending(true);
    try {
      const { data } = await messagingApi.send(id, text);
      // Ajoute le message immédiatement (sans attendre le broadcast WS)
      setMessages(prev => [...prev, data]);
    } catch {
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const header = CONV_TYPE_HEADER[convType] ?? CONV_TYPE_HEADER.PRIVE;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className={`bg-gradient-to-r ${header.gradient} text-white px-4 py-2.5 flex items-center gap-2.5 flex-shrink-0`}>
        <button onClick={() => router.back()}
          className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">‹</button>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">{convNom || header.label}</div>
          <div className="text-[11px] opacity-85">
            {convType === 'COMMUNAUTE' ? '847 membres · Annonces régionales' : 'Conversation chiffrée'}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f6f4f0] px-4 py-3 flex flex-col gap-2 lg:max-w-4xl lg:mx-auto lg:w-full">
        {convType === 'PRIVE' && (
          <div className="self-center text-[10px] text-[#6b6b78] bg-[#6A1B9A]/10 px-4 py-1.5 rounded-full">
            🔒 Conversation chiffrée de bout en bout
          </div>
        )}

        {messages.map(msg => {
          const isMine = msg.authorId === user?.id;
          const isSystem = msg.type === 'SYSTEME';

          if (isSystem) return (
            <div key={msg.id} className="self-center text-[11px] text-[#6A1B9A] bg-[#6A1B9A]/8 px-4 py-1.5 rounded-full max-w-[90%] text-center">
              {msg.contenu}
            </div>
          );

          return (
            <div key={msg.id} className={`flex flex-col max-w-[78%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}>
              {!isMine && (
                <span className="text-[11px] font-bold text-[#6A1B9A] mb-0.5">
                  {msg.author.prenoms} {msg.author.nom}
                </span>
              )}
              <div className={`px-3 py-2.5 rounded-[18px] text-sm leading-relaxed ${
                isMine
                  ? 'bg-gradient-to-br from-[#C62828] to-[#8e1a1a] text-white rounded-br-[5px]'
                  : 'bg-white text-[#1F1B2E] shadow-sm rounded-bl-[5px]'
              }`}>
                {msg.contenu}
                <span className="block text-[10px] mt-1 text-right opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  {isMine && ' ✓✓'}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 bg-white border-t border-[#e6e6ea] px-2.5 py-2 flex items-center gap-1.5 pb-safe lg:max-w-4xl lg:mx-auto lg:w-full">
        <button className="w-10 h-10 rounded-full bg-[#f0f0f4] flex items-center justify-center text-lg text-[#6A1B9A]">😊</button>
        <input
          className="flex-1 bg-[#f6f6fa] border border-[#ececf0] rounded-full px-4 py-2.5 text-sm outline-none"
          placeholder="Écrire un message…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="w-10 h-10 rounded-full bg-[#f0f0f4] flex items-center justify-center text-lg">📷</button>
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C62828] to-[#8e1a1a] flex items-center justify-center text-white text-base disabled:opacity-40"
        >
          {sending ? <span className="text-xs animate-pulse">…</span> : '➤'}
        </button>
      </div>
    </div>
  );
}

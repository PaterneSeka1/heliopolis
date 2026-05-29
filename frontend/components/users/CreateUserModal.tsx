'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { territoriesApi, usersApi } from '@/lib/api';
import type { District, Parish, User } from '@/types';

const ROLE_OPTIONS = [
  { value: 'GARDIEN',    label: 'Gardien' },
  { value: 'GUIDE',      label: 'Guide' },
  { value: 'SENTINELLE', label: 'Sentinelle' },
  { value: 'REGION',     label: 'Conseil régional' },
];

const ROLE_BADGE: Record<string, string> = {
  GARDIEN:    'bg-[#C62828]/10 text-[#C62828]',
  GUIDE:      'bg-[#6A1B9A]/10 text-[#6A1B9A]',
  SENTINELLE: 'bg-[#D9A441]/10 text-[#D9A441]',
  REGION:     'bg-[#1F1B2E]/10 text-[#1F1B2E]',
};

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (user: User) => void;
  /** Verrouille le rôle (non affiché) */
  defaultRole?: string;
  /** Restreint les rôles proposés dans le sélecteur (admin/région uniquement) */
  allowedRoles?: string[];
}

export function CreateUserModal({ isOpen, onClose, onCreated, defaultRole, allowedRoles }: CreateUserModalProps) {
  const { user: actor } = useAuthStore();

  const [nom, setNom]           = useState('');
  const [prenoms, setPrenoms]   = useState('');
  const [matricule, setMatricule] = useState('');
  const [email, setEmail]       = useState('');
  const [telephone, setTelephone] = useState('');
  const [role, setRole]         = useState(defaultRole ?? 'GARDIEN');

  const [districts, setDistricts] = useState<District[]>([]);
  const [parishes, setParishes]   = useState<Parish[]>([]);
  const [districtId, setDistrictId] = useState('');
  const [parishId, setParishId]     = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const actorRole       = actor?.role ?? '';
  const isAdminOrRegion = ['ADMIN', 'REGION'].includes(actorRole);
  const isSentinelle    = actorRole === 'SENTINELLE';

  useEffect(() => {
    if (isOpen) {
      setNom(''); setPrenoms(''); setMatricule('');
      setEmail(''); setTelephone('');
      setRole(defaultRole ?? 'GARDIEN');
      setDistrictId(''); setParishId('');
      setError('');
    }
  }, [isOpen, defaultRole]);

  // Charge les doyennés pour admin/région
  useEffect(() => {
    if (!isOpen || !isAdminOrRegion) return;
    territoriesApi.districts().then(({ data }) => setDistricts(data)).catch(() => {});
  }, [isOpen, isAdminOrRegion]);

  // Charge les paroisses selon le doyenné sélectionné (ou celui de la sentinelle)
  useEffect(() => {
    const id = districtId || (isSentinelle ? actor?.district?.id : '');
    if (!id) { setParishes([]); return; }
    territoriesApi.parishes(id).then(({ data }) => setParishes(data)).catch(() => {});
  }, [districtId, isSentinelle, actor?.district?.id]);

  const needsParish       = ['GUIDE', 'GARDIEN'].includes(role);
  // Affiche le sélecteur si admin/région ET (pas de rôle verrouillé OU plusieurs rôles autorisés)
  const showRoleSelector  = isAdminOrRegion && (!defaultRole || (allowedRoles !== undefined && allowedRoles.length > 1));
  const showDistrict      = isAdminOrRegion && role !== 'REGION';
  const showParish        = (isAdminOrRegion || isSentinelle) && needsParish;

  const handleSubmit = async () => {
    if (!nom.trim() || !prenoms.trim()) {
      setError('Le nom et les prénoms sont obligatoires.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload: Record<string, string | undefined> = {
        nom:       nom.trim(),
        prenoms:   prenoms.trim(),
        role,
        matricule: matricule.trim() || undefined,
        email:     email.trim()     || undefined,
        telephone: telephone.trim() || undefined,
      };
      if (districtId) payload.districtId = districtId;
      if (parishId)   payload.parishId   = parishId;

      const { data } = await usersApi.create(payload);
      onCreated(data as User);
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message ?? 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const resolvedRole = defaultRole ?? role;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="bg-gradient-to-r from-[#1F1B2E] to-[#3a1d4d] text-white p-5 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="font-bold text-sm">Nouveau membre</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ROLE_BADGE[resolvedRole] ?? ''} bg-white/20`}>
                {ROLE_OPTIONS.find(r => r.value === resolvedRole)?.label ?? resolvedRole}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          {/* Sélecteur de rôle (admin/région uniquement, non verrouillé) */}
          {showRoleSelector && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Rôle</label>
              <div className="grid grid-cols-2 gap-1.5">
                {ROLE_OPTIONS
                  .filter(o => actorRole === 'ADMIN' || o.value !== 'REGION')
                  .filter(o => !allowedRoles || allowedRoles.includes(o.value))
                  .map(o => (
                    <button
                      key={o.value}
                      onClick={() => { setRole(o.value); setDistrictId(''); setParishId(''); }}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        role === o.value
                          ? 'bg-[#1F1B2E] text-white border-[#1F1B2E]'
                          : 'bg-white text-[#6b6b78] border-[#e0e0e8] hover:border-[#1F1B2E] hover:text-[#1F1B2E]'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Doyenné */}
          {showDistrict && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Doyenné</label>
              <select
                value={districtId}
                onChange={e => { setDistrictId(e.target.value); setParishId(''); }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/10"
              >
                <option value="">— Sélectionner un doyenné —</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select>
            </div>
          )}

          {/* Paroisse */}
          {showParish && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Paroisse</label>
              <select
                value={parishId}
                onChange={e => setParishId(e.target.value)}
                disabled={parishes.length === 0}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/10 disabled:opacity-50"
              >
                <option value="">— Sélectionner une paroisse —</option>
                {parishes.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
              {parishes.length === 0 && (isSentinelle || districtId) && (
                <p className="text-[11px] text-gray-400 mt-1">
                  {districtId || actor?.district?.id ? 'Chargement…' : 'Sélectionnez d\'abord un doyenné'}
                </p>
              )}
            </div>
          )}

          {/* Informations personnelles */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Prénoms *</label>
              <input
                value={prenoms}
                onChange={e => setPrenoms(e.target.value)}
                placeholder="Kouamé"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom *</label>
              <input
                value={nom}
                onChange={e => setNom(e.target.value)}
                placeholder="KOFFI"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Matricule</label>
            <input
              value={matricule}
              onChange={e => setMatricule(e.target.value)}
              placeholder="0525247O"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/10"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="membre@email.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/10"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Téléphone</label>
            <input
              type="tel"
              value={telephone}
              onChange={e => setTelephone(e.target.value)}
              placeholder="+225 07 00 00 00 00"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/10"
            />
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex-shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-50 text-[#6b6b78] hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !nom.trim() || !prenoms.trim()}
            className="flex-1 bg-[#C62828] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#a82020] transition-colors disabled:opacity-50"
          >
            {loading ? 'Création…' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

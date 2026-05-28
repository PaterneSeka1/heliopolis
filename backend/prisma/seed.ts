/**
 * Seed — Le Codex des Gardiens
 * Route en Joie 2026 · Région d'Abidjan
 *
 * Exécuter : npx prisma db seed
 * (configure dans package.json → "prisma": { "seed": "tsx prisma/seed.ts" })
 */

import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL']!,
});
const prisma = new PrismaClient({ adapter });

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Démarrage du seed — Codex des Gardiens…\n');

  // ── 1. Région ───────────────────────────────────────────────────────────────
  const region = await prisma.region.upsert({
    where: { nom: "Région d'Abidjan" },
    update: {},
    create: {
      nom: "Région d'Abidjan",
      code: 'RGN-ABJ',
    },
  });
  console.log(`✔ Région : ${region.nom}`);

  // ── 2. Districts / Doyennés ─────────────────────────────────────────────────
  const districtsInput = [
    { nom: 'Treichville', code: 'DOY-TRE' },
    { nom: 'Cocody', code: 'DOY-COC' },
    { nom: 'Marcory', code: 'DOY-MAR' },
    { nom: 'Plateau', code: 'DOY-PLT' },
    { nom: 'Bingerville', code: 'DOY-BIN' },
    { nom: 'Abobo', code: 'DOY-ABO' },
    { nom: 'Adjame', code: 'DOY-ADJ' },
  ];

  const districts: Record<string, { id: string; nom: string }> = {};
  for (const d of districtsInput) {
    const district = await prisma.district.upsert({
      where: { regionId_nom: { regionId: region.id, nom: d.nom } },
      update: {},
      create: { nom: d.nom, code: d.code, regionId: region.id },
    });
    districts[d.nom] = district;
  }
  console.log(`✔ Doyennés : ${Object.keys(districts).join(', ')}`);

  // ── 3. Paroisses ────────────────────────────────────────────────────────────
  const parishesInput: Array<{ district: string; parishes: string[] }> = [
    {
      district: 'Treichville',
      parishes: [
        'Saint-Michel de Treichville',
        'Sainte-Marie',
        'Saint-François Xavier',
        'Saint-Augustin',
        'Notre-Dame de Lourdes',
      ],
    },
    {
      district: 'Cocody',
      parishes: [
        'Saint-Joseph de Cocody',
        'Sainte-Famille',
        'Notre-Dame des Grâces',
        'Christ-Roi',
      ],
    },
    {
      district: 'Marcory',
      parishes: [
        'Sainte-Thérèse de Marcory',
        'Saint-Antoine',
        'Notre-Dame de Marcory',
      ],
    },
    {
      district: 'Plateau',
      parishes: [
        'Cathédrale Saint-Paul du Plateau',
        'Saint-Pierre',
        'Sacré-Cœur',
      ],
    },
    {
      district: 'Bingerville',
      parishes: ['Saint-Jean de Bingerville', 'Sainte-Cécile'],
    },
    {
      district: 'Abobo',
      parishes: ["Saint-Luc d'Abobo", 'Saint-Marc', 'Bon Pasteur'],
    },
    {
      district: 'Adjame',
      parishes: ['Notre-Dame de la Mer', "Sainte-Croix d'Adjame"],
    },
  ];

  const parishes: Record<string, { id: string; nom: string }> = {};
  for (const pd of parishesInput) {
    const district = districts[pd.district];
    for (const pnom of pd.parishes) {
      const parish = await prisma.parish.upsert({
        where: { districtId_nom: { districtId: district.id, nom: pnom } },
        update: {},
        create: { nom: pnom, districtId: district.id },
      });
      parishes[pnom] = parish;
    }
  }
  console.log(`✔ Paroisses : ${Object.keys(parishes).length} créées`);

  // ── 4. Communauté Mahatma Gandhi ────────────────────────────────────────────
  const stjoseph = parishes['Saint-Joseph de Cocody'];
  const community = await prisma.community.upsert({
    where: {
      parishId_nom: { parishId: stjoseph.id, nom: 'Communauté Mahatma Gandhi' },
    },
    update: {},
    create: {
      nom: 'Communauté Mahatma Gandhi',
      parishId: stjoseph.id,
    },
  });
  console.log(`✔ Communauté : ${community.nom}`);

  // ── 5. Admin — Grand Archiviste ─────────────────────────────────────────────
  const adminHash = await hash('Admin@2026!');
  const admin = await prisma.user.upsert({
    where: { matricule: '0000001A' },
    update: {
      passwordHash: adminHash,
      statutProfil: 'ACTIF',
      regionId: region.id,
    },
    create: {
      nom: 'Archiviste',
      prenoms: 'Grand',
      matricule: '0000001A',
      email: 'admin@heliopolis.ci',
      passwordHash: adminHash,
      role: 'ADMIN',
      statutProfil: 'ACTIF',
      regionId: region.id,
    },
  });
  console.log(
    `✔ ADMIN       : ${admin.prenoms} ${admin.nom}  (${admin.matricule})`,
  );

  // ── 6. Hiérophante — Conseil d'Héliopolis ───────────────────────────────────
  const regionHash = await hash('Region@2026!');
  const hierophante = await prisma.user.upsert({
    where: { matricule: '0000002B' },
    update: {
      passwordHash: regionHash,
      statutProfil: 'ACTIF',
      regionId: region.id,
      districtId: districts['Cocody'].id,
      parishId: stjoseph.id,
    },
    create: {
      nom: 'Gandhi',
      prenoms: 'Hiérophante',
      matricule: '0000002B',
      email: 'hierophante@heliopolis.ci',
      passwordHash: regionHash,
      role: 'REGION',
      statutProfil: 'ACTIF',
      regionId: region.id,
      districtId: districts['Cocody'].id,
      parishId: stjoseph.id,
      communityId: community.id,
    },
  });

  // Lier la Région au Hiérophante (responsable)
  await prisma.region.updateMany({
    where: { responsableId: hierophante.id, NOT: { id: region.id } },
    data: { responsableId: null },
  });
  await prisma.region.update({
    where: { id: region.id },
    data: { responsableId: hierophante.id },
  });
  console.log(
    `✔ REGION      : ${hierophante.prenoms} ${hierophante.nom}  (${hierophante.matricule})`,
  );

  // ── 7. Sentinelles — une par Doyenné ────────────────────────────────────────
  const sentinellesInput = [
    {
      nom: 'Kouassi',
      prenoms: 'Pierre',
      matricule: '0526101C',
      district: 'Treichville',
      email: 'sentinelle.tre@heliopolis.ci',
    },
    {
      nom: "N'Dri",
      prenoms: 'Marie',
      matricule: '0526102D',
      district: 'Cocody',
      email: 'sentinelle.coc@heliopolis.ci',
    },
    {
      nom: 'Bamba',
      prenoms: 'Soumaïla',
      matricule: '0526103E',
      district: 'Marcory',
      email: 'sentinelle.mar@heliopolis.ci',
    },
    {
      nom: 'Yao',
      prenoms: 'Jean',
      matricule: '0526104F',
      district: 'Plateau',
      email: 'sentinelle.plt@heliopolis.ci',
    },
    {
      nom: 'Coulibaly',
      prenoms: 'Djibril',
      matricule: '0526105G',
      district: 'Bingerville',
      email: 'sentinelle.bin@heliopolis.ci',
    },
    {
      nom: 'Ouattara',
      prenoms: 'Roland',
      matricule: '0526106H',
      district: 'Abobo',
      email: 'sentinelle.abo@heliopolis.ci',
    },
    {
      nom: 'Diomandé',
      prenoms: 'Fatou',
      matricule: '0526107I',
      district: 'Adjame',
      email: 'sentinelle.adj@heliopolis.ci',
    },
  ];

  const sentinelleHash = await hash('Sentinelle@2026!');
  for (const s of sentinellesInput) {
    const district = districts[s.district];
    if (!district) {
      throw new Error(`District introuvable pour la sentinelle ${s.matricule}`);
    }
    const sentinelle = await prisma.user.upsert({
      where: { matricule: s.matricule },
      update: {
        passwordHash: sentinelleHash,
        statutProfil: 'ACTIF',
        regionId: region.id,
        districtId: district.id,
      },
      create: {
        nom: s.nom,
        prenoms: s.prenoms,
        matricule: s.matricule,
        email: s.email,
        passwordHash: sentinelleHash,
        role: 'SENTINELLE',
        statutProfil: 'ACTIF',
        regionId: region.id,
        districtId: district.id,
      },
    });
    // Lier le District à sa Sentinelle
    await prisma.district.updateMany({
      where: { responsableId: sentinelle.id, NOT: { id: district.id } },
      data: { responsableId: null },
    });
    await prisma.district.update({
      where: { id: district.id },
      data: { responsableId: sentinelle.id },
    });
  }
  console.log(`✔ SENTINELLES : 7 créées (une par doyenné)`);

  // ── 8. Guide — Saint-Joseph de Cocody ──────────────────────────────────────
  const guideHash = await hash('Guide@2026!');
  const guide = await prisma.user.upsert({
    where: { matricule: '0526200J' },
    update: {
      passwordHash: guideHash,
      statutProfil: 'ACTIF',
      regionId: region.id,
      districtId: districts['Cocody'].id,
      parishId: stjoseph.id,
    },
    create: {
      nom: 'Koné',
      prenoms: 'Awa',
      matricule: '0526200J',
      email: 'guide.stjoseph@heliopolis.ci',
      passwordHash: guideHash,
      role: 'GUIDE',
      statutProfil: 'ACTIF',
      regionId: region.id,
      districtId: districts['Cocody'].id,
      parishId: stjoseph.id,
      communityId: community.id,
    },
  });
  await prisma.parish.update({
    where: { id: stjoseph.id },
    data: { guideId: guide.id },
  });
  console.log(
    `✔ GUIDE       : ${guide.prenoms} ${guide.nom}  (${guide.matricule})`,
  );

  // ── 9. Gardiens de démonstration ─────────────────────────────────────────────
  const gardiensInput = [
    { nom: 'Kouamé', prenoms: 'Emmanuel', matricule: '0526301K' },
    { nom: 'Moussa', prenoms: 'Salif', matricule: '0526302L' },
    { nom: 'Traoré', prenoms: 'Aminata', matricule: '0526303M' },
    { nom: 'Diomandé', prenoms: 'Bintou', matricule: '0526304N' },
    { nom: "N'Guessan", prenoms: 'Félix', matricule: '0526305O' },
  ];

  const gardienHash = await hash('Gardien@2026!');
  for (const g of gardiensInput) {
    await prisma.user.upsert({
      where: { matricule: g.matricule },
      update: {
        passwordHash: gardienHash,
        statutProfil: 'ACTIF',
        regionId: region.id,
        districtId: districts['Cocody'].id,
        parishId: stjoseph.id,
      },
      create: {
        nom: g.nom,
        prenoms: g.prenoms,
        matricule: g.matricule,
        email: `${g.matricule.toLowerCase()}@heliopolis.ci`,
        passwordHash: gardienHash,
        role: 'GARDIEN',
        statutProfil: 'ACTIF',
        regionId: region.id,
        districtId: districts['Cocody'].id,
        parishId: stjoseph.id,
        communityId: community.id,
      },
    });
  }
  console.log(`✔ GARDIENS    : ${gardiensInput.length} de démonstration créés`);

  // ── 10. Adhésions 2026 ───────────────────────────────────────────────────────
  // Admin, Hiérophante et Guide — à jour
  for (const userId of [admin.id, hierophante.id, guide.id]) {
    await prisma.adhesion.upsert({
      where: { userId_annee: { userId, annee: 2026 } },
      update: {},
      create: {
        userId,
        annee: 2026,
        statut: 'A_JOUR',
        validateurId: admin.id,
        dateValidation: new Date(),
      },
    });
  }
  console.log(`✔ Adhésions   : admin, hiérophante et guide marqués À jour`);

  // ── 11. Badges ──────────────────────────────────────────────────────────────
  const badgesInput = [
    {
      code: 'EVEIL',
      nom: "Pierre d'Éveil",
      description: 'Premier défi validé — le chemin du Gardien commence.',
      condition: 'Valider son premier défi Codex',
      niveau: 'BRONZE' as const,
      conditionMeta: { type: 'challenges_validated', count: 1 },
    },
    {
      code: 'MARCHEUR',
      nom: 'Corde du Marcheur',
      description: 'Cinq défis validés, la route se trace.',
      condition: 'Valider 5 défis Codex',
      niveau: 'BRONZE' as const,
      conditionMeta: { type: 'challenges_validated', count: 5 },
    },
    {
      code: 'ANCRE',
      nom: 'Ancre de Communauté',
      description: 'Premier défi communautaire relevé avec sa paroisse.',
      condition: 'Valider un défi de catégorie Communautaire',
      niveau: 'ARGENT' as const,
      conditionMeta: { type: 'communautaire_validated', count: 1 },
    },
    {
      code: 'ANKH',
      nom: 'Ankh du Gardien',
      description: 'Dix défis validés — le Gardien prend racine.',
      condition: 'Valider 10 défis Codex',
      niveau: 'ARGENT' as const,
      conditionMeta: { type: 'challenges_validated', count: 10 },
    },
    {
      code: 'LUMIERE',
      nom: "Lumière de l'Esprit",
      description: 'Trois défis spirituels accomplis.',
      condition: 'Valider 3 défis de catégorie Spirituelle',
      niveau: 'ARGENT' as const,
      conditionMeta: { type: 'spirituel_validated', count: 3 },
    },
    {
      code: 'FLAMME',
      nom: 'Flamme du Gardien',
      description:
        "Le défi long des 21 jours accompli — la flamme s'est établie.",
      condition: 'Valider le défi « 21 jours de Gardien »',
      niveau: 'OR' as const,
      conditionMeta: { type: 'long_challenge', challengeCode: '21JOURS' },
    },
    {
      code: 'ABAYKACAMP',
      nom: "Bouclier d'Abay-Ka",
      description: 'Participant sélectionné et présent au Camp Régional.',
      condition: 'Être présent au camp régional',
      niveau: 'OR' as const,
      conditionMeta: { type: 'camp_present', campType: 'REGIONAL' },
    },
    {
      code: 'LEGENDE',
      nom: "Étoile d'Héliopolis",
      description: 'Vingt-cinq défis validés — légende vivante du Codex.',
      condition: 'Valider 25 défis Codex',
      niveau: 'LEGENDE' as const,
      conditionMeta: { type: 'challenges_validated', count: 25 },
    },
  ];

  for (const b of badgesInput) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: {},
      create: b,
    });
  }
  console.log(`✔ Badges      : ${badgesInput.length} créés`);

  // ── 12. Défis / Challenges ───────────────────────────────────────────────────
  const challengesInput = [
    {
      titre: '🌱 Planter une graine',
      description:
        'Plante une graine ou un jeune plant dans ton quartier et soigne-le pendant 7 jours. Observe sa croissance chaque jour.',
      categorie: 'PERSONNEL' as const,
      regne: 'TERRE' as const,
      niveau: 'DECOUVERTE' as const,
      preuveDemandee: 'Photo de la graine plantée + photo J+7',
      points: 10,
    },
    {
      titre: '🧹 Nettoyer une paroisse',
      description:
        'Organise ou participe à une action de nettoyage de ton lieu de culte ou de ton quartier avec au moins 3 autres personnes.',
      categorie: 'COMMUNAUTAIRE' as const,
      regne: 'TERRE' as const,
      niveau: 'DECOUVERTE' as const,
      preuveDemandee: 'Photo avant/après + liste des participants',
      points: 15,
    },
    {
      titre: '🙏 Prière du Gardien',
      description:
        'Consacre 10 minutes par jour à une prière ou méditation sur la Création pendant 5 jours consécutifs.',
      categorie: 'SPIRITUEL' as const,
      regne: 'ESPRIT' as const,
      niveau: 'DECOUVERTE' as const,
      preuveDemandee: 'Journal de méditation (texte court de 5 entrées)',
      points: 12,
    },
    {
      titre: "🚰 Réduire l'eau",
      description:
        "Identifie 3 gestes concrets pour réduire ta consommation d'eau et applique-les pendant une semaine entière.",
      categorie: 'PERSONNEL' as const,
      regne: 'EAU' as const,
      niveau: 'ENGAGEMENT' as const,
      preuveDemandee: "Liste des gestes + témoignage écrit d'une semaine",
      points: 20,
    },
    {
      titre: "🌬️ Souffle de l'Air",
      description:
        "Initie ou rejoins un projet de plantation d'arbres ou de préservation de la qualité de l'air dans ton quartier.",
      categorie: 'COMMUNAUTAIRE' as const,
      regne: 'AIR' as const,
      niveau: 'ENGAGEMENT' as const,
      preuveDemandee: "Photo du projet + rapport d'activité (1 page)",
      points: 25,
    },
    {
      titre: '🔥 Veillée du Feu Sacré',
      description:
        "Organise une veillée de partage spirituel autour d'un feu (ou d'une bougie) avec au moins 5 membres de ta communauté.",
      categorie: 'SPIRITUEL' as const,
      regne: 'FEU' as const,
      niveau: 'ENGAGEMENT' as const,
      preuveDemandee: 'Photo de la veillée + liste des participants',
      points: 30,
    },
    {
      titre: "💧 Gardien de l'Eau Vive",
      description:
        "Mène une action de sensibilisation sur la préservation de l'eau dans ta communauté : sensibiliser au moins 10 personnes.",
      categorie: 'COMMUNAUTAIRE' as const,
      regne: 'EAU' as const,
      niveau: 'MAITRISE' as const,
      preuveDemandee: 'Compte-rendu écrit + photos ou signatures',
      points: 40,
    },
    {
      titre: '🌿 21 jours de Gardien',
      description:
        "Le grand défi : 21 jours d'actions quotidiennes pour la Création. Un acte concret par jour, documenté dans un journal de bord.",
      categorie: 'LONG' as const,
      regne: null,
      niveau: 'MAITRISE' as const,
      preuveDemandee: 'Journal de 21 entrées avec photos et/ou textes',
      points: 100,
    },
  ];

  let challengesCreated = 0;
  for (const c of challengesInput) {
    const existing = await prisma.challenge.findFirst({
      where: { titre: c.titre },
    });
    if (!existing) {
      await prisma.challenge.create({
        data: {
          titre: c.titre,
          description: c.description,
          categorie: c.categorie,
          regne: c.regne ?? undefined,
          niveau: c.niveau,
          preuveDemandee: c.preuveDemandee,
          points: c.points,
          statut: 'ACTIF',
          createdById: admin.id,
        },
      });
      challengesCreated++;
    }
  }
  console.log(`✔ Défis       : ${challengesCreated} créés`);

  // ── 13. Camp régional Abay-Ka 2026 ──────────────────────────────────────────
  const existingCamp = await prisma.camp.findFirst({
    where: { nom: "Camp d'Abay-Ka 2026" },
  });
  if (!existingCamp) {
    await prisma.camp.create({
      data: {
        nom: "Camp d'Abay-Ka 2026",
        theme: 'Les Cinq Règnes de la Création',
        description:
          "Camp régional annuel de la Route en Joie — Communauté Mahatma Gandhi, Région d'Abidjan.",
        type: 'REGIONAL',
        statut: 'OUVERT',
        lieu: "Bingerville, Côte d'Ivoire",
        dateDebut: new Date('2026-07-20'),
        dateFin: new Date('2026-07-27'),
        selectionOuverte: true,
        regionId: region.id,
        createdById: admin.id,
      },
    });
  }
  console.log(`✔ Camp        : Camp d'Abay-Ka 2026 (OUVERT · Bingerville)`);

  // ── 14. Canal de messagerie régional ────────────────────────────────────────
  const existingConv = await prisma.conversation.findFirst({
    where: { type: 'REGION', regionId: region.id },
  });
  if (!existingConv) {
    await prisma.conversation.create({
      data: {
        type: 'REGION',
        nom: "Conseil d'Héliopolis — Canal Région",
        description: "Canal officiel de la Région d'Abidjan",
        regionId: region.id,
        isPinned: true,
        isModerated: true,
        members: {
          create: [
            { userId: admin.id, role: 'OWNER' },
            { userId: hierophante.id, role: 'MODERATEUR' },
          ],
        },
      },
    });
  }
  console.log(`✔ Messagerie  : canal régional créé`);

  // ─────────────────────────────────────────────────────────────────────────────
  // Résumé
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ✅  Seed terminé avec succès !');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('  Comptes créés :');
  console.log('  ┌──────────────┬──────────────┬──────────────────────┐');
  console.log('  │ Rôle         │ Matricule    │ Mot de passe         │');
  console.log('  ├──────────────┼──────────────┼──────────────────────┤');
  console.log('  │ ADMIN        │ 0000001A     │ Admin@2026!          │');
  console.log('  │ REGION       │ 0000002B     │ Region@2026!         │');
  console.log('  │ SENTINELLE   │ 0526101C     │ Sentinelle@2026!     │');
  console.log('  │ GUIDE        │ 0526200J     │ Guide@2026!          │');
  console.log('  │ GARDIEN      │ 0526301K     │ Gardien@2026!        │');
  console.log('  └──────────────┴──────────────┴──────────────────────┘');
  console.log('');
  console.log('  URL API  : http://localhost:4000/api');
  console.log('  URL App  : http://localhost:3000');
  console.log('');
}

main()
  .catch((e) => {
    console.error('\n❌ Erreur seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Enums mirroring the Prisma schema — used throughout the NestJS app
// These match exactly the enum definitions in prisma/schema.prisma

export enum UserRole {
  ADMIN = 'ADMIN',
  REGION = 'REGION',
  SENTINELLE = 'SENTINELLE',
  GUIDE = 'GUIDE',
  GARDIEN = 'GARDIEN',
}

export enum ProfileStatus {
  ACTIF = 'ACTIF',
  INACTIF = 'INACTIF',
  EN_ATTENTE_ACTIVATION = 'EN_ATTENTE_ACTIVATION',
  SUSPENDU = 'SUSPENDU',
  ARCHIVE = 'ARCHIVE',
}

export enum AdhesionStatus {
  A_JOUR = 'A_JOUR',
  NON_A_JOUR = 'NON_A_JOUR',
  EN_ATTENTE = 'EN_ATTENTE',
}

export enum CampType {
  REGIONAL = 'REGIONAL',
  DISTRICT = 'DISTRICT',
  PAROISSIAL = 'PAROISSIAL',
  NATIONAL = 'NATIONAL',
  COMMUNAUTE = 'COMMUNAUTE',
}

export enum CampStatus {
  BROUILLON = 'BROUILLON',
  OUVERT = 'OUVERT',
  EN_COURS = 'EN_COURS',
  CLOTURE = 'CLOTURE',
  ARCHIVE = 'ARCHIVE',
}

export enum ChallengeCategory {
  PERSONNEL = 'PERSONNEL',
  COMMUNAUTAIRE = 'COMMUNAUTAIRE',
  SPIRITUEL = 'SPIRITUEL',
  LONG = 'LONG',
}

export enum Regne {
  EAU = 'EAU',
  TERRE = 'TERRE',
  AIR = 'AIR',
  FEU = 'FEU',
  ESPRIT = 'ESPRIT',
}

export enum ChallengeLevel {
  DECOUVERTE = 'DECOUVERTE',
  ENGAGEMENT = 'ENGAGEMENT',
  MAITRISE = 'MAITRISE',
}

export enum SubmissionStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE',
  CORRECTION_DEMANDEE = 'CORRECTION_DEMANDEE',
}

export enum ModerationStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  APPROUVE = 'APPROUVE',
  REJETE = 'REJETE',
}

export enum ConversationType {
  COMMUNAUTE = 'COMMUNAUTE',
  REGION = 'REGION',
  DOYENNE = 'DOYENNE',
  PAROISSE = 'PAROISSE',
  PRIVE = 'PRIVE',
  GROUPE = 'GROUPE',
}

export enum ConversationMemberRole {
  OWNER = 'OWNER',
  MODERATEUR = 'MODERATEUR',
  MEMBRE = 'MEMBRE',
}

export enum MessageType {
  TEXTE = 'TEXTE',
  IMAGE = 'IMAGE',
  FICHIER = 'FICHIER',
  AUDIO = 'AUDIO',
  SYSTEME = 'SYSTEME',
}

export enum BadgeLevel {
  BRONZE = 'BRONZE',
  ARGENT = 'ARGENT',
  OR = 'OR',
  LEGENDE = 'LEGENDE',
}

export enum ParticipationStatus {
  NON_SELECTIONNE = 'NON_SELECTIONNE',
  SELECTIONNE = 'SELECTIONNE',
  CONFIRME = 'CONFIRME',
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  DESISTE = 'DESISTE',
  EN_ATTENTE = 'EN_ATTENTE',
}

export enum PresenceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  NON_RENSEIGNE = 'NON_RENSEIGNE',
}

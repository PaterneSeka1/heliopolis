-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'REGION', 'SENTINELLE', 'GUIDE', 'GARDIEN');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('ACTIF', 'INACTIF', 'EN_ATTENTE_ACTIVATION', 'SUSPENDU', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "AdhesionStatus" AS ENUM ('A_JOUR', 'NON_A_JOUR', 'EN_ATTENTE');

-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('ACTIF', 'INACTIF', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "CampType" AS ENUM ('REGIONAL', 'DISTRICT', 'PAROISSIAL', 'NATIONAL', 'COMMUNAUTE');

-- CreateEnum
CREATE TYPE "CampStatus" AS ENUM ('BROUILLON', 'OUVERT', 'EN_COURS', 'CLOTURE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('NON_SELECTIONNE', 'SELECTIONNE', 'CONFIRME', 'PRESENT', 'ABSENT', 'DESISTE', 'EN_ATTENTE');

-- CreateEnum
CREATE TYPE "PresenceStatus" AS ENUM ('PRESENT', 'ABSENT', 'NON_RENSEIGNE');

-- CreateEnum
CREATE TYPE "ChallengeCategory" AS ENUM ('PERSONNEL', 'COMMUNAUTAIRE', 'SPIRITUEL', 'LONG');

-- CreateEnum
CREATE TYPE "Regne" AS ENUM ('EAU', 'TERRE', 'AIR', 'FEU', 'ESPRIT');

-- CreateEnum
CREATE TYPE "ChallengeLevel" AS ENUM ('DECOUVERTE', 'ENGAGEMENT', 'MAITRISE');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('ACTIF', 'INACTIF', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REJETE', 'CORRECTION_DEMANDEE');

-- CreateEnum
CREATE TYPE "BadgeLevel" AS ENUM ('BRONZE', 'ARGENT', 'OR', 'LEGENDE');

-- CreateEnum
CREATE TYPE "AnnouncementScope" AS ENUM ('COMMUNAUTE', 'REGION', 'DOYENNE', 'PAROISSE');

-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('BROUILLON', 'PUBLIE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('COMMUNAUTE', 'REGION', 'DOYENNE', 'PAROISSE', 'PRIVE', 'GROUPE');

-- CreateEnum
CREATE TYPE "ConversationMemberRole" AS ENUM ('OWNER', 'MODERATEUR', 'MEMBRE');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('ENVOYE', 'LIVRE', 'LU', 'SUPPRIME');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXTE', 'IMAGE', 'FICHIER', 'AUDIO', 'SYSTEME');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REJETE');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('PHOTO_CAMP', 'AFFICHE_CAMP', 'PREUVE_DEFI', 'AVATAR', 'BADGE', 'CERTIFICAT', 'PIECE_JOINTE', 'AUTRE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'STATUS_CHANGE', 'VALIDATE', 'REJECT');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED');

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT,
    "statut" "EntityStatus" NOT NULL DEFAULT 'ACTIF',
    "responsableId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT,
    "regionId" TEXT NOT NULL,
    "responsableId" TEXT,
    "statut" "EntityStatus" NOT NULL DEFAULT 'ACTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parishes" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "guideId" TEXT,
    "statut" "EntityStatus" NOT NULL DEFAULT 'ACTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "parishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communities" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "parishId" TEXT NOT NULL,
    "statut" "EntityStatus" NOT NULL DEFAULT 'ACTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenoms" TEXT NOT NULL,
    "matricule" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "passwordHash" TEXT,
    "avatarUrl" TEXT,
    "dateNaissance" DATE,
    "sexe" CHAR(1),
    "role" "UserRole" NOT NULL DEFAULT 'GARDIEN',
    "statutProfil" "ProfileStatus" NOT NULL DEFAULT 'EN_ATTENTE_ACTIVATION',
    "regionId" TEXT,
    "districtId" TEXT,
    "parishId" TEXT,
    "communityId" TEXT,
    "notifPush" BOOLEAN NOT NULL DEFAULT true,
    "notifEmail" BOOLEAN NOT NULL DEFAULT false,
    "langue" TEXT NOT NULL DEFAULT 'fr',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adhesions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "statut" "AdhesionStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "validateurId" TEXT,
    "dateValidation" TIMESTAMP(3),
    "commentaireInterne" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adhesions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camps" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "theme" TEXT,
    "description" TEXT,
    "dateDebut" DATE NOT NULL,
    "dateFin" DATE NOT NULL,
    "lieu" TEXT NOT NULL,
    "type" "CampType" NOT NULL,
    "statut" "CampStatus" NOT NULL DEFAULT 'BROUILLON',
    "imageUrl" TEXT,
    "selectionOuverte" BOOLEAN NOT NULL DEFAULT false,
    "commentaireInterne" TEXT,
    "regionId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "camps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camp_districts" (
    "campId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "camp_districts_pkey" PRIMARY KEY ("campId","districtId")
);

-- CreateTable
CREATE TABLE "camp_participants" (
    "id" TEXT NOT NULL,
    "campId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "parishId" TEXT NOT NULL,
    "roleAtCamp" "UserRole" NOT NULL DEFAULT 'GARDIEN',
    "adhesionStatusSnapshot" "AdhesionStatus" NOT NULL,
    "participationStatus" "ParticipationStatus" NOT NULL DEFAULT 'SELECTIONNE',
    "presenceStatus" "PresenceStatus" NOT NULL DEFAULT 'NON_RENSEIGNE',
    "selectedById" TEXT NOT NULL,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commentaireInterne" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camp_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presence_logs" (
    "id" TEXT NOT NULL,
    "campId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "statut" "PresenceStatus" NOT NULL,
    "markedById" TEXT NOT NULL,
    "commentaire" TEXT,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presence_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categorie" "ChallengeCategory" NOT NULL,
    "regne" "Regne",
    "niveau" "ChallengeLevel" NOT NULL DEFAULT 'DECOUVERTE',
    "preuveDemandee" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "statut" "ChallengeStatus" NOT NULL DEFAULT 'ACTIF',
    "campId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "gardienId" TEXT NOT NULL,
    "preuveUrl" TEXT,
    "texte" TEXT,
    "commentaire" TEXT,
    "statut" "SubmissionStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "validateurId" TEXT,
    "commentaireValidateur" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedAt" TIMESTAMP(3),
    "moderation" "ModerationStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "publishedToCodex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "imageUrl" TEXT,
    "niveau" "BadgeLevel" NOT NULL DEFAULT 'BRONZE',
    "conditionMeta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codex_reactions" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '❤️',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codex_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "type" "ConversationType" NOT NULL,
    "nom" TEXT,
    "description" TEXT,
    "avatarUrl" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "isReadOnly" BOOLEAN NOT NULL DEFAULT false,
    "regionId" TEXT,
    "districtId" TEXT,
    "parishId" TEXT,
    "campId" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_members" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ConversationMemberRole" NOT NULL DEFAULT 'MEMBRE',
    "mutedUntil" TIMESTAMP(3),
    "lastReadAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "conversation_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "authorId" TEXT,
    "type" "MessageType" NOT NULL DEFAULT 'TEXTE',
    "contenu" TEXT,
    "replyToId" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'ENVOYE',
    "moderation" "ModerationStatus" NOT NULL DEFAULT 'APPROUVE',
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attachments" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "mediaId" TEXT,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "taille" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_read_receipts" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_read_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "portee" "AnnouncementScope" NOT NULL,
    "regionId" TEXT,
    "districtId" TEXT,
    "parishId" TEXT,
    "statut" "AnnouncementStatus" NOT NULL DEFAULT 'BROUILLON',
    "authorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "mimeType" TEXT,
    "taille" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "description" TEXT,
    "uploadedById" TEXT NOT NULL,
    "campId" TEXT,
    "submissionId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_logs" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "action" "ModerationStatus" NOT NULL,
    "reason" TEXT,
    "moderatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "diff" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regions_nom_key" ON "regions"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "regions_responsableId_key" ON "regions"("responsableId");

-- CreateIndex
CREATE UNIQUE INDEX "districts_responsableId_key" ON "districts"("responsableId");

-- CreateIndex
CREATE INDEX "districts_regionId_idx" ON "districts"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "districts_regionId_nom_key" ON "districts"("regionId", "nom");

-- CreateIndex
CREATE UNIQUE INDEX "parishes_guideId_key" ON "parishes"("guideId");

-- CreateIndex
CREATE INDEX "parishes_districtId_idx" ON "parishes"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "parishes_districtId_nom_key" ON "parishes"("districtId", "nom");

-- CreateIndex
CREATE UNIQUE INDEX "communities_parishId_nom_key" ON "communities"("parishId", "nom");

-- CreateIndex
CREATE UNIQUE INDEX "users_matricule_key" ON "users"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_telephone_key" ON "users"("telephone");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_parishId_idx" ON "users"("parishId");

-- CreateIndex
CREATE INDEX "users_districtId_idx" ON "users"("districtId");

-- CreateIndex
CREATE INDEX "users_regionId_idx" ON "users"("regionId");

-- CreateIndex
CREATE INDEX "users_nom_prenoms_idx" ON "users"("nom", "prenoms");

-- CreateIndex
CREATE INDEX "adhesions_annee_statut_idx" ON "adhesions"("annee", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "adhesions_userId_annee_key" ON "adhesions"("userId", "annee");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "camps_statut_dateDebut_idx" ON "camps"("statut", "dateDebut");

-- CreateIndex
CREATE INDEX "camps_type_idx" ON "camps"("type");

-- CreateIndex
CREATE INDEX "camp_participants_campId_participationStatus_idx" ON "camp_participants"("campId", "participationStatus");

-- CreateIndex
CREATE INDEX "camp_participants_campId_districtId_idx" ON "camp_participants"("campId", "districtId");

-- CreateIndex
CREATE INDEX "camp_participants_campId_parishId_idx" ON "camp_participants"("campId", "parishId");

-- CreateIndex
CREATE UNIQUE INDEX "camp_participants_campId_userId_key" ON "camp_participants"("campId", "userId");

-- CreateIndex
CREATE INDEX "presence_logs_campId_idx" ON "presence_logs"("campId");

-- CreateIndex
CREATE INDEX "presence_logs_participantId_idx" ON "presence_logs"("participantId");

-- CreateIndex
CREATE INDEX "challenges_categorie_statut_idx" ON "challenges"("categorie", "statut");

-- CreateIndex
CREATE INDEX "submissions_gardienId_statut_idx" ON "submissions"("gardienId", "statut");

-- CreateIndex
CREATE INDEX "submissions_challengeId_statut_idx" ON "submissions"("challengeId", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "badges_nom_key" ON "badges"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "codex_reactions_submissionId_userId_emoji_key" ON "codex_reactions"("submissionId", "userId", "emoji");

-- CreateIndex
CREATE INDEX "conversations_type_idx" ON "conversations"("type");

-- CreateIndex
CREATE INDEX "conversations_districtId_idx" ON "conversations"("districtId");

-- CreateIndex
CREATE INDEX "conversations_parishId_idx" ON "conversations"("parishId");

-- CreateIndex
CREATE INDEX "conversations_lastMessageAt_idx" ON "conversations"("lastMessageAt");

-- CreateIndex
CREATE INDEX "conversation_members_userId_idx" ON "conversation_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_members_conversationId_userId_key" ON "conversation_members"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_authorId_idx" ON "messages"("authorId");

-- CreateIndex
CREATE INDEX "message_read_receipts_userId_readAt_idx" ON "message_read_receipts"("userId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "message_read_receipts_messageId_userId_key" ON "message_read_receipts"("messageId", "userId");

-- CreateIndex
CREATE INDEX "announcements_portee_statut_publishedAt_idx" ON "announcements"("portee", "statut", "publishedAt");

-- CreateIndex
CREATE INDEX "media_kind_idx" ON "media"("kind");

-- CreateIndex
CREATE INDEX "media_campId_idx" ON "media"("campId");

-- CreateIndex
CREATE INDEX "moderation_logs_targetType_targetId_idx" ON "moderation_logs"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "moderation_logs_moderatorId_idx" ON "moderation_logs"("moderatorId");

-- CreateIndex
CREATE INDEX "contacts_receiverId_status_idx" ON "contacts"("receiverId", "status");

-- CreateIndex
CREATE INDEX "contacts_requesterId_status_idx" ON "contacts"("requesterId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_requesterId_receiverId_key" ON "contacts"("requesterId", "receiverId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parishes" ADD CONSTRAINT "parishes_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parishes" ADD CONSTRAINT "parishes_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communities" ADD CONSTRAINT "communities_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "parishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "parishes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adhesions" ADD CONSTRAINT "adhesions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adhesions" ADD CONSTRAINT "adhesions_validateurId_fkey" FOREIGN KEY ("validateurId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camps" ADD CONSTRAINT "camps_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camps" ADD CONSTRAINT "camps_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_districts" ADD CONSTRAINT "camp_districts_campId_fkey" FOREIGN KEY ("campId") REFERENCES "camps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_districts" ADD CONSTRAINT "camp_districts_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_participants" ADD CONSTRAINT "camp_participants_campId_fkey" FOREIGN KEY ("campId") REFERENCES "camps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_participants" ADD CONSTRAINT "camp_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_participants" ADD CONSTRAINT "camp_participants_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_participants" ADD CONSTRAINT "camp_participants_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "parishes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_participants" ADD CONSTRAINT "camp_participants_selectedById_fkey" FOREIGN KEY ("selectedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presence_logs" ADD CONSTRAINT "presence_logs_campId_fkey" FOREIGN KEY ("campId") REFERENCES "camps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presence_logs" ADD CONSTRAINT "presence_logs_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "camp_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presence_logs" ADD CONSTRAINT "presence_logs_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_campId_fkey" FOREIGN KEY ("campId") REFERENCES "camps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_gardienId_fkey" FOREIGN KEY ("gardienId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_validateurId_fkey" FOREIGN KEY ("validateurId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codex_reactions" ADD CONSTRAINT "codex_reactions_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "parishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_campId_fkey" FOREIGN KEY ("campId") REFERENCES "camps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_read_receipts" ADD CONSTRAINT "message_read_receipts_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_read_receipts" ADD CONSTRAINT "message_read_receipts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "parishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_campId_fkey" FOREIGN KEY ("campId") REFERENCES "camps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

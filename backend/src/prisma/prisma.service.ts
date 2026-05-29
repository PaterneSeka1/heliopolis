import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, PoolClient } from 'pg';

function formatDatabaseTarget(connectionString: string | undefined) {
  if (!connectionString) return 'DATABASE_URL absent';
  try {
    const url = new URL(connectionString);
    return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}${url.pathname}`;
  } catch {
    return 'DATABASE_URL invalide';
  }
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private static readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;
  private heartbeat: NodeJS.Timeout | null = null;
  private keepAliveClient: PoolClient | null = null;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL est requis pour initialiser Prisma.');
    }

    const pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 1_000,
    });

    pool.on('error', (err) => {
      PrismaService.logger.warn(`pg pool error (ignoré) : ${err.message}`);
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`;
      PrismaService.logger.log(
        `Base de données connectée : ${formatDatabaseTarget(process.env.DATABASE_URL)}`,
      );
    } catch (error) {
      PrismaService.logger.error(
        `Connexion Prisma impossible (${formatDatabaseTarget(process.env.DATABASE_URL)}). ` +
          "Si tu utilises Prisma dev, lance `npm run db:dev`, puis `npm run db:sync` avant de relancer l'API.",
      );
      throw error;
    }

    // Connexion dédiée au keep-alive : empêche la base de se mettre en veille
    await this.acquireKeepAlive();

    // Ping toutes les 5 s — maintient la connexion dédiée et détecte les coupures
    this.heartbeat = setInterval(() => void this.pingKeepAlive(), 5_000);
  }

  private async acquireKeepAlive() {
    try {
      this.keepAliveClient = await this.pool.connect();
      await this.keepAliveClient.query('SELECT 1');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      PrismaService.logger.warn(`Keep-alive initial échoué : ${msg}`);
      this.keepAliveClient = null;
    }
  }

  private async pingKeepAlive() {
    if (!this.keepAliveClient) {
      await this.acquireKeepAlive();
      return;
    }
    try {
      await this.keepAliveClient.query('SELECT 1');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      PrismaService.logger.warn(`Heartbeat DB échoué (${msg}), reconnexion…`);
      try { this.keepAliveClient.release(true); } catch { /* ignore */ }
      this.keepAliveClient = null;
      await this.acquireKeepAlive();
    }
  }

  async onModuleDestroy() {
    if (this.heartbeat) clearInterval(this.heartbeat);
    try { this.keepAliveClient?.release(); } catch { /* ignore */ }
    await this.$disconnect();
    await this.pool.end();
  }
}

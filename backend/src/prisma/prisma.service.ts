import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

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

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL est requis pour initialiser Prisma.');
    }

    const pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    // Absorbe les erreurs de connexion idle pour éviter les crash non gérés
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
    } catch (error) {
      PrismaService.logger.error(
        `Connexion Prisma impossible (${formatDatabaseTarget(process.env.DATABASE_URL)}). ` +
          "Si tu utilises Prisma dev, lance `npm run db:dev`, puis `npm run db:sync` avant de relancer l'API.",
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}

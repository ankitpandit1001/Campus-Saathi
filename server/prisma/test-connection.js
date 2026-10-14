import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const url = process.env.DATABASE_URL || '';
if (!url || url.includes('localhost:5432') || url.includes('postgres:postgres@')) {
  console.log('[Status] Ready: Waiting for Neon connection string to be placed in server/.env');
  process.exit(2);
}

const normalizedUrl = url.replace(/([?&])channel_binding=[^&]+(&|$)/, (m, p1, p2) => (p2 === '&' ? p1 : ''));

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: normalizedUrl,
    },
  },
  log: ['error'],
});

async function testConnection() {
  try {
    console.log('[Test Connection] Connecting to remote PostgreSQL database...');
    const result = await prisma.$queryRaw`SELECT 1 as connected, current_database() as db_name`;
    const dbName = result[0]?.db_name || 'verified';
    console.log(`[Test Connection] SUCCESS: Handshake verified with database "${dbName}".`);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    // Sanitize any potential URL or credential strings in the error message
    const sanitizedMsg = (error.message || '').replace(/:[^:@\s]+@/, ':****@');
    console.error(`[Test Connection] ERROR: Handshake failed.`);
    console.error(`[Test Connection] Details: ${sanitizedMsg}`);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();

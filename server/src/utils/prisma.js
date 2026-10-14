import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Automatically sanitize Neon connection strings (Prisma engine does not support channel_binding)
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('channel_binding=')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL
    .replace(/([?&])channel_binding=[^&]+(&|$)/, (m, p1, p2) => (p2 === '&' ? p1 : ''))
    .replace(/[?&]$/, '');
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;

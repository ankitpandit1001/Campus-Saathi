import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbProvider = process.env.DB_PROVIDER || 'sqlite';
const schemaPath = dbProvider === 'postgresql' ? 'prisma/schema.prisma' : 'prisma/schema.sqlite.prisma';

console.log(`[CampusFix DB Setup] Target Provider: ${dbProvider}`);
console.log(`[CampusFix DB Setup] Schema File: ${schemaPath}`);

try {
  console.log('[CampusFix DB Setup] Generating Prisma Client...');
  execSync(`npx prisma generate --schema=${schemaPath}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: process.env,
  });

  console.log('[CampusFix DB Setup] Synchronizing Database Schema...');
  execSync(`npx prisma db push --schema=${schemaPath} --force-reset --accept-data-loss`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: process.env,
  });

  console.log('[CampusFix DB Setup] Seeding database with initial data...');
  execSync(`node prisma/seed.js`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: process.env,
  });

  console.log('[CampusFix DB Setup] Database setup and seed completed successfully!');
} catch (error) {
  console.error('[CampusFix DB Setup] Failed to setup database:', error.message);
  process.exit(1);
}

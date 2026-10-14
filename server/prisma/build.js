import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';
const dbProvider = process.env.DB_PROVIDER || (isProduction ? 'postgresql' : 'sqlite');
const schemaPath = dbProvider === 'postgresql' ? 'prisma/schema.prisma' : 'prisma/schema.sqlite.prisma';

console.log(`[CampusSaathi Build] Target Database Provider: ${dbProvider}`);
console.log(`[CampusSaathi Build] Generating Prisma Client from: ${schemaPath}`);

try {
  execSync(`npx prisma generate --schema=${schemaPath}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: process.env,
  });
  console.log('[CampusSaathi Build] Prisma client generated successfully!');
} catch (error) {
  console.error('[CampusSaathi Build] Failed to generate Prisma client:', error.message);
  process.exit(1);
}

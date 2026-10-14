import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || (isProduction ? '0.0.0.0' : '127.0.0.1');

app.listen(PORT, HOST, () => {
  console.log(`===================================================`);
  console.log(` CampusSaathi Backend Server is Running!`);
  console.log(` Base URL: http://${HOST}:${PORT}`);
  console.log(` Healthcheck: http://${HOST}:${PORT}/api/health`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===================================================`);
});


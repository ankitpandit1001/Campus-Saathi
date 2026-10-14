import jwt from 'jsonwebtoken';
import crypto from 'crypto';

function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  console.warn('[Security Warning] JWT_SECRET not found in environment. Generating ephemeral fallback secret.');
  return crypto.randomBytes(32).toString('hex');
}

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });
  } catch (error) {
    return null;
  }
}

export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  };
}


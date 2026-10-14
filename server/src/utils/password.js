import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(plainTextPassword) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainTextPassword, salt);
}

export async function comparePassword(plainTextPassword, hash) {
  if (!plainTextPassword || !hash) return false;
  return bcrypt.compare(plainTextPassword, hash);
}

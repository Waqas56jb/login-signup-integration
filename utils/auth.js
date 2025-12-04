import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Hash password
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate session token
export const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Calculate expiration date (default: 7 days)
export const getSessionExpiration = (days = 7) => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  return expirationDate;
};


import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const hashToken = async (token: string): Promise<string> => {
  return await bcrypt.hash(token, SALT_ROUNDS);
};

export const verifyTokenHash = async (token: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(token, hash);
};
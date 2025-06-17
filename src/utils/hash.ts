import bcrypt from 'bcrypt'

export function hashToken(token: string) {
  return bcrypt.hash(token, 10)
}

export function verifyHash(token: string, hash: string) {
  return bcrypt.compare(token, hash)
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}
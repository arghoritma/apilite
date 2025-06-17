import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const ACCESS_SECRET = process.env.ACCESS_SECRET as string
const REFRESH_SECRET = process.env.REFRESH_SECRET as string


export function signAccessToken(userId: string) {
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: '10m' })
}

export function signRefreshToken(userId: string, deviceId: string) {
  return jwt.sign({ userId, deviceId }, REFRESH_SECRET, { expiresIn: '30d' })
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET)
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET)
}
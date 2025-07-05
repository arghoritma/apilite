import db from '../config/database'
import { v4 as uuid } from 'uuid'

export interface CreateSessionData {
  userId: string
  deviceId: string
  userAgent: string
  ip: string
  expiredAt: Date
}

export interface SessionData {
  id: string
  user_id: string
  device_id: string
  ip_address: string
  user_agent: string
  is_active: boolean
  created_at: Date
  last_used_at: Date
  expired_at: Date
}

export class SessionService {
  async createSession(data: CreateSessionData): Promise<SessionData> {
    const sessionId = uuid()

    const [session] = await db('user_sessions').insert({
      id: sessionId,
      user_id: data.userId,
      device_id: data.deviceId,
      user_agent: data.userAgent,
      ip_address: data.ip,
      is_active: true,
      last_used_at: new Date(),
      expired_at: data.expiredAt,
      created_at: new Date()
    }).returning('*')

    return session
  }
  async saveRefreshToken(sessionId: string, tokenHash: string, expiredAt: Date): Promise<void> {
    await db('refresh_tokens').insert({
      id: uuid(),
      session_id: sessionId,
      token_hash: tokenHash,
      revoked: false,
      created_at: new Date(),
      expired_at: expiredAt
    })
  }
  async getValidRefreshToken(sessionId: string): Promise<string | null> {
    const token = await db('refresh_tokens')
      .where('session_id', sessionId)
      .where('revoked', false)
      .where('expired_at', '>', new Date())
      .orderBy('created_at', 'desc')
      .first()

    return token?.token_hash || null
  }
  async revokeRefreshTokens(sessionId: string): Promise<void> {
    await db('refresh_tokens')
      .where('session_id', sessionId)
      .update({ revoked: true })
  }
  async updateLastUsed(sessionId: string): Promise<void> {
    await db('user_sessions')
      .where('id', sessionId)
      .update({ last_used_at: new Date() })
  }
  async deactivateSession(sessionId: string): Promise<void> {
    await db('user_sessions')
      .where('id', sessionId)
      .update({ is_active: false })

    await this.revokeRefreshTokens(sessionId)
  }
  async deactivateAllUserSessions(userId: string): Promise<void> {
    const sessions = await db('user_sessions')
      .where('user_id', userId)
      .where('is_active', true)
      .select('id')

    await db('user_sessions')
      .where('user_id', userId)
      .update({ is_active: false })

    for (const session of sessions) {
      await this.revokeRefreshTokens(session.id)
    }
  }
  async getActiveSession(sessionId: string): Promise<SessionData | null> {
    return await db('user_sessions')
      .where('id', sessionId)
      .where('is_active', true)
      .where('expired_at', '>', new Date())
      .first()
  }
  async getUserSessions(userId: string): Promise<SessionData[]> {
    return await db('user_sessions')
      .where('user_id', userId)
      .where('is_active', true)
      .where('expired_at', '>', new Date())
      .orderBy('last_used_at', 'desc')
  }
}

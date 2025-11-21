import { db } from '../config/native-database'
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

    const session = db('user_sessions').insertReturning({
      id: sessionId,
      user_id: data.userId,
      device_id: data.deviceId,
      user_agent: data.userAgent,
      ip_address: data.ip,
      is_active: 1,
      last_used_at: new Date().toISOString(),
      expired_at: data.expiredAt.toISOString(),
      created_at: new Date().toISOString()
    }, ['*'])

    return session
  }

  async saveRefreshToken(sessionId: string, tokenHash: string, expiredAt: Date): Promise<void> {
    db('refresh_tokens').insert({
      id: uuid(),
      session_id: sessionId,
      token_hash: tokenHash,
      revoked: 0,
      created_at: new Date().toISOString(),
      expired_at: expiredAt.toISOString()
    })
  }

  async getValidRefreshToken(sessionId: string): Promise<string | null> {
    const token = db('refresh_tokens')
      .where('session_id', sessionId)
      .where('revoked', 0)
      .where('expired_at', '>', new Date().toISOString())
      .orderBy('created_at', 'desc')
      .first()

    return token?.token_hash || null
  }

  async revokeRefreshTokens(sessionId: string): Promise<void> {
    db('refresh_tokens')
      .where('session_id', sessionId)
      .update({ revoked: 1 })
  }

  async updateLastUsed(sessionId: string): Promise<void> {
    db('user_sessions')
      .where('id', sessionId)
      .update({ last_used_at: new Date().toISOString() })
  }

  async deactivateSession(sessionId: string): Promise<void> {
    db('user_sessions')
      .where('id', sessionId)
      .update({ is_active: 0 })

    await this.revokeRefreshTokens(sessionId)
  }

  async deactivateAllUserSessions(userId: string): Promise<void> {
    const sessions = db('user_sessions')
      .where('user_id', userId)
      .where('is_active', 1)
      .select(['id'])

    db('user_sessions')
      .where('user_id', userId)
      .update({ is_active: 0 })

    for (const session of sessions) {
      await this.revokeRefreshTokens(session.id)
    }
  }

  async getActiveSession(sessionId: string): Promise<SessionData | null> {
    const session = db('user_sessions')
      .where('id', sessionId)
      .where('is_active', 1)
      .where('expired_at', '>', new Date().toISOString())
      .first()

    return session || null
  }

  async getUserSessions(userId: string): Promise<SessionData[]> {
    return db('user_sessions')
      .where('user_id', userId)
      .where('is_active', 1)
      .where('expired_at', '>', new Date().toISOString())
      .orderBy('last_used_at', 'desc')
      .select(['*'])
  }
}

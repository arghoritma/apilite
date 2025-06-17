import { db } from '../config/database'

export class SessionService {
  async createSession(data: {
    userId: string
    deviceId: string
    userAgent: string
    ip: string
    expiredAt: Date
  }) {
    return await db('user_sessions').insert({
      ...data,
      is_active: true,
      created_at: new Date(),
    }).returning('*')
  }

  async saveRefreshToken(sessionId: string, hashedToken: string) {
    return await db('refresh_tokens').insert({
      session_id: sessionId,
      token_hash: hashedToken,
      created_at: new Date(),
      expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
  }

  async deactivateSession(userId: string, deviceId: string) {
    return await db('user_sessions')
      .where({ user_id: userId, device_id: deviceId })
      .update({ is_active: false })
  }
}


//a
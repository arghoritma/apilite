import { signAccessToken, signRefreshToken } from '../utils/jwt'
import { hashToken, verifyHash } from '../utils/hash'
import redis from './redis'
import { SessionService } from './session'

export class AuthService {
  constructor(private sessionService: SessionService) { }

  async login(user: any, userAgent: string, ip: string) {
    const deviceId = crypto.randomUUID()
    const accessToken = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id, deviceId)

    const session = await this.sessionService.createSession({
      userId: user.id,
      deviceId,
      userAgent,
      ip,
      expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 hari
    })

    const hashedToken = await hashToken(refreshToken)

    await redis.set(
      `session:${user.id}:${deviceId}`,
      JSON.stringify({
        sessionId: session?.id,
        refreshToken,
        userAgent,
        ip,
        createdAt: new Date(),
        expiredAt: session.expiredAt,
      }),
      { EX: 60 * 60 * 24 * 30 } // TTL 30 hari
    )

    await this.sessionService.saveRefreshToken(session.id, hashedToken)

    return { accessToken, refreshToken }
  }

  async revalidate(userId: string, deviceId: string, token: string) {
    const data = await redis.get(`session:${userId}:${deviceId}`)
    if (!data) throw new Error('Session not found')

    const parsed = JSON.parse(data)
    const valid = parsed.refreshToken === token
    if (!valid) throw new Error('Invalid token')

    const accessToken = signAccessToken(userId)
    return { accessToken }
  }

  async logout(userId: string, deviceId: string) {
    await redis.del(`session:${userId}:${deviceId}`)
    await this.sessionService.deactivateSession(userId, deviceId)
  }
}
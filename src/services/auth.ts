import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { hashToken, verifyTokenHash } from '../utils/hash';
import { RedisService } from './redis';
import { SessionService, CreateSessionData } from './session';
import db from '../config/database';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  session: {
    id: string;
    deviceId: string;
    expiresAt: Date;
  };
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private redis: RedisService;

  constructor(private sessionService: SessionService) {
    this.redis = new RedisService();
  }

  async login(user: any, userAgent: string, ip: string, deviceId?: string): Promise<LoginResult> {
    const finalDeviceId = deviceId || crypto.randomUUID();

    const sessionData: CreateSessionData = {
      userId: user.id,
      deviceId: finalDeviceId,
      userAgent,
      ip,
      expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    const session = await this.sessionService.createSession(sessionData);

    const accessToken = signAccessToken(user.id, session.id, finalDeviceId);
    const refreshToken = signRefreshToken(user.id, session.id, finalDeviceId);

    const hashedRefreshToken = await hashToken(refreshToken);
    await this.sessionService.saveRefreshToken(
      session.id,
      hashedRefreshToken,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );

    const cacheData = {
      sessionId: session.id,
      userId: user.id,
      deviceId: finalDeviceId,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      userAgent,
      ip,
      createdAt: session.created_at,
      expiredAt: session.expired_at
    };

    if (await this.redis.isReallyAvailable()) {
      await this.redis.set(
        `session:${session.id}`,
        JSON.stringify(cacheData),
        "EX",
        60 * 60 * 24 * 30
      );

      const client = this.redis.getClient();
      await client.sadd(`user_sessions:${user.id}`, session.id);
      await client.expire(`user_sessions:${user.id}`, 60 * 60 * 24 * 30);
      console.log('⚡ Session cached in Redis');
    } else {
      console.warn('⚠️ Redis not available, skipping session caching');
    }


    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      session: {
        id: session.id,
        deviceId: finalDeviceId,
        expiresAt: session.expired_at
      }
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<RefreshResult> {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const { userId, sessionId, deviceId } = decoded;

      let cachedSession = null;
      try {
        const cached = await this.redis.get(`session:${sessionId}`);
        if (cached) {
          cachedSession = JSON.parse(cached);
        }
      } catch (redisError) {
        console.error('Redis error during refresh:', redisError);
      }

      const dbSession = await this.sessionService.getActiveSession(sessionId);
      if (!dbSession) {
        try {
          await this.redis.getClient().del(`session:${sessionId}`);
        } catch (redisError) {
          console.error('Redis delete error:', redisError);
        }
        throw new Error('Session expired or invalid');
      }

      const storedTokenHash = await this.sessionService.getValidRefreshToken(sessionId);
      if (!storedTokenHash) {
        throw new Error('Refresh token not found or expired');
      }

      const isValidToken = await verifyTokenHash(refreshToken, storedTokenHash);
      if (!isValidToken) {
        throw new Error('Invalid refresh token');
      }

      const newAccessToken = signAccessToken(userId, sessionId, deviceId);
      const newRefreshToken = signRefreshToken(userId, sessionId, deviceId);

      await this.sessionService.revokeRefreshTokens(sessionId);
      const newHashedToken = await hashToken(newRefreshToken);
      await this.sessionService.saveRefreshToken(
        sessionId,
        newHashedToken,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      );

      await this.sessionService.updateLastUsed(sessionId);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };

    } catch (error) {
      throw new Error(`Refresh token failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logout(sessionId: string): Promise<void> {
    try {
      if (this.redis.isAvailable()) {
        const cachedSession = await this.redis.get(`session:${sessionId}`);
        if (cachedSession) {
          const sessionData = JSON.parse(cachedSession);
          await this.redis.getClient().srem(`user_sessions:${sessionData.userId}`, sessionId);
        }

        await this.redis.getClient().del(`session:${sessionId}`);
      } else {
        throw new Error('Redis not available');
      }
    } catch (redisError) {
      console.warn('⚠️ Redis not available - proceeding with DB logout');
    }

    await this.sessionService.deactivateSession(sessionId);
  }

  async logoutAllDevices(userId: string): Promise<void> {
    try {
      if (this.redis.isAvailable()) {
        const client = this.redis.getClient();
        const sessionIds = await client.smembers(`user_sessions:${userId}`);

        if (sessionIds.length > 0) {
          const pipeline = client.pipeline();
          sessionIds.forEach(sessionId => {
            pipeline.del(`session:${sessionId}`);
          });
          pipeline.del(`user_sessions:${userId}`);
          await pipeline.exec();
        }
      } else {
        throw new Error('Redis not available');
      }
    } catch (redisError) {
      console.warn('⚠️ Redis not available - proceeding with DB logout');
    }

    await this.sessionService.deactivateAllUserSessions(userId);
  }

  async getSessionFromCache(sessionId: string): Promise<any | null> {
    try {
      const cached = await this.redis.get(`session:${sessionId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (redisError) {
      console.error('Redis error getting session:', redisError);
      return null;
    }
  }

  async getUserActiveSessions(userId: string): Promise<any[]> {
    const sessions = [];

    try {
      if (await this.redis.isReallyAvailable()) {
        const client = this.redis.getClient();
        const sessionIds = await client.smembers(`user_sessions:${userId}`);

        console.log(`⚡ Found ${sessionIds.length} sessions in Redis for user ${userId}`);

        for (const sessionId of sessionIds) {
          const sessionData = await this.getSessionFromCache(sessionId);
          if (sessionData) {
            sessions.push(sessionData);
          }
        }

        if (sessions.length === 0) {
          const dbSessions = await this.sessionService.getUserSessions(userId);

          for (const dbSession of dbSessions) {
            const user = await db('users')
              .where('id', userId)
              .select('id', 'name', 'email')
              .first();

            if (user) {
              const sessionData = {
                sessionId: dbSession.id,
                userId: dbSession.user_id,
                deviceId: dbSession.device_id,
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email
                },
                userAgent: dbSession.user_agent,
                ip: dbSession.ip_address,
                createdAt: dbSession.created_at,
                expiredAt: dbSession.expired_at
              };

              sessions.push(sessionData);

              try {
                await this.redis.set(
                  `session:${dbSession.id}`,
                  JSON.stringify(sessionData),
                  "EX",
                  60 * 60 * 24 * 30
                );
                await client.sadd(`user_sessions:${userId}`, dbSession.id);
              } catch (redisError) {
                console.error('Redis cache error:', redisError);
              }
            }
          }
        }
      } else {
        throw new Error('Redis not available');
      }

    } catch (error) {
      console.warn('⚠️ Redis not available - fetching sessions from DB');

      try {
        const dbSessions = await this.sessionService.getUserSessions(userId);

        for (const dbSession of dbSessions) {
          const user = await db('users')
            .where('id', userId)
            .select('id', 'name', 'email')
            .first();

          if (user) {
            sessions.push({
              sessionId: dbSession.id,
              userId: dbSession.user_id,
              deviceId: dbSession.device_id,
              user: {
                id: user.id,
                name: user.name,
                email: user.email
              },
              userAgent: dbSession.user_agent,
              ip: dbSession.ip_address,
              createdAt: dbSession.created_at,
              expiredAt: dbSession.expired_at
            });
          }
        }
      } catch (dbError) {
        console.error('Database error getting sessions:', dbError);
      }
    }

    return sessions;
  }
}

import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { hashToken, verifyTokenHash } from '../utils/hash';
import redis from './redis';
import { SessionService, CreateSessionData } from './session';
import { db } from '../config/database';

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
  constructor(private sessionService: SessionService) {}

  async login(user: any, userAgent: string, ip: string, deviceId?: string): Promise<LoginResult> {
    const finalDeviceId = deviceId || crypto.randomUUID();
    
    // Buat session baru
    const sessionData: CreateSessionData = {
      userId: user.id,
      deviceId: finalDeviceId,
      userAgent,
      ip,
      expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 hari
    };

    const session = await this.sessionService.createSession(sessionData);

    // Generate tokens
    const accessToken = signAccessToken(user.id, session.id, finalDeviceId);
    const refreshToken = signRefreshToken(user.id, session.id, finalDeviceId);

    // Hash dan simpan refresh token
    const hashedRefreshToken = await hashToken(refreshToken);
    await this.sessionService.saveRefreshToken(
      session.id, 
      hashedRefreshToken, 
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );

    // Cache session data di Redis
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

    try {
      await redis.setex(
        `session:${session.id}`,
        60 * 60 * 24 * 30, // 30 hari
        JSON.stringify(cacheData)
      );

      // Cache user sessions list
      await redis.sadd(`user_sessions:${user.id}`, session.id);
      await redis.expire(`user_sessions:${user.id}`, 60 * 60 * 24 * 30);
    } catch (redisError) {
      console.error('Redis cache error during login:', redisError);
      // Continue without cache if Redis fails
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
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      const { userId, sessionId, deviceId } = decoded;

      // Cek session di cache
      let cachedSession = null;
      try {
        const cached = await redis.get(`session:${sessionId}`);
        if (cached) {
          cachedSession = JSON.parse(cached);
        }
      } catch (redisError) {
        console.error('Redis error during refresh:', redisError);
      }

      // Validasi session di database
      const dbSession = await this.sessionService.getActiveSession(sessionId);
      if (!dbSession) {
        // Hapus dari cache jika session tidak valid
        try {
          await redis.del(`session:${sessionId}`);
        } catch (redisError) {
          console.error('Redis delete error:', redisError);
        }
        throw new Error('Session expired or invalid');
      }

      // Validasi refresh token hash
      const storedTokenHash = await this.sessionService.getValidRefreshToken(sessionId);
      if (!storedTokenHash) {
        throw new Error('Refresh token not found or expired');
      }

      const isValidToken = await verifyTokenHash(refreshToken, storedTokenHash);
      if (!isValidToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const newAccessToken = signAccessToken(userId, sessionId, deviceId);
      const newRefreshToken = signRefreshToken(userId, sessionId, deviceId);

      // Revoke old refresh token dan simpan yang baru
      await this.sessionService.revokeRefreshTokens(sessionId);
      const newHashedToken = await hashToken(newRefreshToken);
      await this.sessionService.saveRefreshToken(
        sessionId,
        newHashedToken,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      );

      // Update last used
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
      // Hapus dari cache
      const cachedSession = await redis.get(`session:${sessionId}`);
      if (cachedSession) {
        const sessionData = JSON.parse(cachedSession);
        await redis.srem(`user_sessions:${sessionData.userId}`, sessionId);
      }
      
      await redis.del(`session:${sessionId}`);
    } catch (redisError) {
      console.error('Redis error during logout:', redisError);
    }
    
    // Deactivate session di database
    await this.sessionService.deactivateSession(sessionId);
  }

  async logoutAllDevices(userId: string): Promise<void> {
    try {
      // Hapus semua session dari cache
      const sessionIds = await redis.smembers(`user_sessions:${userId}`);
      
      if (sessionIds.length > 0) {
        const pipeline = redis.pipeline();
        sessionIds.forEach(sessionId => {
          pipeline.del(`session:${sessionId}`);
        });
        pipeline.del(`user_sessions:${userId}`);
        await pipeline.exec();
      }
    } catch (redisError) {
      console.error('Redis error during logout all:', redisError);
    }
    
    // Deactivate semua session di database
    await this.sessionService.deactivateAllUserSessions(userId);
  }

  async getSessionFromCache(sessionId: string): Promise<any | null> {
    try {
      const cached = await redis.get(`session:${sessionId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (redisError) {
      console.error('Redis error getting session:', redisError);
      return null;
    }
  }

  async getUserActiveSessions(userId: string): Promise<any[]> {
    const sessions = [];

    try {
      // Coba ambil dari Redis cache terlebih dahulu
      const sessionIds = await redis.smembers(`user_sessions:${userId}`);
      
      for (const sessionId of sessionIds) {
        const sessionData = await this.getSessionFromCache(sessionId);
        if (sessionData) {
          sessions.push(sessionData);
        }
      }

      // Jika tidak ada di cache, ambil dari database
      if (sessions.length === 0) {
        const dbSessions = await this.sessionService.getUserSessions(userId);
        
        for (const dbSession of dbSessions) {
          // Get user data
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

            // Cache the session data
            try {
              await redis.setex(
                `session:${dbSession.id}`,
                60 * 60 * 24 * 30,
                JSON.stringify(sessionData)
              );
              await redis.sadd(`user_sessions:${userId}`, dbSession.id);
            } catch (redisError) {
              console.error('Redis cache error:', redisError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error getting user sessions:', error);
      
      // Fallback ke database jika Redis error
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

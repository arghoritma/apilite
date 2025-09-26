import { Request, Response, NextFunction } from "ultimate-express";
import { verifyAccessToken } from "../utils/jwt";
import { AuthService } from "../services/auth";
import { SessionService } from "../services/session";
import { RedisService } from "../services/redis";
import db from "../config/database";
import dotenv from "dotenv";
dotenv.config();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    sessionId: string;
    deviceId: string;
  };
}

const sessionService = new SessionService();
const authService = new AuthService(sessionService);
const redisService = new RedisService();

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        code: 'NO_TOKEN',
        message: "Access token is required"
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Verify access token
    const decoded = verifyAccessToken(token);
    const { userId, sessionId, deviceId } = decoded;


    // Cek session di cache terlebih dahulu
    let cachedSession = null;

    if (redisService.isAvailable()) {
      cachedSession = await authService.getSessionFromCache(sessionId);
    }

    if (cachedSession) {
      // Session ditemukan di cache
      (req as AuthRequest).user = {
        id: cachedSession.user.id,
        name: cachedSession.user.name,
        email: cachedSession.user.email,
        sessionId: cachedSession.sessionId,
        deviceId: cachedSession.deviceId
      };
      return next();
    }

    // Jika tidak ada di cache, cek database
    const dbSession = await sessionService.getActiveSession(sessionId);
    if (!dbSession) {
      res.status(401).json({
        code: 'SESSION_EXPIRED',
        message: "Session expired or invalid"
      });
      return;
    }

    // Get user data
    const user = await db('users')
      .where('id', userId)
      .select('id', 'name', 'email')
      .first();

    if (!user) {
      res.status(401).json({
        code: 'USER_NOT_FOUND',
        message: "User not found"
      });
      return;
    }



    if (await redisService.isReallyAvailable()) {
      // Update cache
      const cacheData = {
        sessionId: dbSession.id,
        userId: user.id,
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
      try {
        await redisService.set(`session:${sessionId}`, JSON.stringify(cacheData), "EX", 60 * 60 * 24 * 30);
        console.log('⚡ Session cache updated in Redis');
      } catch (error) {
        console.error('Redis error setting session:', error);
      }
    } else {
      console.warn('⚠️ Redis not available - skipping cache update');
    }

    (req as AuthRequest).user = {
      id: user.id,
      name: user.name,
      email: user.email,
      sessionId: dbSession.id,
      deviceId: dbSession.device_id
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      code: 'AUTH_ERROR',
      message: "Invalid or expired token",
      error: error.message,
    });
    return;
  }
};

import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const ACCESS_SECRET = process.env.ACCESS_SECRET as string
const REFRESH_SECRET = process.env.REFRESH_SECRET as string

export interface AccessTokenPayload {
  userId: string;
  sessionId: string;
  deviceId: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  deviceId: string;
  type: 'refresh';
}



export const signAccessToken = (userId: string, sessionId: string, deviceId: string): string => {
  return jwt.sign(
    {
      userId,
      sessionId,
      deviceId,
      type: 'access'
    } as AccessTokenPayload,
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

export const signRefreshToken = (userId: string, sessionId: string, deviceId: string): string => {
  return jwt.sign(
    {
      userId,
      sessionId,
      deviceId,
      type: 'refresh'
    } as RefreshTokenPayload,
    REFRESH_SECRET,
    { expiresIn: '30d' }
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
};


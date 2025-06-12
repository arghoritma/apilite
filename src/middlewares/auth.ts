import { Request, Response, NextFunction } from "ultimate-express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { db } from "../config/database";
import dotenv from "dotenv";
import redisClient from "@/services/redisClient";
dotenv.config;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    session_id: string;
  };
}

interface TokenPayload extends JwtPayload {
  session_id: string;
}

interface dbSession {
  id: string;
  user_id: string;
  is_active: number;
  expired_at: number;
  name: string;
  email: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    const { session_id } = decoded;

    // Get user_id from chached

    const cachedSession = await redisClient.get(session_id);

    if (cachedSession) {
      console.log("Chace hit");
      req.user = JSON.parse(cachedSession);
      return next();
    }

    //TODO

    const session = await db("sessions")
      .join("users", "sessions.user_id", "users.id")
      .where("sessions.id", session_id)
      .andWhere("sessions.is_active", 1)
      .andWhere("sessions.expired_at", ">", new Date())
      .select("sessions.*", "users.id as user_id", "users.name as name", "users.email email")
      .first();


    if (!session) {
      res
        .status(401)
        .json({ message: "Sesi tidak valid atau telah kedaluwarsa" });
    }

    const sessionData = JSON.stringify(session);
    await redisClient.set(session_id, sessionData, { EX: 3600 });

    req.user = {
      id: session.user_id,
      name: session.name,
      email: session.email,
      session_id
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      message: "Invalid token",
      error: error.message,
    });
    return;
  }
};

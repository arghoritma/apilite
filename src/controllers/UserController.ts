import { Request, Response } from 'ultimate-express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { v4 as uuid } from 'uuid'
import redisClient from '../services/redisClient';
import { getExpiryTime } from '../utils/helper';

interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string,
    email: string,
    session_id: string;
  };
}

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Get generated id
      const id = uuid();

      // Create user
      const [userId] = await db('users').insert({
        id,
        name,
        email,
        password: hashedPassword
      });

      res.status(201).json({
        message: 'User registered successfully',
        userId
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error registering user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await db('users').where({ email }).first();
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      const sessionId = uuid();
      const expiresAt = getExpiryTime(1)

      // Add session

      const [session] = await db("sessions").insert({
        id: sessionId,
        user_id: user.id,
        expired_at: expiresAt,
      }).returning("*")

      const sessionData = JSON.stringify({
        ...session,
        name: user.name,
        email: user.email,
      })

      // Chache in redis

      await redisClient.set(sessionId, sessionData, { EX: 3600 })

      // Generate JWT token
      const token = jwt.sign(
        { session_id: sessionId },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Login successful',
        token
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error logging in',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async logout(req: AuthRequest, res: Response) {
    try {
      const sessionId = req.user?.session_id;

      if (!sessionId) {
        return res.status(400).json({ message: 'No active session' });
      }

      // Delete session
      await db("sessions").where({ id: sessionId }).del();

      // Delete cache
      await redisClient.del(sessionId);

      res.json({ message: 'Logout successful' });
    } catch (error) {
      res.status(500).json({
        message: 'Error logging out',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const user = await db('users')
        .where({ id: userId })
        .select('id', 'name', 'email')
        .first();

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
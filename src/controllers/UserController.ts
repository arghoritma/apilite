import { Request, Response } from 'ultimate-express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const [userId] = await db('users').insert({
        username,
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

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
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

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const user = await db('users')
        .where({ id: userId })
        .select('id', 'username', 'email')
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
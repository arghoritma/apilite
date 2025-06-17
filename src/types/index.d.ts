export interface UserPayload {
  id: string;
  name: string;
  email: string;
  sessionId: string;
  deviceId: string;
}

// Lakukan "declaration merging" untuk menambahkan properti custom ke interface Request
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload; // Gunakan '?' karena properti ini tidak ada di semua request
    }
  }
}
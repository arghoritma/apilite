import express from "ultimate-express";
import dotenv from "dotenv";
import userRoutes from './routes/userRoutes';
import { db } from './config/database';
import MigrateLatest from './commands/migrate-latest';
// Load environment variables
dotenv.config();

// Create Express instance
const app = express();

// Parse JSON bodies
app.use(express.json());

// API routes
app.use('/api/users', userRoutes);

// Run migrations

(async () => {
  await MigrateLatest.run()
})()

// Test database connection
try {
  db.raw('SELECT 1')
    .then(() => {
      console.log('Database connected successfully');
    })
    .catch((error) => {
      console.error('Database connection failed:', error);
      process.exit(1);
    });
  console.log('Database connected successfully');
} catch (error) {
  console.error('Database connection failed:', error);
  process.exit(1);
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
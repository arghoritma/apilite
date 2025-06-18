import express from "ultimate-express";
import dotenv from "dotenv";
import Routers from "./routes";
import { db } from "./config/database";
import MigrateLatest from "./commands/migrate-latest";
import redis from "./services/redis";

// Load environment variables
dotenv.config();

// Create Express instance
const app = express();

// Parse JSON bodies
app.use(express.json());

// API routes
app.use("/api", Routers);

// Run migrations

// Serve static files
app.use(express.static("public"));

// Test Redis connection
(async () => {
  try {
    await redis.connect();
    await redis.ping();
    console.log("Redis test: Connection and ping successful 🚀");
    await redis.disconnect();
  } catch (error) {
    console.error("Redis test: Connection or ping failed ❌", error);
    process.exit(1);
  }
})();

(async () => {
  await MigrateLatest.run();
})();

// Test database connection
try {
  db.raw("SELECT 1")
    .then(() => {
      console.log("Database connected successfully 🚀");
    })
    .catch((error) => {
      console.error("Database connection failed:", error);
      process.exit(1);
    });
  console.log("Database connected successfully");
} catch (error) {
  console.error("Database connection failed:", error);
  process.exit(1);
}

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

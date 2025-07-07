import express from "ultimate-express";
import dotenv from "dotenv";
import Routers from "./routes";
import { checkDatabaseConnection } from "./config/database";
import { RedisService } from "./services/redis";

// Load environment variables
dotenv.config();

// Create Express instance
const app = express();

// Parse JSON bodies
app.use(express.json());

// API routes
app.use("/api", Routers);

// Serve static files
app.use(express.static("public"));
// Test Redis connection

const redisService = new RedisService();

(async () => {
  await redisService.checkConnection();
  await checkDatabaseConnection()
})();


// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

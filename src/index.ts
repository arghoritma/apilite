import express from "ultimate-express";
import dotenv from "dotenv";
import Routers from "./routes";
import { checkDatabaseConnection } from "./config/database";
import { RedisService } from "./services/redis";
import { WebSocketService } from './services/websocket';

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

  if (await redisService.isReallyAvailable()) {
    console.log("⚡ Redis connected successfully");
  } else {
    console.warn("⚠️ Redis connection failed - continuing without Redis");
  }

  await checkDatabaseConnection()
})();


// Start the server
const PORT = process.env.PORT || 3000;

// Create HTTP server and attach WebSocket
const wsService = new WebSocketService(app);

// Export wsService for controller usage
export { wsService };

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server attached.`);
});

import { Router } from "ultimate-express";
import WebSocketController from "../controllers/WebSocketController";

const router = Router();

// Public endpoint to broadcast message to all websocket clients
router.post("/broadcast", WebSocketController.broadcast);

export default router;

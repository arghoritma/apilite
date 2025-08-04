import { Request, Response } from "ultimate-express";
import { wsService } from "../index";

export default class WebSocketController {
  static broadcast(req: Request, res: Response) {
    const { type, payload } = req.body;
    if (!type) {
      return res.status(400).json({ code: "VALIDATION_ERROR", message: "type is required" });
    }
    wsService.broadcast({ type, payload });
    res.json({ code: "SUCCESS", message: "Broadcast sent" });
  }
}

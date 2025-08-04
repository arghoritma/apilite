import UltimateWS from 'ultimate-ws';

interface WebSocketBroadcastMessage {
  type: string;
  payload: any;
}

export class WebSocketService {
  private wss: any;
  private clients: Set<any> = new Set();
  constructor(app: any) {
    // app = instance express/ultimate-express
    this.wss = new (UltimateWS as any).WebSocketServer({
      server: app,
      path: '/ws',
    });
    this.wss.on('connection', (ws: any) => {
      this.clients.add(ws);
      ws.on('close', () => this.clients.delete(ws));
    });
  }
  broadcast(message: WebSocketBroadcastMessage) {
    const data = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === 1) { // 1 = OPEN
        client.send(data);
      }
    }
  }
}


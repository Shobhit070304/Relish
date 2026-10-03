import { WebSocketServer } from "ws";

let wss = null;

export function initWebSocketServer(httpServer) {
    if (!wss) {
        wss = new WebSocketServer({ server: httpServer });
    }

    wss.on('connection', (ws) => {
        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true });
    })

    // Heartbeat interval to cleanup dead connections
    const interval = setInterval(() => {
        if (!wss) return;
        for (const ws of wss.clients) {
            if (!ws.isAlive) {
                ws.terminate();
                continue;
            }

            ws.isAlive = false;
            ws.ping();
        }
    }, 30000);

    wss.on('close', () => clearInterval(interval));
}


export function broadcastDishUpdate(dish) {
    if (!wss) return;
    const message = JSON.stringify({ type: 'DISH_UPDATED', dish });
    for (const client of wss.clients) {
        if (client.readyState === 1) {
            client.send(message);
        }
    }
}
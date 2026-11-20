import { DurableObject } from "cloudflare:workers";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, service: "pirakubdg-realtime" }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
      return new Response("PirakuBDG Realtime Worker Ready. Connect via WebSocket.", {
        status: 200,
        headers: CORS_HEADERS
      });
    }

    let doName = null;
    if (url.pathname === "/ws/global") {
      doName = "global-presence";
    } else if (url.pathname.startsWith("/ws/room/")) {
      const roomId = decodeURIComponent(url.pathname.slice("/ws/room/".length)).trim() || "bandung_wetan";
      doName = "room:" + roomId;
    }

    if (!doName) {
      return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
    }

    const id = env.ROOM_DO.idFromName(doName);
    const stub = env.ROOM_DO.get(id);
    return stub.fetch(request);
  }
};

export class PirakuRoomDO extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    if (typeof WebSocketRequestResponsePair !== "undefined" && typeof this.ctx.setWebSocketAutoResponse === "function") {
      this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('{"type":"ping"}', '{"type":"pong"}'));
    }
  }

  async fetch(request) {
    const url = new URL(request.url);
    const sessionId = (url.searchParams.get("sessionId") || "").trim() || crypto.randomUUID();

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ sessionId, presence: null });

    // Send initial presence snapshot to the newly connected client
    try {
      server.send(JSON.stringify({ type: "presence_sync", state: this.buildPresenceState() }));
    } catch (_) {}

    return new Response(null, { status: 101, webSocket: client });
  }

  buildPresenceState(excludeWs = null) {
    const state = {};
    for (const ws of this.ctx.getWebSockets()) {
      if (excludeWs && ws === excludeWs) continue;
      if (ws.readyState !== undefined && ws.readyState !== 1) continue;
      const att = ws.deserializeAttachment();
      if (att && att.sessionId && att.presence) {
        state[att.sessionId] = [att.presence];
      }
    }
    return state;
  }

  broadcastPresenceSync(excludeWs = null) {
    const msg = JSON.stringify({ type: "presence_sync", state: this.buildPresenceState(excludeWs) });
    for (const ws of this.ctx.getWebSockets()) {
      if (excludeWs && ws === excludeWs) continue;
      if (ws.readyState !== undefined && ws.readyState !== 1) continue;
      try {
        ws.send(msg);
      } catch (_) {}
    }
  }

  async webSocketMessage(ws, rawMessage) {
    let data;
    try {
      data = JSON.parse(typeof rawMessage === "string" ? rawMessage : new TextDecoder().decode(rawMessage));
    } catch (_) {
      return;
    }
    if (!data || typeof data !== "object") return;

    if (data.type === "ping") {
      try { ws.send('{"type":"pong"}'); } catch (_) {}
      return;
    }

    const att = ws.deserializeAttachment() || { sessionId: "", presence: null };

    if (data.type === "track") {
      ws.serializeAttachment({
        sessionId: att.sessionId,
        presence: data.payload && typeof data.payload === "object" ? data.payload : {}
      });
      this.broadcastPresenceSync();
      return;
    }

    if (data.type === "broadcast" && data.event) {
      const out = JSON.stringify({
        type: "broadcast",
        event: data.event,
        payload: data.payload
      });

      // Route targeted WebRTC signaling directly to payload.to when present
      const targetSid = data.payload && typeof data.payload.to === "string" ? data.payload.to : null;
      if (targetSid) {
        for (const peer of this.ctx.getWebSockets()) {
          if (peer === ws) continue;
          if (peer.readyState !== undefined && peer.readyState !== 1) continue;
          const peerAtt = peer.deserializeAttachment();
          if (peerAtt && peerAtt.sessionId === targetSid) {
            try { peer.send(out); } catch (_) {}
          }
        }
        return;
      }

      for (const peer of this.ctx.getWebSockets()) {
        if (peer === ws) continue;
        if (peer.readyState !== undefined && peer.readyState !== 1) continue;
        try {
          peer.send(out);
        } catch (_) {}
      }
    }
  }

  async webSocketClose(ws) {
    let hadPresence = false;
    try {
      const att = ws.deserializeAttachment();
      hadPresence = Boolean(att && att.presence);
      ws.serializeAttachment(null);
    } catch (_) {}
    if (hadPresence) this.broadcastPresenceSync(ws);
  }

  async webSocketError(ws) {
    let hadPresence = false;
    try {
      const att = ws.deserializeAttachment();
      hadPresence = Boolean(att && att.presence);
      ws.serializeAttachment(null);
    } catch (_) {}
    if (hadPresence) this.broadcastPresenceSync(ws);
  }
}

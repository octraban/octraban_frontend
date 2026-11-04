/**
 * useEventStream
 * Connects to the backend WebSocket and calls onEvent for each incoming event.
 */
import { useEffect } from "react";
import { resolveWsUrl, type DecodedEvent } from "../api";

export function useEventStream(onEvent: (ev: DecodedEvent) => void) {
  useEffect(() => {
    const ws = new WebSocket(resolveWsUrl());

    ws.onmessage = (msg) => {
      try {
        const payload = JSON.parse(msg.data);
        if (payload.type === "event") onEvent(payload.data as DecodedEvent);
      } catch {
        /* ignore malformed frames */
      }
    };

    ws.onerror = (err) => console.error("[ws] error", err);

    return () => ws.close();
  }, []);
}

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // WebSocket devre dışı - sadece REST API kullanıyoruz
    console.log("WebSocket disabled - using REST API only");
  }, [queryClient]);

  return wsRef.current;
}

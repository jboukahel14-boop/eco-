import { useEffect, useRef, useCallback } from 'react';
import { useCartStore } from '@/store/cart-store';

type MessageHandler = (data: Record<string, unknown>) => void;

interface WebSocketOptions {
  onInventoryUpdate?: MessageHandler;
  onOrderConfirmed?: MessageHandler;
  onLowStockAlert?: MessageHandler;
}

export function useWebSocket(options: WebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number>();
  const fetchCart = useCartStore((s) => s.fetchCart);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.debug('[WS] Connected');
        if (reconnectRef.current) {
          clearTimeout(reconnectRef.current);
          reconnectRef.current = undefined;
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case 'inventory.updated':
              options.onInventoryUpdate?.(message.data);
              if (message.data.product_id) {
                fetchCart();
              }
              break;
            case 'order.confirmed':
              options.onOrderConfirmed?.(message.data);
              break;
            case 'low.stock.alert':
              options.onLowStockAlert?.(message.data);
              break;
          }
        } catch {
          console.debug('[WS] Raw message:', event.data);
        }
      };

      ws.onclose = () => {
        console.debug('[WS] Disconnected. Reconnecting in 5s...');
        reconnectRef.current = window.setTimeout(connect, 5000);
      };

      ws.onerror = (err) => {
        console.error('[WS] Error:', err);
        ws.close();
      };
    } catch (err) {
      console.error('[WS] Connection failed:', err);
      reconnectRef.current = window.setTimeout(connect, 5000);
    }
  }, [fetchCart, options]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { send };
}

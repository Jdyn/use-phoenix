import { PhoenixContext } from './usePhoenix';
import { PhoenixSocket, SocketConnectOption } from './usePhoenix/types';
import { Socket } from 'phoenix';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type PhoenixProviderProps = {
  url?: string;
  options?: Partial<SocketConnectOption>;
  children?: React.ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
};

export const cache = new Map<string, any>();

export function PhoenixProvider({ url, options, ...props }: PhoenixProviderProps) {
  const { children, onOpen, onClose, onError } = props;

  const [socket, set] = useState<PhoenixSocket | null>(null);
  const [isConnected, setConnected] = useState(false);
  const [isError, setError] = useState(false);

  const socketRef = useRef(socket);

  const _options = useMemo(() => options, [options]);

  const defaultListeners = useCallback(
    (socket: PhoenixSocket) => {
      socket.onMessage(({ event, payload, topic }) => {
        if (event === 'phx_reply') return;

        if (event === 'phx_close') {
          cache.forEach((_, key) => {
            if (key.startsWith(`${topic}:`)) {
              cache.delete(key);
            }
          });
        } else {
          cache.set(`${topic}:${event}`, payload);
        }
      });

      socket.onOpen(() => {
        setConnected(true);
        setError(false);

        /**
         * So when the socket experiences a disconnect, the
         * reconnect attempts will kick in. Once it suceeds,
         * for some reason I can't seem to get the existing
         * chhanels to work again. the `useChannel` internel
         * refs don't seem to get updated, so all push events
         * fail after reconnecting. Let's just clear the channels
         * and let the hooks recreate them.
         */
        socket.channels = [];

        onOpen?.();
      });

      socket.onClose(() => {
        setConnected(false);
        setError(false);

        onClose?.();
      });

      socket.onError(() => {
        setConnected(false);
        setError(true);

        onError?.();
      });
    },
    [onClose, onError, onOpen]
  );

  const connect = useCallback(
    (url: string, options?: Partial<SocketConnectOption>): PhoenixSocket => {
      const socket = new Socket(url, options ?? {}) as PhoenixSocket;
      socket.connect();
      socketRef.current = socket;
      set(socket);
      defaultListeners(socket);

      return socket;
    },
    []
  );

  useEffect(() => {
    if (!url) return;

    const socket = connect(url, _options || {});

    return () => {
      if (url) socket.disconnect();
    };
  }, [url, _options, connect]);

  return (
    <PhoenixContext.Provider value={{ socket: socketRef.current, connect, isConnected, isError }}>
      {children}
    </PhoenixContext.Provider>
  );
}

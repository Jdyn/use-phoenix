import useLatest from './useLatest';
import { PhoenixContext } from './usePhoenix';
import { PhoenixSocket, SocketConnectOption } from './usePhoenix/types';
import { Socket } from 'phoenix';
import React, { useCallback, useEffect, useState } from 'react';

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

  const socketRef = useLatest(socket);

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

      if (onOpen) socket.onOpen(onOpen);
      if (onClose) socket.onClose(onClose);
      if (onError) socket.onError(onError);

      socket.onOpen(() => {
        setConnected(true);
      });

      socket.onClose(() => {
        setConnected(false);
      });
    },
    [onClose, onError, onOpen]
  );

  const connect = useCallback(
    (url: string, options?: Partial<SocketConnectOption>): PhoenixSocket => {
      const socket = new Socket(url, options ?? {}) as PhoenixSocket;
      socket.connect();
      set(socket);
      defaultListeners(socket);

      return socket;
    },
    [defaultListeners]
  );

  useEffect(() => {
    if (!url) return;

    const socket = connect(url, options);

    return () => {
      socket.disconnect();
    };
  }, [url, options, connect]);

  return (
    <PhoenixContext.Provider value={{ socket: socketRef.current, connect, isConnected }}>
      {children}
    </PhoenixContext.Provider>
  );
}

PhoenixProvider.defaultProps = {
  options: {},
  onOpen: null,
  onClose: null,
  onError: null,
  connect: true,
  children: null
};

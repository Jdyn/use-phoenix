import React, { useCallback, useEffect, useState } from "react";
import { Channel, Socket, SocketConnectOption } from "phoenix";
import useLatest from "./useLatest";

export type PhoenixSocket = Socket & { channels: Channel[] };

export type ConnectFunction = (url: string, options: Partial<SocketConnectOption>) => void;

const PhoenixContext = React.createContext<{
  socket: PhoenixSocket | null;
  connect: ConnectFunction;
}>({
  socket: null,
  connect: () => {},
});

export const useSocket = (): {
  socket: PhoenixSocket | null;
  connect: ConnectFunction;
} => React.useContext(PhoenixContext);

export type SocketProviderProps = {
  children?: React.ReactNode;
  options?: Partial<SocketConnectOption>;
  url?: string;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
};

export function PhoenixProvider(props: SocketProviderProps) {
  const { children, url, options } = props;
  const [socket, set] = useState<PhoenixSocket | null>(null);
  const socketRef = useLatest(socket);

  useEffect(() => {
    if (!url) return;

    connect(url, options);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [url, options]);

  const connect = useCallback((url: string, options?: Partial<SocketConnectOption>): void => {
    const { onOpen, onClose, onError } = props;

    if (socketRef.current) {
      socketRef.current?.disconnect();
    }

    const socket = new Socket(url, options ?? {}) as PhoenixSocket;
    socket.connect();
    set(socket);

    if (onOpen) socket.onOpen(onOpen);
    if (onClose) socket.onClose(onClose);
    if (onError) socket.onError(onError);
  }, []);

  return (
    <PhoenixContext.Provider value={{ socket: socketRef.current, connect }}>
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
  children: null,
};

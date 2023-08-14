import React, { useCallback, useEffect, useState } from "react";
import { Socket, SocketConnectOption } from "phoenix";

import { PhoenixSocket } from "./usePhoenix/types";
import useLatest from "./useLatest";
import { PhoenixContext } from "./usePhoenix";

export type PhoenixProviderProps = {
  children?: React.ReactNode;
  options?: Partial<SocketConnectOption>;
  url?: string;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
};

export function PhoenixProvider(props: PhoenixProviderProps) {
  const { children, url, options } = props;
  const [socket, set] = useState<PhoenixSocket | null>(null);
  const socketRef = useLatest(socket);

	const connect = useCallback((url: string, options?: Partial<SocketConnectOption>): void => {
    const { onOpen, onClose, onError } = props;

    const socket = new Socket(url, options ?? {}) as PhoenixSocket;
    socket.connect();
    set(socket);

    if (onOpen) {socket.onOpen(onOpen);}
    if (onClose) {socket.onClose(onClose);}
    if (onError) {socket.onError(onError);}
  }, []);

  useEffect(() => {
    if (!url) {return;}
		const localRef = socketRef.current;

    connect(url, options);

    return () => {
      localRef?.disconnect();
    };
  }, [url, options]);

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

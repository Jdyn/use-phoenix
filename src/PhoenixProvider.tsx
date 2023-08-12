import React, { useEffect } from "react";
import { Socket, SocketConnectOption } from "phoenix";

const PhoenixContext = React.createContext<Socket | null>(null);

export const useSocket = () => React.useContext(PhoenixContext);

export type SocketProviderProps = {
  children?: React.ReactNode;
  options?: SocketConnectOption;
  url: string;
  connect?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
};

export function PhoenixProvider(props: SocketProviderProps) {
  const { children, connect, url, options } = props;
  const socketRef = React.useRef<Socket | null>(null);

  function closeSocket() {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }

  useEffect(() => {
    const { onOpen, onClose, onError } = props;
    if (socketRef.current) {
      closeSocket();
    }

    if (!connect) return;

    const socket = new Socket(url, options);
    socket.connect();
    socketRef.current = socket;

    if (onOpen) socket.onOpen(onOpen);
    if (onClose) socket.onClose(onClose);
    if (onError) socket.onError(onError);

    return () => {
      closeSocket();
    };
  }, [connect, url, options]);

  return <PhoenixContext.Provider value={socketRef.current}>{children}</PhoenixContext.Provider>;
};

PhoenixProvider.defaultProps = {
  options: {},
  onOpen: null,
  onClose: null,
  onError: null,
  connect: true,
  children: null,
};

import { Channel, Socket, SocketConnectOption } from "phoenix";

export type PhoenixSocket = Socket & { channels: Channel[] };

export type ConnectFunction = (url: string, options: Partial<SocketConnectOption>) => void;

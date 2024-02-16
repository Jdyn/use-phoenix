import { Channel, MessageRef, Socket } from 'phoenix';

export type PhoenixSocket = {
  channels: Channel[];
  onMessage(callback: (message: {
    event: string;
    payload: Record<string, any>;
    ref: MessageRef;
    topic: string;
    join_ref: MessageRef;
  }) => void | Promise<void>): MessageRef;
} & Socket;

export interface SocketConnectOption {
  binaryType: BinaryType;
  params: Record<string, any> | (() => object);
  transport: new (endpoint: string) => object;
  timeout: number;
  heartbeatIntervalMs: number;
  longpollerTimeout: number;
  /** The function to encode outgoing messages, Defaults to JSON encoder */
  encode: (payload: object, callback: (encoded: any) => void | Promise<void>) => void;
  decode: (payload: string, callback: (decoded: any) => void | Promise<void>) => void;
  logger: (kind: string, message: string, data: any) => void;
  reconnectAfterMs: (tries: number) => number;
  rejoinAfterMs: (tries: number) => number;
  vsn: string;
}

/**
 * Connect to a Phoenix Socket
 * @param url The URL of the socket
 * @param options The options to pass to the socket connection
 */
export type ConnectFunction = (url: string, options: Partial<SocketConnectOption>) => void;

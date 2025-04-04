import { Channel, Push } from 'phoenix';
import { PhoenixSocket } from './usePhoenix';
import { ChannelMeta } from './useChannel';
export declare const findChannel: (socket: PhoenixSocket | null, topic: string) => Channel | undefined;
export declare const createMeta: <T>(isSuccess: ChannelMeta<T>["isSuccess"], isLoading: ChannelMeta<T>["isLoading"], isError: ChannelMeta<T>["isError"], error: ChannelMeta<T>["error"], data: ChannelMeta<T>["data"], status: ChannelMeta<T>["status"]) => ChannelMeta<T>;
export declare const pushPromise: <Response>(push: Push) => Promise<Response>;
export type Merge<A, B> = {
    [K in keyof A | keyof B]: K extends keyof A & keyof B ? A[K] | B[K] : K extends keyof B ? B[K] : K extends keyof A ? A[K] : never;
};

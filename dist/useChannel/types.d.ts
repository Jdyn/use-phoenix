import { Merge } from '../util';
export type { Push } from 'phoenix';
export { Channel } from 'phoenix';
export type ChannelState<JoinResposne> = Merge<ChannelMeta<JoinResposne>, {
    leave: () => void;
    push: PushFunction;
}>;
export type PushEvent = {
    event: string;
    data?: any;
};
export type ChannelStatus = 'joining' | 'success' | 'error' | 'internal server error' | 'connection timeout' | 'closed';
export type ChannelMeta<JoinResposne> = {
    data: JoinResposne | undefined;
    status: ChannelStatus;
    isSuccess: boolean;
    isLoading: boolean;
    isError: boolean;
    error: any;
};
export type PushFunction = <Event extends PushEvent, PushResponse = any>(event: Event['event'], data?: Event['data']) => Promise<PushResponse>;
export type ChannelOptions<Params = undefined> = {
    /**
     * The params to send to the server when joining the channel.
     */
    params?: Params extends Record<string, any> ? Params : undefined;
    /**
     * A boolean indicating whether the channel should wait until another
     * `useChannel` hook has connected to the topic instead of trying to
     * connect itself.
     *
     * This is useful for when you have multiple components that need to interact
     * with the same channel and only one of them should be responsible for
     * opening the channel with the correct data.
     *
     * Note that this option will ignore any `params` given if set to `true`.
     * Params should be passed to the `useChannel` hook that is meant to connect.
     * If there is no non-passive `useChannel` that connects, this hook will never connect.
     */
    passive?: boolean;
};
export type ChannelParams = Record<string, any>;

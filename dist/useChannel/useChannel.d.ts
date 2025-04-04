import type { Channel, ChannelOptions, ChannelParams, ChannelState } from './types';
/**
 * A hook to open a new Phoenix channel, or attach to an existing one
 * that has been opened by another component.
 *
 * Note If the channel is already open, the hook will return the existing
 * channel and state.
 *
 * This behavior differs from Phoenix.js where any time you create
 * a new channel, it will close the existing one. This hook will not close
 * the existing channel and instead attaches to it.
 *
 * This is useful for when you have multiple components that need to interact
 * with the same channel.
 *
 * @example
 * ```ts
 *	const [channel, { push, leave, data }] = useChannel('room:1', { params: { token: '123' } });
 *	useEvent(channel, 'new_message', handleMessage);
 * ```
 *
 * @param topic - the topic to connect to.
 * @param options - options for the channel.
 *  - `params` - The params to send to the server when joining the channel.
 *  - `passive` - A boolean indicating whether the channel should wait until another `useChannel` hook has connected to the topic instead of trying to connect itself.
 */
export declare function useChannel<Params extends ChannelParams, JoinPayload>(topic: string | boolean | null | undefined, _options?: ChannelOptions<Params>): [Channel | undefined, ChannelState<JoinPayload>];

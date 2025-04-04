import { Channel } from 'phoenix';
import { EventAction } from './types';
/**
 * A hook to subscribe to a Phoenix Channel event.
 *
 * You may obtain the event data from the `data` property and/or the `listener` callback.
 *
 * @example
 * ```ts
 * 	type NewMessageEvent = {
 *			event: 'new_message';
 *			data: { message: string };
 * 	};
 *
 *	const [channel, state] = useChannel('room:1');
 *	const { data } = useEvent<NewMessageEvent>(channel, 'new_message', handleMessage);
 * ```
 *
 *
 * @param channel - A `Channel` provided by `useChannel`.
 * @param event - The event name to listen for.
 * @param listener - The callback function to invoke when the event is received.
 *
 * @returns The data from the event.
 */
export declare function useEvent<Event extends EventAction>(channel: Channel | undefined | null, event: Event['event'], listener?: (response: Event['data']) => void): {
    data: Event['data'] | undefined;
};

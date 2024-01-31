import { useEffect, useState } from 'react';
import { Channel } from 'phoenix';
import useLatest from '../useLatest';
import { EventAction } from './types';

/**
 * A hook to subscribe to a Phoenix channel event.
 *
 * @example
 * ```ts
 *	const [channel, state] = useChannel('room:1');
 *	useEvent(channel, 'new_message', handleMessage);
 * ```
 *
 * @param channel - A `Channel` provided by `useChannel`.
 * @param event - The event name to listen for.
 * @param listener - The callback function to invoke when the event is received.
 */
export function useEvent<Event extends EventAction>(
	channel: Channel | undefined | null,
	event: Event['event'],
	listener?: (response: Event['data']) => void
): { data: Event['data'] | null } {
	const handler = useLatest(listener);

	const [data, setData] = useState<Event['data'] | null>(null);

	useEffect(() => {
		if (!channel) return;
		if (typeof event !== 'string') return;

		const ref = channel.on(event, (message) => {
			if (typeof handler.current === 'function') {
				handler.current(message);
			}

			setData(message);
		});

		return () => {
			channel.off(event, ref);
		};
	}, [channel, event, handler]);

	return { data };
}

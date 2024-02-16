import { useEffect, useState } from 'react';
import { Channel } from 'phoenix';
import useLatest from '../useLatest';
import { EventAction } from './types';
import { cache } from '../PhoenixProvider';

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
export function useEvent<Event extends EventAction>(
  channel: Channel | undefined | null,
  event: Event['event'],
  listener?: (response: Event['data']) => void
): { data: Event['data'] | null } {
  const handler = useLatest(listener);
  const [loaded, setLoaded] = useState(false);

  const [data, setData] = useState<Event['data'] | null>(null);

  useEffect(() => {
    if (!channel) return;
    if (typeof event !== 'string') return;

    if (!loaded) {
      setLoaded(true);

      const data = cache.get(`${channel.topic}:${event}`);

      if (data) {
        if (typeof handler.current === 'function') {
          handler.current(data);
        }

        // console.log('preloaded', channel.topic, event, data)
        setData(data);
      }
    }

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

import { useCallback, useEffect, useState } from 'react';
import { Channel } from 'phoenix';
import useLatest from '../useLatest';
import { usePhoenix } from '../usePhoenix';
import { findChannel } from '../util';
import { EventAction } from './types';

/**
 * Hook to subscribe to a Phoenix channel event.
 *
 * @example - Usage with a boolean identifier
 * ```ts
 *	useEvent(props.id && `room:${props.id}`, 'new_message', handleMessage);
 * ```
 * @example -  Usage with a channel topic.
 * ```ts
 *	useEvent('room:lobby', 'new_message', handleMessage);
 * ```
 * @example - Usage with an existing channel.
 * ```ts
 * 	const channel = useChannel('room:lobby');
 *	useEvent(channel, 'new_message', handleMessage);
 * ```
 *
 * @param identifier - The identifier can be a topic `string` or a `Channel`.
 * In the case of a topic string, the hook will attempt to look for and connec to an existing instance
 * of the channel on the socket. If one does not exist, it will create a new instance and join the channel.
 * Additionally, if the identifier is a boolean expression that evaluates to `false`, the hook will not
 * attempt to connect the identifier to the socket.
 * @param event - The event name to listen for.
 * @param listener - The callback function to invoke when the event is received.
 */
export function useEvent<Event extends EventAction>(
  identifier: Channel | string | undefined | null,
  event: Event['event'],
  listener?: (response: Event['response']) => void
): { data: Event['response'] | null } {
  const { socket } = usePhoenix();
  const handler = useLatest(listener);
  const [channel, set] = useState<Channel | null>(null);
	const [data, setData] = useState<Event['response'] | null>(null);

  const upsert = useCallback(
    (topic: string): Channel | null => {
      if (socket) {
        let channel = findChannel(socket, topic);
        if (channel) return channel;

        channel = socket.channel(topic, {});
        channel.join();
        return channel;
      }

      return null;
    },
    [socket]
  );

  useEffect(() => {
    /*
     * If the identifier is undefined, it indicates that a boolean expression was supplied
     * and the condition was not met. This prevents the socket from being initialized
     */
    if (typeof identifier == 'undefined' || identifier === null) {
      return;
    } else if (typeof identifier == 'string') {
      set(upsert(identifier));
      return;
    } else if (identifier instanceof Channel) {
      set(identifier);
    } else {
      throw new Error('Invalid identifier. Must be a topic string or Channel.');
    }
  }, [identifier, upsert]);

  useEffect(() => {
    if (channel === null) return;

    const ref = channel.on(event, (message) => {
			setData(message);
      if (typeof handler.current !== 'function') return;
      handler.current(message);
    });

    return () => {
      channel.off(event, ref);
      set(null);
    };
  }, [channel, event, handler]);

	return { data }
}

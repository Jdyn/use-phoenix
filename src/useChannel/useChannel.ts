import { useCallback, useEffect, useRef, useState } from 'react';
import useLatest from '../useLatest';
import { usePhoenix } from '../usePhoenix';
import type {
  Channel,
  ChannelMeta,
  ChannelOptions,
  ChannelParams,
  ChannelState,
  PushFunction
} from './types';
import { Channel as ChannelClass } from 'phoenix';

import { createMeta, findChannel, pushPromise } from '../util';
import cache from '../cache';

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
 *	const [channel, { push, leave, data }] = useChannel('room:1');
 *	useEvent(channel, 'new_message', handleMessage);
 * ```
 *
 * @param topic - the topic to connect to.
 * @param params - The params to send when joining the channel.
 */
export function useChannel<Params extends ChannelParams, JoinPayload>(
  topic: string | boolean | null | undefined,
  params?: ChannelOptions<Params>
): [Channel | undefined, ChannelState<JoinPayload>] {
  const { socket, isConnected } = usePhoenix();

  const [channel, set] = useState<Channel | undefined>(findChannel(socket, topic as string));
  const channelRef = useRef<Channel | null>(null);
  const [meta, setMeta] = useState<ChannelMeta<JoinPayload>>(
    cache.get<JoinPayload>(topic as string)
  );

  const paramsRef = useLatest(params);

  useEffect(() => {
    if (!isConnected) return;
    if (typeof topic !== 'string') return;
    if (!socket) return;

    const params = paramsRef.current?.params ?? {};

    const existingChannel = findChannel(socket, topic);

    if (existingChannel) {
      /* If we find an existing channel with this topic,
        we reconect our internal reference. */
      set(existingChannel);
      channelRef.current = existingChannel;

      if (existingChannel.state === 'joining') {
        existingChannel.on('phx_reply', () => {
          /* It is possible that we found an existing channel
						but it has not yet fully joined. In this case, we want to
						listen in on phx_reply, to update our meta from the
						useChannel that is actually doing the join()  */
          setMeta(cache.get<JoinPayload>(topic));
        });
      } else {
        setMeta(cache.get<JoinPayload>(topic));
      }

      return;
    }

    const _channel = socket.channel(topic, params);

    _channel
      .join()
      .receive('ok', (response: JoinPayload) => {
        const meta = createMeta<JoinPayload>(true, false, false, null, response, 'success');
        cache.insert(topic, meta);
        setMeta(meta);
      })
      .receive('error', (error) => {
        setMeta(createMeta<JoinPayload>(false, false, true, error, null, 'error'));
      })
      .receive('timeout', () => {
        setMeta(createMeta<JoinPayload>(false, false, true, null, null, 'connection timeout'));
      });

    _channel.onError((error) => {
      setMeta(createMeta<JoinPayload>(false, false, true, error, null, 'error'));
    });

    _channel.on('phx_error', () => {
      setMeta(createMeta<JoinPayload>(false, false, true, null, null, 'internal server error'));
      /**
       * If the channel is in an error state, we want to leave the channel.
       * So we do not attempt to rejoin infinitely.
       *
       * Disabling this for now, could make it opt-in.
       */
      // if (channel) channel.leave();
    });

    set(_channel);
    channelRef.current = _channel;
  }, [isConnected, topic, setMeta, set]);

  /**
   * Pushes an event to the channel.
   *
   * @param event - The event to push.
   * @param payload - The payload to send with the event.
   * @returns Promise
   */
  const push: PushFunction = useCallback((event, payload) => {
    if (channelRef.current === null) return Promise.reject('Channel is not connected.');
    return pushPromise(channelRef.current.push(event, payload ?? {}));
  }, []);

  /**
   * Allows you to leave the channel.
   *
   * useChannel does not automatically leave the channel when the component unmounts by default. If
   * you want to leave the channel when the component unmounts, you can use a useEffect:
   *
   * @example
   * ```ts
   *  useEffect(() => {
   *    return () => {
   *      leave();
   *    };
   *  }, []);
   * ```
   * @returns void
   */
  const leave = useCallback(() => {
    if (channelRef.current instanceof ChannelClass) {
      channelRef.current.leave();
      set(undefined);
    }
  }, []);

  return [channel, { ...meta, push, leave }];
}

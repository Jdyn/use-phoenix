import { useCallback, useEffect, useRef, useState } from 'react';
import useLatest from '../useLatest';
import { PhoenixSocket, usePhoenix } from '../usePhoenix';
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
import cache, { defaultMeta } from '../cache';

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
 *  - `yield` - A boolean indicating whether the channel should wait until another `useChannel` hook has connected to the topic instead of trying to connect itself.
 */
export function useChannel<Params extends ChannelParams, JoinPayload>(
  topic: string | boolean | null | undefined,
  _options?: ChannelOptions<Params>
): [Channel | undefined, ChannelState<JoinPayload>] {
  const { socket, isConnected } = usePhoenix();

  const [channel, set] = useState<Channel | undefined>(findChannel(socket, topic as string));
  const channelRef = useRef<Channel | null>(null);
  const [meta, setMeta] = useState<ChannelMeta<JoinPayload>>(
    cache.get<JoinPayload>(topic as string)
  );

  const optionsRef = useLatest(_options);

  const messageRef = useRef<string | undefined>(undefined);

  const handleJoin = useCallback(
    (_channel: Channel) => {
      /* If we find an existing channel with this topic,
          we reconect our internal reference. */
      set(channel);
      channelRef.current = _channel;

      if (_channel.state === 'joining') {
        _channel.on('phx_reply', () => {
          /* It is possible that we found an existing channel
              but it has not yet fully joined. In this case, we want to
              listen in on phx_reply, to update our meta from the
              useChannel that is actually doing the join()  */
          setMeta(cache.get<JoinPayload>(topic));
        });
      } else {
        setMeta(cache.get<JoinPayload>(topic));
      }
    },
    [set, setMeta]
  );

  const createChannel = useCallback(
    (_topic: string, _socket: PhoenixSocket) => {
      const params = optionsRef.current?.params ?? {};

      const _channel = _socket.channel(_topic, params);

      _channel
        .join()
        .receive('ok', (response: JoinPayload) => {
          const meta = createMeta<JoinPayload>(true, false, false, null, response, 'success');
          cache.insert(_topic, meta);
          setMeta(meta);
        })
        .receive('error', (error) => {
          setMeta(createMeta<JoinPayload>(false, false, true, error, undefined, 'error'));
        })
        .receive('timeout', () => {
          setMeta(
            createMeta<JoinPayload>(false, false, true, null, undefined, 'connection timeout')
          );
        });

      _channel.onError((error) => {
        setMeta(createMeta<JoinPayload>(false, false, true, error, undefined, 'error'));
      });

      _channel.on('phx_error', () => {
        setMeta(
          createMeta<JoinPayload>(false, false, true, null, undefined, 'internal server error')
        );
      });

      set(_channel);
      channelRef.current = _channel;
    },
    [set, setMeta]
  );

  useEffect(() => {
    if (!socket) return;
    if (!isConnected) return;
    if (typeof topic !== 'string') return;

    const isLazy = optionsRef.current?.yield ?? false;
    if (isLazy) return;

    const existingChannel = findChannel(socket, topic);

    if (existingChannel) {
      handleJoin(existingChannel);
      return;
    }

    createChannel(topic, socket);
  }, [isConnected, topic, setMeta, set]);

  useEffect(() => {
    const isLazy = optionsRef.current?.yield ?? false;

    if (!isLazy) return;
    if (!socket) return;
    if (!isConnected) return;
    if (typeof topic !== 'string') return;

    messageRef.current = socket.onMessage(({}) => {
      if (channelRef.current === null) {
        const channel = findChannel(socket, topic as string);
        if (channel) handleJoin(channel);
      }
    });
  }, [isConnected, topic]);

  useEffect(() => {
    const isLazy = optionsRef.current?.yield ?? false;

    if (isLazy && channel && socket && messageRef.current) {
      socket.off([messageRef.current]);
      messageRef.current = undefined;
    }
  }, [topic, channel]);

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
      setMeta(defaultMeta);
    }
  }, []);

  return [channel, { ...meta, push, leave }];
}

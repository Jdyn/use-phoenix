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
      set(_channel);
      channelRef.current = _channel;

      const _topic = _channel.topic;

      if (_channel.state === 'joining') {
        _channel.on('phx_reply', () => {
          /* It is possible that we found an existing channel
              but it has not yet fully joined. In this case, we want to
              listen in on phx_reply, to update our meta from the
              useChannel that is actually doing the join()  */
          setMeta(cache.get<JoinPayload>(_topic));
        });
      } else {
        setMeta(cache.get<JoinPayload>(_topic));
      }
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
    if (existingChannel) return handleJoin(existingChannel);

    const params = optionsRef.current?.params ?? {};

    const _channel = socket.channel(topic, params);

    const recieveOk = (response: JoinPayload) => {
      const meta = createMeta<JoinPayload>(true, false, false, null, response, 'success');
      cache.insert(topic, meta);
      setMeta(meta);
    };

    const recieveError = (error: any) => {
      const meta = createMeta<JoinPayload>(false, false, true, error, undefined, 'error');
      setMeta(meta);
    };

    const recieveTimeout = () => {
      setMeta(createMeta<JoinPayload>(false, false, true, null, undefined, 'connection timeout'));
    };

    const onError = (error: any) => {
      const meta = createMeta<JoinPayload>(false, false, true, error, undefined, 'error');
      setMeta(meta);
    };

    const onPhxError = () => {
      const meta = createMeta<JoinPayload>(
        false,
        false,
        true,
        null,
        undefined,
        'internal server error'
      );

      setMeta(meta);
    };

    _channel
      .join()
      .receive('ok', recieveOk)
      .receive('error', recieveError)
      .receive('timeout', recieveTimeout);

    _channel.onError(onError);
    _channel.on('phx_error', onPhxError);

    set(_channel);
    channelRef.current = _channel;

    return () => {
      if (_channel) {
        /*
          So the problem is that these .recieve() functions stay persisted even after this hook
          has potentially moved on to an entirely different topic.

          So consider the following scenario:
            - we connect on topic 'room:1' and we error. That is, we aren't permitted to enter.
            - Then, using the same hook, we connect to room:2 and we are permitted.
            - Since the first one errored, **and the socket has configured rejoin() timeouts**,
              the socket will attempt to rejoin 'room:1' even though we have already moved
              on to 'room:2'. The rejoin attempt will actually call the recieve functions
              and be able to update the state of the hook, even though we are no longer
              interested in that topic.

            - So, we will be in a success state after joining 'room:2', and then rejoin will
              trigger and the recieve('ok') will be called, and since it's for room:1, it will
              update the state of the hook back into an error state.

            - Here, once the topic changes, we remove all recieve hooks to prevent this from happening.
            - So the rejoin() attempt will be called, but this hook won't be listening!

          This can be entirely avoided if, the hook-user correctly calls leave() when the `room:1` join
          fails, but that's not a guarantee, and I think the expected behavior is that the hook no
          longer cares about it's previous topic.
        */
        // @ts-ignore
        if (_channel.joinPush) _channel.joinPush.recHooks = [];

        
        _channel.off('phx_error');
        _channel.off('phx_close');
        _channel.off('phx_reply');
      }
    };
  }, [isConnected, topic, handleJoin]);

  useEffect(() => {
    const isLazy = optionsRef.current?.yield ?? false;

    if (!isLazy) return;
    if (!socket) return;
    if (!isConnected) return;
    if (typeof topic !== 'string') return;

    messageRef.current = socket.onMessage(({ topic: _topic }) => {
      if (channelRef.current === null && _topic === topic) {
        const channel = findChannel(socket, topic as string);
        if (channel) handleJoin(channel);
      }
    });
  }, [isConnected, topic, handleJoin]);

  useEffect(() => {
    return () => {
      const isLazy = optionsRef.current?.yield ?? false;

      if (isLazy && channel && socket && messageRef.current) {
        socket.off([messageRef.current]);
        messageRef.current = undefined;
      }
    };
  }, []);

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

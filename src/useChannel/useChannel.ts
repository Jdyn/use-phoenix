import { useCallback, useEffect, useState } from 'react';
import useLatest from '../useLatest';
import { usePhoenix } from '../usePhoenix';
import { findChannel } from '../util';
import { Channel, ChannelOptions, ChannelParams, Push, PushFunction } from '.';

export function useChannel<TParams extends ChannelParams, TJoinResponse>(
  topic: string,
  options?: ChannelOptions<TParams, TJoinResponse>
): [Channel | null, PushFunction, () => void] {
  const { params, onJoin } = options || {};
  const { socket } = usePhoenix();
  const [channel, set] = useState<Channel | null>(null);
  const channelRef = useLatest(channel);
  const joinHandler = useLatest(onJoin);

  useEffect(() => {
    if (socket === null) return;
    if (findChannel(socket, topic)) return;

    const channel = socket.channel(topic, params);
    channel.join().receive('ok', (response: TJoinResponse) => {
      joinHandler.current?.(response);
    });

    set(channel);
  }, [socket, topic, params, joinHandler]);

  const push: PushFunction = (event, payload) =>
    pushPromise(channelRef.current?.push(event, payload ?? {}));

  /*
   * Allows you to leave the channel.
   * useChannel does not automatically leave the channel when the component unmounts by default.
   *
   */
  const leave = useCallback(() => {
    if (channel instanceof Channel) {
      channel.leave();
      set(null);
    }
  }, [channel]);

  return [channelRef.current, push, leave];
}

const pushPromise = <Response>(push: Push | undefined): Promise<Response> =>
  new Promise((resolve, reject) => {
    if (!push) {
      return reject('no push');
    }

    push.receive('ok', resolve).receive('error', reject);
  });

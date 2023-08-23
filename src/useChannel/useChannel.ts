import { useEffect, useState } from 'react';
import useLatest from '../useLatest';
import { usePhoenix } from '../usePhoenix';
import { Channel, ChannelOptions, ChannelParams, Push, PushFunction } from '.';

export function useChannel<TParams extends ChannelParams, TJoinResponse>(
  topic: string,
  options?: ChannelOptions<TParams, TJoinResponse>
): [Channel | null, PushFunction] {
  const { params, onJoin } = options || {};
  const { socket } = usePhoenix();
  const [channel, set] = useState<Channel | null>(null);
  const channelRef = useLatest(channel);
  const joinHandler = useLatest(onJoin);

  useEffect(() => {
    if (socket === null) {
      return;
    }

    const channel = socket.channel(topic, params);
    channel.join().receive('ok', (response: TJoinResponse) => {
      joinHandler.current?.(response);
    });

    set(channel);

    return () => {
      channel.leave();
      set(null);
    };
  }, [socket, topic, params, joinHandler]);

  const push: PushFunction = (event, payload) =>
    pushPromise(channelRef.current?.push(event, payload ?? {}));

  return [channelRef.current, push];
}

const pushPromise = <Response>(push: Push | undefined): Promise<Response> =>
  new Promise((resolve, reject) => {
    if (!push) {
      return reject('no push');
    }

    push.receive('ok', resolve).receive('error', reject);
  });

import { useCallback, useEffect, useState } from 'react';
import useLatest from '../useLatest';
import { usePhoenix } from '../usePhoenix';
import { Channel, ChannelMeta, ChannelOptions, ChannelParams, Push, PushFunction } from '.';
import { findChannel } from '../util';
import { Merge } from '../usePresence';

export function useChannel<TParams extends ChannelParams, TJoinResponse>(
  topic: string,
  options?: ChannelOptions<TParams>
): [Channel | null, Merge<ChannelMeta<TJoinResponse>, { leave: () => void; push: PushFunction }>] {
  const { socket } = usePhoenix();

  const [channel, set] = useState<Channel | null>(null);
	const [meta, setMeta] = useState<ChannelMeta<TJoinResponse>>({
		data: null,
		isSuccess: false,
		isLoading: true,
		isError: false,
		error: null,
	});

  const channelRef = useLatest(channel);

	const { params } = options || {};

  useEffect(() => {
    if (socket === null) return;
    if (findChannel(socket, topic)) return;

    const channel = socket.channel(topic, params);
    channel.join().receive('ok', (response: TJoinResponse) => {
			setMeta({
				isSuccess: true,
				isLoading: false,
				isError: false,
				error: null,
				data: response
			});
    }).receive('error', (error) => {
			setMeta({
				isSuccess: false,
				isLoading: false,
				isError: true,
				error,
				data: null
			});
		})
		.receive('timeout', () => {
			setMeta({
				isSuccess: false,
				isLoading: false,
				isError: true,
				error: 'timeout',
				data: null
				});
		});

    set(channel);

  }, [socket, topic, params]);

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

  return [channelRef.current, { leave, push, ...meta}];
}

const pushPromise = <Response>(push: Push | undefined): Promise<Response> =>
  new Promise((resolve, reject) => {
    if (!push) {
      return reject('no push');
    }

    push.receive('ok', resolve).receive('error', reject);
  });

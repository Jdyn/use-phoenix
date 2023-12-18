import { useCallback, useEffect, useState } from 'react';
import useLatest from '../useLatest';
import { usePhoenix } from '../usePhoenix';
import type { Channel, ChannelMeta, ChannelOptions, ChannelParams, Push, PushFunction } from './types';
import { Channel as ChannelClass } from 'phoenix';

import { findChannel } from '../util';
import { Merge } from '../usePresence';

export function useChannel<TParams extends ChannelParams, TJoinResponse>(
	topic: string | boolean | null | undefined,
	options?: ChannelOptions<TParams>
): [Channel | null, Merge<ChannelMeta<TJoinResponse>, { leave: () => void; push: PushFunction }>] {
	const { socket } = usePhoenix();

	const [channel, set] = useState<Channel | null>(null);
	const [meta, setMeta] = useState<ChannelMeta<TJoinResponse>>({
		data: null,
		status: 'joining',
		isSuccess: false,
		isLoading: true,
		isError: false,
		error: null
	});

	const channelRef = useLatest(channel);

	const { params } = options || {};

	useEffect(() => {
		if (socket === null) return;
		if (typeof topic !== 'string') return;
		if (findChannel(socket, topic)) return;

		const channel = socket.channel(topic, params);

		channel
			.join()
			.receive('ok', (response: TJoinResponse) => {
				setMeta({
					isSuccess: true,
					isLoading: false,
					isError: false,
					error: null,
					data: response,
					status: 'success'
				});
			})
			.receive('error', (error) => {
				setMeta({
					isSuccess: false,
					isLoading: false,
					isError: true,
					error,
					data: null,
					status: 'error'
				});
			})
			.receive('timeout', () => {
				setMeta({
					isSuccess: false,
					isLoading: false,
					isError: true,
					error: null,
					status: 'connection timeout',
					data: null
				});
			});

		channel.on('phx_error', () => {
			setMeta({
				isSuccess: false,
				isLoading: false,
				isError: true,
				error: null,
				status: 'internal server error',
				data: null
			});

			/**
			 * If the channel is in an error state, we want to leave the channel.
			 * So we do not attempt to rejoin infinitely.
			 */
			channel.leave();
		});

		set(channel);
	}, [socket, topic, params, setMeta]);

	const push: PushFunction = (event, payload) =>
		pushPromise(channelRef.current?.push(event, payload ?? {}));

	/*
	 * Allows you to leave the channel.
	 * useChannel does not automatically leave the channel when the component unmounts by default.
	 *
	 */
	const leave = useCallback(() => {
		if (channel instanceof ChannelClass) {
			channel.leave();
			set(null);
		}
	}, [channel]);

	return [channelRef.current, { leave, push, ...meta }];
}

const pushPromise = <Response>(push: Push | undefined): Promise<Response> =>
	new Promise((resolve, reject) => {
		if (!push) {
			return reject('no push');
		}

		push.receive('ok', resolve).receive('error', reject);
	});

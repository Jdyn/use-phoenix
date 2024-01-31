import { useCallback, useEffect, useMemo, useState } from 'react';
import useLatest from '../useLatest';
import { usePhoenix } from '../usePhoenix';
import {
	Channel,
	ChannelMeta,
	ChannelOptions,
	ChannelParams,
	ChannelState,
	Push,
	PushFunction
} from './types';
import { Channel as ChannelClass } from 'phoenix';

import { findChannel } from '../util';
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
export function useChannel<TParams extends ChannelParams, JoinResposne>(
	topic: string | boolean | null | undefined,
	params?: ChannelOptions<TParams>
): [Channel | undefined, ChannelState<JoinResposne>] {
	const { socket, isConnected } = usePhoenix();

	const [channel, set] = useState<Channel | undefined>(findChannel(socket, topic as string));
	const [meta, setMeta] = useState<ChannelMeta<JoinResposne>>(
		cache.get<JoinResposne>(topic as string)
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
					we need to reconect our internal reference. */
			set(existingChannel);
			setMeta(cache.get<JoinResposne>(topic));

			return;
		}

		const _channel = socket.channel(topic, params);

		_channel
			.join()
			.receive('ok', (response: JoinResposne) => {
				const meta: ChannelMeta<JoinResposne> = {
					isSuccess: true,
					isLoading: false,
					isError: false,
					error: null,
					data: response,
					status: 'success'
				};

				setMeta(meta);
				cache.insert(topic, meta);
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

		_channel.onError((error) => {
			setMeta({
				isSuccess: false,
				isLoading: false,
				isError: true,
				error,
				data: null,
				status: 'error'
			});
		});

		_channel.on('phx_error', () => {
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
			if (channel) channel.leave();
		});

		set(_channel);
	}, [isConnected, topic]);

	const push: PushFunction = useCallback(
		(event, payload) => {
			if (channel === undefined) return Promise.reject('Channel is not connected.');
			return pushPromise(channel.push(event, payload ?? {}));
		},
		[channel]
	);

	/*
	 * Allows you to leave the channel.
	 * useChannel does not automatically leave the channel when the component unmounts by default.
	 *
	 */
	const leave = useCallback(() => {
		if (channel instanceof ChannelClass) {
			channel.leave();
			set(undefined);
		}
	}, [channel]);

	const channelState: ChannelState<JoinResposne> = useMemo(
		() => ({ ...meta, push, leave }),
		[meta, push, leave]
	);

	return [channel, channelState];
}

const pushPromise = <Response>(push: Push): Promise<Response> =>
	new Promise((resolve, reject) => {
		push.receive('ok', resolve).receive('error', reject);
	});

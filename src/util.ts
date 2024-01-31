import { Channel } from 'phoenix';
import { PhoenixSocket } from './usePhoenix';

export const findChannel = (socket: PhoenixSocket | null, topic: string): Channel | undefined => {
	if (typeof topic !== 'string') return undefined;
	return socket?.channels.find((channel) => channel.topic === topic);
};

export type Merge<A, B> = {
	[K in keyof A | keyof B]: K extends keyof A & keyof B
		? A[K] | B[K]
		: K extends keyof B
			? B[K]
			: K extends keyof A
				? A[K]
				: never;
};

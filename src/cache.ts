import { ChannelMeta } from './useChannel';

export const cache = new Map<string, ChannelMeta<any>>();

const defaultMeta: ChannelMeta<any> = {
	data: null,
	status: 'joining',
	isSuccess: false,
	isLoading: true,
	isError: false,
	error: null
};

export default {
	insert: (topic: string, channelMeta: ChannelMeta<any>) => {
		cache.set(topic, channelMeta);
	},
	get: <JoinPayload>(topic: string | undefined | boolean | null): ChannelMeta<JoinPayload> => {
		if (typeof topic !== 'string') return defaultMeta;

		const result = cache.get(topic);

		if (result) {
			return result;
		} else {
			return defaultMeta;
		}
	},
	delete: (topic: string): boolean => {
		return cache.delete(topic);
	}
};

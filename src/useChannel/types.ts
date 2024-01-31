import { Merge } from '../util';

export type { Push } from 'phoenix';
export { Channel } from 'phoenix';

export type ChannelState<JoinResposne> = Merge<ChannelMeta<JoinResposne>, { leave: () => void; push: PushFunction }>;

export type PushEvent = {
	event: string;
	data?: Record<string, any>;
}

export type ChannelStatus =
	| 'joining'
	| 'success'
	| 'error'
	| 'internal server error'
	| 'connection timeout'
	| 'closed';

export type ChannelMeta<JoinResposne> = {
	data: JoinResposne | null;
	status: ChannelStatus;
	isSuccess: boolean;
	isLoading: boolean;
	isError: boolean;
	error: any;
};

export type PushFunction = (<Event extends PushEvent, PushResponse = any>(
	event: Event['event'],
	data?: Event['data']
) => Promise<PushResponse>);

export type ChannelOptions<Params = undefined> = {
	params?: Params extends Record<string, any> ? Params : undefined;
};

export type ChannelParams = Record<string, any>;

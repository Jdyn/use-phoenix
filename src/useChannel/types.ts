export type { Push } from 'phoenix';
export { Channel } from 'phoenix';

export interface PushEvent {
  type: string;
  payload?: Record<string, any>;
}

export type ChannelMeta<TJoinResponse> = {
	data: TJoinResponse | null;
	isSuccess: boolean;
	isLoading: boolean;
	isError: boolean;
	error: any;
}

export type PushFunction = <E extends PushEvent, PushResponse = void>(
  event: E extends { type: string } ? PushEvent['type'] : void,
  payload?: E extends PushEvent['payload'] ? PushEvent['payload'] : void
) => Promise<PushResponse>;

export type ChannelOptions<Params = undefined> = {
  params?: Params extends Record<string, any> ? Params : undefined;
};

export type ChannelParams = Record<string, any>;

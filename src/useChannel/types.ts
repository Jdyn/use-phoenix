export type { Push } from 'phoenix';
export { Channel } from 'phoenix';

export interface PushEvent {
  type: string;
  payload?: Record<string, any>;
}

export type PushFunction = <E extends PushEvent, PushResponse = void>(
  event: E extends { type: string } ? PushEvent['type'] : void,
  payload?: E extends PushEvent['payload'] ? PushEvent['payload'] : void
) => Promise<PushResponse>;

export type ChannelOptions<Params = undefined, JoinResponse = void> = {
  params?: Params extends Record<string, any> ? Params : undefined;
  onJoin: (payload: JoinResponse) => void;
};

export type ChannelParams = Record<string, any>;
export type JoinResponse = any;

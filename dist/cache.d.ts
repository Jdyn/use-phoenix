import { ChannelMeta } from './useChannel';
export declare const cache: Map<string, ChannelMeta<any>>;
export declare const defaultMeta: ChannelMeta<any>;
declare const _default: {
    insert: (topic: string, channelMeta: ChannelMeta<any>) => void;
    get: <JoinPayload>(topic: string | undefined | boolean | null) => ChannelMeta<JoinPayload>;
    delete: (topic: string) => boolean;
};
export default _default;

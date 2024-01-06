import { PhoenixSocket } from './usePhoenix';
import type { Channel } from 'phoenix';

export const findChannel = (socket: PhoenixSocket | null, topic: string): Channel | undefined =>
	socket ? socket.channels.find((channel) => channel.topic === topic) : undefined;

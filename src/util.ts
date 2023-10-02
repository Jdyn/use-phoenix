import { PhoenixSocket } from './usePhoenix';

export const findChannel = (socket: PhoenixSocket, topic: string) =>
	socket.channels.find((channel) => channel.topic === topic);

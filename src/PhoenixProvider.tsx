import useLatest from './useLatest';
import { PhoenixContext } from './usePhoenix';
import { PhoenixSocket, SocketConnectOption } from './usePhoenix/types';
import { Socket } from 'phoenix';
import React, { useCallback, useEffect, useState } from 'react';

export type PhoenixProviderProps = {
	url?: string;
	options?: Partial<SocketConnectOption>;
	children?: React.ReactNode;
	onOpen?: () => void;
	onClose?: () => void;
	onError?: () => void;
};

export function PhoenixProvider({ url, options, ...props }: PhoenixProviderProps) {
	const { children, onOpen, onClose, onError } = props;

	const [socket, set] = useState<PhoenixSocket | null>(null);
	const socketRef = useLatest(socket);

	const defaultListeners = useCallback(
		(socket: PhoenixSocket) => {
			if (onOpen) socket.onOpen(onOpen);
			if (onClose) socket.onClose(onClose);
			if (onError) socket.onError(onError);
		},
		[onClose, onError, onOpen]
	);

	const connect = useCallback(
		(url: string, options?: Partial<SocketConnectOption>): PhoenixSocket => {
			const socket = new Socket(url, options ?? {}) as PhoenixSocket;
			socket.connect();
			set(socket);

			defaultListeners(socket);

			return socket;
		},
		[defaultListeners]
	);

	useEffect(() => {
		if (!url) return;

		const socket = connect(url, options);

		return () => {
			socket.disconnect();
		};
	}, [url, options, connect]);

	return (
		<PhoenixContext.Provider value={{ socket: socketRef.current, connect }}>
			{children}
		</PhoenixContext.Provider>
	);
}

PhoenixProvider.defaultProps = {
	options: {},
	onOpen: null,
	onClose: null,
	onError: null,
	connect: true,
	children: null
};

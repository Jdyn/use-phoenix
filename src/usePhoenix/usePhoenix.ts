import React from 'react';
import { ConnectFunction, PhoenixSocket } from './types';

export const PhoenixContext = React.createContext<{
	socket: PhoenixSocket | null;
	connect: ConnectFunction;
	isConnected: boolean;
} | null>(null);

export const usePhoenix = () => {
	const context = React.useContext(PhoenixContext);
	if (context === null) throw new Error('usePhoenix must be used within a PhoenixProvider');
	return context;
};

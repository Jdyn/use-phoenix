import React from 'react';
import { ConnectFunction, PhoenixSocket } from './types';
export declare const PhoenixContext: React.Context<{
    socket: PhoenixSocket | null;
    connect: ConnectFunction;
    isConnected: boolean;
    isError: boolean;
} | null>;
export declare const usePhoenix: () => {
    socket: PhoenixSocket | null;
    connect: ConnectFunction;
    isConnected: boolean;
    isError: boolean;
};

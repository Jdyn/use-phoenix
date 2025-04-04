import { SocketConnectOption } from './usePhoenix/types';
import React from 'react';
export type PhoenixProviderProps = {
    url?: string;
    options?: Partial<SocketConnectOption>;
    children?: React.ReactNode;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: () => void;
};
export declare const cache: Map<string, any>;
export declare function PhoenixProvider({ url, options, ...props }: PhoenixProviderProps): import("react/jsx-runtime").JSX.Element;

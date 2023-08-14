import { useCallback, useEffect, useState } from 'react';
import { Channel } from 'phoenix';

import useLatest from '../useLatest';
import { PhoenixSocket, usePhoenix } from '../usePhoenix';

import { UseEvent } from './types';

export const useEvent: UseEvent = (identifier, event, listener) => {
  const [channel, set] = useState<Channel | null>(null);
  const handler = useLatest(listener);
  const { socket } = usePhoenix();

  useEffect(() => {
    if (channel === null) {
      return;
    }

    const ref = channel.on(event, (message) => {
      if (typeof handler.current !== 'function') {
        return;
      }

      handler.current(message);
    });

    return () => {
      channel.off(event, ref);
      set(null);
    };
  }, [channel, event, handler]);

  const fetchOrCreateChannel = useCallback(
    (identifier: string, socket: PhoenixSocket): Channel | null => {
      let channel = socket.channels.find((channel) => channel.topic === identifier);
      if (channel) {
        return channel;
      }

      channel = socket.channel(identifier, {});
      channel.join();
      return channel;
    },
    []
  );

  useEffect(() => {
    if (socket && typeof identifier == 'string') {
      set(fetchOrCreateChannel(identifier, socket));
    } else if (socket && typeof identifier === 'object') {
      set(identifier);
    }
  }, [fetchOrCreateChannel, identifier, socket]);
};

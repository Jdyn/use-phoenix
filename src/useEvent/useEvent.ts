import { useCallback, useEffect, useState } from 'react';
import { Channel } from 'phoenix';

import useLatest from '../useLatest';
import { usePhoenix } from '../usePhoenix';

import { UseEvent } from './types';

export const useEvent: UseEvent = (identifier, event, listener) => {
  const [channel, set] = useState<Channel | null>(null);
  const handler = useLatest(listener);
  const { socket } = usePhoenix();

  const upsert = useCallback(
    (topic: string): Channel | null => {
      if (socket) {
        let channel = socket.channels.find((channel) => channel.topic === topic);
        if (channel) return channel;

        channel = socket.channel(topic, {});
        channel.join();
        return channel;
      }

      return null;
    },
    [socket]
  );

  useEffect(() => {
    if (typeof identifier == 'string') {
      set(upsert(identifier));
      return;
    } else if (identifier instanceof Channel) {
      set(identifier);
    } else {
      throw new Error('Invalid identifier. Must be a topic string or Channel.');
    }
  }, [identifier, upsert]);

  useEffect(() => {
    if (channel === null) return;

    const ref = channel.on(event, (message) => {
      if (typeof handler.current !== 'function') return;
      handler.current(message);
    });

    return () => {
      channel.off(event, ref);
      set(null);
    };
  }, [channel, event, handler]);
};

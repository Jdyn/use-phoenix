import { useEffect, useMemo, useState } from 'react';
import { Presence } from 'phoenix';
import { usePhoenix } from '../usePhoenix';
import type { Merge, Metas, PresenceState } from './types';

export type UsePresenceProps<T, M> = {
  topic: string;
  modifier?: (presence: PresenceState<T, M>) => T;
};

export function usePresence<PayloadType, MetasType = Metas>(
  topic: string | undefined
): Merge<PayloadType, {id: string, metas: MetasType}>[] {
  const [_presence, _setPresence] = useState<PresenceState<PayloadType, MetasType>>({});
  const { socket } = usePhoenix();

  useEffect(() => {
    if (socket && topic) {
      const channel = socket.channel(topic, {});

      channel.on('presence_state', (newState) => {
        _setPresence((prevState) => {
          if (Object.keys(prevState).length === 0) return newState;
          return Presence.syncState(prevState, newState);
        });
      });

      channel.on('presence_diff', (newDiff) => {
        _setPresence((prevState) => {
          if (Object.keys(prevState).length === 0) return prevState;
          return Presence.syncDiff(prevState, newDiff);
        });
      });

      channel.join();
    }
  }, [socket, _setPresence, topic]);

  const items = useMemo(
    () =>
      _presence
        ? Object.keys(_presence).map((key: string) => ({ id: key, ..._presence[key] }))
        : [],
    [_presence]
  ) as Merge<PayloadType, {id: string, metas: MetasType}>[];

  return items;
}

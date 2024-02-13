import { useEffect, useMemo, useState } from 'react';
import { Presence } from 'phoenix';
import { usePhoenix } from '../usePhoenix';
import type { Metas, PresenceState } from './types';
import { Merge } from '../util';

export function usePresence<PayloadType, MetasType = Metas>(
  topic: string | undefined
): Merge<PayloadType, { id: string; metas: MetasType }>[] {
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

      return () => {
        channel.leave();
        _setPresence({});
      };
    }

    return () => {};
  }, [socket, _setPresence, topic]);

  const items = useMemo(
    () =>
      _presence
        ? Object.keys(_presence).map((key: string) => {
            let metas = _presence[key].metas;

            if (Array.isArray(metas) && metas.length === 1) {
              metas = metas[0];
            }

            return { id: key, ..._presence[key], metas };
          })
        : [],
    [_presence]
  ) as Merge<PayloadType, { id: string; metas: MetasType }>[];

  return items;
}

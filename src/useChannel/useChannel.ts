import { useSocket } from "../PhoenixProvider";
import { useEffect, useRef, useState } from "react";
import { Channel, Push, PushFunction, UseChannel } from ".";
import useLatest from "../useLatest";

export const useChannel: UseChannel = (topic, options) => {
  const { params, onJoin } = options || {};
  const { socket } = useSocket();
  const [channel, set] = useState<Channel | null>(null);
  const channelRef = useLatest(channel);
  const onJoinRef = useLatest(onJoin);

  useEffect(() => {
    if (socket === null) return;

    const channel = socket.channel(topic, params);
    channel.join().receive("ok", (response) => {
      onJoinRef.current?.(response);
    });

    set(channel);

    return () => {
      channel.leave();
      set(null);
    };
  }, [socket, topic, params]);

  const push: PushFunction = (event, payload) =>
    pushPromise(channelRef.current?.push(event, payload ?? {}));

  return [channelRef.current, push];
};

const pushPromise = <Response>(push: Push | undefined): Promise<Response> =>
  new Promise((resolve, reject) => {
    if (!push) return reject("no push");

    push.receive("ok", resolve).receive("error", reject);
  });

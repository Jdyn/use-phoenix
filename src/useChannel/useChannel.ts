import { useSocket } from "../PhoenixProvider";
import { useEffect, useRef } from "react";
import { Channel, Push, PushFunction, UseChannel } from ".";
import useLatest from "../useLatest";

export const useChannel: UseChannel = (topic, options) => {
  const { params, onJoin } = options || {};
  const socket = useSocket();
  const channelRef = useRef<Channel | null>(null);
  const onJoinRef = useLatest(onJoin);

  useEffect(() => {
    if (socket === null) return;

    const channel = socket.channel(topic, params);
    channel.join().receive("ok", (response) => {
      onJoinRef.current?.(response);
    });

    channelRef.current = channel;

    return () => {
      channel.leave();
      channelRef.current = null;
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

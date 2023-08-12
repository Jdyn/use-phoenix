import { Channel, Push } from "phoenix";
import { useSocket } from "./PhoenixProvider";
import { useEffect, useRef } from "react";

type PushFunction = <
  PushResponse,
  PushAction extends { type: string; payload?: Record<string, any> | undefined }
>(
  event: PushAction["type"],
  payload: PushAction["payload"] extends Record<string, any>
    ? PushAction["payload"]
    : Record<string, any>
) => Promise<PushResponse>;

export function useChannel<Params extends Record<string, unknown> = {}, JoinPayload = null>(
  topic: string,
  options?: { params?: Params; onJoin?: (payload: JoinPayload) => void }
): [Channel | null, PushFunction] {
  const { params, onJoin } = options || {};
  const socket = useSocket();
  const channelRef = useRef<Channel | null>(null);
  const onJoinRef = useRef(onJoin);

  onJoinRef.current = onJoin;

  useEffect(() => {
    if (socket === null) return;

    const channel = socket.channel(topic, params);
    channel.join().receive("ok", (payload) => onJoinRef.current && onJoinRef.current(payload));
    channelRef.current = channel;

    return () => {
      channel.leave();
      channelRef.current = null;
    };
  }, [socket, topic, params]);

  const push: PushFunction = (event, payload) => {
    return pushPromise(channelRef.current?.push(event, payload ?? {}));
  };

  return [channelRef.current, push];
}

const pushPromise = <Response>(push: Push | undefined): Promise<Response> =>
  new Promise((resolve, reject) => {
    if (!push) return reject("no push");

    push.receive("ok", resolve).receive("error", reject);
  });

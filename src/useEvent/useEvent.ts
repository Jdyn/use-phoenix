import { useEffect, useState } from "react";
import { UseEvent } from "./types";
import useLatest from "../useLatest";
import { PhoenixSocket, useSocket } from "../PhoenixProvider";
import { Channel } from "phoenix";

export const useEvent: UseEvent = (identifier, event, listener) => {
  const [channel, set] = useState<Channel | null>(null);
  const _listener = useLatest(listener);
  const { socket } = useSocket();

  useEffect(() => {
    if (channel === null) return;
    const ref = channel.on(event, (message) => {
      if (typeof _listener.current !== "function") return;
      _listener.current(message);
    });

    // return () => {
    //   channel.off(event, ref);
    // };
  }, [channel, event]);

  useEffect(() => {
    if (socket && typeof identifier == "string") {
      set(fetchOrCreateChannel(identifier, socket));
    } else if (typeof identifier === "object" && identifier?.topic) {
      set(identifier);
    }
  }, [identifier, socket]);

  function fetchOrCreateChannel(identifier: string, socket: PhoenixSocket): Channel | null {
    let channel = socket.channels.find((channel) => channel.topic === identifier);
    if (channel) return channel;

    channel = socket.channel(identifier, {})
		channel.join()
    return channel;
  }
};

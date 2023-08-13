import { Channel } from "phoenix";

export interface EventAction {
  event: string;
  response: Record<string, any>;
}

export type UseEventListener<EventResponse> = (response: EventResponse) => void;

export type UseEvent = <Event extends EventAction>(
  channel: Channel | string | null,
  event: Event["event"],
  listener: (response: Event["response"]) => void
) => void;

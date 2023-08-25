export type EventAction = {
  event: string;
  response: any;
}

export type UseEventListener<EventResponse> = (response: EventResponse) => void;

export type EventAction = {
	event: string;
	data: any;
};

export type UseEventListener<EventResponse> = (response: EventResponse) => void;

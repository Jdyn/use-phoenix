export type Metas = { phx_ref?: string }[];

export type PresenceState<T, M = Metas> = {
	[id: string]: T & { metas: M };
};

export type PresenceData<T, M = Metas> = T & {
	id: string;
	metas: M;
};

export type PresenceDiff<T, M = Metas> = {
	joins: T & { metas: M };
	leaves: T & { metas: M };
};

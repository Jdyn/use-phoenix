export type Metas = { phx_ref?: string }[]

export type PresenceState<T, M = Metas> = {
	[id: string]: T & { metas: M};
}

export type PresenceData<T, M = Metas> = T & {
	id: string;
	metas: M;
}

export type PresenceDiff<T, M = Metas> = {
  joins: T & { metas: M };
  leaves: T & { metas: M };
};

export type Merge<A, B> = {
  [K in keyof A | keyof B]:
    K extends keyof A & keyof B
    ? A[K] | B[K]
    : K extends keyof B
    ? B[K]
    : K extends keyof A
    ? A[K]
    : never;
};

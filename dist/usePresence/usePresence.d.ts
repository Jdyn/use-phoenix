import type { Metas } from './types';
import { Merge } from '../util';
export declare function usePresence<PayloadType, MetasType = Metas>(topic: string | undefined): Merge<PayloadType, {
    id: string;
    metas: MetasType;
}>[];

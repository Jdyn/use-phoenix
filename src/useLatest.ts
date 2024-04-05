import type { RefObject } from 'react';
import { useRef } from 'react';

export default <T>(val: T): RefObject<T> => {
  const ref = useRef<T>(val);
  ref.current = val;
  return ref;
};

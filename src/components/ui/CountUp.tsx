import { useEffect, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { Text, type TextVariant } from './Text';
import type { TextStyle } from 'react-native';

// Counts from `from` to `to` (ease-out) in DM Mono with tabular digits.
export function CountUp({
  to,
  from = 0,
  duration = 1600,
  format = (n) => Math.round(n).toLocaleString('en-US'),
  variant = 'monoLg',
  style,
}: {
  to: number;
  from?: number;
  duration?: number;
  format?: (n: number) => string;
  variant?: TextVariant;
  style?: TextStyle;
}) {
  const reduced = useReducedMotion();
  const [v, setV] = useState(reduced ? to : from);
  useEffect(() => {
    if (reduced) {
      setV(to);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / duration);
      setV(from + (to - from) * (1 - Math.pow(1 - t, 3)));
      if (t >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [to, from, duration, reduced]);
  return (
    <Text variant={variant} tabular style={style}>
      {format(v)}
    </Text>
  );
}

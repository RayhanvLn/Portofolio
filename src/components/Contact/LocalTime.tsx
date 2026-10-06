'use client';
import { useEffect, useState } from 'react';

/** Live clock in the given IANA zone. Renders nothing until mounted (no hydration mismatch). */
export function LocalTime({ timeZone }: { timeZone: string }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () => {
      try {
        return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone, timeZoneName: 'short' }).format(new Date());
      } catch {
        return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date());
      }
    };
    setTime(fmt());
    const id = window.setInterval(() => setTime(fmt()), 30_000);
    return () => window.clearInterval(id);
  }, [timeZone]);
  return <span suppressHydrationWarning>{time ?? '—'}</span>;
}

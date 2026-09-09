'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function WaitlistCounter() {
  const count = useQuery(api.waitlist.getCount);
  if (count === undefined) {
    return (
      <div className="text-center mt-6">
        <div className="text-white/60 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="text-center mt-6">
      <div className="text-white/60 text-sm mb-1">
        Join {count.toLocaleString()} others on the waitlist
      </div>
      <div className="text-white/40 text-xs">
        Be part of the movement to take back pickleball ratings
      </div>
    </div>
  );
}

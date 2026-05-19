'use client';

/* Presence stub — wire up Pusher / Ably / Supabase Realtime when ready */

export interface PresencePeer {
  memberId: string;
  lastEditAt: number;
}

export function usePresence() {
  /* Simulated static presence for v1 */
  const peers: PresencePeer[] = [
    { memberId: 'david', lastEditAt: Date.now() - 2000 },
    { memberId: 'lola',  lastEditAt: Date.now() - 45000 },
  ];

  const activePeers = peers.filter(
    (p) => Date.now() - p.lastEditAt < 30_000
  );

  const lastEditor = peers.reduce((latest, p) =>
    p.lastEditAt > (latest?.lastEditAt ?? 0) ? p : latest,
    peers[0]
  );

  const secondsAgo = lastEditor
    ? Math.round((Date.now() - lastEditor.lastEditAt) / 1000)
    : 0;

  return {
    peers,
    activePeers,
    lastEditor,
    secondsAgo,
    isLive: activePeers.length > 0,
  };
}

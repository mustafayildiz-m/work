const cache = new Map();
const CACHE_TTL = 60_000; // 1 minute

export async function fetchUserProfile(userId) {
  if (!userId) return null;

  const key = String(userId);
  const cached = cache.get(key);

  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.promise;
  }

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return null;

  const promise = fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  )
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

  cache.set(key, { promise, ts: Date.now() });
  return promise;
}

export function invalidateProfileCache(userId) {
  if (userId) cache.delete(String(userId));
  else cache.clear();
}

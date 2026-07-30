const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const CACHE_KEY = 'story-thumbnail-cache';
const CACHE_TTL = 24 * 60 * 60 * 1000;

export function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function extractInstagramCode(url) {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/i);
  return match?.[1] || null;
}

export function isInstagramUrl(url) {
  return !!url && /instagram\.com/i.test(url);
}

export function isYouTubeUrl(url) {
  return !!url && /(?:youtube\.com|youtu\.be|youtube-nocookie\.com)/i.test(url);
}

export function getStoredThumbnail(url) {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    const entry = cache[url];
    if (!entry || Date.now() - entry.ts > CACHE_TTL) return null;
    return entry.thumbnail;
  } catch {
    return null;
  }
}

export function setStoredThumbnail(url, thumbnail) {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    cache[url] = { thumbnail, ts: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export function getDirectThumbnail(story) {
  if (story?.thumbnail_url) {
    return story.thumbnail_url.startsWith('http')
      ? story.thumbnail_url
      : `${API_BASE}${story.thumbnail_url}`;
  }

  const ytId = extractYouTubeId(story?.video_url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

  return null;
}

export function getThumbnailImageUrl(videoUrl) {
  return `${API_BASE}/scholar-stories/thumbnail-image?url=${encodeURIComponent(videoUrl)}`;
}

export async function resolveStoryThumbnail(story) {
  const direct = getDirectThumbnail(story);
  if (direct) return direct;

  const videoUrl = story?.video_url;
  if (!videoUrl) return null;

  const cached = getStoredThumbnail(videoUrl);
  if (cached) return cached;

  if (isInstagramUrl(videoUrl)) {
    const proxied = getThumbnailImageUrl(videoUrl);
    setStoredThumbnail(videoUrl, proxied);
    return proxied;
  }

  try {
    const res = await fetch(
      `${API_BASE}/scholar-stories/resolve-thumbnail?url=${encodeURIComponent(videoUrl)}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.thumbnail_url) {
      setStoredThumbnail(videoUrl, data.thumbnail_url);
      return data.thumbnail_url;
    }
  } catch {}

  return null;
}

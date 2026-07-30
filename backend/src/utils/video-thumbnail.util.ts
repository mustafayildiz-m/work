export function extractYouTubeId(url?: string | null): string | null {
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

export function extractInstagramCode(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/i);
  return match?.[1] || null;
}

export function getYouTubeThumbnail(url?: string | null): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function isInstagramUrl(url?: string | null): boolean {
  return !!url && /instagram\.com/i.test(url);
}

export async function fetchInstagramThumbnail(url: string): Promise<string | null> {
  const oembedUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}`;
  const response = await fetch(oembedUrl, {
    headers: {
      'User-Agent': 'Instagram 76.0.0.21.95',
      Accept: 'application/json',
    },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { thumbnail_url?: string };
  return data.thumbnail_url || null;
}

'use client';

import { useEffect, useState } from 'react';
import { BsInstagram, BsYoutube } from 'react-icons/bs';
import {
  getDirectThumbnail,
  isInstagramUrl,
  isYouTubeUrl,
  resolveStoryThumbnail,
} from '@/utils/videoThumbnail';

const StoryThumbnail = ({ story, alt, className = '', style = {} }) => {
  const [src, setSrc] = useState(() => getDirectThumbnail(story));
  const [loading, setLoading] = useState(!getDirectThumbnail(story) && !!story?.video_url);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const direct = getDirectThumbnail(story);

    if (direct) {
      setSrc(direct);
      setLoading(false);
      setFailed(false);
      return () => { active = false; };
    }

    if (!story?.video_url) {
      setSrc(null);
      setLoading(false);
      setFailed(true);
      return () => { active = false; };
    }

    setLoading(true);
    setFailed(false);

    resolveStoryThumbnail(story).then((thumbnail) => {
      if (!active) return;
      if (thumbnail) {
        setSrc(thumbnail);
        setFailed(false);
      } else {
        setSrc(null);
        setFailed(true);
      }
      setLoading(false);
    });

    return () => { active = false; };
  }, [story?.id, story?.video_url, story?.thumbnail_url]);

  const platform = isInstagramUrl(story?.video_url)
    ? 'instagram'
    : isYouTubeUrl(story?.video_url)
      ? 'youtube'
      : null;

  if (loading) {
    return (
      <div className={`story-thumb story-thumb--loading ${className}`} style={style}>
        <div className="story-thumb__shimmer" />
      </div>
    );
  }

  if (!src || failed) {
    return (
      <div
        className={`story-thumb story-thumb--placeholder ${platform ? `story-thumb--${platform}` : ''} ${className}`}
        style={style}
      >
        {platform === 'instagram' ? <BsInstagram size={34} /> : platform === 'youtube' ? <BsYoutube size={34} /> : null}
        <span className="story-thumb__placeholder-title">{story?.title}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || story?.title || 'Story thumbnail'}
      className={`story-thumb__img ${className}`}
      style={style}
      loading="lazy"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={() => {
        if (isInstagramUrl(story?.video_url) && !src?.includes('thumbnail-image')) {
          const proxied = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/scholar-stories/thumbnail-image?url=${encodeURIComponent(story.video_url)}`;
          setSrc(proxied);
          return;
        }
        const ytFallback = getDirectThumbnail({ ...story, thumbnail_url: null });
        if (ytFallback && ytFallback !== src) {
          setSrc(ytFallback);
          return;
        }
        setFailed(true);
        setSrc(null);
      }}
    />
  );
};

export default StoryThumbnail;

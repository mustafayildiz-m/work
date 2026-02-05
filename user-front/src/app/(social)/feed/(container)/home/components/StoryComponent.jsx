'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Zuck } from 'zuck.js';
import 'zuck.js/css';
import 'zuck.js/skins/snapgram';
const StoryComponent = ({
  stories
}) => {
  const storiesRef = useRef(null);
  const storiesFunc = useRef(null);
  useEffect(() => {
    if (storiesRef.current && !storiesFunc.current) {
      storiesFunc.current = Zuck(storiesRef.current, {
        reactive: true,
        previousTap: true,
        skin: 'snapgram',
        autoFullScreen: false,
        avatars: true,
        // was true
        list: false,
        openEffect: true,
        cubeEffect: true,
        backButton: true,
        rtl: false,
        localStorage: false,
        backNative: true,
        stories: stories
      });
    }

    // return () => {
    // storiesFunc.current?.remove();
    // }
  }, [stories]);
  return <div ref={storiesRef} className="storiesWrapper  stories-square   carousel scroll-enable stories">
      {stories.map(story => {
      return <div key={story.id} className="story " data-id={story.id} data-photo={story.photo} data-last-updated={story.time}>
            <Link className="item-link" href="">
              <span className="item-preview">
                <Image 
                  src={story.photo} 
                  alt="post"
                  width={40}
                  height={40}
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMzMzIiBvZmZzZXQ9IjIwJSIgLz4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzIyMiIgb2Zmc2V0PSI1MCUiIC8+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMzMzMiIG9mZnNldD0iNzAlIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzMzIiAvPgogIDxyZWN0IGlkPSJyIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9InVybCgjZykiIC8+CiAgPGFuaW1hdGUgeGxpbms6aHJlZj0iI3IiIGF0dHJpYnV0ZU5hbWU9IngiIGZyb209Ii00MCIgdG89IjQwIiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgIC8+Cjwvc3ZnPg=="
                  style={{ transition: 'opacity 0.3s ease-in-out' }}
                />
              </span>
              <span className="info" itemProp="author" itemScope itemType="http://schema.org/Person">
                <strong className="name" itemProp="name">
                  {story.name}
                </strong>
                <span className="time" />
              </span>
            </Link>
            <ul className="items">
              {story.items.map(storyItem => {
            return <li key={storyItem.id} data-id={storyItem.id}>
                    <a href={storyItem.src} data-link data-linktext data-time={storyItem.time} data-type={storyItem.type} data-length={storyItem.length}>
                      <Image 
                        src={storyItem.preview} 
                        alt="story-item"
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover' }}
                      />
                    </a>
                  </li>;
          })}
            </ul>
          </div>;
    })}
    </div>;
};
export default StoryComponent;
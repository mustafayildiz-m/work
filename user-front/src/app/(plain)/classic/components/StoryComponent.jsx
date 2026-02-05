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
  return <div ref={storiesRef} className="storiesWrapper  stories user-icon carousel scroll-enable stories">
      {stories.map(story => {
      return <div key={story.id} className="story stories-square user-icon carousel" data-id={story.id} data-photo={story.photo} data-last-updated={story.time}>
            <Link className="item-link" href="">
              <span className="item-preview">
                <Image 
                  src={story.photo} 
                  alt="post"
                  width={40}
                  height={40}
                  priority
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
import { FormattedMessage } from "react-intl";
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Comments, Heading, Likes, Saves, Tabs } from '../post';

const Post2 = () => {
  const [activeTab, setActiveTab] = useState('saves');

  const comments = [
    {
      avatar: '300-1.png',
      author: 'Mr. Anderson',
      date: '1 Day ago',
      text: 'Long before you sit dow to put digital pen to paper you need to make sure you have to sit down and write. I’ll show you how to write a great blog post in five simple steps that people will actually want to read. Ready?',
    },
    {
      avatar: '300-15.png',
      author: 'Mrs. Anderson',
      date: '1 Day ago',
      text: 'Long before you sit dow to put digital pen to paper.',
    },
  ];

  return (
    <Card>
      <Heading
        author="Jenny Klabber"
        avatar={{ image: '300-1.png', imageClass: 'rounded-full size-[50px]' }}
        date="2 days ago"
      />
      <p className="mb-5 text-sm text-foreground leading-5.5 px-7.5">
        <FormattedMessage id="UI.I_CAN_HEAR_YOUR_OBJECTIONS_ALREADY_BUT_D" />
      </p>
      <div>
        <Tabs
          postId={2}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          comments={2}
          likes="24"
          saves={16}
          className="mx-7.5"
        />

        {activeTab === 'comments' && (
          <div id="post_2_comments">
            <Comments items={comments} />
          </div>
        )}
        {activeTab === 'likes' && (
          <div id="post_2_likes">
            <Likes />
          </div>
        )}
        {activeTab === 'saves' && (
          <div id="post_2_saves">
            <Saves />
          </div>
        )}
      </div>
    </Card>
  );
};

export { Post2 };

import { FormattedMessage } from "react-intl";
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Comments, Heading, Likes, Saves, Tabs } from '../post';

const Post4 = () => {
  const [activeTab, setActiveTab] = useState('comments');

  const comments = [
    {
      avatar: '300-3.png',
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
        date="Week ago"
      />
      <p className="text-sm text-foreground leading-5.5 mb-5 px-7.5">
        <FormattedMessage id="UI.THIS_DOESNT_MEAN_THAT_ALL_BLOGGERS_ARE_I" />
      </p>
      <div>
        <Tabs
          postId={4}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          comments={2}
          likes="47k"
          saves={900}
          className="mx-7.5"
        />

        {activeTab === 'comments' && (
          <div id="post_4_comments">
            <Comments items={comments} />
          </div>
        )}
        {activeTab === 'likes' && (
          <div id="post_4_likes">
            <Likes />
          </div>
        )}
        {activeTab === 'saves' && (
          <div id="post_4_saves">
            <Saves />
          </div>
        )}
      </div>
    </Card>
  );
};

export { Post4 };

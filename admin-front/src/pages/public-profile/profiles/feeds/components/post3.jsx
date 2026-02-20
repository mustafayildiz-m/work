import { FormattedMessage } from "react-intl";
import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Comments, Heading, Likes, Saves, Tabs } from '../post';

const Post3 = () => {
  const [activeTab, setActiveTab] = useState('likes');

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
        author="Finance Deprt - Annual Report"
        avatar={{
          icon: FileText,
          className:
            'flex items-center justify-center uppercase rounded-full size-[50px] shrink-0 bg-primary-light text-primary',
          iconClass: 'text-2xl',
        }}
        date="1 week ago"
      />
      <p className="text-sm text-foreground leading-5.5 px-7.5">
        <FormattedMessage id="UI.YOU_ALSO_NEED_TO_BE_ABLE_TO_ACCEPT_THAT_" />
      </p>
      <div className="p-7.5 pb-5">
        <iframe
          className="w-full aspect-video rounded-xl min-h-[400px]"
          src="https://www.youtube.com/embed/2uWJpnuCMKQ?si=6-ohuJieU2Fg3pDr"
        ></iframe>
      </div>
      <div>
        <Tabs
          postId={3}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          comments={27}
          likes="47k"
          saves={900}
          className="mx-7.5"
        />

        {activeTab === 'comments' && (
          <div id="post_3_comments">
            <Comments items={comments} />
          </div>
        )}
        {activeTab === 'likes' && (
          <div id="post_3_likes">
            <Likes />
          </div>
        )}
        {activeTab === 'saves' && (
          <div id="post_3_saves">
            <Saves />
          </div>
        )}
      </div>
    </Card>
  );
};

export { Post3 };

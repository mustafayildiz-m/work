'use client';

import * as React from 'react';
import * as Tabs from '@radix-ui/react-tabs';

function List({ orientation = 'vertical', children, ...props }) {
  const listRef = React.useRef(null);

  return (
    <Tabs.Root orientation={orientation} {...props}>
      <Tabs.List ref={listRef}>{children}</Tabs.List>
    </Tabs.Root>
  );
}

function ListItem({ children, ...props }) {
  return <Tabs.Trigger {...props}>{children}</Tabs.Trigger>;
}

export { List, ListItem };

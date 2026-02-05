'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreatePostCard from '@/components/cards/CreatePostCard';
import Posts from './components/Posts';

const Feed = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectToUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // If no token, redirect to login
          router.push('/auth/sign-in');
          return;
        }

        // Decode the JWT token to get user ID
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        const userId = decodedPayload.sub;

        if (userId) {
          // Redirect to the user's own profile feed
          router.push(`/profile/user/${userId}/feed`);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error redirecting to user profile:', error);
        setLoading(false);
      }
    };

    redirectToUserProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yönlendiriliyor...</span>
        </div>
        <p className="mt-3">Profilinize yönlendiriliyor...</p>
      </div>
    );
  }

  // Fallback: show the feed with CreatePostCard and Posts
  return (
    <>
      <CreatePostCard />
      <Posts showOwnPosts={true} />
    </>
  );
};

export default Feed;
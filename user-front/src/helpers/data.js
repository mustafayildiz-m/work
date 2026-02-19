import { celebrationData } from '@/assets/data/celebrations';
import { notificationData } from '@/assets/data/notification';
import { eventScheduleData, mediaData, userConnections, users } from '@/assets/data/other';
import { blogsData, eventData, groupsData, postVideosData, socialCommentsData, socialPostsData, trendingVideos } from '@/assets/data/social';
import { sleep } from '@/utils/promise';
export const getAllUsers = async () => {
  await sleep();
  return users;
};

export const getWhoToFollow = async (type = 'all', limit = 200) => {
  try {
    const token = localStorage.getItem('token');

    // If no token, don't attempt to fetch from protected endpoint
    if (!token) {
      return users.slice(0, limit);
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/who-to-follow?type=${type}&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Silently handle 401 for invalid tokens
      if (response.status === 401) {
        return users.slice(0, limit);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching who to follow data:', error);
    // Fallback to static data if API fails
    return users.slice(0, limit);
  }
};
export const getAllNotifications = async () => {
  await sleep();
  return notificationData;
};
export const getAllEvents = async () => {
  await sleep();
  return eventData;
};
export const getEventById = async id => {
  const data = eventData.find(event => event.id === id);
  await sleep();
  return data;
};
export const getGroupById = async id => {
  const data = groupsData.find(group => group.id === id);
  await sleep();
  return data;
};
export const getAllGroups = async () => {
  await sleep();
  return groupsData;
};
export const getAllMedia = async () => {
  await sleep();
  return mediaData;
};
export const getAllBlogs = async () => {
  await sleep();
  return blogsData;
};
export const getAllEventSchedules = async () => {
  const data = eventScheduleData.map(schedule => {
    const user = users.find(user => user.id === schedule.userId);
    const speakers = schedule.speakerId.map(speaker => {
      const teamSpeaker = users.find(user => user.id === speaker);
      if (teamSpeaker) {
        return teamSpeaker;
      }
    });
    return {
      ...schedule,
      user,
      speakers
    };
  });
  await sleep();
  return data;
};
export const getAllUserConnections = async () => {
  const data = userConnections.map(connection => {
    const user = users.find(user => user.id === connection.userId);
    return {
      ...connection,
      user
    };
  });
  await sleep();
  return data;
};
export const getAllCelebrations = async () => {
  const data = celebrationData.map(celebration => {
    const user = users.find(user => user.id === celebration.userId);
    return {
      ...celebration,
      user
    };
  });
  await sleep();
  return data;
};
export const getAllTrendingVideos = async () => {
  const data = trendingVideos.map(video => {
    const user = users.find(user => user.id === video.userId);
    return {
      ...video,
      user
    };
  });
  await sleep();
  return data;
};
export const getAllPostVideos = async () => {
  const data = postVideosData.map(video => {
    const user = users.find(user => user.id === video.userId);
    return {
      ...video,
      user
    };
  });
  await sleep();
  return data;
};
export const getUserById = async id => {
  const data = users.find(user => user.id === id);
  await sleep();
  return data;
};
export const getBlogById = async id => {
  const data = blogsData.find(blog => blog.id === id);
  await sleep();
  return data;
};
export const getUserForAllComments = commentsData => {
  return commentsData.map(comment => {
    const socialUser = users.find(user => user.id === comment.socialUserId);
    if (comment.children) {
      comment.children = getUserForAllComments(comment.children);
    }
    return {
      ...comment,
      socialUser
    };
  });
};
export const getAllFeeds = async () => {
  const data = socialPostsData.map(post => {
    const socialUser = users.find(user => user.id === post.socialUserId);
    const commentsData = socialCommentsData.filter(comment => comment.postId === post.id);
    let comments;
    if (commentsData.length) {
      comments = getUserForAllComments(commentsData);
    }
    return {
      ...post,
      socialUser,
      comments
    };
  });
  await sleep();
  return data;
};

export const getTimelinePosts = async (userId, language = 'tr') => {
  try {
    const token = localStorage.getItem('token');


    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error('API URL not configured. Please check environment variables.');
    }

    if (!userId || userId === 'undefined') {
      console.error('getTimelinePosts: Invalid userId provided', userId);
      return { posts: [], total: 0 }; // Return empty structure
    }

    // Dil parametresi ile API çağrısı
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/user-posts/timeline/${userId}`);
    if (language) {
      url.searchParams.append('language', language);
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      headers: headers,
    });


    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (response.status === 404) {
        throw new Error('Timeline not found for this user.');
      } else {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching timeline posts:', error);
    // Don't fallback to static data, throw the error instead
    throw error;
  }
};
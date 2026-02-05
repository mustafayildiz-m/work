'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const SearchContext = createContext();

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    users: [],
    scholars: [],
    followers: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState('all'); // 'all', 'users', 'scholars', 'followers'
  const [showResults, setShowResults] = useState(false);

  // Debug: Session bilgisini logla

  const getAuthHeaders = useCallback(() => {
    // NextAuth session'da access_token field'ı var, accessToken değil
    const token = session?.access_token || session?.accessToken;
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  }, [session?.access_token, session?.accessToken]);

  const searchUsers = useCallback(async (query, limit = 10) => {
    const token = session?.access_token || session?.accessToken;
    if (!query.trim() || !token) {
      return [];
    }
    
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/search/users?q=${encodeURIComponent(query)}&limit=${limit}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      
      if (response.ok) {
        const data = await response.json();
        return data.results || [];
      }
      
      const errorText = await response.text();
      return [];
    } catch (error) {
      // console.error('❌ Error searching users:', error);
      return [];
    }
  }, [session?.access_token, session?.accessToken, getAuthHeaders]);

  const searchScholars = useCallback(async (query, limit = 10) => {
    const token = session?.access_token || session?.accessToken;
    if (!query.trim() || !token) {
      return [];
    }
    
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/search/scholars?q=${encodeURIComponent(query)}&limit=${limit}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      
      if (response.ok) {
        const data = await response.json();
        return data.results || [];
      }
      
      const errorText = await response.text();
      return [];
    } catch (error) {
      // console.error('❌ Error searching scholars:', error);
      return [];
    }
  }, [session?.access_token, session?.accessToken, getAuthHeaders]);

  const searchFollowers = useCallback(async (query, limit = 10) => {
    const token = session?.access_token || session?.accessToken;
    if (!query.trim() || !token) {
      return [];
    }
    
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/search/followers?q=${encodeURIComponent(query)}&limit=${limit}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      
      if (response.ok) {
        const data = await response.json();
        // API'den dönen users array'ini followers olarak kullan
        return data.users || data.results || [];
      }
      
      const errorText = await response.text();
      return [];
    } catch (error) {
      // console.error('❌ Error searching followers:', error);
      return [];
    }
  }, [session?.access_token, session?.accessToken, getAuthHeaders]);

  const performSearch = useCallback(async (query, type = 'all') => {
    const token = session?.access_token || session?.accessToken;
    
    if (!query.trim() || !token) {
      setSearchResults({ users: [], scholars: [], followers: [] });
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);
    setSearchType(type);

    try {
      
      // Genel arama API'yi kullan
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/search?q=${encodeURIComponent(query)}&type=all&limit=20`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      
      if (response.ok) {
        const data = await response.json();
        
        // Sonuçları kategorilere ayır
        let results = { users: [], scholars: [], followers: [] };
        
        if (data.results && Array.isArray(data.results)) {
          data.results.forEach(item => {
            if (item.type === 'scholar') {
              results.scholars.push({
                id: item.id,
                name: item.fullName,
                username: item.fullName.toLowerCase().replace(/\s+/g, '.'),
                bio: item.biography,
                profilePicture: item.photoUrl ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${item.photoUrl}` : '/profile/profile.png',
                lineage: item.lineage,
                birthDate: item.birthDate,
                deathDate: item.deathDate,
                locationName: item.locationName,
                isFollowed: item.isFollowed
              });
            } else if (item.type === 'user') {
              results.users.push({
                id: item.id,
                name: item.fullName,
                username: item.fullName.toLowerCase().replace(/\s+/g, '.'),
                bio: item.biography,
                profilePicture: item.photoUrl ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${item.photoUrl}` : '/profile/profile.png'
              });
            } else if (item.type === 'follower') {
              results.followers.push({
                id: item.id,
                name: item.fullName,
                username: item.fullName.toLowerCase().replace(/\s+/g, '.'),
                bio: item.biography,
                profilePicture: item.photoUrl ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${item.photoUrl}` : '/profile/profile.png'
              });
            }
          });
        }
        
        setSearchResults(results);
        setShowResults(true);
      } else {
        const errorText = await response.text();
        
        // Fallback: Eski arama yöntemini kullan
        let results = { users: [], scholars: [], followers: [] };

        if (type === 'all' || type === 'users') {
          results.users = await searchUsers(query);
        }

        if (type === 'all' || type === 'scholars') {
          results.scholars = await searchScholars(query);
        }

        if (type === 'all' || type === 'followers') {
          results.followers = await searchFollowers(query);
        }

        setSearchResults(results);
        setShowResults(true);
      }
    } catch (error) {
      // console.error('❌ Search error:', error);
      
      // Fallback: Eski arama yöntemini kullan
      let results = { users: [], scholars: [], followers: [] };

      if (type === 'all' || type === 'users') {
        results.users = await searchUsers(query);
      }

      if (type === 'all' || type === 'scholars') {
        results.scholars = await searchScholars(query);
      }

      if (type === 'all' || type === 'followers') {
        results.followers = await searchFollowers(query);
      }

      setSearchResults(results);
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  }, [searchUsers, searchScholars, searchFollowers, session?.access_token, session?.accessToken]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults({ users: [], scholars: [], followers: [] });
    setShowResults(false);
  }, []);

  const value = {
    searchQuery,
    searchResults,
    isSearching,
    searchType,
    showResults,
    performSearch,
    clearSearch,
    setSearchType,
    setShowResults
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

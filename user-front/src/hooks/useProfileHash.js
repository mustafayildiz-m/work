'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { decodeProfileId, encodeProfileId, isNumericProfileId } from '@/utils/profileEncoder';

/**
 * Profile sayfalarında hash/ID çözümlemesi için hook
 * - Hash ise decode eder, numeric ID döner
 * - Numeric ID ise hash URL'e yönlendirir (eski linkler için)
 * @returns {{ profileId: number|null, profileHash: string|null, type: string|null, isValid: boolean, isLoading: boolean }}
 */
export const useProfileHash = () => {
  const params = useParams();
  const router = useRouter();
  const paramId = params?.id;

  const result = useMemo(() => {
    if (!paramId || typeof paramId !== 'string') {
      return { profileId: null, profileHash: null, type: null, isValid: false };
    }

    // Numeric ID (eski format) - decode gerekmez, ama redirect için işaretle
    if (isNumericProfileId(paramId)) {
      const id = parseInt(paramId, 10);
      return {
        profileId: id,
        profileHash: paramId, // Geçici, redirect'te hash üretilecek
        type: null, // URL'den bilinemiyor, path'e bakılmalı
        isValid: true,
        isNumeric: true,
      };
    }

    // Hash formatı - decode et
    const decoded = decodeProfileId(paramId);
    if (!decoded) {
      return { profileId: null, profileHash: paramId, type: null, isValid: false };
    }

    return {
      profileId: decoded.id,
      profileHash: paramId,
      type: decoded.type,
      isValid: true,
      isNumeric: false,
    };
  }, [paramId]);

  // Numeric ID ile user profile'a girilirse hash URL'e yönlendir
  useEffect(() => {
    if (result.isValid && result.isNumeric && result.profileId) {
      const pathName = typeof window !== 'undefined' ? window.location.pathname : '';
      if (pathName.includes('/profile/user/')) {
        const hash = encodeProfileId('user', result.profileId);
        const newPath = pathName.replace(`/profile/user/${paramId}`, `/profile/user/${hash}`);
        if (newPath !== pathName) {
          router.replace(newPath);
        }
      } else if (pathName.includes('/profile/scholar/')) {
        const hash = encodeProfileId('scholar', result.profileId);
        const newPath = pathName.replace(`/profile/scholar/${paramId}`, `/profile/scholar/${hash}`);
        if (newPath !== pathName) {
          router.replace(newPath);
        }
      }
    }
  }, [result.isValid, result.isNumeric, result.profileId, paramId, router]);

  return {
    ...result,
    isLoading: false,
  };
};

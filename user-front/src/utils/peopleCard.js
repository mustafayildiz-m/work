import { getImageUrl } from './image';

export const getPersonCoverUrl = (person) => {
  const cover = person?.coverImage || person?.cover_image;
  if (cover) return getImageUrl(cover);
  if (person?.photoUrl) return getImageUrl(person.photoUrl);
  return null;
};

export const getPersonAvatarUrl = (photoUrl, fallback = '/profile/profile.png') => {
  return getImageUrl(photoUrl) || fallback;
};

export const stripPersonBio = (text) => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').trim();
};

export const truncateBio = (text, max = 80) => {
  const clean = stripPersonBio(text);
  if (!clean) return '';
  if (clean.length <= max) return clean;
  return `${clean.substring(0, max)}...`;
};

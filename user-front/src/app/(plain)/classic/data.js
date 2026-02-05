import { BsBell, BsBellFill, BsBookmarkHeartFill, BsCalendarEventFill, BsCameraReels, BsCardChecklist, BsChatLeft, BsChatLeftText, BsCollectionFill, BsFileText, BsFolder, BsGearWideConnected, BsHouse, BsImages, BsNewspaper, BsPeople, BsUiRadiosGrid, BsMicFill } from 'react-icons/bs';

export const menuData = [{
  label: 'Ana Sayfa',
  icon: BsHouse
}, {
  label: 'Albümler',
  icon: BsFolder
}, {
  label: 'Gruplar',
  icon: BsPeople
}, {
  label: 'Mesajlaşma',
  icon: BsChatLeft,
  isBadge: true
}, {
  label: 'Bildirimler',
  icon: BsBell,
  isBadge: true
}, {
  label: 'Ağım',
  icon: BsUiRadiosGrid,
  isBadge: true
}];

export const leftSidebarData = [{
  icon: BsCardChecklist,
  label: 'Haber Akışı',
  url: '/profile/feed'
}, {
  icon: BsPeople,
  label: 'Kitaplar',
  url: '/profile/connections'
}, {
  icon: BsFileText,
  label: 'Makaleler',
  url: '/feed/articles'
}, {
  icon: BsMicFill,
  label: 'Podcast',
  url: '/feed/podcasts'
}, {
  icon: BsNewspaper,
  label: 'Son Haberler',
  url: '/blogs'
}, {
  icon: BsCalendarEventFill,
  label: 'Etkinlikler',
  url: '/feed/events'
}, {
  icon: BsCollectionFill,
  label: 'Gruplar',
  url: '/feed/groups'
}, {
  icon: BsBellFill,
  label: 'Bildirimler',
  url: '/notifications'
}, {
  icon: BsGearWideConnected,
  label: 'Ayarlar',
  url: '/settings/account'
}, {
  icon: BsImages,
  label: 'Fotoğraflar',
  url: '/feed/albums'
}, {
  icon: BsBookmarkHeartFill,
  label: 'Kutlama',
  url: '/feed/celebration'
}, {
  icon: BsCameraReels,
  label: 'Video',
  url: '/feed/post-videos'
}, {
  icon: BsChatLeftText,
  label: 'Mesajlaşma',
  url: '/messaging'
}];

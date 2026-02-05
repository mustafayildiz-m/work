import homeImg from '@/assets/images/icon/home-outline-filled.svg';
import personImg from '@/assets/images/icon/person-outline-filled.svg';
import medalImg from '@/assets/images/icon/medal-outline-filled.svg';
import clockImg from '@/assets/images/icon/clock-outline-filled.svg';
import earthImg from '@/assets/images/icon/earth-outline-filled.svg';
import notificationImg from '@/assets/images/icon/notification-outlined-filled.svg';
import cogImg from '@/assets/images/icon/cog-outline-filled.svg';
import bookOpenImg from '@/assets/images/icon/book-open-outline-filled.svg';
import bookImg from '@/assets/images/icon/book-outline-filled.svg';
import likeImg from '@/assets/images/icon/like-outline-filled.svg';
import starImg from '@/assets/images/icon/star-outline-filled.svg';
import taskDoneImg from '@/assets/images/icon/task-done-outline-filled.svg';
import arrowBoxedImg from '@/assets/images/icon/arrow-boxed-outline-filled.svg';
import shieldImg from '@/assets/images/icon/shield-outline-filled.svg';
import handshakeImg from '@/assets/images/icon/handshake-outline-filled.svg';
import chatAltImg from '@/assets/images/icon/chat-alt-outline-filled.svg';
import trashImg from '@/assets/images/icon/trash-var-outline-filled.svg';
import clipboardImg from '@/assets/images/icon/clipboard-list-outline-filled.svg';
import microphoneImg from '@/assets/images/icon/chat-alt-outline-filled.svg'; // Geçici olarak chat-alt kullanıyoruz

export const profilePanelLinksData1 = [{
  image: typeof homeImg === 'string' ? homeImg : homeImg.src,
  nameKey: 'menu.feed',
  link: '/feed/home'
}, {
  image: typeof earthImg === 'string' ? earthImg : earthImg.src,
  nameKey: 'menu.worldNews',
  link: '/blogs'
}, {
  image: typeof bookOpenImg === 'string' ? bookOpenImg : bookOpenImg.src,
  nameKey: 'menu.islamicScholars',
  link: '/feed/scholars'
}, {
  image: typeof personImg === 'string' ? personImg : personImg.src,
  nameKey: 'menu.users',
  link: '/feed/who-to-follow'
}, {
  image: typeof bookImg === 'string' ? bookImg : bookImg.src,
  nameKey: 'menu.books',
  link: '/feed/books'
}, {
  image: typeof clipboardImg === 'string' ? clipboardImg : clipboardImg.src,
  nameKey: 'menu.articles',
  link: '/feed/articles'
}, {
  image: typeof microphoneImg === 'string' ? microphoneImg : microphoneImg.src,
  nameKey: 'menu.podcast',
  link: '/feed/podcasts'
}];

export const profilePanelLinksData2 = [{
  image: typeof homeImg === 'string' ? homeImg : homeImg.src,
  name: 'Akış',
  link: '/profile/feed'
}, {
  image: typeof medalImg === 'string' ? medalImg : medalImg.src,
  name: 'Popüler',
  link: ''
}, {
  image: typeof clockImg === 'string' ? clockImg : clockImg.src,
  name: 'Yakın zamanda',
  link: ''
}, {
  image: typeof likeImg === 'string' ? likeImg : likeImg.src,
  name: 'Abonelikler',
  link: ''
}, {
  image: typeof starImg === 'string' ? starImg : starImg.src,
  name: 'Favorilerim',
  link: ''
}, {
  image: typeof taskDoneImg === 'string' ? taskDoneImg : taskDoneImg.src,
  name: 'Favori Listesi',
  link: ''
}, {
  image: typeof notificationImg === 'string' ? notificationImg : notificationImg.src,
  name: 'Bildirimler',
  link: '/notifications'
}, {
  image: typeof cogImg === 'string' ? cogImg : cogImg.src,
  name: 'Ayarlar',
  link: '/settings/account'
}, {
  image: typeof arrowBoxedImg === 'string' ? arrowBoxedImg : arrowBoxedImg.src,
  name: 'Çıkış yap',
  link: '/auth/sign-in'
}];
export const settingPanelLinksData = [{
  image: typeof personImg === 'string' ? personImg : personImg.src,
  nameKey: 'menu.account',
  link: '/settings/account'
},
// {
//   image: notificationImg,
//   nameKey: 'menu.notifications',
//   link: '/settings/notification'
// }, {
//   image: shieldImg,
//   nameKey: 'menu.privacy',
//   link: '/settings/privacy'
// }, {
//   image: handshakeImg,
//   nameKey: 'menu.communication',
//   link: '/settings/communication'
// }, {
//   image: chatAltImg,
//   nameKey: 'menu.messaging',
//   link: '/settings/messaging'
// }, 
{
  image: typeof trashImg === 'string' ? trashImg : trashImg.src,
  nameKey: 'menu.closeAccount',
  link: '/settings/close-account'
}];
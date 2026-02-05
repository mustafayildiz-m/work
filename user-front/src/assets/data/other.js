import { addOrSubtractDaysFromDate, addOrSubtractMinutesFromDate } from '@/utils/date';
import avatar1 from '@/assets/images/avatar/01.jpg';
import avatar2 from '@/assets/images/avatar/02.jpg';
import avatar3 from '@/assets/images/avatar/03.jpg';
import avatar4 from '@/assets/images/avatar/04.jpg';
import avatar5 from '@/assets/images/avatar/05.jpg';
import avatar6 from '@/assets/images/avatar/06.jpg';
import avatar7 from '@/assets/images/avatar/07.jpg';
import avatar8 from '@/assets/images/avatar/08.jpg';
import avatar9 from '@/assets/images/avatar/09.jpg';
import avatar10 from '@/assets/images/avatar/10.jpg';
import avatar11 from '@/assets/images/avatar/11.jpg';
import avatar12 from '@/assets/images/avatar/12.jpg';
import album1 from '@/assets/images/albums/01.jpg';
import album2 from '@/assets/images/albums/02.jpg';
import album3 from '@/assets/images/albums/03.jpg';
import album4 from '@/assets/images/albums/04.jpg';
import album5 from '@/assets/images/albums/05.jpg';
import album6 from '@/assets/images/albums/06.jpg';
import element14 from '@/assets/images/elements/14.svg';
export const users = [{
  id: '101',
  name: 'Ahmed El-Ghazzali',
  avatar: avatar1,
  mutualCount: 50,
  role: 'İslami Bilgin',
  status: 'çevrimiçi',
  lastMessage: 'Ahmed, Sufizm üzerine bir ders paylaştı.',
  lastActivity: addOrSubtractMinutesFromDate(0),
  bio: 'İslami felsefe ve Sufizm üzerine tutkuyla çalışan bir araştırmacı.',
  followers: 2200,
  following: 600
}, {
  id: '102',
  name: 'Fatimah al-Zahra',
  avatar: avatar2,
  mutualCount: 33,
  isStory: true,
  role: 'İslami Bilgin ve Tarihçi',
  status: 'çevrimiçi',
  lastMessage: 'Fatimah, İslami tarih hakkında bir parça paylaştı.',
  lastActivity: addOrSubtractMinutesFromDate(1),
  bio: 'Erken İslam tarihi ve Ahl al-Bayt üzerine uzmanlaşmış bir tarihçi ve bilgin.',
  followers: 1800,
  following: 700
}, {
  id: '103',
  name: 'İbn Sina (Avicenna)',
  avatar: avatar3,
  mutualCount: 21,
  hasRequested: true,
  role: 'Felsefeci ve Hekim',
  status: 'çevrimdışı',
  lastMessage: 'İbn Sina, yeni bir tıbbi risale yayımladı.',
  lastActivity: addOrSubtractMinutesFromDate(2),
  bio: 'Felsefeci, hekim ve çok yönlü bir bilim insanı. Tıp ve felsefe üzerine pek çok etkili eser yazmıştır.',
  followers: 3000,
  following: 1200
}, {
  id: '104',
  name: 'İmam Şafi‘i',
  avatar: avatar4,
  mutualCount: 45,
  role: 'İslami Hukukçu',
  status: 'çevrimdışı',
  lastMessage: 'İmam Şafi‘i, yeni bir fıkıh prensibi paylaştı.',
  lastActivity: addOrSubtractMinutesFromDate(10),
  bio: 'Şafi‘i mezhebinin kurucusu, açık ve özlü hukuki hükümler sunmaya adanmış bir alim.',
  followers: 1500,
  following: 500
}, {
  id: '105',
  name: 'Al-Ghazali',
  avatar: avatar5,
  mutualCount: 35,
  role: 'İslami Teolog',
  status: 'çevrimiçi',
  lastMessage: 'Al-Ghazali, manevi hayat üzerine görüşlerini paylaştı.',
  lastActivity: addOrSubtractMinutesFromDate(120),
  bio: 'İslami felsefe ve manevi hayat üzerine önemli katkılar sunmuş, özellikle tasavvuf ve etik alanlarında etkili olmuştur.',
  followers: 2500,
  following: 800
}, {
  id: '106',
  name: 'İbn Arabi',
  avatar: avatar6,
  mutualCount: 50,
  role: 'Sufi Usta',
  status: 'çevrimiçi',
  lastMessage: 'İbn Arabi, ilahi aşk üzerine bir şiir paylaştı.',
  lastActivity: addOrSubtractDaysFromDate(1),
  bio: 'İslam mistisizminin önemli isimlerinden bir sufi usta ve şair.',
  followers: 5000,
  following: 1300
}, {
  id: '107',
  name: 'Said Nursi',
  avatar: avatar8,
  mutualCount: 33,
  role: 'İslami Bilgin',
  status: 'çevrimdışı',
  lastMessage: 'Said Nursi, Kur’an üzerine yeni bir yorum yazdı.',
  lastActivity: addOrSubtractDaysFromDate(4),
  bio: 'Risale-i Nur koleksiyonu ile tanınan, İslam’ı derinlemesine anlatan önemli bir alim.',
  followers: 2300,
  following: 900
}, {
  id: '108',
  name: 'İmam Ali',
  avatar: avatar9,
  mutualCount: 33,
  role: 'Şii İmamı',
  status: 'çevrimdışı',
  lastMessage: 'İmam Ali, adalet üzerine bir ders verdi.',
  lastActivity: addOrSubtractDaysFromDate(4),
  bio: 'Peygamber Muhammed’in kuzeni ve dört halifeden biri. Bilgelik ve adaletle tanınır.',
  followers: 6000,
  following: 2500
}, {
  id: '109',
  name: 'İbn Kesir',
  avatar: avatar10,
  mutualCount: 33,
  role: 'İslami Bilgin ve Tefsirci',
  status: 'çevrimiçi',
  lastMessage: 'İbn Kesir, yeni bir tefsir ayeti yorumlaması paylaştı.',
  lastActivity: addOrSubtractDaysFromDate(6),
  bio: 'Kur’an tefsiri alanında en çok başvurulan İslami eserlerden birine sahip olan ünlü bir alim.',
  followers: 3300,
  following: 1100
}, {
  id: '110',
  name: 'İmam Buhari',
  avatar: avatar11,
  mutualCount: 33,
  role: 'Hadis Derleyicisi',
  status: 'çevrimiçi',
  lastMessage: 'İmam Buhari, yeni bir hadis derlemesi paylaştı.',
  lastActivity: addOrSubtractDaysFromDate(10),
  bio: 'Sahih al-Buhari’nin derleyicisi, İslam’ın en güvenilir hadis koleksiyonlarından birini oluşturmuştur.',
  followers: 4000,
  following: 1500
}, {
  id: '111',
  name: 'Şeyh Nazım',
  avatar: avatar12,
  mutualCount: 33,
  role: 'Sufi Şeyhi',
  status: 'çevrimdışı',
  lastMessage: 'Şeyh Nazım, iç huzur üzerine bir öğreti paylaştı.',
  lastActivity: addOrSubtractDaysFromDate(18),
  bio: 'Tasavvuf yolunda pek çok insanı etkileyen bir sufi şeyhi.',
  followers: 5000,
  following: 1800
}];

export const userConnections = [{
  id: '251',
  userId: '101',
  role: 'İmam',
  sharedConnectionAvatars: [avatar1, avatar2, avatar3, avatar4, avatar5],
  description: 'Şeyh Ahmed, Molla Fatma, ve 20 diğer ortak bağlantı'
}, {
  id: '252',
  userId: '102',
  role: 'Müftü | Hoca',
  sharedConnectionAvatars: [avatar4, avatar6, avatar7, avatar8],
  description: 'Hoca Ahmet, Molla Leyla, ve 10 diğer ortak bağlantı'
}, {
  id: '253',
  userId: '103',
  role: 'Şeyh',
  description: 'Molla Ali ve Hoca Yusuf ile ortak bağlantılar'
}, {
  id: '254',
  userId: '104',
  role: 'Dini Bilgini | İmam',
  description: 'Hoca Ahmet, Molla Hatice, ve 115 diğer ortak bağlantılar'
}, {
  id: '255',
  userId: '105',
  role: 'Dini Alim',
  description: 'Şeyh Osman ve Molla Zeynep ile ortak bağlantılar'
}];
export const eventScheduleData = [{
  id: '901',
  userId: '101',
  date: addOrSubtractDaysFromDate(1, true),
  title: 'İman Yolunda Birlikte Yürümek',
  description: 'Müslümanların bir araya gelerek İslam\'ın güzelliklerini tartıştığı bu etkinlikte, toplumsal huzurun temelleri üzerine konuşulacak. Allah’ın rızasını kazanmak için kardeşlik bağlarını kuvvetlendirmeyi hedefleyen bir program olacaktır.',
  speakerId: ['101', '102']
}, {
  id: '902',
  userId: '102',
  date: addOrSubtractDaysFromDate(380),
  title: '2000 Yıldır İslam\'ın İzinde',
  description: 'İslam’ın geçmişten günümüze gelişimi ve onun insanlığa katkıları hakkında derinlemesine bir konuşma yapılacak. Bu etkinlikte, İslam medeniyetinin insanlık tarihindeki yerini daha iyi anlamak için önemli bir fırsat olacak.',
  speakerId: ['103', '104']
}, {
  id: '903',
  userId: '103',
  date: addOrSubtractDaysFromDate(980),
  title: 'İslam Medeniyetinin Temelleri',
  description: 'Müslümanların tarih boyunca inşa ettikleri büyük medeniyetin temellerini keşfetmeye yönelik bir sunum yapılacak. İslam’ın dünyadaki etkisi ve medeniyetlere kattığı değerler üzerinde durulacak.',
  speakerId: ['105', '106']
}, {
  id: '904',
  userId: '104',
  date: addOrSubtractDaysFromDate(480),
  title: 'İslam’da Ahlak ve İyilik',
  description: 'İslam’da ahlak ve insanlara karşı sorumluluklarımız üzerine bir konuşma gerçekleştirilecek. Toplumun huzuru ve bireylerin gelişimi için İslam’ın sunduğu ahlaki prensipler tartışılacak.',
  speakerId: ['106', '107']
}];

export const mediaData = [{
  id: '851',
  image: album1,
  comments: 3000,
  likes: 22000,
  time: '02:20',
  title: 'Kapak fotoğrafları',
  count: 5
}, {
  id: '852',
  image: album2,
  comments: 12000,
  likes: 32000,
  time: '01:15',
  title: 'Profil fotoğrafları',
  count: 20
}, {
  id: '853',
  image: album3,
  comments: 4000,
  likes: 21000,
  time: '02:00',
  title: 'İsimsiz fotoğraflar',
  count: 12
}, {
  id: '854',
  image: album4,
  comments: 16000,
  likes: 32000,
  time: '01:00'
}, {
  id: '855',
  image: album5,
  comments: 8000,
  likes: 20000,
  time: '02:20'
}, {
  id: '856',
  image: album6,
  comments: 12000,
  likes: 56000,
  time: '02:20'
}];
export const messages = [];
const defaultTo = {
  id: '108',
  lastActivity: addOrSubtractMinutesFromDate(0),
  lastMessage: 'Selamünaleyküm! Teşekkürler, haber verdiğin için sağ ol. Görüşmek üzere inşallah!',
  status: 'online',
  avatar: avatar10,
  mutualCount: 30,
  name: 'Judy Nguyen',
  role: 'İslam Alimi'
};
for (const user of users) {
  messages.push({
    id: '451',
    to: defaultTo,
    from: user,
    message: 'Gazetelerdeki keşiflerinize hayran kaldım, Allah razı olsun😊',
    sentOn: addOrSubtractMinutesFromDate(110)
  }, {
    id: '452',
    to: user,
    from: defaultTo,
    message: 'Memnuniyetle, Allah’ın izniyle yardımcı olacağım.',
    sentOn: addOrSubtractMinutesFromDate(100),
    isRead: true
  }, {
    id: '454',
    to: user,
    from: defaultTo,
    message: 'Evime gelen misafirlere hizmet etmek için dua ettim.',
    sentOn: addOrSubtractMinutesFromDate(100),
    isRead: true
  }, {
    id: '455',
    to: defaultTo,
    from: user,
    message: 'Lütfen ekli dosyaları kontrol ediniz, Allah yardımcınız olsun.',
    sentOn: addOrSubtractMinutesFromDate(90)
  }, {
    id: '456',
    to: defaultTo,
    from: user,
    message: 'Yardımlarınız için Allah’a şükürler olsun, çok değerli ve faydalı.',
    sentOn: addOrSubtractMinutesFromDate(80)
  }, {
    id: '457',
    to: defaultTo,
    from: user,
    message: 'Tebrikler! Allah sizi her zaman başarıya ulaştırsın.',
    sentOn: addOrSubtractMinutesFromDate(80),
    image: element14
  }, {
    id: '458',
    to: user,
    from: defaultTo,
    message: 'Allah’a emanet olun, bu konuda size güveniyorum ve destek veriyorum.',
    sentOn: addOrSubtractMinutesFromDate(80),
    isSend: true
  },
  {
    id: '459',
    to: defaultTo,
    from: user,
    message: 'Hac yolculuğu ve hayatın zorluklarına dair düşüncelerimi paylaşmak istiyorum. Allah her adımda yardımcımız olsun.',
    sentOn: addOrSubtractMinutesFromDate(80)
  });
}

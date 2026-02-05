import { addOrSubtractDaysFromDate, addOrSubtractMinutesFromDate } from '@/utils/date';
import postImg1 from '@/assets/images/post/3by2/01.jpg';
import postImg2 from '@/assets/images/post/3by2/02.jpg';
import postImg3 from '@/assets/images/post/3by2/03.jpg';
import element12 from '@/assets/images/elements/12.svg';
import videoImg1 from '@/assets/images/post/16by9/large/01.jpg';
import videoImg2 from '@/assets/images/post/16by9/large/02.jpg';
import videoImg3 from '@/assets/images/post/16by9/large/03.jpg';
import videoImg4 from '@/assets/images/post/16by9/large/04.jpg';
import videoImg5 from '@/assets/images/post/16by9/large/05.jpg';
import videoImg11 from '@/assets/images/post/16by9/large/11.jpg';
import videoImg12 from '@/assets/images/post/16by9/large/12.jpg';
import videoImg13 from '@/assets/images/post/16by9/large/13.jpg';
import videoImg14 from '@/assets/images/post/16by9/large/14.jpg';
import videoImg15 from '@/assets/images/post/16by9/large/15.jpg';
import event1 from '@/assets/images/events/01.jpg';
import event2 from '@/assets/images/events/02.jpg';
import event3 from '@/assets/images/events/03.jpg';
import event4 from '@/assets/images/events/04.jpg';
import event5 from '@/assets/images/events/05.jpg';
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
import avatar14 from '@/assets/images/avatar/14.jpg';
import logo8 from '@/assets/images/logo/08.svg';
import logo1 from '@/assets/images/logo/01.svg';
import logo2 from '@/assets/images/logo/02.svg';
import logo3 from '@/assets/images/logo/03.svg';
import logo5 from '@/assets/images/logo/05.svg';
import logo9 from '@/assets/images/logo/09.svg';
import logo10 from '@/assets/images/logo/10.svg';
import logo12 from '@/assets/images/logo/12.svg';
import backgroundImg1 from '@/assets/images/bg/01.jpg';
import backgroundImg2 from '@/assets/images/bg/02.jpg';
import backgroundImg3 from '@/assets/images/bg/03.jpg';
import backgroundImg4 from '@/assets/images/bg/04.jpg';
import backgroundImg5 from '@/assets/images/bg/05.jpg';
import blogPost1 from '@/assets/images/post/4by3/03.jpg';
import blogPost4 from '@/assets/images/post/4by3/04.jpg';
import blogPost5 from '@/assets/images/post/4by3/05.jpg';
import blogPost6 from '@/assets/images/post/4by3/06.jpg';
import post1 from '@/assets/images/post/16by9/01.jpg';
import post2 from '@/assets/images/post/16by9/02.jpg';
import post3 from '@/assets/images/post/16by9/03.jpg';
import post4 from '@/assets/images/post/16by9/04.jpg';
import post5 from '@/assets/images/post/16by9/05.jpg';
import post6 from '@/assets/images/post/16by9/06.jpg';
import post7 from '@/assets/images/post/16by9/07.jpg';
import post8 from '@/assets/images/post/16by9/08.jpg';
import post9 from '@/assets/images/post/16by9/09.jpg';
import post10 from '@/assets/images/post/16by9/10.jpg';
import post11 from '@/assets/images/post/16by9/11.jpg';
import post12 from '@/assets/images/post/16by9/12.jpg';
import post13 from '@/assets/images/post/16by9/13.jpg';
import post14 from '@/assets/images/post/16by9/14.jpg';
export const socialCommentsData = [{
  id: '401',
  postId: '10001',
  comment: 'Zahiren meşakkatli olan işler, nefsi taleplerin terkinden sonra kolaylaşır. Lakin bazı yollar, tecelliye mazhar olmaz; çünkü yöneliş niyetsizdir.',
  likesCount: 3,
  socialUserId: '103',
  createdAt: addOrSubtractMinutesFromDate(300),
  children: [{
    id: '402',
    comment: 'Güzellik niyetle açığa çıkar; edep ve haya ile bezenen hâl, kalbi mesrur eder. Fakat bazı sözler, anlamayan kulaklara çarpıp geri döner.',
    postId: '10002',
    likesCount: 5,
    replyTo: '401',
    socialUserId: '104',
    createdAt: addOrSubtractMinutesFromDate(120)
  }, {
    id: '405',
    comment: 'Duanın kabulü, bazen bir çağrının isabetli yankısıdır; bahtı açık olanın nasibi de hazırdır.',
    postId: '10002',
    likesCount: 0,
    replyTo: '401',
    socialUserId: '102',
    createdAt: addOrSubtractMinutesFromDate(15)
  }]
}, {
  id: '403',
  postId: '10001',
  comment: 'Zahiren meşakkatli olan işler, nefsi taleplerin terkinden sonra kolaylaşır. Lakin bazı yollar, tecelliye mazhar olmaz; çünkü yöneliş niyetsizdir.',
  likesCount: 1,
  socialUserId: '105',
  createdAt: addOrSubtractMinutesFromDate(4)
}, {
  id: '404',
  postId: '10002',
  comment: 'Zahiren meşakkatli olan işler, nefsi taleplerin terkinden sonra kolaylaşır. Lakin bazı yollar, tecelliye mazhar olmaz; çünkü yöneliş niyetsizdir.',
  likesCount: 3,
  socialUserId: '103',
  createdAt: addOrSubtractMinutesFromDate(300),
  children: [{
    id: '405',
    comment: 'Güzellik niyetle açığa çıkar; edep ve haya ile bezenen hâl, kalbi mesrur eder. Fakat bazı sözler, anlamayan kulaklara çarpıp geri döner.',
    postId: '10002',
    likesCount: 5,
    replyTo: '404',
    socialUserId: '104',
    createdAt: addOrSubtractMinutesFromDate(120)
  }, {
    id: '406',
    comment: 'Duanın kabulü, bazen bir çağrının isabetli yankısıdır; bahtı açık olanın nasibi de hazırdır.',
    postId: '10002',
    likesCount: 0,
    replyTo: '404',
    socialUserId: '102',
    createdAt: addOrSubtractMinutesFromDate(15)
  }]
}, {
  id: '407',
  postId: '10002',
  comment: 'Tebrikler :)',
  likesCount: 1,
  image: element12,
  socialUserId: '105',
  createdAt: addOrSubtractMinutesFromDate(4)
}, {
  id: '408',
  postId: '10003',
  comment: 'Hayret, bazen gönülden gelen samimiyetle birleşince iltifata dönüşür.',
  likesCount: 3,
  socialUserId: '103',
  createdAt: addOrSubtractMinutesFromDate(300),
  children: [{
    id: '409',
    comment: 'Her ne kadar latife aransa da, kalpten olmayan söz gönle tesir etmez.',
    postId: '10003',
    likesCount: 5,
    replyTo: '408',
    socialUserId: '104',
    createdAt: addOrSubtractMinutesFromDate(120)
  }]
}];
export const socialPostsData = [{
  id: '10001',
  socialUserId: '101',
  caption: "Hamdimizi sunarız ki; ilim yolunda yürüyüp, proje yönetimi sahasında icazetimizi aldık. Üstelik bu yolda, başkanın takdirine mazhar olduk. Her adımda niyet, her satırda sabır.",
  likesCount: 56,
  commentsCount: 12,
  image: postImg1,
  createdAt: addOrSubtractMinutesFromDate(120)
}, {
  id: '10002',
  socialUserId: '102',
  caption: `Nimet bilirim ki; @bootstrap hanesinde işe alım meşveretinde bulunmak nasip oldu. Mülakatlar hoş idi, muhabbetli geçti. Umarım bu yolculuk, nice gönle vesile olur. #istihdam #niyet #hizmet`,
  likesCount: 56,
  commentsCount: 12,
  photos: [postImg3, postImg2, postImg1],
  createdAt: addOrSubtractMinutesFromDate(120)
}, {
  id: '10003',
  socialUserId: '105',
  caption: `Rahatlık, belki de iç âlemdeki huzurun bir yansımasıydı. Gönül odasında sükûn bulmak... #çıraklık #emek #nasip`,
  likesCount: 56,
  commentsCount: 12,
  createdAt: addOrSubtractDaysFromDate(1),
  isVideo: true
}];

export const trendingVideos = [{
  id: '501',
  userId: '101',
  title: 'Gazâlî’nin Hayatı: İlmin Işığında Bir Ömür',
  image: videoImg1,
  time: '10:20',
  views: '156.9K'
}, {
  id: '502',
  userId: '102',
  title: 'İhyâ-u Ulûmiddîn Nedir? – Kalpleri Dirilten Eser',
  isVerified: true,
  iframe: 'https://www.youtube.com/embed/3zwRL6g1-G8',
  views: '458.4K'
}, {
  id: '503',
  userId: '103',
  title: 'Kimyâ-yı Saâdet: Mutluluğun Manevi Formülü',
  image: videoImg2,
  time: '03:40',
  views: '235.4K'
}, {
  id: '504',
  userId: '104',
  title: 'El-Munkız mine’d-Dalâl: Gazâlî’nin Şüpheden Hakikate Yolculuğu',
  image: videoImg3,
  time: '06:12',
  views: '891.7K'
}, {
  id: '505',
  userId: '105',
  title: 'Tasavvufun Kalbi: Gazâlî’ye Göre Nefis Terbiyesi',
  image: videoImg4,
  time: '03:45',
  views: '457.2K'
}, {
  id: '506',
  userId: '106',
  title: 'Felsefe ile Mücadele: Tehâfütü’l-Felâsife’nin Önemi',
  image: videoImg5,
  time: '10:20',
  views: '876.2K'
}, {
  id: '507',
  userId: '107',
  title: 'Gazâlî’ye Göre Marifet: Bilgiden Hikmete Geçiş',
  time: '10:20',
  isVideoPlayer: true,
  views: '145.2K'
}, {
  id: '508',
  userId: '108',
  title: 'Gazâlî’nin Eğitim Anlayışı: İlmin Amelle Buluşması',
  iframe: 'https://www.youtube.com/embed/9XzO1gnCvOM',
  time: '10:20',
  views: '235.8K'
}, {
  id: '509',
  userId: '109',
  title: 'Gazâlî ve Modern Zihin: Zamanlar Arası Bir Köprü',
  iframe: 'https://www.youtube.com/embed/YLe8JdAnj1A',
  time: '10:20',
  views: '785.2K'
}];
export const postVideosData = [{
  id: '4001',
  userId: '101',
  title: 'Gazâlî’nin Gençlik Yılları ve İlimle Tanışması',
  image: videoImg11,
  views: '156.9K görüntüleme',
  time: '10:20',
  uploadTime: addOrSubtractMinutesFromDate(1)
}, {
  id: '4002',
  userId: '102',
  title: 'İhyâ-u Ulûmiddîn: Kalpleri Diriltme Sanatı',
  image: videoImg12,
  views: '156.9K görüntüleme',
  time: '05:10',
  uploadTime: addOrSubtractMinutesFromDate(25)
}, {
  id: '4003',
  userId: '103',
  title: 'Gazâlî’ye Göre Akıl ve Kalp Arasındaki Denge',
  image: videoImg13,
  views: '156.9K görüntüleme',
  time: '03:40',
  uploadTime: addOrSubtractMinutesFromDate(50)
}, {
  id: '4004',
  userId: '104',
  title: 'Hakikati Arayan Adam: El-Munkız mine’d-Dalâl',
  image: videoImg14,
  views: '156.9K görüntüleme',
  time: '06:12',
  uploadTime: addOrSubtractDaysFromDate(15)
}, {
  id: '4005',
  userId: '105',
  title: 'Gazâlî ve Zamanın Tüccarları: Dünya ile İmtihan',
  image: videoImg15,
  views: '156.9K görüntüleme',
  time: '03:45',
  uploadTime: addOrSubtractDaysFromDate(30)
}];
export const eventData = [{
  id: '301',
  title: 'Tasavvufun Kapıları: Gazâlî’nin İrfan Yolculuğu',
  category: 'Tasavvuf Sohbeti',
  image: event1,
  label: 'Çevrimiçi',
  date: addOrSubtractDaysFromDate(3, true),
  location: 'Bağdat',
  attendees: [avatar1, avatar3, avatar4],
  type: 'online'
}, {
  id: '302',
  title: 'Nefs Terbiyesi Üzerine Derinlikli Bakış',
  category: 'İlmî Müzakere',
  image: event2,
  label: 'Medrese',
  date: addOrSubtractDaysFromDate(5, true),
  location: 'Nişâbur',
  attendees: [avatar5, avatar6],
  type: 'this-week'
}, {
  id: '303',
  title: 'İhyâ Okumaları: Kalp İlmi ve Amelin Bütünlüğü',
  category: 'Tefsirli Eser Okuması',
  image: event3,
  label: 'Çevrimiçi',
  date: addOrSubtractDaysFromDate(7, true),
  location: 'Horasan',
  attendees: [avatar6, avatar7, avatar8, avatar9],
  type: 'online'
}, {
  id: '304',
  title: 'Gazâlî’ye Göre Hikmet ve Mizah',
  category: 'Canlı Sohbet',
  image: event4,
  date: addOrSubtractDaysFromDate(8, true),
  location: 'Şam',
  attendees: [avatar6, avatar2, avatar4],
  type: 'local'
}, {
  id: '305',
  title: 'Zuhd ve Dünya Arasında Denge',
  category: 'İlmi Toplantı',
  image: event5,
  date: addOrSubtractDaysFromDate(15, true),
  location: 'Kudüs',
  label: 'Bahçede',
  attendees: [avatar5, avatar6],
  type: 'local'
}];
export const groupsData = [{
  id: '2001',
  image: backgroundImg1,
  logo: logo8,
  name: 'Zühd Yolcuları',
  type: 'Özel',
  ppd: 20,
  members: [avatar2, avatar3, avatar4, avatar5],
  memberCount: '32 bin'
}, {
  id: '2002',
  image: backgroundImg2,
  logo: logo2,
  name: 'İrfan Ehli',
  type: 'Açık',
  ppd: 12,
  members: [avatar6, avatar7, avatar9],
  memberCount: '23 bin'
}, {
  id: '2003',
  image: backgroundImg3,
  logo: logo9,
  name: 'İhyâ Okurları',
  type: 'Açık',
  ppd: 16,
  members: [avatar11, avatar10],
  memberCount: '45 bin',
  isJoin: true
}, {
  id: '2004',
  image: backgroundImg4,
  logo: logo10,
  name: 'Kalp İlmi Talipleri',
  type: 'Özel',
  ppd: 5,
  members: [avatar10, avatar14, avatar9, avatar4, avatar11],
  memberCount: '32 bin',
  isJoin: true
}, {
  id: '2005',
  image: backgroundImg5,
  logo: logo12,
  name: 'Gazâlî Düşünce Çevresi',
  type: 'Özel',
  ppd: 5,
  members: [avatar8, avatar4, avatar1, avatar6],
  memberCount: '12 bin'
}, {
  id: '2006',
  image: backgroundImg1,
  logo: logo1,
  name: 'Nizâmiyye Yolu',
  type: 'Açık',
  ppd: 12,
  members: [avatar6, avatar6, avatar9],
  memberCount: '23 bin',
  isJoin: true
}, {
  id: '2007',
  image: backgroundImg2,
  logo: logo3,
  name: 'Sükûtun Hikmeti',
  type: 'Özel',
  ppd: 16,
  members: [avatar11, avatar10],
  memberCount: '45 bin'
}, {
  id: '2008',
  image: backgroundImg3,
  logo: logo5,
  name: 'Hakikat Yolcuları',
  type: 'Özel',
  ppd: 5,
  members: [avatar10, avatar14, avatar9, avatar4, avatar11],
  memberCount: '32 bin'
}];
export const blogsData = [{
  id: '51',
  image: blogPost1,
  category: 'İman ve Ahlak',
  title: 'İmanlı bir insanın sosyal medya kullanımı üzerine düşünceler',
  description: 'Sosyal medyanın sağlıklı kullanımı, insanın kalbini ve zihnini temiz tutma amacına hizmet etmelidir. Aksi takdirde, insanı dünya ve ahiret için zarara sokabilir.',
  date: addOrSubtractDaysFromDate(3),
  categoryVariant: 'success'
}, {
  id: '52',
  image: blogPost4,
  category: 'Sosyal Yaşam',
  title: 'Canlı yayınlar ve teknoloji: Bir müslümanın bakış açısı',
  description: 'Teknolojiyi kullanırken, Rabbimizin rızasını kazanmak için dikkatli olmalı ve insanlara faydalı olma niyetiyle hareket etmeliyiz. Aksi takdirde, zamanın israfı olabilir.',
  date: addOrSubtractDaysFromDate(50),
  categoryVariant: 'warning'
}, {
  id: '53',
  image: blogPost5,
  category: 'İslam ve Bilim',
  title: 'Google: 2022’nin en çok aranan dini bilgiler',
  description: 'Birçok insan, internette din ile ilgili sorular aramaktadır. Bu durum, insanın doğru bilgiye erişmesini kolaylaştırırken, yanlış bilgilere de kapı aralayabilir. İslam, doğru bilgiyi aramayı teşvik eder.',
  date: addOrSubtractDaysFromDate(68),
  categoryVariant: 'info'
}, {
  id: '54',
  image: blogPost6,
  category: 'Dini Değerler',
  title: 'Teknolojiyi doğru kullanarak ahlaki değerleri korumak',
  description: 'Teknoloji insanı daha iyi bir insan yapma aracı olmalı, değilse kötüye kullanımı doğurur. İslam, her şeyde dengeyi savunur ve teknolojiyi ahlaki değerlerle uyumlu kullanmamızı öğütler.',
  date: addOrSubtractDaysFromDate(125),
  categoryVariant: 'danger'
}];

export const postData = [{
  id: '851',
  image: post1,
  title: 'Hızla söylemek, uygun bir şekilde hareket etmek ve çocukları yetiştirmek üzerine düşünceler.',
  likeCount: 56,
  comments: 12,
  share: 3,
  category: 'for-you',
}, {
  id: '852',
  photos: [post2, post13],
  title: 'İyi niyetle başlamak, kalpten yapılan işler gerçek değer taşır. Aydınlanmak şaşırtıcı olabilir.',
  likeCount: 23,
  comments: 10,
  share: 2,
  category: 'for-you',
}, {
  id: '853',
  image: post3,
  title: 'Çocuklar sevindirilirken, mutluluğun kaynağının doğru yerde arandığı anlatılmaktadır.',
  likeCount: 102,
  comments: 65,
  share: 40,
  category: 'for-you',
}, {
  id: '854',
  image: post4,
  title: 'Neyin en yüksek faydayı sağladığı konusunda doğru bir duruş, düzeni sağlamak önemli.',
  likeCount: 89,
  comments: 56,
  share: 30,
  isVideo: true,
  category: 'for-you',
}, {
  id: '855',
  image: post5,
  title: 'Bir insanın huzuru, içindeki sıkıntıları kabul etmesiyle gelir. Zorluklar ise olgunlaştırır.',
  likeCount: 78,
  comments: 32,
  share: 23,
  category: 'for-you',
}, {
  id: '856',
  iframe: 'https://www.youtube.com/embed/7E45f46yDFI',
  title: 'Su gibi zaman, doğru bir şekilde değerlendirildiğinde hayatı anlamlı kılar.',
  likeCount: 68,
  comments: 56,
  share: 12,
  isVideo: true,
  category: 'for-you',
}, {
  id: '857',
  image: post6,
  title: 'Yanlış bir yol, insanı çıkmaza sokar. Gerçek bilgi ise, insanı doğru yolda tutar.',
  likeCount: 78,
  comments: 35,
  share: 40,
  category: 'for-you',
}, {
  id: '858',
  title: 'Hayatın zorluklarından kaçmak yerine, insan onlarla yüzleşerek güçlü olur.',
  likeCount: 89,
  comments: 20,
  share: 23,
  isPlyer: true,
  category: 'for-you',
}, {
  id: '859',
  image: post8,
  title: 'Mutluluğu ve huzuru, içsel dengeyi kurarak elde etmek mümkündür.',
  likeCount: 78,
  comments: 23,
  share: 12,
  category: 'for-you',
}, {
  id: '860',
  image: post7,
  title: 'Görüşlerimizde, kalp temizliği ve dürüstlük her zaman daha yüksek değere sahiptir.',
  likeCount: 45,
  comments: 36,
  share: 56,
  category: 'for-you',
}, {
  id: '861',
  image: post14,
  title: 'İçsel çatışmalar, doğru yönlendirme ve sabırla aşılabilir.',
  likeCount: 88,
  comments: 25,
  share: 30,
  category: 'for-you',
}, {
  id: '862',
  image: post9,
  title: 'Sosyal sorumluluk ve insanlık, her zaman öne çıkmalıdır.',
  likeCount: 58,
  comments: 23,
  share: 15,
  category: 'covid',
}, {
  id: '863',
  image: post10,
  title: 'Sağlık ve güvenlik her zaman toplumun genel huzurunu artırır.',
  likeCount: 69,
  comments: 45,
  share: 23,
  category: 'covid',
}, {
  id: '864',
  image: post11,
  title: 'Bir toplumun gelişmesi için sağlıklı bireyler ve doğru bilgiler şarttır.',
  likeCount: 100,
  comments: 65,
  share: 47,
  category: 'covid',
}, {
  id: '865',
  image: post12,
  title: 'Birlikte hareket etmek, zorlukların üstesinden gelmek için en iyi yoldur.',
  likeCount: 58,
  comments: 23,
  share: 45,
  category: 'covid',
}];

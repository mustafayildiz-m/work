import { addOrSubtractMinutesFromDate } from '@/utils/date';
import logo12 from '@/assets/images/logo/12.svg';
import Link from 'next/link';
import avatar1 from '@/assets/images/avatar/01.jpg';
import avatar2 from '@/assets/images/avatar/02.jpg';
import avatar3 from '@/assets/images/avatar/03.jpg';
import avatar4 from '@/assets/images/avatar/04.jpg';
import avatar7 from '@/assets/images/avatar/07.jpg';
import logo8 from '@/assets/images/logo/08.svg';
export const notificationData = [{
  id: '151',
  title: 'İmam Ali El-Sistani size yeni bir ilmi paylaşım yaptı.',
  avatar: avatar1,
  time: addOrSubtractMinutesFromDate(1),
  isFriendRequest: true
}, {
  id: '152',
  title: 'Prof. Dr. Ahmet Yüksel&apos;in "İslamda Ahlak" adlı seminerine davetlisiniz.',
  description: <button className="btn btn-sm btn-outline-light py-1 mt-1 me-2">Seminere katıl</button>,
  avatar: avatar2,
  time: addOrSubtractMinutesFromDate(1)
}, {
  id: '153',
  title: 'Müftü Mahmud Efendi&apos;nin "Kur&apos;an ve Tefsir" dersine yeni bir video eklendi.',
  textAvatar: {
    text: 'WB',
    variant: 'success'
  },
  time: addOrSubtractMinutesFromDate(2),
  isRead: true
}, {
  id: '154',
  title: 'İslam Tarihi üzerine yapılan yeni bir araştırma yayınlandı: "Osmanlı İmparatorluğu ve İslam".',
  avatar: logo12,
  time: addOrSubtractMinutesFromDate(8),
  isRead: true
}, {
  id: '155',
  title: 'Dr. Hasan Karcı sizi takip etmeye başladı.',
  description: <p className="small">
         <Link href=""> @Hasan Karcı</Link> &quot;İslam&apos;ın Temel İlkeleri&quot; üzerine yazdığı yeni kitabını duyurdu.{' '}
      </p>,
  avatar: avatar3,
  time: addOrSubtractMinutesFromDate(20)
}, {
  id: '156',
  title: 'Yeni bağışınız alındı!',
  description: <p className="small mb-0">Diyanet Vakfı, 1000 TL bağışınızı başarıyla kabul etti.</p>,
  avatar: avatar4,
  time: addOrSubtractMinutesFromDate(180)
}, {
  id: '157',
  title: 'Yaptığınız bağış için teşekkürler: #23685',
  description: <>
        <p className="small mb-0">Bağışınız Diyanet Vakfı&apos;na ulaşmıştır. Teşekkür ederiz.</p>{' '}
        <a className="btn btn-link btn-sm" href="#!">
          {' '}
          <u> Review order </u>
        </a>
      </>,
  avatar: logo8,
  time: addOrSubtractMinutesFromDate(300)
}, {
  id: '158',
  title: 'Yeni bir Makale Paylaşıldı: "İslam&apos;da Toplum ve Ahlak".',
  description: <p className="small mb-0">Prof. Dr. Hüsamettin Kızıltan&apos;ın yeni makalesi yayınlandı.</p>,
  avatar: avatar4,
  time: addOrSubtractMinutesFromDate(180),
  isRead: true
}, {
  id: '159',
  title: 'Yeni bir video yayınlandı: "Kur&apos;an&apos;da Ahlak ve Adalet".',
  description: <>
        <p className="small mb-0">Yeni video yayında,</p>
        <Link href="#"> izlemek için tıklayın.</Link>
      </>,
  avatar: avatar7,
  time: addOrSubtractMinutesFromDate(300),
  isRead: true
}];
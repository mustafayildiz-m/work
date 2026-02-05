import Link from 'next/link';

export const celebrationData = [{
  id: '251',
  userId: '101',
  title: <>
        <h6>
          <Link href="">Prof. Dr. Ahmet Yüksel</Link>
        </h6>
        <p className="small ms-sm-2 mb-0 mb-sm-2">Bugün onun doğum günü</p>
      </>,
  placeholder: 'Doğum günü kutlu olsun...'
}, {
  id: '252',
  userId: '102',
  title: <>
        <h6>
          <Link href="">Prof. Dr. İsmail Kara</Link>
        </h6>
        <p className="small ms-sm-2 mb-0 mb-sm-2">Bugün onun doğum günü</p>
      </>,
  placeholder: 'Doğum günü dileklerinizi yazın...',
  textAvatar: {
    text: 'IK',
    variant: 'danger'
  }
}, {
  id: '253',
  userId: '103',
  title: <p className="mb-0 mb-sm-2">
        Tebrik edin{' '}
        <Link href="" className="h6">
          Prof. Dr. Hüsamettin Kızıltan{' '}
        </Link>{' '}
        20 yıldır ilim yolunda{' '}
        <Link className="h6" href="">
          İstanbul Üniversitesi - İlahiyat Fakültesi
        </Link>{' '}
      </p>,
  placeholder: 'Tebrik edin'
}, {
  id: '254',
  userId: '104',
  title: <p>
        İmam Ali El-Sistani ve 3 diğer alim, <strong>Medrese Eğitim Semineri</strong>&apos;ne katılıyor.
      </p>,
  isEvent: true
}, {
  id: '255',
  userId: '105',
  title: <>
        <h6>
          <Link href="">Prof. Dr. Mehmet Özdemir</Link>
        </h6>
        <p className="small ms-sm-2 mb-0 mb-sm-2">Doğum günü 15 Mart</p>
      </>,
  placeholder: 'Doğum günü dileklerinizi yazın...'
}, {
  id: '256',
  userId: '106',
  title: <>
        <h6>
          <Link href="">Prof. Dr. Abdullah Yılmaz</Link>
        </h6>
        <p className="small ms-sm-2 mb-0 mb-sm-2">Doğum günü 25 Mayıs</p>
      </>,
  placeholder: 'Doğum günü kutlu olsun...'
}, {
  id: '257',
  userId: '107',
  title: <p className="mb-0 mb-sm-2">
        Tebrik edin{' '}
        <Link href="" className="h6">
          Prof. Dr. Yusuf Kılıç{' '}
        </Link>{' '}
        25 yıldır İslami ilimler üzerine araştırmalar yapıyor.
      </p>,
  placeholder: 'Tebrik edin'
}, {
  id: '258',
  userId: '108',
  title: <p>
        İmam Hasan ve 5 diğer alim, <strong>Uluslararası İslam Kongresi</strong>&apos;ne katılıyor.
      </p>,
  isEvent: true
}];

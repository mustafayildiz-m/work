import Link from 'next/link';
import { Alert, Button, Card, CardBody, CardFooter, CardHeader, Col, Row } from 'react-bootstrap';
import { BsHouse, BsInfoCircle } from 'react-icons/bs';
import { FaThumbsDown, FaThumbsUp } from 'react-icons/fa';

export const metadata = {
  title: 'Yardım Detayı'
};

const HelpDetails = () => {
  return (
    <Row>
      <Col xs={12} className="vstack gap-4">
        <Card className="border p-sm-4">
          <CardHeader className="border-0 py-0">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb breadcrumb-dots mb-2">
                <li className="breadcrumb-item">
                  <Link href="">
                    <BsHouse className="me-1" /> Anasayfa
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href="">
                    <BsInfoCircle className="me-1" /> Yardım
                  </Link>
                </li>
                <li className="breadcrumb-item active">Node.js ile Başlarken</li>
              </ol>
            </nav>
            <h2>Node.js ile Başlarken</h2>
            <ul className="nav nav-divider">
              <li className="nav-item">Son güncelleme: 7 ay önce</li>
              <li className="nav-item">Yazar: Sam Lanson</li>
            </ul>
          </CardHeader>
          <CardBody>
            <p>
              Bismillah. Her işte başlangıçta bazı zorluklar olur. Sabırla ilerleyen, sonunda kolaylığı bulur. Zaman geçer, çile biter; hikmet zahmette gizlidir. Nice büyüklerimiz de meşakkatle yollarını yürümüşlerdir. 
              <b>Gayret edenin yolu, ferahlığa çıkar.</b>
            </p>
            <Button variant="primary">Node JS İndir</Button>
            <h5 className="mt-4">İçindekiler</h5>
            <p>İlim öğrenmeye adım atan kimse, mükâfata da yaklaşır.</p>
            <Alert variant="warning" role="alert">
              <strong>Not: </strong>İlim meclisleri en hayırlı yerlerdendir. Bilgiyi paylaşan, sadaka vermiş gibidir.
              <Link className="alert-link" href=""> Devamını oku </Link>
            </Alert>
            <p>
              Kalpten niyetle başlanan işler, bereket bulur. Bir meseleye niyetle yaklaşmak, yolun yarısıdır. Lütuf, anlayış ve tefekkürle gelen ilim kalpte yer eder. 
              Mütevazı olanı Rabbimiz yüceltir. 
            </p>
            <ul>
              <li>İlmine güvenip kibirlenen, nasibini kaybeder. Samimiyetle yaklaşmak gerekir.</li>
              <li>İlim, hikmetle birleştiğinde kalpte iz bırakır.</li>
              <li>
                <strong>Faydalı bilgi, amel ile taçlanır. İlmiyle amel eden âlim olur.</strong>
              </li>
              <li>Her yeni bilgi, gönülde bir pencere açar. Niyetle öğrenilen unutulmaz.</li>
              <li>İlim talebesi, yolcu gibidir. Azığını güzel niyetle almalıdır.</li>
              <li>
                <i>Farklı fikirler arasında selametle ilerlemek gerekir. Hikmet, anlayışla zuhur eder.</i>
              </li>
              <li>Dünya malı geçicidir. Kalıcı olan, insanın arkasında bıraktığı hayırdır.</li>
            </ul>
            <p>
              Evine bereket gelir, ilimle meşgul olanın. Kalpten gelen niyetle yürüyen, yolunu şaşırmaz. Gayret edenin yolu, açılır. Rabbim her adımımızı hayra vesile kılsın.
              <u>İlimle yapılan hizmetin kıymeti büyüktür.</u> Samimiyetle yapılan küçük bir iş, büyük sonuçlar doğurabilir.
            </p>
          </CardBody>
          <CardFooter className="border-0 pt-0">
            <div className="border p-3 rounded d-sm-flex align-items-center justify-content-between text-center">
              <h5 className="m-0">Bu yazı faydalı oldu mu?</h5>
              <small className="py-2 d-block">45 kişiden 20&apos;si faydalı buldu</small>
              <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                <input type="radio" className="btn-check" name="btnradio" id="btnradio1" />
                <label className="btn btn-outline-light btn-sm mb-0" htmlFor="btnradio1">
                  <FaThumbsUp className="me-1" /> Evet
                </label>
                <input type="radio" className="btn-check" name="btnradio" id="btnradio2" />
                <label className="btn btn-outline-light btn-sm mb-0" htmlFor="btnradio2">
                  Hayır <FaThumbsDown className="ms-1" />
                </label>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Col>
    </Row>
  );
};

export default HelpDetails;

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button, Card, CardBody, Col, Row } from 'react-bootstrap';
import { BsArrowLeft, BsEnvelopePaper } from 'react-icons/bs';

const newsletterMap = {
  '1': {
    title: 'Haftalik Gundem',
    publishedAt: '12 Mart 2026',
    intro: 'Bu sayida haftanin one cikan haberleri, editor notlari ve topluluktan secilen oneriler yer aliyor.',
    imageUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
    sections: [
      {
        title: 'Detay',
        content: '<p>Platforma eklenen yeni icerikler, topluluk etkilesimleri ve haftanin one cikan basliklari bu bultende ozetlenir.</p><p>Editor notlariyla birlikte kisa ve odakli bir icerik akisina yer verilir.</p>'
      }
    ]
  },
  '2': {
    title: 'Kitap ve Makale Seckisi',
    publishedAt: '9 Mart 2026',
    intro: 'Bu bulten, yeni eklenen kitaplar ve makalelerden olusan secili bir okuma listesi sunar.',
    imageUrl: 'https://images.unsplash.com/photo-1455885666463-9cbe4c9987fa?auto=format&fit=crop&w=1200&q=80',
    sections: [
      {
        title: 'Detay',
        content: '<p>Yeni eklenen kitaplar ve makaleler arasindan secili bir derleme sunulur.</p><p>Okuma rotasi ve kisa notlar ile iceriklerin daha hizli kesfedilmesi hedeflenir.</p>'
      }
    ]
  },
  '3': {
    title: 'Topluluktan Oneriler',
    publishedAt: '5 Mart 2026',
    intro: 'Topluluktan gelen yorumlar, en cok kaydedilen paylasimlar ve haftanin dikkat ceken onerileri.',
    imageUrl: 'https://images.unsplash.com/photo-1475727946784-2890c02f8b88?auto=format&fit=crop&w=1200&q=80',
    sections: [
      {
        title: 'Detay',
        content: '<p>Topluluktan gelen one cikan oneriler ve en cok kaydedilen paylasimlar bu bultende bir araya getirilir.</p>'
      }
    ]
  }
};

const NewsletterDetailPage = ({ params }) => {
  const data = newsletterMap[params.id];
  const themeCardStyle = {
    backgroundColor: 'var(--bs-body-bg)',
    color: 'var(--bs-body-color)',
    borderColor: 'var(--bs-border-color)'
  };
  if (!data) {
    notFound();
  }

  return (
    <Col lg={9}>
      <Row className="g-3">
        <Col lg={8}>
          <Card className="border-0 shadow-sm" style={themeCardStyle}>
            <CardBody className="p-4 p-md-5">
              <Button
                as={Link}
                href="/feed/newsletters"
                variant="light"
                className="mb-3 d-inline-flex align-items-center gap-2 border"
                style={{
                  backgroundColor: 'var(--bs-tertiary-bg)',
                  color: 'var(--bs-body-color)',
                  borderColor: 'var(--bs-border-color)'
                }}
              >
                <BsArrowLeft />
                Tum bultenlere don
              </Button>

              <div className="d-flex align-items-center gap-2 mb-2 text-muted small">
                <BsEnvelopePaper className="text-success" />
                <span>IW Newsletter</span>
              </div>

              <h3 className="fw-bold mb-2">{data.title}</h3>
              <small className="text-muted d-block mb-3">{data.publishedAt}</small>

              <p className="mb-4">{data.intro}</p>

              <figure className="mb-4">
                <img
                  src={data.imageUrl}
                  alt={data.title}
                  className="w-100 rounded-3 border"
                  style={{ maxHeight: 380, objectFit: 'cover' }}
                />
              </figure>

              <div className="d-grid gap-4">
                {data.sections.map((section) => (
                  <div key={section.title}>
                    <div
                      className="mb-0 text-muted"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-3" style={themeCardStyle}>
            <CardBody>
              <small className="text-muted d-block mb-1">Yayin bilgisi</small>
              <h6 className="fw-bold mb-1">IW Newsletter</h6>
              <p className="text-muted small mb-0">Bu icerikler admin panelinden yayimlanir.</p>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-sm" style={themeCardStyle}>
            <CardBody>
              <h6 className="fw-bold mb-3">Diger sayilar</h6>
              {Object.entries(newsletterMap)
                .filter(([id]) => id !== params.id)
                .map(([id, item]) => (
                  <div key={id} className="mb-3 pb-3 border-bottom">
                    <Link href={`/feed/newsletters/${id}`} className="text-decoration-none">
                      <small className="text-muted d-block">{item.publishedAt}</small>
                      <strong className="d-block">{item.title}</strong>
                    </Link>
                  </div>
                ))}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Col>
  );
};

export default NewsletterDetailPage;

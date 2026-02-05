import { Button, Card, CardBody, CardHeader, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap';
import { interestsData } from './data';
import Image from 'next/image';
import { BsBriefcase, BsCalendarDate, BsEnvelope, BsGeoAlt, BsHeart, BsPencilSquare, BsPlusCircleDotted, BsThreeDots, BsTrash } from 'react-icons/bs';
import Link from 'next/link';

export const metadata = {
  title: 'Hakkında'
};

const Interests = () => {
  return (
    <Card>
      <CardHeader className="d-sm-flex justify-content-between border-0 pb-0">
        <CardTitle>Etiketler / Kategoriler</CardTitle>
        <Button variant="primary-soft" size="sm">
          {' '}
          Tümünü Gör
        </Button>
      </CardHeader>
      <CardBody>
        <Row className="g-4">
          {interestsData.map((item, idx) => (
            <Col sm={6} lg={4} key={idx}>
              <div className="d-flex align-items-center position-relative border border-1 rounded p-2">
                <div className="avatar">
                  <img className="avatar-img" src={item.image} alt="image" />
                </div>
                <div className="ms-2">
                  <h6 className="mb-0">
                    {' '}
                    <Link className="stretched-link" href="">
                      {item.name}{' '}
                    </Link>
                  </h6>
                  <p className="small mb-0">{item.description}</p>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </CardBody>
    </Card>
  );
};

const ActionDropdown = () => {
  return (
    <Dropdown className="ms-auto">
      <DropdownToggle as="a" className="nav nav-link text-secondary mb-0" role="button" id="aboutAction" data-bs-toggle="dropdown" aria-expanded="false">
        <BsThreeDots />
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end" aria-labelledby="aboutAction">
        <li>
          <DropdownItem href="">
            {' '}
            <BsPencilSquare size={22} className="fa-fw pe-2" />
            Düzenle
          </DropdownItem>
        </li>
      </DropdownMenu>
    </Dropdown>
  );
};

const About = () => {
  return (
    <>
      <Card>
        <CardHeader className="border-0 pb-0">
          <CardTitle> Profil Bilgisi</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="rounded border px-3 py-2 mb-3">
            <div className="d-flex align-items-center justify-content-between">
              <h6>Özet</h6>
              <ActionDropdown />
            </div>
            <p>
              Ahmed El-Ghazzali (ö. 1126), Selçuklu döneminde Horasan bölgesinde yetişmiş önemli bir sufi ve İslam düşünürüdür. Ünlü İslam filozofu ve mutasavvıf Ebu Hamid el-Ghazzali’nin kardeşidir; ancak ağabeyinin aksine felsefeye mesafeli durmuş, tasavvufu doğrudan aşk ve sezgi üzerinden temellendirmiştir.
            </p>
            <p>
              Ahmed El-Ghazzali, &quot;aşk tasavvufu&quot; denildiğinde ilk akla gelen isimlerden biridir. Allah’a duyulan aşkın, akılla değil kalple anlaşılacağını savunmuştur. İnsanın hakikate ulaşma yolculuğunda en yüksek mertebenin &quot;ilahi aşk&quot; olduğunu ifade etmiştir. Bu yönüyle Mevlânâ, Attar, ve hatta Yunus Emre gibi sonradan gelen büyük mutasavvıflar üzerinde dolaylı etkileri olmuştur.
            </p>
            <p>
              En meşhur eseri olan &quot;Savânihü’l-uşşâk&quot; (Âşıkların Hatıraları), tasavvuf tarihinde aşkın metafizik ve içsel boyutlarını konu edinen başyapıtlardandır. Bu eser, aşkı yalnızca bir duygu değil, insanın varoluşuna dair derin bir sır olarak ele alır. Ona göre aşk, kul ile Allah arasında kurulan en saf bağdır ve bu bağ her türlü akli ölçüyü aşar.
            </p>
            <p>
              Ahmed El-Ghazzali, Hallâc-ı Mansûr gibi &quot;Enel Hak&quot; diyen aşk şehitlerini savunmuş ve aşk uğruna çekilen acıyı kutsal bir mertebe saymıştır. Onun düşüncesinde, aşk hem bir yakıcı ateş hem de arındırıcı bir nurdur.
            </p>
            <p>
              Sufi geleneğinde Ahmed El-Ghazzali, düşünceyle değil gönülle konuşan bir rehber olarak yer edinmiştir. Bugün hâlâ aşk merkezli tasavvuf anlayışının kurucu isimlerinden biri olarak saygıyla anılmaktadır.
            </p>
          </div>
          <Row className="g-4">
            <Col sm={12}>
              <div className="d-flex align-items-center rounded border px-3 py-2">
                <p className="mb-0">
                  <BsCalendarDate className="fa-fw me-2" /> Doğum : <strong> Hicri: c. 475 H / Miladi: c. 1082 M</strong>
                </p>
                <ActionDropdown />
              </div>
            </Col>
            <Col sm={12}>
              <div className="d-flex align-items-center rounded border px-3 py-2">
                <p className="mb-0">
                  <BsCalendarDate className="fa-fw me-2" /> Ölüm : <strong> Hicri: 520 H / Miladi: 1126 M </strong>
                </p>
                <ActionDropdown />
              </div>
            </Col>
            {/*
            <Col sm={6}>
              <div className="d-flex align-items-center rounded border px-3 py-2">
                <p className="mb-0">
                  <BsBriefcase className="fa-fw me-2" /> <strong> Baş Geliştirici </strong>
                </p>
                <ActionDropdown />
              </div>
            </Col>
            <Col sm={6}>
              <div className="d-flex align-items-center rounded border px-3 py-2">
                <p className="mb-0">
                  <BsGeoAlt className="fa-fw me-2" /> Yaşadığı Yer: <strong> New Hampshire </strong>
                </p>
                <ActionDropdown />
              </div>
            </Col>
            <Col sm={6}>
              <div className="d-flex align-items-center rounded border px-3 py-2">
                <p className="mb-0">
                  <BsGeoAlt className="fa-fw me-2" /> Katılım Tarihi: <strong> 26 Kasım 2019 </strong>
                </p>
                <ActionDropdown />
              </div>
            </Col>
            <Col sm={6}>
              <div className="d-flex align-items-center rounded border px-3 py-2">
                <p className="mb-0">
                  <BsEnvelope className="fa-fw me-2" /> E-posta: <strong> webestica@gmail.com </strong>
                </p>
                <ActionDropdown />
              </div>
            </Col>
            <Col sm={6} className="position-relative">
              <Link className="btn btn-dashed rounded w-100 icons-center justify-content-center" href="">
                {' '}
                <BsPlusCircleDotted className="me-1" />
                Bir işyeri ekle
              </Link>
            </Col>
            <Col sm={6} className="position-relative">
              <Link className="btn btn-dashed rounded w-100 icons-center justify-content-center" href="">
                {' '}
                <BsPlusCircleDotted className="me-1" />
                Bir eğitim ekle
              </Link>
            </Col>
            */}
          </Row>
        </CardBody>
      </Card>
      <Interests />
    </>
  );
};

export default About;

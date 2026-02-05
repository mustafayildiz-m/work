import Image from 'next/image';
import Link from 'next/link';
import { Alert, Button, Card, CardBody, CardHeader, CardTitle, Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import eventImg from '@/assets/images/events/01.jpg';
import { BsBookmark, BsCalendarCheck, BsFileEarmarkPdf, BsGear, BsGeoAlt, BsLock, BsPeople, BsThreeDots } from 'react-icons/bs';

export const metadata = {
  title: 'Etkinlikler'
};

const Events = () => {
  return (
    <Card>
      <CardHeader className="d-sm-flex align-items-center justify-content-between border-0 pb-0">
        <CardTitle className="mb-sm-0">Etkinlikleri Keşfedin</CardTitle>
        <Button variant="primary-soft" size="sm">
          <span className="icons-center">
            <FaPlus className="pe-1" /> Etkinlik oluştur
          </span>
        </Button>
      </CardHeader>
      <CardBody>
        <Alert variant="success" dismissible className="fade show" role="alert">
          <strong>Yaklaşan etkinlik:</strong> 19 Eylül 2024&apos;teki öğrenme konferansı
          <Link href="/events" className="btn btn-xs btn-success ms-md-4">
            Etkinliği görüntüle
          </Link>
        </Alert>
        <div className="row">
          <div className="d-sm-flex align-items-center">
            <div className="avatar avatar-xl">
              <span role="button">
                <Image className="avatar-img rounded border border-white border-3" src={eventImg} alt="etkinlik" />
              </span>
            </div>
            <div className="ms-sm-4 mt-2 mt-sm-0">
              <h5 className="mb-1">
                <Link href="/event/details">Yeşil alandaki komedi</Link>
              </h5>
              <ul className="nav nav-stack small">
                <li className="nav-item icons-center gap-1">
                  <BsCalendarCheck size={18} className="pe-1" /> Pazartesi, 25 Eylül 2020, 9:30
                </li>
                <li className="nav-item icons-center gap-1">
                  <BsGeoAlt size={18} className="pe-1" /> San Francisco
                </li>
                <li className="nav-item icons-center gap-1">
                  <BsPeople size={18} className="pe-1" /> 77 katılımcı
                </li>
              </ul>
            </div>
            <div className="d-flex mt-3 ms-auto">
              <Dropdown>
                <DropdownToggle as="a" className="icon-md btn btn-secondary-soft content-none" type="button" id="profileAction" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>
                    <BsThreeDots />
                  </span>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end" aria-labelledby="profileAction">
                  <li>
                    <DropdownItem href="">
                      <BsBookmark className="fa-fw pe-2" />
                      Profilinizi mesajla paylaş
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem href="">
                      <BsFileEarmarkPdf className="fa-fw pe-2" />
                      Profilinizi PDF olarak kaydedin
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem href="">
                      <BsLock className="fa-fw pe-2" />
                      Profili kilitle
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownDivider />
                  </li>
                  <li>
                    <DropdownItem href="">
                      <BsGear className="fa-fw pe-2" />
                      Profil ayarları
                    </DropdownItem>
                  </li>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default Events;

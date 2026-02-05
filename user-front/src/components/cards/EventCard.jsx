import Image from 'next/image';
import Link from 'next/link';
import { Card, CardBody, Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import { BsBookmarkCheck, BsCalendarCheck, BsEnvelope, BsGeoAlt, BsPeople, BsPerson, BsShare, BsShareFill } from 'react-icons/bs';
import { FaThumbsUp } from 'react-icons/fa';

const EventCard = ({
  attendees,
  category,
  date,
  image,
  location,
  title,
  label,
  id
}) => {
  return <Card className="h-100">
      <div className="position-relative">
        <Image className="img-fluid rounded-top" src={image} alt="görsel" />
        {label && <div className="badge bg-danger text-white mt-2 me-2 position-absolute top-0 end-0">{label}</div>}
      </div>

      <CardBody className="position-relative pt-0">
        <Link className="btn btn-xs btn-primary mt-n3" href="/event/details">
          {category}{' '}
        </Link>
        <h5 className="mt-3">
          {' '}
          <Link href={`/feed/events/${id}`}> {title} </Link>{' '}
        </h5>

        <p className="mb-0 small">
          {' '}
          <BsCalendarCheck size={17} className="pe-1" />{' '}
          {date.toLocaleString('tr-TR', {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          })} -{' '}
          {date.toLocaleString('tr-TR', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })}{' '}
        </p>
        <p className="small">
          {' '}
          <BsGeoAlt size={17} className="pe-1" /> {location}{' '}
        </p>

        <ul className="avatar-group list-unstyled align-items-center mb-0">
          {attendees.map((avatar, idx) => <li className="avatar avatar-xs" key={idx}>
              <Image className="avatar-img rounded-circle" src={avatar} alt="katılımcı" />
            </li>)}
          <li className="avatar avatar-xs">
            <div className="avatar-img rounded-circle bg-primary">
              <span className="smaller text-white position-absolute top-50 start-50 translate-middle">+{Math.floor(Math.random() * 100)}</span>
            </div>
          </li>
          <li className="ms-3">
            <small> katılıyor</small>
          </li>
        </ul>

        <div className="d-flex mt-3 justify-content-between">
          <div className="w-100">
            <input type="checkbox" className="btn-check d-block" id={`Interested${id}`} />
            <label className="btn btn-sm btn-outline-success d-block" htmlFor={`Interested${id}`}>
              <span className="icons-center gap-1">
                <FaThumbsUp size={12} className="me-1" /> İlgileniyorum
              </span>{' '}
            </label>
          </div>
          <Dropdown className="ms-3">
            <DropdownToggle as="a" className="btn btn-sm btn-primary-soft content-none" id="eventActionShare" data-bs-toggle="dropdown" aria-expanded="false">
              <BsShareFill />
            </DropdownToggle>

            <DropdownMenu className="dropdown-menu-end" aria-labelledby="eventActionShare">
              <li>
                <DropdownItem href="">
                  {' '}
                  <BsEnvelope size={18} className="fa-fw pe-1" /> Direkt Mesaj ile Gönder
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="">
                  {' '}
                  <BsBookmarkCheck size={18} className="fa-fw pe-1" /> Haber Kaynağında Paylaş{' '}
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="">
                  {' '}
                  <BsPeople size={18} className="fa-fw pe-1" /> Bir Grupta Paylaş
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="">
                  {' '}
                  <BsShare size={18} className="fa-fw pe-1" /> Farklı Yolla Paylaş…
                </DropdownItem>
              </li>
              <li>
                <DropdownDivider />
              </li>
              <li>
                <DropdownItem href="">
                  {' '}
                  <BsPerson size={18} className="fa-fw pe-1" /> Bir Arkadaşın Profilinde Paylaş
                </DropdownItem>
              </li>
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardBody>
    </Card>;
};

export default EventCard;

'use client';

import Image from 'next/image';
import DateFormInput from '@/components/form/DateFormInput';
import TextAreaFormInput from '@/components/form/TextAreaFormInput';
import DropzoneFormInput from '@/components/form/DropzoneFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import useToggle from '@/hooks/useToggle';
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import * as yup from 'yup';
import avatar1 from '@/assets/images/avatar/01.jpg';
import avatar2 from '@/assets/images/avatar/02.jpg';
import avatar3 from '@/assets/images/avatar/03.jpg';
import avatar4 from '@/assets/images/avatar/04.jpg';
import avatar5 from '@/assets/images/avatar/05.jpg';
import avatar6 from '@/assets/images/avatar/06.jpg';
import avatar7 from '@/assets/images/avatar/07.jpg';
import { yupResolver } from '@hookform/resolvers/yup';
import { BsFileEarmarkText } from 'react-icons/bs';

const CreateEvent = () => {
  const guests = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7];
  const {
    isTrue: isOpen,
    toggle
  } = useToggle();
  const eventFormSchema = yup.object({
    title: yup.string().required('Lütfen etkinlik başlığını girin'),
    description: yup.string().required('Lütfen etkinlik açıklamasını girin'),
    duration: yup.string().required('Lütfen etkinlik süresini girin'),
    location: yup.string().required('Lütfen etkinlik lokasyonunu girin'),
    guest: yup.string().email('Lütfen geçerli bir e-posta girin').required('Lütfen etkinlik davetli e-posta adresini girin')
  });
  const {
    control,
    handleSubmit
  } = useForm({
    resolver: yupResolver(eventFormSchema)
  });

  return (
    <>
      <Button variant="primary-soft" onClick={toggle}>
        <span className="d-flex align-items-center gap-1">
          <FaPlus className="pe-1" /> Etkinlik oluştur
        </span>{' '}
      </Button>

      <Modal show={isOpen} onHide={toggle} centered className="fade" id="modalCreateEvents" tabIndex={-1} aria-labelledby="modalLabelCreateEvents" aria-hidden="true">
        <form onSubmit={handleSubmit(() => {})}>
          <ModalHeader closeButton>
            <h5 className="modal-title" id="modalLabelCreateEvents">
              Etkinlik oluştur
            </h5>
          </ModalHeader>
          <ModalBody>
            <Row className="row g-4">
              <TextFormInput name="title" label="Başlık" placeholder="Etkinlik adı burada" containerClassName="col-12" control={control} />
              <TextAreaFormInput name="description" label="Açıklama" rows={2} placeholder="Örn: konular, program, vb." containerClassName="col-12" control={control} />

              <Col sm={4}>
                <label className="form-label">Tarih</label>
                <DateFormInput options={{
                  enableTime: false
                }} type="text" className="form-control" placeholder="Tarih seçin" />
              </Col>
              <div className="col-sm-4">
                <label className="form-label">Saat</label>
                <DateFormInput options={{
                  enableTime: true,
                  noCalendar: true
                }} type="text" className="form-control" placeholder="Saat seçin" />
              </div>
              <TextFormInput name="duration" label="Süre" placeholder="1s 23dk" containerClassName="col-sm-4" control={control} />
              <TextFormInput name="location" label="Konum" placeholder="Logansport, IN 46947" containerClassName="col-12" control={control} />
              <TextFormInput name="guest" type="email" label="Davetli ekle" placeholder="Davetli e-posta" containerClassName="col-12" control={control} />
              <Col xs={12} className="mt-3">
                <ul className="avatar-group list-unstyled align-items-center mb-0">
                  {guests.map((avatar, idx) => (
                    <li className="avatar avatar-xs" key={idx}>
                      <Image className="avatar-img rounded-circle" src={avatar} alt="avatar" />
                    </li>
                  ))}
                  <li className="ms-3">
                    <small> +50 </small>
                  </li>
                </ul>
              </Col>
              <div className="mb-3">
                <DropzoneFormInput showPreview helpText="Sunum ve belgeleri buraya bırakın veya yüklemek için tıklayın." icon={BsFileEarmarkText} label="Ek dosya yükle" />
              </div>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button variant="danger-soft" type="button" className="me-2" onClick={toggle}>
              {' '}
              İptal
            </Button>
            <Button variant="success-soft" type="submit">
              Şimdi oluştur
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
};

export default CreateEvent;

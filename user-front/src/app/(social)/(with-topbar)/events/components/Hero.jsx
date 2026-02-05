import { Button, Col, Container, Row } from 'react-bootstrap';
import backgroundImg7 from '@/assets/images/bg/07.jpg';
import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import DateFormInput from '@/components/form/DateFormInput';
const Hero = () => {
  return <section className="pt-5 pb-0 position-relative" style={{
    backgroundImage: `url(${backgroundImg7.src})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'top center'
  }}>
      <div className="bg-overlay bg-dark opacity-8" />
      <Container>
        <div className="py-5">
          <Row className="position-relative">
            <Col lg={9} className="mx-auto">
              <div className="text-center">
                <h1 className="text-white">Yakınınızdaki etkinlikleri bulun</h1>
                <p className="text-white">Haydi&apos;size en yakın yemek, içmek ve alışveriş yapmak için en iyi yerleri ortaya çıkaralım.</p>
              </div>
              <div className="mx-auto bg-mode shadow rounded p-4 mt-5">
                <form className="row align-items-end g-4">
                  <Col sm={6} lg={3}>
                    <label className="form-label">Tür seçin</label>
                    <ChoicesFormInput className="form-select js-choice choice-select-text-none" data-position="bottom" data-search-enabled="false">
                      <option value="kategori">Kategori</option>
                      <option value="komedi">Komedi</option>
                      <option value="dans">Dans</option>
                      <option value="aile">Aile</option>
                      <option value="müzik">Müzik</option>
                      <option value="atölye">Atölye</option>
                    </ChoicesFormInput>
                  </Col>
                  <Col sm={6} lg={3}>
                    <label className="form-label">Tarih</label>
                    <DateFormInput className="form-control" placeholder="12/10/2022" options={{
                    enableTime: false
                  }} />
                  </Col>
                  <Col sm={6} lg={3}>
                    <label className="form-label">Tarih</label>
                    <DateFormInput className="form-control" placeholder="14/10/2022" options={{
                    enableTime: false
                  }} />
                  </Col>
                  <Col sm={6} lg={3}>
                    <Button variant="primary" className="w-100">
                      Tarihleri filtrele
                    </Button>
                  </Col>
                </form>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </section>;
};
export default Hero;
'use client';

import { Col, Container, Row } from 'react-bootstrap';
import ScholarStories from './components/IslamicNews';
import SidePenal from './components/SidePenal';
import Footer from './components/Footer';

const Blogs = () => {
  return <>
    <main style={{ marginTop: '72px', paddingTop: '1.5rem' }}>
      <Container>
        <Row className="g-4">
          <Col lg={8}>
            <ScholarStories />
          </Col>
          <Col lg={4}>
            <Row className="g-4">
              <SidePenal />
            </Row>
          </Col>
        </Row>
      </Container>
    </main>


  </>;
};

export default Blogs;
'use client';

import { Col, Container, Row } from 'react-bootstrap';
import ScholarStories from './components/IslamicNews';
import SidePenal from './components/SidePenal';
import Footer from './components/Footer';

const Blogs = () => {
  return <>
    <main className="blogs-page">
      <Container className="px-2 px-sm-3">
        <Row className="g-2 g-md-4">
          <Col lg={8}>
            <ScholarStories />
          </Col>
          <Col lg={4} className="blogs-sidebar">
            <Row className="g-2 g-md-4">
              <SidePenal />
            </Row>
          </Col>
        </Row>
      </Container>
    </main>


  </>;
};

export default Blogs;
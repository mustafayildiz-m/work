'use client';

import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';

const NewslettersPage = () => {
  return (
    <Col lg={9}>
      <Card>
        <CardHeader>
          <h5 className="mb-0">Newsletters</h5>
        </CardHeader>
        <CardBody>
          <p className="mb-0">Latest newsletter content will appear here.</p>
        </CardBody>
      </Card>
    </Col>
  );
};

export default NewslettersPage;

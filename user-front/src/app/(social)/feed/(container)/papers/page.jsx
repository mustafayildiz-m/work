'use client';

import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';

const PapersPage = () => {
  return (
    <Col lg={9}>
      <Card>
        <CardHeader>
          <h5 className="mb-0">Papers</h5>
        </CardHeader>
        <CardBody>
          <p className="mb-0">Paper content will appear here.</p>
        </CardBody>
      </Card>
    </Col>
  );
};

export default PapersPage;

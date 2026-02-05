'use client';

import { Col } from 'react-bootstrap';
import LanguageSelector from './components/LanguageSelector';

const BooksPage = () => {
  return (
    <Col lg={9}>
      <LanguageSelector />
    </Col>
  );
};

export default BooksPage;

import { currentYear, developedBy, developedByLink } from '@/context/constants';
import Link from 'next/link';
import { Col, Container, Row } from 'react-bootstrap';
const Footer = () => {
  return <footer className="bg-mode py-3">
      <Container>
        <Row>
          <Col md={6}>
            <ul className="nav justify-content-center justify-content-md-start lh-1">
              <li className="nav-item">
                <Link className="nav-link" href="/profile/about">
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" target="_blank" href={developedByLink}>
                  Support{' '}
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="">
                  Docs{' '}
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/privacy-terms">
                  Privacy &amp; terms
                </Link>
              </li>
            </ul>
          </Col>
          <Col md={6}>
            <p className="text-center text-md-end mb-0">
              ©{currentYear}{' '}
              <Link className="text-body" target="_blank" href={developedByLink}>
                {' '}
                {developedBy}{' '}
              </Link>
              All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>;
};
export default Footer;
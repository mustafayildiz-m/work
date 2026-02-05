'use client';

import { settingPanelLinksData } from '@/assets/data/layout';
import SettingPanel from '@/components/layout/SettingPanel';
import { useLayoutContext } from '@/context/useLayoutContext';
import useViewPort from '@/hooks/useViewPort';
import { Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from 'react-bootstrap';
import { FaSlidersH } from 'react-icons/fa';

const SettingLayout = ({
  children
}) => {
  const { width } = useViewPort();
  const { startOffcanvas } = useLayoutContext();
  
  return (
    <main style={{ marginTop: '72px', paddingTop: '1.5rem' }}>
      <Container>
        <Row className="g-4">
          <Col lg={3}>
            <div className="d-flex align-items-center mb-4 d-lg-none">
              <button 
                onClick={startOffcanvas.toggle} 
                className="border-0 bg-transparent" 
                type="button"
              >
                <span className="btn btn-primary">
                  <FaSlidersH />
                </span>
                <span className="h6 mb-0 fw-bold d-lg-none ms-2">Settings</span>
              </button>
            </div>
            
            {width >= 992 ? (
              <SettingPanel links={settingPanelLinksData} />
            ) : (
              <Offcanvas 
                show={startOffcanvas.open} 
                onHide={startOffcanvas.toggle} 
                placement="start"
              >
                <OffcanvasHeader closeButton />
                <OffcanvasBody className="p-3">
                  <SettingPanel links={settingPanelLinksData} />
                </OffcanvasBody>
              </Offcanvas>
            )}
          </Col>
          
          <Col lg={6} className="vstack gap-4">
            <div className="tab-content py-0 mb-0">
              {children}
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default SettingLayout;
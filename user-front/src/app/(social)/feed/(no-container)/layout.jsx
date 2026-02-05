'use client';

import { profilePanelLinksData2 } from '@/assets/data/layout';
import ProfilePanel from '@/components/layout/ProfilePanel';
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient';
import { useLayoutContext } from '@/context/useLayoutContext';
import useViewPort from '@/hooks/useViewPort';
import { Container, Offcanvas, OffcanvasBody, OffcanvasHeader } from 'react-bootstrap';
import { FaSlidersH } from 'react-icons/fa';
const Feed2Layout = ({
  children
}) => {
  const {
    startOffcanvas
  } = useLayoutContext();
  const {
    width
  } = useViewPort();
  return <main>
      <Container fluid>
        <div className="navbar navbar-vertical navbar-light">
          <div className="d-flex align-items-center d-lg-none mb-2">
            <button onClick={startOffcanvas.toggle} className="border-0 bg-transparent" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasSideNavbar" aria-controls="offcanvasSideNavbar">
              <span className="btn btn-primary">
                <FaSlidersH />
              </span>
              <span className="h6 mb-0 fw-bold d-lg-none ms-2">Profilim</span>
            </button>
          </div>

          {width >= 992 ? <SimplebarReactClient className="offcanvas-start">
              <ProfilePanel links={profilePanelLinksData2} />
            </SimplebarReactClient> : <Offcanvas show={startOffcanvas.open} placement="start" onHide={startOffcanvas.toggle} tabIndex={-1} id="offcanvasSideNavbar">
              <OffcanvasHeader closeButton />

              <OffcanvasBody className="d-block px-2 px-lg-0">
                <div>
                  <ProfilePanel links={profilePanelLinksData2} />
                </div>
              </OffcanvasBody>
            </Offcanvas>}
        </div>

        <div className="page-content">{children}</div>
      </Container>
    </main>;
};
export default Feed2Layout;
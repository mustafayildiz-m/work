import Image from 'next/image';
import { Card, Col, Container, Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap';
import Link from 'next/link';
import { BsBookmark, BsFlag, BsPersonX, BsSlashCircle, BsThreeDots, BsXCircle } from 'react-icons/bs';
import post1 from '@/assets/images/post/16by9/big/01.jpg';
import avatar4 from '@/assets/images/avatar/04.jpg';
import { getAllFeeds } from '@/helpers/data';
import UserComments from '@/components/UserComments';
export const metadata = {
  title: 'Post Details'
};
const ActionMenu = ({
  name
}) => {
  return <Dropdown drop="start">
      <DropdownToggle as="a" className="text-secondary btn btn-secondary-soft-hover py-1 px-2 content-none" id="cardFeedAction">
        <BsThreeDots />
      </DropdownToggle>

      <DropdownMenu className="dropdown-menu-end" aria-labelledby="cardFeedAction">
        <li>
          <DropdownItem href="">
            {' '}
            <BsBookmark size={22} className="fa-fw pe-2" />
            Gönderiyi Kaydet
          </DropdownItem>
        </li>
        <li>
          <DropdownItem href="">
            {' '}
            <BsPersonX size={22} className="fa-fw pe-2" />
            Takibi bırak {name}{' '}
          </DropdownItem>
        </li>
        <li>
          <DropdownItem href="">
            {' '}
            <BsXCircle size={22} className="fa-fw pe-2" />
            Gönderiyi gizle
          </DropdownItem>
        </li>
        <li>
          <DropdownItem href="">
            {' '}
            <BsSlashCircle size={22} className="fa-fw pe-2" />
            Englele
          </DropdownItem>
        </li>
        <li>
          <DropdownDivider />
        </li>
        <li>
          <DropdownItem href="">
            {' '}
            <BsFlag size={22} className="fa-fw pe-2" />
            Gönderiyi şikayet et
          </DropdownItem>
        </li>
      </DropdownMenu>
    </Dropdown>;
};
const PostDetails = async () => {
  const allComments = await getAllFeeds();
  return <main>
      <div>
        <Container>
          <Row>
            <Col lg={8} className="mx-auto">
              <Card className="card-body">
                <Image className="card-img rounded" src={post1} alt="image" />
                <div className="d-flex align-items-center justify-content-between my-3">
                  <div className="d-flex align-items-center">
                    <div className="avatar avatar-story me-2">
                      <Link href="">
                        {' '}
                        <Image className="avatar-img rounded-circle" src={avatar4} alt="" />{' '}
                      </Link>
                    </div>
                    <div>
                      <div className="nav nav-divider">
                        <h6 className="nav-item card-title mb-0">
                          {' '}
                          <Link href=""> Lori Ferguson </Link>
                        </h6>
                        <span className="nav-item small"> 2s</span>
                      </div>
                      <p className="mb-0 small">Web Developer at Webestica</p>
                    </div>
                  </div>
                  <ActionMenu name="Lori Ferguson" />
                </div>
                <h1 className="h4">Speedily say has suitable disposal add boy. On forth doubt miles of child.</h1>
                <p>
                  Exercise joy man children rejoiced. Yet uncommonly his ten who diminution astonished. Speedily say has suitable disposal add boy. On
                  forth doubt miles of child.
                </p>
                {allComments.slice(0, 1).map((comment, idx) => <UserComments comment={comment} key={idx} showStats />)}
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </main>;
};
export default PostDetails;
import { Button, Card, CardBody, Col } from 'react-bootstrap';
import VideoPlayer from './VideoPlayer';
import Image from 'next/image';
import Link from 'next/link';
import { getAllTrendingVideos } from '@/helpers/data';
const TrailerCard = ({
  trailer
}) => {
  const {
    title,
    views,
    iframe,
    isVideoPlayer,
    user
  } = trailer;
  return <Card className="position-relative h-100">
      <div className="card-image">
        {isVideoPlayer && <VideoPlayer />}
        {iframe && <div className="ratio ratio-16x9 card-img-top overflow-hidden">
            <iframe src={iframe} title="YouTube video" allowFullScreen />
          </div>}
      </div>

      <CardBody className="position-relative">
        <h6>
          {' '}
          <Link className="stretched-link" href="/feed/videos/details">
            {' '}
            {title}{' '}
          </Link>{' '}
        </h6>
        <div className="d-flex mt-3">
          <div className="avatar avatar-xxs me-2">
            {user?.avatar && <Image className="avatar-img rounded-circle" src={user.avatar} alt="image" />}
          </div>

          <div>
            <h6 className="mb-0 lh-1">
              {' '}
              <Link href=""> {user?.name} </Link>{' '}
            </h6>
            <span className="ms-auto small"> {views} views</span>
          </div>
        </div>
      </CardBody>
    </Card>;
};
const OfficialTrailer = async () => {
  const allTrailers = await getAllTrendingVideos();
  return <>
      <Col xs={12} className="mt-4">
        <div className="d-sm-flex justify-content-between align-items-center">
          <h5 className="mb-md-0">Official Trailer </h5>
          <Button variant="primary" size="sm">
            View more video
          </Button>
        </div>
      </Col>
      {allTrailers.slice(6, 9).map((trailer, idx) => <Col sm={6} lg={4} key={idx}>
          <TrailerCard trailer={trailer} />
        </Col>)}
    </>;
};
export default OfficialTrailer;
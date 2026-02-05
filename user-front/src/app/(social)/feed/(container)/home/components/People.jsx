'use client';

import TinySlider from '@/components/TinySlider';
import Image from 'next/image';
import { Button, Card, CardBody, CardFooter, CardHeader } from 'react-bootstrap';
import { renderToString } from 'react-dom/server';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import clsx from 'clsx';
import { useFetchData } from '@/hooks/useFetchData';
import { getAllUsers } from '@/helpers/data';
import Link from 'next/link';
const PeopleCard = ({
  people
}) => {
  const {
    avatar,
    mutualCount: mutual,
    name,
    isStory
  } = people;
  return <Card className="shadow-none text-center">
      <CardBody className="p-2 pb-0">
        <div className={clsx('avatar avatar-xl', {
        'avatar-story': isStory
      })}>
          <span role="button">
            <Image 
              className="avatar-img rounded-circle" 
              src={avatar} 
              alt="avatar" 
              width={40} 
              height={40} 
              loading="eager"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMzMzIiBvZmZzZXQ9IjIwJSIgLz4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzIyMiIgb2Zmc2V0PSI1MCUiIC8+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMzMzMiIG9mZnNldD0iNzAlIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzMzIiAvPgogIDxyZWN0IGlkPSJyIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9InVybCgjZykiIC8+CiAgPGFuaW1hdGUgeGxpbms6aHJlZj0iI3IiIGF0dHJpYnV0ZU5hbWU9IngiIGZyb209Ii00MCIgdG89IjQwIiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgIC8+Cjwvc3ZnPg=="
              unoptimized={true}
              style={{ objectFit: 'cover', transition: 'opacity 0.3s ease-in-out' }} 
            />
          </span>
        </div>
        <h6 className="card-title mb-1 mt-3">
          {' '}
          <Link href="">{name} </Link>
        </h6>
        <p className="mb-0 small lh-sm">{mutual} mutual connections</p>
      </CardBody>

      <CardFooter className="p-2 border-0">
        <Button variant="primary-soft" size="sm" className="w-100">
          {' '}
          Add friend{' '}
        </Button>
      </CardFooter>
    </Card>;
};
const People = () => {
  const allPeople = useFetchData(getAllUsers);
  const peopleSliderSettings = {
    arrowKeys: true,
    gutter: 12,
    autoplayButton: false,
    autoplayButtonOutput: false,
    nested: 'inner',
    mouseDrag: true,
    controlsText: [renderToString(<FaChevronLeft size={16} />), renderToString(<FaChevronRight size={16} />)],
    autoplay: true,
    controls: true,
    edgePadding: 30,
    items: 3,
    nav: false,
    responsive: {
      1: {
        items: 1
      },
      576: {
        items: 2
      },
      768: {
        items: 2
      },
      992: {
        items: 2
      },
      1200: {
        items: 3
      }
    }
  };
  return <Card>
      <CardHeader className="d-flex justify-content-between align-items-center border-0 pb-0">
        <h6 className="card-title mb-0">People you may know</h6>
        <Button size="sm" variant="primary-soft">
          {' '}
          See all{' '}
        </Button>
      </CardHeader>

      <CardBody>
        <div className="tiny-slider arrow-hover">
          {allPeople && <TinySlider className="ms-n4" settings={peopleSliderSettings}>
              {allPeople?.slice(0, 4).map((people, idx) => <div key={idx}>
                  <PeopleCard people={people} key={idx} />
                </div>)}
            </TinySlider>}
        </div>
      </CardBody>
    </Card>;
};
export default People;
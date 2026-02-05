import { Card, CardBody, CardFooter, CardHeader, CardTitle } from 'react-bootstrap';
import { activityData } from './data';
import Image from 'next/image';
import { BsLockFill, BsUnlockFill } from 'react-icons/bs';
import { timeSince } from '@/utils/date';
import clsx from 'clsx';
export const metadata = {
  title: 'Nesebi / Soy Bağı'
};
const Activity = () => {
  return <Card>
      <CardHeader className="border-0 pb-0">
        <CardTitle> Nesebi / Soy Bağı</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="timeline ">
          {activityData.map((timeline, idx) => <div className={clsx('timeline-item', {
          'align-items-center': activityData.length - 1 != idx
        })} key={idx}>
              <div className="timeline-icon">
                <div className="avatar text-center">
                  {timeline?.avatar ? <Image className="avatar-img rounded-circle" src={timeline.avatar} alt="image" /> : <div className={`avatar-img rounded-circle bg-${timeline.textAvatar?.variant}`}>
                      <span className="text-white position-absolute top-50 start-50 translate-middle fw-bold">{timeline.textAvatar?.text}</span>
                    </div>}
                </div>
              </div>
              <div className="timeline-content">
                <div className="d-sm-flex justify-content-between">
                  <div>
                    <p className="small mb-0">{timeline.title}</p>
                    {timeline.type && <p className="small mb-0">
                        {timeline.type === 'only me' ? <BsLockFill size={18} className="pe-1" /> : <BsUnlockFill size={18} className="pe-1" />}
                        {timeline.type}
                      </p>}
                    {timeline.description}
                  </div>
                  <p className="small ms-sm-3 mt-2 mt-sm-0 text-nowrap">{timeSince(timeline.time)}</p>
                </div>
              </div>
            </div>)}
        </div>
      </CardBody>
    </Card>;
};
export default Activity;
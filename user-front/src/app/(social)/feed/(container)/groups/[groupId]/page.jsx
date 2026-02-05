import { Col } from 'react-bootstrap';
import AllGroupDetails from './components/page';
import { getGroupById } from '@/helpers/data';
import { notFound } from 'next/navigation';
export const generateMetadata = async ({
  params
}) => {
  const group = await getGroupById(params.groupId);
  return {
    title: group?.id ?? 'Group Details'
  };
};
const GroupDetails = async ({
  params
}) => {
  const group = await getGroupById(params.groupId);
  if (!group) notFound();
  return <Col md={8} lg={8} className="vstack gap-4">
      <AllGroupDetails />
    </Col>;
};
export default GroupDetails;
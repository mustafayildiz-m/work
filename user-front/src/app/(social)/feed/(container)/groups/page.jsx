import { Col } from 'react-bootstrap';
import AllGroups from './components/AllGroups';
export const metadata = {
  title: 'Groups'
};
const Groups = () => {
  return <Col md={8} lg={6} className="vstack gap-4">
      <AllGroups />
    </Col>;
};
export default Groups;
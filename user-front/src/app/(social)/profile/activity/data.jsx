import { addOrSubtractMinutesFromDate } from '@/utils/date';
import avatar7 from '@/assets/images/avatar/07.jpg';
import avatar1 from '@/assets/images/avatar/01.jpg';
import avatar2 from '@/assets/images/avatar/02.jpg';
import avatar3 from '@/assets/images/avatar/03.jpg';
export const activityData = [{
  title: 'Kişi 0',
  avatar: avatar7,
  time: addOrSubtractMinutesFromDate(1),
  description: <div className="bg-light rounded p-2 small mb-2">Bugün karşılaştığım en iyi resim bu....</div>,
}, {
  title: 'Kişi 1',
  time: addOrSubtractMinutesFromDate(2),
  description: <div className="bg-light rounded p-2 small mb-2">Bugün karşılaştığım en iyi resim bu....</div>,
  avatar: avatar1
}, {
  title: "Kişi 2",
  time: addOrSubtractMinutesFromDate(60),
  description: <div className="bg-light rounded p-2 small mb-2">Bugün karşılaştığım en iyi resim bu....</div>,
  textAvatar: {
    text: 'SM',
    variant: 'success'
  }
}, {
  title: 'Kişi 3',
  time: addOrSubtractMinutesFromDate(240),
  description: <div className="bg-light rounded p-2 small mb-2">Bugün karşılaştığım en iyi resim bu....</div>,
  avatar: avatar2
}, {
  title: 'Kişi 4',
  time: addOrSubtractMinutesFromDate(600),
  description: <div className="bg-light rounded p-2 small mb-2">Bugün karşılaştığım en iyi resim bu....</div>,
  avatar: avatar3
}];
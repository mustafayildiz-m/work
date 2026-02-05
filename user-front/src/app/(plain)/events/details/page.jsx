import Footer from './components/Footer';
import Hero from './components/Hero';
import OverView from './components/OverView';
import Topbar from './components/Topbar';
export const metadata = {
  title: 'Event Details 2'
};
const EventDetails = () => {
  return <>
      <Topbar />
      <main>
        <Hero />
        <OverView />
      </main>
      <Footer />
    </>;
};
export default EventDetails;
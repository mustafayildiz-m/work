import DiscoverEvents from './components/DiscoverEvents';
import Hero from './components/Hero';
export const metadata = {
  title: 'Events 2'
};
const Events = () => {
  return <main>
      <Hero />
      <DiscoverEvents />
    </main>;
};
export default Events;
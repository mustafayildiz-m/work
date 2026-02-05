import Footer from './components/Footer';
import Player from './components/Player';
import RelatedVideos from './components/RelatedVideos';
export const metadata = {
  title: 'Video Details'
};
const VideoDetails = () => {
  return <>
      <Player />
      <RelatedVideos />
      <Footer />
    </>;
};
export default VideoDetails;
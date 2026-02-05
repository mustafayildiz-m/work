import AllPosts from './components/AllPosts';
import Hero from './components/Hero';
export const metadata = {
  title: 'Post Home'
};
const Posts = () => {
  return <main className="pt-5">
      <Hero />

      <AllPosts />
    </main>;
};
export default Posts;
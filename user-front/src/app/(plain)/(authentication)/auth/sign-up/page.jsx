import { Card } from 'react-bootstrap';
import SignUpForm from './components/SignUpForm';
import Link from 'next/link';
export const metadata = {
  title: 'Giriş yap'
};
const SignUp = () => {
  return <Card className="card-body rounded-3 p-4 p-sm-5">
      <div className="text-center">
        <h1 className="mb-2">Kaydol</h1>
        <span className="d-block">
        Zaten bir hesabınız var mı? <Link href="/auth/sign-in">Giriş yapın</Link>
        </span>
      </div>
      <SignUpForm />
    </Card>;
};
export default SignUp;
import { Card } from 'react-bootstrap';
import LoginForm from './components/LoginForm';
import Link from 'next/link';
export const metadata = {
  title: 'Giriş yap'
};
const SignIn = () => {
  return <Card className="card-body text-center p-4 p-sm-5">
      <h1 className="mb-2">Giriş yap</h1>
      <p className="mb-0">
        Hesabınız yok mu? <Link href="/auth/sign-up"> Kaydolmak için buraya tıklayın</Link>
      </p>
      <LoginForm />
    </Card>;
};
export default SignIn;
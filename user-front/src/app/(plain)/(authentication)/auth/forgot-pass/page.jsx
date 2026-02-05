import { Card } from 'react-bootstrap';
import ForgotPassForm from './components/ForgotPassForm';
export const metadata = {
  title: 'Şifrenizi mi unuttunuz?'
};
const ForgotPassword = () => {
  return <Card className="card-body rounded-3 text-center p-4 p-sm-5">
      <h1 className="mb-2">Şifrenizi mi unuttunuz?</h1>
      <p>Hesapla ilişkili e-posta adresini girin.</p>
      <ForgotPassForm />
    </Card>;
};
export default ForgotPassword;
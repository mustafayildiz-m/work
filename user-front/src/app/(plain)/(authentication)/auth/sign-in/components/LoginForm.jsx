'use client';

import { currentYear, developedBy, developedByLink } from '@/context/constants';
import Link from 'next/link';
import useSignIn from './useSignIn';
import TextFormInput from '@/components/form/TextFormInput';
import PasswordFormInput from '@/components/form/PasswordFormInput';
import { Button, FormCheck } from 'react-bootstrap';
const LoginForm = () => {
  const {
    loading,
    login,
    control
  } = useSignIn();
  return <form className="mt-sm-4" onSubmit={login}>
      <TextFormInput name="email" type="email" placeholder="Enter email" control={control} containerClassName="mb-3 input-group-lg" />
      <div className="mb-3 position-relative">
        {/* @ts-ignore */}
        <PasswordFormInput name="password" placeholder="Enter password" control={control} size="lg" containerClassName="w-100" />
      </div>
      <div className="mb-3 d-sm-flex justify-content-between">
        <div>
          <FormCheck type="checkbox" label="Remember me?" id="rememberCheck" />
        </div>
        <Link href="/auth/forgot-pass">Şifreni mi unuttun?</Link>
      </div>
      <div className="d-grid">
        <Button variant="primary" size="lg" type="submit" disabled={loading}>
          Giriş yap
        </Button>
      </div>
      <p className="mb-0 mt-3">
        ©{currentYear}{' '}
        <Link target="_blank" href={developedByLink}>
          {developedBy}.
        </Link>{' '}
        Tüm hakları saklıdır.
      </p>
    </form>;
};
export default LoginForm;
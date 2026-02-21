'use client';

import PasswordFormInput from '@/components/form/PasswordFormInput';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { currentYear, developedBy, developedByLink } from '@/context/constants';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
const ForgotPassForm = () => {
  const forgotPassSchema = yup.object({
    password: yup.string().required('Please enter your password')
  });
  const {
    control,
    handleSubmit,
    watch,
    getValues
  } = useForm({
    resolver: yupResolver(forgotPassSchema)
  });
  
  const password = watch('password');
  
  return <form className="mt-3" onSubmit={handleSubmit(() => {})}>
      <div className="mb-3">
        <PasswordFormInput name="password" control={control} size="lg" placeholder="Enter new password" />
        <div className="mt-2">
          <PasswordStrengthMeter password={password} />
        </div>
      </div>
      <div className="mb-3">
        <p>
          Geri dön, <Link href="/auth/sign-in">giriş yap</Link>
        </p>
      </div>
      <div className="d-grid">
        <Button variant="primary" size="lg" type="submit">
          Şifreni sıfırlar
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
export default ForgotPassForm;
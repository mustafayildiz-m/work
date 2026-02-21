'use client';

import PasswordFormInput from '@/components/form/PasswordFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { currentYear, developedBy, developedByLink } from '@/context/constants';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import { useState } from 'react';
import { Button, FormCheck } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
const SignUpForm = () => {
  const signUpSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('please enter your email'),
    password: yup.string().required('Please enter your password'),
    confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match')
  });
  const {
    control,
    handleSubmit,
    watch,
    getValues
  } = useForm({
    resolver: yupResolver(signUpSchema)
  });
  
  const password = watch('password');
  
  return <form className="mt-4" onSubmit={handleSubmit(() => {})}>
      <div className="mb-3">
        <TextFormInput name="email" control={control} containerClassName="input-group-lg" placeholder="Eposta adresini gir" />
        <small>E-postanızı asla başka biriyle paylaşmayacağız.</small>
      </div>
      <div className="mb-3 position-relative">
        <PasswordFormInput name="password" control={control} size="lg" placeholder="Yeni şifre oluştur" />
        <div className="mt-2">
          <PasswordStrengthMeter password={password} />
        </div>
      </div>
      <PasswordFormInput name="confirmPassword" control={control} size="lg" containerClassName="mb-3" placeholder="Şifreni doğrula" />
      <div className="mb-3 text-start">
        <FormCheck label="Beni hatırla." id="termAndCondition" />
      </div>
      <div className="d-grid">
        <Button variant="primary" type="submit" size="lg">
          Hesap oluştur
        </Button>
      </div>
      <p className="mb-0 mt-3 text-center">
        ©{currentYear}{' '}
        <Link target="_blank" href={developedByLink}>
          {developedBy}.
        </Link>{' '}
        Tüm hakları saklıdır.
      </p>
    </form>;
};
export default SignUpForm;
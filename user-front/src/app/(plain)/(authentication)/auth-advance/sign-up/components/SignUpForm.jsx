'use client';

import PasswordFormInput from '@/components/form/PasswordFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import DropzoneFormInput from '@/components/form/DropzoneFormInput';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { currentYear, developedBy, developedByLink } from '@/context/constants';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, FormCheck } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/useLanguageContext';
import styles from '../../auth-pages.module.css';

const SignUpForm = () => {
  const { t, locale } = useLanguage();
  const [firstPassword, setFirstPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const router = useRouter();

  const signUpSchema = yup.object({
    firstName: yup.string().required('Lütfen adınızı girin'),
    lastName: yup.string().required('Lütfen soyadınızı girin'),
    email: yup.string().email('Lütfen geçerli bir e-posta girin').required('Lütfen e-postanızı girin'),
    password: yup.string().min(6, 'Şifre en az 6 karakter olmalıdır').required('Lütfen şifrenizi girin'),
    confirmPassword: yup.string()
      .oneOf([yup.ref('password')], 'Parolalar eşleşmelidir')
      .required('Lütfen şifrenizi doğrulayın'),
    acceptTerms: yup.boolean()
      .oneOf([true], 'Kullanım şartlarını kabul etmelisiniz')
      .required('Kullanım şartlarını kabul etmelisiniz')
  });

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    }
  });

  const password = watch('password');
  const formValues = watch();

  useEffect(() => {
    setFirstPassword(getValues().password);
  }, [password, getValues]);

  const handleFileSelect = (files) => {
    if (files && files.length > 0) {
      // Sadece ilk dosyayı al (tek profil fotoğrafı)
      setSelectedFile(files[0]);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // FormData oluştur
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('username', data.email.split('@')[0]);
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('language', locale);

      // Eğer fotoğraf seçildiyse ekle
      if (selectedFile) {
        formData.append('profilePhoto', selectedFile);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      console.log('Registering with API URL:', apiUrl);

      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
        // Loading state true kalsın, yönlendirme olsun
        setTimeout(() => router.push('/auth-advance/sign-in'), 1500);
      } else {
        const err = await res.json();
        setError(err.message || 'Kayıt başarısız!');
        setLoading(false);
      }
    } catch (e) {
      setError('Sunucuya bağlanılamadı!');
      setLoading(false);
    }
  };

  return <form className="mt-2" onSubmit={handleSubmit(onSubmit)}>
    <div className="mb-1 text-start">
      <TextFormInput
        name="firstName"
        control={control}
        placeholder={t('auth.firstNamePlaceholder')}
      />
    </div>
    <div className="mb-1 text-start">
      <TextFormInput
        name="lastName"
        control={control}
        placeholder={t('auth.lastNamePlaceholder')}
      />
    </div>
    <div className="mb-1 text-start">
      <TextFormInput
        name="email"
        control={control}
        placeholder={t('auth.emailPlaceholderRequired')}
      />
    </div>

    {/* Profil Fotoğrafı Yükleme - Compact on mobile */}
    <div className="mb-1 text-start">
      <DropzoneFormInput
        label=""
        text={<span className={styles.hiddenOnMobile}>{t('auth.profilePhotoOptional')}</span>}
        showPreview={true}
        onFileUpload={handleFileSelect}
        helpText=""
        maxFiles={1}
      />
    </div>

    <div className="mb-1 position-relative">
      <PasswordFormInput
        name="password"
        control={control}
        placeholder={t('auth.passwordPlaceholderRequired')}
      />
    </div>
    <PasswordFormInput
      name="confirmPassword"
      control={control}
      containerClassName="mb-1"
      placeholder={t('auth.confirmPasswordPlaceholder')}
    />
    <div className="mb-1 text-start">
      <Controller
        name="acceptTerms"
        control={control}
        render={({ field }) => (
          <>
            <FormCheck
              label={<span>{t('auth.acceptTerms')} <span className="text-danger">*</span></span>}
              id="termAndCondition"
              style={{ fontSize: '0.9rem' }}
              className="custom-green-check"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
            {errors.acceptTerms && (
              <div className="text-danger small mt-1">
                {errors.acceptTerms.message}
              </div>
            )}
          </>
        )}
      />
    </div>
    {error && <div className="alert alert-danger py-2 small">{error}</div>}
    {success && <div className="alert alert-success py-2 small">{success}</div>}
    <div className="d-grid mt-2">
      <Button
        size="lg"
        type="submit"
        disabled={loading || !isValid || !formValues.acceptTerms}
        className={styles.submitButton}
        style={{
          borderRadius: '12px',
          minHeight: '54px',
          fontWeight: '600',
          background: loading || !isValid || !formValues.acceptTerms
            ? 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)'
            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          border: 'none',
          color: 'white'
        }}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {t('auth.registering')}
          </>
        ) : (
          t('auth.signUp')
        )}
      </Button>
    </div>
    <div className="text-center mt-2">
      <Link
        href="/auth-advance/sign-in"
        style={{
          color: '#059669',
          fontWeight: '600',
          textDecoration: 'none',
          fontSize: '0.9rem'
        }}
      >
        {t('auth.alreadyHaveAccount')} {t('auth.signIn')}
      </Link>
    </div>
  </form>;
};
export default SignUpForm;
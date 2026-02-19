'use client';

import PasswordFormInput from '@/components/form/PasswordFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import DropzoneFormInput from '@/components/form/DropzoneFormInput';
import DateFormInput from '@/components/form/DateFormInput';
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
import { BsPerson } from 'react-icons/bs';

const SignUpForm = () => {
  const { t, locale } = useLanguage();
  const [firstPassword, setFirstPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const router = useRouter();

  const signUpSchema = yup.object({
    firstName: yup.string().required(t('auth.firstNameRequired') || 'Lütfen adınızı girin'),
    lastName: yup.string().required(t('auth.lastNameRequired') || 'Lütfen soyadınızı girin'),
    email: yup.string().email(t('auth.emailInvalid') || 'Lütfen geçerli bir e-posta girin').required(t('auth.emailRequired') || 'Lütfen e-postanızı girin'),
    birthDate: yup.date()
      .nullable()
      .required(t('auth.birthDateRequired'))
      .test('age', t('auth.ageLimitError'), (value) => {
        if (!value) return false;
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 16;
      }),
    password: yup.string().min(6, t('auth.passwordMinLength') || 'Şifre en az 6 karakter olmalıdır').required(t('auth.passwordRequired') || 'Lütfen şifrenizi girin'),
    confirmPassword: yup.string()
      .oneOf([yup.ref('password')], t('auth.passwordsNotMatch') || 'Parolalar eşleşmelidir')
      .required(t('auth.confirmPasswordRequired') || 'Lütfen şifrenizi doğrulayın'),
    acceptTerms: yup.boolean()
      .oneOf([true], t('auth.acceptTermsRequired') || 'Kullanım şartlarını kabul etmelisiniz')
      .required(t('auth.acceptTermsRequired') || 'Kullanım şartlarını kabul etmelisiniz')
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
      birthDate: null,
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

      if (data.birthDate) {
        // Format as YYYY-MM-DD for backend
        const date = new Date(data.birthDate);
        const formattedDate = date.toISOString().split('T')[0];
        formData.append('birthDate', formattedDate);
      }

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
        setSuccess(t('auth.registerSuccess') || 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
        // Loading state true kalsın, yönlendirme olsun
        setTimeout(() => router.push('/auth-advance/sign-in'), 1500);
      } else {
        const err = await res.json();
        setError(err.message || t('auth.registerError') || 'Kayıt başarısız!');
        setLoading(false);
      }
    } catch (e) {
      setError(t('auth.serverError') || 'Sunucuya bağlanılamadı!');
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

    <div className="mb-1 text-start">
      <DateFormInput
        name="birthDate"
        control={control}
        placeholder={t('auth.birthDatePlaceholder')}
        options={{
          maxDate: new Date()
        }}
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
    <div className="text-center mt-2 d-flex flex-column gap-2">
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
      <div className="d-grid mt-2">
        <Button
          size="lg"
          type="button"
          variant="outline-primary"
          onClick={() => window.location.href = '/'}
          style={{
            borderRadius: '12px',
            minHeight: '52px',
            fontWeight: '700',
            border: '2px solid #764ba2',
            color: '#764ba2',
            backgroundColor: 'rgba(118, 75, 162, 0.05)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            fontSize: '1rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#764ba2';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(118, 75, 162, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(118, 75, 162, 0.05)';
            e.currentTarget.style.color = '#764ba2';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
        >
          <BsPerson size={22} />
          <span>{t('auth.visitAsGuest')}</span>
        </Button>
      </div>
    </div>
  </form>;
};
export default SignUpForm;
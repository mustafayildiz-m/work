'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNotificationContext } from '@/context/useNotificationContext';
import useQueryParams from '@/hooks/useQueryParams';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/useLanguageContext';

const useSignIn = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { login } = useAuth();
  const {
    push
  } = useRouter();
  const {
    showNotification
  } = useNotificationContext();
  const queryParams = useQueryParams();

  const loginFormSchema = yup.object({
    email: yup.string().email('Lütfen geçerli bir e-posta girin').required('Lütfen e-posta adresinizi girin'),
    password: yup.string().required('Lütfen şifrenizi girin')
  });

  const {
    control,
    handleSubmit
  } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const handleLogin = handleSubmit(async values => {
    setLoading(true);
    try {
      const result = await login(values);

      if (result.success) {
        // Başarılı giriş - Animasyonu göster
        setShowSuccess(true);
        setLoading(false);

        // Yönlendirme yap - Animasyonun tamamlanması ve okunması için bekle
        setTimeout(() => {
          const targetUrl = queryParams['redirectTo'] ?? '/feed/home';
          // Production'da daha güvenli olması için window.location.href kullan
          // Bu şekilde tüm session state'in senkronize olduğundan emin oluruz
          window.location.href = window.location.origin + (targetUrl.startsWith('/') ? targetUrl : '/' + targetUrl);
        }, 1500);
      } else {
        // Giriş başarısız - loading'i kapat
        setLoading(false);

        // Error mesajını translate et
        let errorMessage = t('auth.loginError');

        if (result.error) {
          // Eğer error i18n key ise translate et
          if (result.error.startsWith('auth.')) {
            errorMessage = t(result.error);
          } else {
            // Backend'den gelen error mesajını kontrol et
            const error = result.error.toLowerCase();
            if (error.includes('devre dışı') || error.includes('disabled')) {
              errorMessage = t('auth.accountDisabled');
            } else if (error.includes('geçersiz') || error.includes('invalid')) {
              errorMessage = t('auth.invalidCredentials');
            } else {
              errorMessage = result.error;
            }
          }
        }

        showNotification({
          message: errorMessage,
          variant: 'danger'
        });
      }
    } catch (e) {
      // Hata durumunda - loading'i kapat
      setLoading(false);
      showNotification({
        message: t('common.error'),
        variant: 'danger'
      });
    }
  });

  return {
    loading,
    showSuccess,
    login: handleLogin,
    control
  };
};

export default useSignIn;
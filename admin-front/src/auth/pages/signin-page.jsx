import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/context/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getSigninSchema } from '../forms/signin-schema';
import { useIntl } from 'react-intl';

export function SignInPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const intl = useIntl();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const pwdReset = searchParams.get('pwd_reset');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (pwdReset === 'success') {
      setSuccessMessage(intl.formatMessage({ id: 'AUTH.PASSWORD_RESET_SUCCESS' }));
    }

    if (errorParam) {
      setError(errorDescription || intl.formatMessage({ id: 'AUTH.GENERIC_ERROR' }));
    }
  }, [searchParams, intl]);

  const form = useForm({
    resolver: zodResolver(getSigninSchema()),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  async function onSubmit(values) {
    try {
      setIsProcessing(true);
      setError(null);
      if (!values.email.trim() || !values.password) {
        setError(intl.formatMessage({ id: 'AUTH.EMAIL_PASSWORD_REQUIRED' }));
        return;
      }
      await login(values.email, values.password);
      const nextPath = searchParams.get('next') || '/';
      setTimeout(() => {
        navigate(nextPath, { replace: true });
      }, 100);
    } catch (err) {
      console.error('Login form error:', err);
      // Backend'den gelen hata mesajını direkt göster
      const errorMessage = err instanceof Error ? err.message : intl.formatMessage({ id: 'AUTH.GENERIC_ERROR' });
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="block w-full space-y-5">
        <div className="text-center space-y-1 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {intl.formatMessage({ id: 'AUTH.ADMIN_PANEL_TITLE' })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {intl.formatMessage({ id: 'AUTH.PLEASE_LOGIN' })}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" appearance="light" onClose={() => setError(null)}>
            <AlertIcon>
              <AlertCircle />
            </AlertIcon>
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        {successMessage && (
          <Alert appearance="light" onClose={() => setSuccessMessage(null)}>
            <AlertIcon>
              <Check />
            </AlertIcon>
            <AlertTitle>{successMessage}</AlertTitle>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{intl.formatMessage({ id: 'AUTH.EMAIL_LABEL' })}</FormLabel>
              <FormControl>
                <Input placeholder={intl.formatMessage({ id: 'AUTH.EMAIL_PLACEHOLDER' })} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center gap-2.5">
                <FormLabel>{intl.formatMessage({ id: 'AUTH.PASSWORD_LABEL' })}</FormLabel>
              </div>
              <div className="relative">
                <Input
                  placeholder={intl.formatMessage({ id: 'AUTH.PASSWORD_PLACEHOLDER' })}
                  type={passwordVisible ? 'text' : 'password'}
                  {...field}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  tabIndex={-1}
                  onClick={() => setPasswordVisible((v) => !v)}
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-sm font-normal cursor-pointer">
                  {intl.formatMessage({ id: 'AUTH.REMEMBER_ME' })}
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing
            ? intl.formatMessage({ id: 'AUTH.LOGGING_IN' })
            : intl.formatMessage({ id: 'AUTH.LOGIN_BUTTON' })}
        </Button>
      </form>
    </Form>
  );
}


import { useEffect } from 'react';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { setRecaptchaTokenGetter } from '@/services/api';

export default function RecaptchaInitializer() {
  const { getRecaptchaToken } = useRecaptcha();

  useEffect(() => {
    setRecaptchaTokenGetter(async () => {
      return await getRecaptchaToken('api_request');
    });
  }, [getRecaptchaToken]);

  return null;
}

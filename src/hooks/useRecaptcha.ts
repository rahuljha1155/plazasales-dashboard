import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useCallback } from 'react';

export const useRecaptcha = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getRecaptchaToken = useCallback(
    async (action: string = 'submit') => {
      if (!executeRecaptcha) {
        return null;
      }

      try {
        // Generate a fresh token with timestamp to ensure uniqueness
        const token = await executeRecaptcha(action);
        return token;
      } catch (error) {
        return null;
      }
    },
    [executeRecaptcha]
  );

  return { getRecaptchaToken };
};

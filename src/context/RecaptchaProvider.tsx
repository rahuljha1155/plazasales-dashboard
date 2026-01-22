import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import type { ReactNode } from 'react';

export default function RecaptchaProvider({ children }: { children: ReactNode }) {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

  if (!siteKey) {
    console.warn('reCAPTCHA site key is missing');
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}

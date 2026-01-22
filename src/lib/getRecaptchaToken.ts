// src/lib/getRecaptchaToken.ts
export async function getRecaptchaToken(action: string = "submit") {
  return new Promise((resolve) => {
    if (!window.grecaptcha) return resolve(null);

    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(import.meta.env.VITE_RECAPTCHA_SITE_KEY, { action })
        .then((token: string) => {
          resolve(token);
        })
        .catch(() => resolve(null));
    });
  });
}

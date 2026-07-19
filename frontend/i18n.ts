import {getRequestConfig} from 'next-intl/server';
import { cookies } from 'next/headers';

const locales = ['fr', 'en', 'ar'];

export default getRequestConfig(async ({locale}) => {
  let validLocale = locale;
  
  if (!validLocale || !locales.includes(validLocale as string)) {
    const cookieLocale = cookies().get('NEXT_LOCALE')?.value;
    if (cookieLocale && locales.includes(cookieLocale)) {
      validLocale = cookieLocale;
    } else {
      validLocale = 'fr';
    }
  }

  return {
    locale: validLocale as string,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});

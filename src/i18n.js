import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: ['en', 'es'],
    load: "languageOnly",
    debug: true,
    backend: {
        loadPath: './i18n/{{lng}}.json'
    },
    detection:{

        lookupLocalStorage: "chromatic-lang",
    },

    interpolation: {
      escapeValue: false,
    }
  });


export default i18n;
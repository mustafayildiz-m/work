import { toAbsoluteUrl } from '@/lib/helpers';
import enMessages from './messages/en.json';
import trMessages from './messages/tr.json';

const I18N_MESSAGES = {
  en: enMessages,
  tr: trMessages,
};

const I18N_CONFIG_KEY = 'i18nConfig';

const I18N_LANGUAGES = [
  {
    label: 'English',
    code: 'en',
    direction: 'ltr',
    flag: toAbsoluteUrl('/media/flags/united-states.svg'),
    messages: I18N_MESSAGES.en,
  },
  {
    label: 'Türkçe',
    code: 'tr',
    direction: 'ltr',
    flag: toAbsoluteUrl('/media/flags/turkey.svg'),
    messages: I18N_MESSAGES.tr,
  },
];

const I18N_DEFAULT_LANGUAGE = I18N_LANGUAGES[0]; // English is default

export {
  I18N_CONFIG_KEY,
  I18N_DEFAULT_LANGUAGE,
  I18N_LANGUAGES,
  I18N_MESSAGES,
};

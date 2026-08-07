import { useIntl } from 'react-intl';

export function useQaIntl() {
  const intl = useIntl();
  const t = (id, values) => intl.formatMessage({ id, defaultMessage: id }, values);
  return { t, intl };
}

import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { HeaderActions } from '@/components/header-actions';
import {
  localePrefix,
  localeText,
  type DocsLocale,
} from '@/lib/i18n';

export function baseOptions(locale: DocsLocale): BaseLayoutProps {
  const prefix = localePrefix(locale);
  const text = localeText[locale];

  return {
    nav: {
      title: 'Qn Chrome Tabs',
      url: prefix || '/',
    },
    links: [
      { text: text.home, url: prefix || '/', on: 'nav' },
      { text: text.start, url: `${prefix}/docs/start`, on: 'nav' },
      { text: text.guide, url: `${prefix}/docs/guide`, on: 'nav' },
      { text: 'API', url: `${prefix}/docs/api`, on: 'nav' },
      { text: text.examples, url: `${prefix}/docs/examples`, on: 'nav' },
      {
        type: 'custom',
        secondary: true,
        on: 'nav',
        children: <HeaderActions />,
      },
    ],
  };
}

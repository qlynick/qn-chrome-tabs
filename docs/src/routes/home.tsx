import { useCallback, useEffect, useRef, useState } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { useDocsTitle } from '@/components/title-provider';
import {
  localeText,
  type DocsLocale,
} from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';
import { getDocsUrl } from '@/lib/runtime-url';

export default function Home({ locale = 'zh' }: { locale?: DocsLocale }) {
  const [frameHeight, setFrameHeight] = useState(1600);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const { setOpenSearch } = useSearchContext();
  const frameUrl = getDocsUrl('demo/index.html');
  frameUrl.searchParams.set('locale', locale);
  useDocsTitle(localeText[locale].home);

  const syncFrameLocale = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'qn-chrome-tabs-locale', locale },
      frameUrl.origin,
    );
  }, [frameUrl.origin, locale]);

  useEffect(() => {
    syncFrameLocale();

    function updateFrameHeight(event: MessageEvent) {
      if (
        event.origin !== frameUrl.origin
        || event.source !== frameRef.current?.contentWindow
      ) {
        return;
      }
      const message = event.data as {
        type?: string;
        height?: number;
      };
      if (message.type === 'qn-chrome-tabs-open-search') {
        setOpenSearch(true);
        return;
      }
      if (
        message.type === 'qn-chrome-tabs-demo-height'
        && typeof message.height === 'number'
      ) {
        setFrameHeight(message.height);
      }
    }

    window.addEventListener('message', updateFrameHeight);
    return () => window.removeEventListener('message', updateFrameHeight);
  }, [frameUrl.origin, setOpenSearch, syncFrameLocale]);

  return (
    <HomeLayout key={locale} {...baseOptions(locale)}>
      <iframe
        ref={frameRef}
        id="docs-demo-frame"
        src={frameUrl.toString()}
        title="Qn Chrome Tabs"
        className="block w-full border-0"
        style={{ height: frameHeight }}
        onLoad={syncFrameLocale}
      />
    </HomeLayout>
  );
}

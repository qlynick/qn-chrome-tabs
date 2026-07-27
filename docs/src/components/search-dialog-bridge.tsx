import { Dialog } from '@base-ui/react/dialog';
import type { SharedProps } from 'fumadocs-ui/contexts/search';
import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router';
import { getDocsLocale, localeText } from '@/lib/i18n';

const LazyDocsSearchDialog = lazy(() =>
  import('@/components/search-dialog').then((module) => ({
    default: module.DocsSearchDialog,
  })),
);

function DialogRegistration({
  showLoading = false,
  ...props
}: SharedProps & { showLoading?: boolean }) {
  const locale = getDocsLocale(useLocation().pathname);

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.onOpenChange}
      handle={props.dialogHandle}
    >
      {showLoading && (
        <Dialog.Portal>
          <Dialog.Backdrop className="docs-search-loading-overlay" />
          <Dialog.Popup
            className="docs-search-loading-dialog"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">
              {localeText[locale].loadingSearch}
            </Dialog.Title>
            <div className="docs-search-loading-content" aria-busy="true">
              <span className="docs-search-loading-spinner" aria-hidden="true" />
              <span>{localeText[locale].loadingSearch}</span>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  );
}

export function DocsSearchDialogBridge(props: SharedProps) {
  if (!props.open) return <DialogRegistration {...props} />;

  return (
    <Suspense fallback={<DialogRegistration {...props} showLoading />}>
      <LazyDocsSearchDialog {...props} />
    </Suspense>
  );
}

import { useDocsSearch } from 'fumadocs-core/search/client';
import { flexsearchStaticClient } from 'fumadocs-core/search/client/flexsearch-static';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useLocation } from 'react-router';
import { getDocsLocale, localeText } from '@/lib/i18n';
import { getDocsUrl } from '@/lib/runtime-url';

export function DocsSearchDialog(props: SharedProps) {
  const locale = getDocsLocale(useLocation().pathname);
  const { search, setSearch, query } = useDocsSearch({
    client: flexsearchStaticClient({
      from: getDocsUrl(`api/search/${locale}`).toString(),
    }),
  });

  return (
    <SearchDialog
      {...props}
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogInput placeholder={localeText[locale].search} />
          <SearchDialogClose>{localeText[locale].close}</SearchDialogClose>
        </SearchDialogHeader>
        <SearchDialogList
          items={query.data === 'empty' ? [] : query.data}
        />
      </SearchDialogContent>
    </SearchDialog>
  );
}

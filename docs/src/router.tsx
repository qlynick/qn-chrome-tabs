import { RootProvider } from 'fumadocs-ui/provider/react-router';
import {
  createBrowserRouter,
  createMemoryRouter,
  Outlet,
  type RouteObject,
  useLocation,
  useNavigate,
} from 'react-router';
import DocsRoute, {
  enDocsLoader,
  koDocsLoader,
  zhDocsLoader,
} from '@/routes/docs';
import Home from '@/routes/home';
import NotFound from '@/routes/not-found';
import RouteError from '@/routes/route-error';
import {
  getDocsLocale,
  localizePath,
  localeItems,
  uiTranslations,
} from '@/lib/i18n';
import { DocsSearchDialogBridge } from '@/components/search-dialog-bridge';

function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const locale = getDocsLocale(location.pathname);

  return (
    <RootProvider
      search={{ SearchDialog: DocsSearchDialogBridge }}
      i18n={{
        locale,
        locales: localeItems,
        translations: uiTranslations[locale],
        onLocaleChange(nextLocale) {
          navigate({
            pathname: localizePath(location.pathname, nextLocale as typeof locale),
            search: location.search,
            hash: location.hash,
          });
        },
      }}
    >
      <Outlet />
    </RootProvider>
  );
}

const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: 'docs/*', loader: zhDocsLoader, element: <DocsRoute /> },
      { path: 'en', element: <Home locale="en" /> },
      { path: 'en/docs/*', loader: enDocsLoader, element: <DocsRoute /> },
      { path: 'ko', element: <Home locale="ko" /> },
      { path: 'ko/docs/*', loader: koDocsLoader, element: <DocsRoute /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

function normalizeDocsPath(path: string) {
  return /^\/(start|guide|api|examples)(?=\/|[?#]|$)/.test(path)
    ? `/docs${path}`
    : path;
}

export function createDocsRouter(embedded: boolean, initialPath = '/') {
  const normalizedPath = normalizeDocsPath(initialPath);

  return embedded
    ? createMemoryRouter(routes, { initialEntries: [normalizedPath] })
    : createBrowserRouter(routes);
}

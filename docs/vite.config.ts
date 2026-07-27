import { fileURLToPath } from 'node:url';
import { readFile, readdir } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { structure } from 'fumadocs-core/mdx-plugins/remark-structure';
import { flexsearch } from 'fumadocs-core/search/flexsearch';
import { loader } from 'fumadocs-core/source';
import mdx from 'fumadocs-mdx/vite';
import { defineConfig, type Plugin } from 'vite';
import qiankun from 'vite-plugin-qiankun';

const docsDirectory = fileURLToPath(
  new URL('./content/docs', import.meta.url),
);
const virtualManifestId = 'virtual:docs-manifest';
const resolvedManifestId = `\0${virtualManifestId}`;
const locales = ['zh', 'en', 'ko'] as const;
type DocsLocale = typeof locales[number];

async function getDocsFiles() {
  return (await readdir(docsDirectory, {
    recursive: true,
    withFileTypes: true,
  }))
    .filter((entry) => entry.isFile())
    .map((entry) => resolve(entry.parentPath, entry.name));
}

function getFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  const metadata = match?.[1] ?? '';

  return {
    body: match ? content.slice(match[0].length) : content,
    title: metadata.match(/^title:\s*(.+)$/m)?.[1].trim(),
    description: metadata.match(/^description:\s*(.+)$/m)?.[1].trim(),
  };
}

function isDocsFile(file: string) {
  return file.startsWith(`${docsDirectory}${sep}`)
    && ['.json', '.md', '.mdx'].includes(extname(file));
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;');
}

function localeFilePath(file: string, locale: DocsLocale) {
  const path = relative(docsDirectory, file).split(sep).join('/');
  if (locale === 'zh') {
    return path.startsWith('en/') || path.startsWith('ko/') ? undefined : path;
  }
  return path.startsWith(`${locale}/`)
    ? path.slice(locale.length + 1)
    : undefined;
}

function localeBaseUrl(locale: DocsLocale) {
  return locale === 'zh' ? '/docs' : `/${locale}/docs`;
}

async function createSearchData(locale: DocsLocale) {
  const files = (await getDocsFiles())
    .filter((file) => ['.md', '.mdx'].includes(extname(file)))
    .map((file) => ({ file, path: localeFilePath(file, locale) }))
    .filter((item): item is { file: string; path: string } => (
      item.path !== undefined
    ));

  const indexes = await Promise.all(files.map(async ({ file, path: filePath }) => {
    const content = await readFile(file, 'utf8');
    const { body, title = 'Documentation', description = '' } = getFrontmatter(content);
    const path = filePath
      .replace(/\.(md|mdx)$/, '')
      .replace(/\/index$/, '');

    return {
      id: path || 'index',
      title,
      description,
      structuredData: structure(body),
      url: path ? `${localeBaseUrl(locale)}/${path}` : localeBaseUrl(locale),
    };
  }));

  const response = await flexsearch({ indexes }).staticGET();
  return response.text();
}

async function createLocaleManifest(locale: DocsLocale) {
  const files = await getDocsFiles();
  const sourceFiles = await Promise.all(files.map(async (file) => {
    const path = localeFilePath(file, locale);
    if (!path) return;

    if (['.md', '.mdx'].includes(extname(file))) {
      const { title, description } = getFrontmatter(await readFile(file, 'utf8'));
      return {
        type: 'page' as const,
        path,
        data: { title, description },
      };
    }

    if (file.endsWith('meta.json')) {
      return {
        type: 'meta' as const,
        path,
        data: JSON.parse(await readFile(file, 'utf8')) as {
          title?: string;
          pages?: string[];
        },
      };
    }
  }));

  const source = loader({
    source: {
      files: sourceFiles.filter((file) => file !== undefined),
    },
    baseUrl: localeBaseUrl(locale),
  });

  return {
    pages: Object.fromEntries(
      source.getPages().map((page) => [
        page.slugs.join('/'),
        {
          path: locale === 'zh' ? page.path : `${locale}/${page.path}`,
          title: page.data.title ?? '文档',
        },
      ]),
    ),
    pageTree: {
      $fumadocs_loader: 'page-tree' as const,
      data: JSON.parse(JSON.stringify(source.getPageTree(), (key, value) => {
        if (
          (key === 'name' || key === 'icon')
          && typeof value === 'string'
        ) {
          return escapeHtml(value);
        }
        return value;
      })) as object,
    },
  };
}

async function createDocsManifest() {
  return Object.fromEntries(await Promise.all(locales.map(async (locale) => [
    locale,
    await createLocaleManifest(locale),
  ]))) as Record<DocsLocale, Awaited<ReturnType<typeof createLocaleManifest>>>;
}

function docsManifest(
  initialManifest: Awaited<ReturnType<typeof createDocsManifest>>,
): Plugin {
  return {
    name: 'qn-chrome-tabs-docs-manifest',
    resolveId(id) {
      if (id === virtualManifestId) return resolvedManifestId;
    },
    load(id) {
      if (id !== resolvedManifestId) return;
      return `export default ${JSON.stringify(initialManifest)};`;
    },
    configureServer(server) {
      const reloadForFile = (file: string) => {
        if (isDocsFile(file)) server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', reloadForFile);
      server.watcher.on('unlink', reloadForFile);
      server.middlewares.use('/api/docs-manifest', async (_request, response) => {
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.end(JSON.stringify(await createDocsManifest()));
      });
    },
    handleHotUpdate({ file, server }) {
      if (!isDocsFile(file)) return;
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}

function staticSearch(): Plugin {
  const data = new Map<DocsLocale, Promise<string>>();
  const getData = (locale: DocsLocale) => {
    const cached = data.get(locale);
    if (cached) return cached;
    const next = createSearchData(locale);
    data.set(locale, next);
    return next;
  };

  return {
    name: 'qn-chrome-tabs-static-search',
    configureServer(server) {
      server.middlewares.use('/api/search', async (request, response) => {
        const locale = request.url?.split('/').filter(Boolean)[0] as DocsLocale;
        if (!locales.includes(locale)) {
          response.statusCode = 404;
          response.end();
          return;
        }
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.end(await getData(locale));
      });
    },
    async generateBundle() {
      for (const locale of locales) {
        this.emitFile({
          type: 'asset',
          fileName: `api/search/${locale}`,
          source: await getData(locale),
        });
      }
    },
    handleHotUpdate({ file }) {
      if (isDocsFile(file)) data.clear();
    },
  };
}

export default defineConfig(async ({ command }) => {
  const isDev = command === 'serve';
  const initialManifest = await createDocsManifest();

  return {
    base: isDev
      ? '/'
      : process.env.DOCS_PUBLIC_BASE
        ?? 'https://qlynick.github.io/qn-chrome-tabs/',
    plugins: [
      mdx(),
      docsManifest(initialManifest),
      staticSearch(),
      tailwindcss(),
      !isDev && react(),
      qiankun('chrome-tabs-docs', { useDevMode: isDev }),
    ].filter(Boolean),
    server: {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        collections: fileURLToPath(new URL('./.source', import.meta.url)),
        'node:path': fileURLToPath(
          new URL('./src/lib/path-browser.ts', import.meta.url),
        ),
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'use-sync-external-store/shim',
        'use-sync-external-store/shim/with-selector',
        'react-dom/server.edge',
        'fumadocs-core/source/client',
        'fumadocs-ui/layouts/docs',
        'fumadocs-ui/layouts/docs/page',
        'fumadocs-ui/layouts/home',
        'fumadocs-ui/layouts/shared',
        'fumadocs-ui/mdx',
        'fumadocs-ui/provider/react-router',
      ],
    },
    build: {
      rollupOptions: {
        input: {
          index: fileURLToPath(new URL('./index.html', import.meta.url)),
          demo: fileURLToPath(new URL('./demo/index.html', import.meta.url)),
        },
      },
    },
  };
});

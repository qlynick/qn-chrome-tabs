import browserCollections from 'collections/browser';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import docsManifest from 'virtual:docs-manifest';
import { getMDXComponents } from '@/components/mdx';
import { useDocsTitle } from '@/components/title-provider';
import { DocsRequestError } from '@/lib/docs-request-error';
import {
  localeText,
  type DocsLocale,
} from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';
import { getDocsUrl } from '@/lib/runtime-url';

async function getDocsManifest() {
  if (!import.meta.env.DEV) return docsManifest;

  const url = getDocsUrl('api/docs-manifest');
  let response: Response;
  try {
    response = await fetch(url, { cache: 'no-store' });
  } catch {
    throw new DocsRequestError(
      '无法连接文档清单服务。',
      url.toString(),
      undefined,
      '请确认文档子应用已经启动，并且 micro-portal 可以访问该地址。',
    );
  }

  if (!response.ok) {
    throw new DocsRequestError(
      '无法获取文档清单。',
      url.toString(),
      response.status,
      '请确认 micro-portal 的子应用 entry 指向正在运行的文档服务。',
    );
  }

  const content = await response.text();
  try {
    return JSON.parse(content) as typeof docsManifest;
  } catch {
    throw new DocsRequestError(
      '文档清单响应格式不正确，接口返回的不是 JSON。',
      url.toString(),
      response.status,
      content.trimStart().startsWith('<')
        ? '当前请求返回了 HTML，通常表示请求错误地落到了 micro-portal 主应用。'
        : '请检查文档清单接口的响应内容。',
    );
  }
}

async function loadDocs(locale: DocsLocale, { params }: LoaderFunctionArgs) {
  const manifest = await getDocsManifest();
  const slugs = (params['*'] ?? '').split('/').filter(Boolean).join('/');
  const localeManifest = manifest[locale];
  const page = localeManifest.pages[slugs];
  if (!page) throw new Response('Not found', { status: 404 });

  return {
    ...page,
    locale,
    pageTree: localeManifest.pageTree,
  };
}

export const zhDocsLoader = (args: LoaderFunctionArgs) => loadDocs('zh', args);
export const enDocsLoader = (args: LoaderFunctionArgs) => loadDocs('en', args);
export const koDocsLoader = (args: LoaderFunctionArgs) => loadDocs('ko', args);

const clientLoader = browserCollections.docs.createClientLoader({
  component({ toc, frontmatter, default: Mdx }) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody>
          <Mdx components={getMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

export default function DocsRoute() {
  const loaderData = useLoaderData<typeof zhDocsLoader>();
  const { pageTree } = useFumadocsLoader(loaderData);
  useDocsTitle(loaderData.title ?? localeText[loaderData.locale].document);

  return (
    <HomeLayout key={loaderData.locale} {...baseOptions(loaderData.locale)}>
      <DocsLayout
        key={loaderData.locale}
        nav={{ enabled: false }}
        searchToggle={{ enabled: false }}
        tree={pageTree}
      >
        {clientLoader.useContent(loaderData.path)}
      </DocsLayout>
    </HomeLayout>
  );
}

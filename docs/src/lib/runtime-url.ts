import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

export function getDocsBaseUrl() {
  const injectedBase = qiankunWindow.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;

  if (typeof injectedBase === 'string' && injectedBase.length > 0) {
    return new URL(injectedBase);
  }

  return new URL(import.meta.env.BASE_URL, window.location.origin);
}

export function getDocsUrl(path: string) {
  return new URL(path.replace(/^\/+/, ''), getDocsBaseUrl());
}

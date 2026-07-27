declare module 'virtual:docs-manifest' {
  import type { SerializedPageTree } from 'fumadocs-core/source/client';

  type LocaleManifest = {
    pages: Record<string, {
      path: string;
      title: string;
    }>;
    pageTree: SerializedPageTree;
  };

  const manifest: Record<'zh' | 'en' | 'ko', LocaleManifest>;

  export default manifest;
}

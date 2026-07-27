import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import {
  qiankunWindow,
  renderWithQiankun,
  type QiankunProps,
} from 'vite-plugin-qiankun/dist/helper';
import { DocsTitleProvider } from './components/title-provider';
import { createDocsRouter } from './router';
import './app.css';

interface DocsMicroAppProps extends QiankunProps {
  initialPath?: string;
  onPathChange?: (path: string) => void;
  onTitleChange?: (title: string) => void;
}

let root: Root | undefined;
let router: ReturnType<typeof createDocsRouter> | undefined;
let unsubscribe: (() => void) | undefined;

function render(props: DocsMicroAppProps = {}) {
  const container = props.container?.querySelector('#root')
    ?? document.querySelector('#root');
  if (!container) throw new Error('找不到文档应用挂载节点 #root');

  const embedded = Boolean(qiankunWindow.__POWERED_BY_QIANKUN__);
  router = createDocsRouter(embedded, props.initialPath);

  if (props.onPathChange) {
    let currentPath = router.state.location.pathname;
    if (props.initialPath && props.initialPath !== currentPath) {
      props.onPathChange(currentPath);
    }
    unsubscribe = router.subscribe((state) => {
      if (state.location.pathname === currentPath) return;
      currentPath = state.location.pathname;
      props.onPathChange?.(currentPath);
    });
  }

  root = createRoot(container);
  root.render(
    <StrictMode>
      <DocsTitleProvider
        embedded={embedded}
        onTitleChange={props.onTitleChange}
      >
        <RouterProvider router={router} />
      </DocsTitleProvider>
    </StrictMode>,
  );
}

renderWithQiankun({
  bootstrap() {},
  mount: render,
  unmount() {
    root?.unmount();
    unsubscribe?.();
    router?.dispose();
    root = undefined;
    unsubscribe = undefined;
    router = undefined;
  },
  update() {},
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  void render();
}

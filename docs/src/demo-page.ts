import '../../demo/styles.css';
import demoHtml from '../../demo/index.html?raw';

const main = demoHtml.match(/<main>([\s\S]*?)<\/main>/)?.[1];

if (!main) {
  throw new Error('无法读取 Demo 页面内容');
}

document.body.innerHTML = `<main>${main}</main>`;
await import('../../demo/main');

function reportHeight() {
  const parentOrigin = document.referrer
    ? new URL(document.referrer).origin
    : window.location.origin;

  window.parent.postMessage(
    {
      type: 'qn-chrome-tabs-demo-height',
      height: document.documentElement.scrollHeight,
    },
    parentOrigin,
  );
}

new ResizeObserver(reportHeight).observe(document.body);
reportHeight();

import {
  isRouteErrorResponse,
  Link,
  useRevalidator,
  useRouteError,
} from 'react-router';
import { useDocsTitle } from '@/components/title-provider';
import { DocsRequestError } from '@/lib/docs-request-error';

function getErrorInfo(error: unknown) {
  if (error instanceof DocsRequestError) {
    return {
      title: '文档暂时无法加载',
      message: error.message,
      hint: error.hint ?? '请确认文档子应用服务可访问，然后重试。',
      detail: [
        error.status ? `HTTP 状态：${error.status}` : undefined,
        `请求地址：${error.url}`,
      ].filter(Boolean).join('\n'),
      retryable: true,
    };
  }

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return {
        title: '文档页面不存在',
        message: '没有找到当前地址对应的文档。',
        hint: '请检查地址，或返回文档首页继续浏览。',
        detail: `HTTP 状态：${error.status}`,
        retryable: false,
      };
    }

    return {
      title: '文档加载失败',
      message: typeof error.data === 'string' ? error.data : error.statusText,
      hint: '请稍后重试；如果问题持续存在，请检查子应用服务。',
      detail: `HTTP 状态：${error.status}`,
      retryable: true,
    };
  }

  return {
    title: '文档运行异常',
    message: error instanceof Error ? error.message : '发生了未知错误。',
    hint: '请刷新后重试；如果问题持续存在，请查看浏览器控制台。',
    detail: error instanceof Error ? `${error.name}: ${error.message}` : '',
    retryable: true,
  };
}

export default function RouteError() {
  const error = useRouteError();
  const revalidator = useRevalidator();
  const info = getErrorInfo(error);
  useDocsTitle(info.title);

  return (
    <main className="docs-error-page">
      <section className="docs-error-card" aria-live="polite">
        <div className="docs-error-icon" aria-hidden="true">!</div>
        <p className="docs-error-eyebrow">Qn Chrome Tabs 文档</p>
        <h1>{info.title}</h1>
        <p className="docs-error-message">{info.message}</p>
        <div className="docs-error-hint">
          <strong>处理建议</strong>
          <span>{info.hint}</span>
        </div>
        {info.detail && (
          <details className="docs-error-detail">
            <summary>查看错误详情</summary>
            <pre>{info.detail}</pre>
          </details>
        )}
        <div className="docs-error-actions">
          {info.retryable && (
            <button
              type="button"
              onClick={() => revalidator.revalidate()}
              disabled={revalidator.state !== 'idle'}
            >
              {revalidator.state === 'idle' ? '重新加载' : '正在重试…'}
            </button>
          )}
          <Link to="/">返回文档首页</Link>
        </div>
      </section>
    </main>
  );
}

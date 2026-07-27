import { Link } from 'react-router';
import { useDocsTitle } from '@/components/title-provider';

export default function NotFound() {
  useDocsTitle('页面不存在');

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8">
      <h1 className="text-xl font-bold">页面不存在</h1>
      <Link to="/" className="text-fd-primary underline">
        返回首页
      </Link>
    </main>
  );
}

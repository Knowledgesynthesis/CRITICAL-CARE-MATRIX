import { Link } from 'react-router-dom';
import { Page } from '@/components/ui';

export default function NotFound() {
  return (
    <Page>
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
        <Link to="/" className="mt-6 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Back home
        </Link>
      </div>
    </Page>
  );
}

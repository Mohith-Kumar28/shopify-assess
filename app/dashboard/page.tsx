import { Suspense } from 'react';
import DashboardClient from './components/client';

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="loading-state">
        <p>Loading dashboard...</p>
      </div>
    }>
      <DashboardClient />
    </Suspense>
  );
} 
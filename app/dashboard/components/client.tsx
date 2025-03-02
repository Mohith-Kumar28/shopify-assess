'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Dashboard from '../../components/Dashboard';
import { SurveyService } from '../../services/survey.service';

interface SurveyStats {
  totalSurveys: number;
  totalResponses: number;
  satisfactionDistribution: Record<string, number>;
  foundItemsDistribution: Record<string, number>;
  recentResponses: Array<{
    id: string;
    satisfaction: string;
    foundItems: string;
    improvements: string;
    createdAt: string;
  }>;
  improvementThemes: Record<string, number>;
}

export default function DashboardClient() {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const shop = searchParams.get('shop');

  useEffect(() => {
    if (!shop) {
      router.push('/');
      return;
    }

    async function loadStats() {
      try {
        const data = await SurveyService.getSurveyStats(shop as string);
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, [shop, router]);

  if (!shop) {
    return null;
  }

  return <Dashboard stats={stats!} isLoading={isLoading} />;
} 
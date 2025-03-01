'use client';

import { useEffect, useState } from 'react';
import Dashboard from '../components/Dashboard';
import { SurveyService } from '../services/survey.service';

interface SurveyStats {
  totalSurveys: number;
  totalResponses: number;
  recentResponses: Array<{
    id: string;
    question: string;
    answer: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const shop = new URLSearchParams(window.location.search).get('shop');

  useEffect(() => {
    async function loadStats() {
      if (!shop) return;

      try {
        const data = await SurveyService.getSurveyStats(shop);
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, [shop]);

  if (!shop) {
    window.location.href = '/';
    return null;
  }

  return <Dashboard stats={stats!} isLoading={isLoading} />;
} 
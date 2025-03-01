'use client';

import { useEffect, useState } from 'react';
import Dashboard from '../components/Dashboard';
import { SurveyService } from '../services/survey.service';

interface PageProps {
  searchParams: {
    shop?: string;
  };
}

interface SurveyStats {
  totalSurveys: number;
  questionStats: Record<string, {
    question: string;
    answers: Record<string, number>;
    total: number;
  }>;
}

export default function DashboardPage({ searchParams }: PageProps) {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { shop } = searchParams;

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
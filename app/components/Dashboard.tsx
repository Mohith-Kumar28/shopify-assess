import React from 'react';
import {
  Page,
  Layout,
  Card,
  DataTable,
  Button,
  ButtonGroup,
  Text,
  SkeletonBodyText,
  Box,
} from '@shopify/polaris';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  stats: {
    totalSurveys: number;
    questionStats: Record<string, {
      question: string;
      answers: Record<string, number>;
      total: number;
    }>;
  };
  isLoading?: boolean;
}

export default function Dashboard({ stats, isLoading }: DashboardProps) {
  if (isLoading) {
    return (
      <Page title="Survey Dashboard">
        <Layout>
          <Layout.Section>
            <Card>
              <SkeletonBodyText lines={10} />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const getChartData = (questionId: string) => {
    const questionData = stats.questionStats[questionId];
    const labels = Object.keys(questionData.answers);
    const data = labels.map(label => questionData.answers[label]);

    return {
      labels,
      datasets: [
        {
          label: questionData.question,
          data,
          backgroundColor: 'rgba(0, 128, 96, 0.5)',
          borderColor: 'rgb(0, 128, 96)',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const getResponseTable = (questionId: string) => {
    const questionData = stats.questionStats[questionId];
    const rows = Object.entries(questionData.answers).map(([answer, count]) => [
      answer,
      count,
      `${((count / questionData.total) * 100).toFixed(1)}%`,
    ]);

    return (
      <DataTable
        columnContentTypes={['text', 'numeric', 'numeric']}
        headings={['Response', 'Count', 'Percentage']}
        rows={rows}
      />
    );
  };

  return (
    <Page title="Survey Dashboard">
      <Layout>
        <Layout.Section>
          <Card>
            <Box padding="400">
              <Text variant="headingLg" as="h3">
                Total Surveys: {stats.totalSurveys}
              </Text>
            </Box>
          </Card>
        </Layout.Section>

        {Object.keys(stats.questionStats).map((questionId) => (
          <Layout.Section key={questionId}>
            <Card>
              <Box padding="400">
                <Text variant="headingMd" as="h3">
                  {stats.questionStats[questionId].question}
                </Text>
                <Box paddingBlock="400">
                  <div style={{ height: '300px' }}>
                    <Bar data={getChartData(questionId)} options={chartOptions} />
                  </div>
                </Box>
                <Box paddingBlockStart="400">
                  {getResponseTable(questionId)}
                </Box>
              </Box>
            </Card>
          </Layout.Section>
        ))}

        <Layout.Section>
          <Card>
            <Box padding="400">
              <ButtonGroup>
                <Button variant="primary">Export Data</Button>
                <Button>Print Report</Button>
              </ButtonGroup>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 
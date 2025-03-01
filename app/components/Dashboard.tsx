'use client';

import { Page, Layout, Card, Text, SkeletonBodyText } from '@shopify/polaris';

interface DashboardProps {
  stats: {
    totalSurveys: number;
    totalResponses: number;
    recentResponses: Array<{
      id: string;
      question: string;
      answer: string;
      createdAt: string;
    }>;
  } | null;
  isLoading: boolean;
}

export default function Dashboard({ stats, isLoading }: DashboardProps) {
  if (isLoading) {
    return (
      <Page title="Dashboard">
        <Layout>
          <Layout.Section>
            <Card>
              <SkeletonBodyText lines={5} />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (!stats) {
    return (
      <Page title="Dashboard">
        <Layout>
          <Layout.Section>
            <Card>
              <Text as="p">No survey data available.</Text>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page title="Survey Dashboard">
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: '20px' }}>
              <Text variant="headingMd" as="h2">
                Survey Statistics
              </Text>
              <div style={{ marginTop: '1rem' }}>
                <Text as="p">Total Surveys: {stats.totalSurveys}</Text>
                <Text as="p">Total Responses: {stats.totalResponses}</Text>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '20px' }}>
              <Text variant="headingMd" as="h2">
                Recent Responses
              </Text>
              <div style={{ marginTop: '1rem' }}>
                {stats.recentResponses.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {stats.recentResponses.map((response) => (
                      <li key={response.id} style={{ marginBottom: '1rem' }}>
                        <Text as="p" fontWeight="bold">
                          {response.question}
                        </Text>
                        <Text as="p">Answer: {response.answer}</Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {new Date(response.createdAt).toLocaleDateString()}
                        </Text>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Text as="p">No recent responses.</Text>
                )}
              </div>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 
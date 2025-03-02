'use client';

import { 
  Page, 
  Layout, 
  Card, 
  Text, 
  SkeletonBodyText,
  DataTable,
  Badge,
  Select,
  EmptySearchResult,
  BlockStack,
  ProgressBar,
  Icon
} from '@shopify/polaris';
import { StarIcon } from '@shopify/polaris-icons';
import { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SurveyResponse {
  id: string;
  satisfaction: string;
  foundItems: string;
  improvements: string;
  createdAt: string;
}

interface DashboardProps {
  stats: {
    totalSurveys: number;
    totalResponses: number;
    satisfactionDistribution: Record<string, number>;
    foundItemsDistribution: Record<string, number>;
    recentResponses: Array<SurveyResponse>;
    improvementThemes: Record<string, number>;
  } | null;
  isLoading: boolean;
}

const SatisfactionRating = ({ score }: { score: number }) => {
  const maxStars = 5;
  const fullStars = Math.floor(score);
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {[...Array(maxStars)].map((_, index) => (
        <Icon
          key={index}
          source={StarIcon}
          tone={index < fullStars ? "success" : "subdued"}
        />
      ))}
      <Text as="span" tone="subdued">({score.toFixed(1)})</Text>
    </div>
  );
};

// Update the visualization helper
const getFoundItemsStats = (foundItemsDistribution: Record<string, number>) => {
  const found = foundItemsDistribution['Yes'] || 0;
  const notFound = foundItemsDistribution['No'] || 0;
  return [
    { name: 'Found the item they were looking for', value: found, color: '#0E9F6E' },
    { name: 'Could not find the item', value: notFound, color: '#F05252' }
  ];
};

export default function Dashboard({ stats, isLoading }: DashboardProps) {
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');

  const handleDateFilterChange = useCallback((value: string) => {
    setSelectedDateFilter(value);
  }, []);

  const calculateSatisfactionScore = useCallback(() => {
    if (!stats?.satisfactionDistribution) return 0;

    const satisfactionValues: { [key: string]: number } = {
      'Very Satisfied': 5,
      'Satisfied': 4,
      'Neutral': 3,
      'Dissatisfied': 2,
      'Very Dissatisfied': 1
    };

    let total = 0;
    let count = 0;

    Object.entries(stats.satisfactionDistribution).forEach(([rating, number]) => {
      total += (satisfactionValues[rating] || 0) * number;
      count += number;
    });

    return count > 0 ? total / count : 0;
  }, [stats?.satisfactionDistribution]);

  const getFoundItemsRate = useCallback(() => {
    if (!stats?.foundItemsDistribution) return 0;
    const total = Object.values(stats.foundItemsDistribution).reduce((a, b) => a + b, 0);
    return total > 0 ? (stats.foundItemsDistribution['Yes'] || 0) / total : 0;
  }, [stats?.foundItemsDistribution]);

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

  const satisfactionScore = calculateSatisfactionScore();
  const foundItemsRate = getFoundItemsRate();

  return (
    <Page title="Customer Satisfaction Dashboard">
      <Layout>
        {/* Key Metrics */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Key Performance Metrics</Text>
              <BlockStack gap="400">
                <div>
                  <Text variant="headingSm" as="h3">Overall Satisfaction</Text>
                  <BlockStack gap="200">
                    <SatisfactionRating score={satisfactionScore} />
                    <ProgressBar progress={Math.round(satisfactionScore * 20)} size="small" tone="success" />
                  </BlockStack>
                </div>
                
                <div>
                  <Text variant="headingSm" as="h3">Required Items Findability</Text>
                  <BlockStack gap="200">
                    <Text as="p">{(foundItemsRate * 100).toFixed(1)}% success rate</Text>
                    <ProgressBar progress={Math.round(foundItemsRate * 100)} size="small" tone="success" />
                  </BlockStack>
                </div>

                <div>
                  <Text variant="headingSm" as="h3">Customer Item Search Success</Text>
                  <div style={{ width: '100%', height: '200px' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={getFoundItemsStats(stats.foundItemsDistribution)}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {getFoundItemsStats(stats.foundItemsDistribution).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3">Response Volume</Text>
                  <Text as="p">
                    Total Responses: <Badge tone="success">{stats.totalSurveys.toString()}</Badge>
                  </Text>
                </BlockStack>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

          {/* Recent Feedback */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="headingMd" as="h2">Recent Customer Feedback</Text>
                <Select
                  label="Time period"
                  labelInline
                  options={[
                    {label: 'All time', value: 'all'},
                    {label: 'Today', value: 'today'},
                    {label: 'Last 7 days', value: 'week'},
                    {label: 'Last 30 days', value: 'month'}
                  ]}
                  value={selectedDateFilter}
                  onChange={handleDateFilterChange}
                />
              </div>
              {stats.recentResponses.length > 0 ? (
                <DataTable
                  columnContentTypes={['text', 'text', 'text']}
                  headings={['Satisfaction', 'Found Item?', 'Feedback']}
                  rows={stats.recentResponses.map((response) => [
                    <div key={`${response.id}-satisfaction`}>
                      <Text as="span" tone={
                        response.satisfaction.includes('Very Satisfied') || response.satisfaction.includes('Satisfied') || response.satisfaction.includes('Neutral')
                          ? 'success'
                          : 'critical'
                      }>
                        {response.satisfaction}
                      </Text>
                    </div>,
                    <Badge key={`${response.id}-found`} tone={response.foundItems === 'Yes' ? 'success' : 'critical'}>
                      {response.foundItems}
                    </Badge>,
                    response.improvements || '-'
                  ])}
                />
              ) : (
                <EmptySearchResult
                  title="No responses found"
                  description="Try changing the time period filter"
                />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Satisfaction Breakdown */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Satisfaction Breakdown</Text>
              <BlockStack gap="400">
                {Object.entries(stats.satisfactionDistribution)
                  .sort(([a], [b]) => {
                    const order = ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'];
                    return order.indexOf(a) - order.indexOf(b);
                  })
                  .map(([rating, count]) => {
                    const percentage = (count / stats.totalSurveys) * 100;
                    return (
                      <BlockStack key={rating} gap="200">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text as="span">{rating}</Text>
                          <Text as="span">{count} ({percentage.toFixed(1)}%)</Text>
                        </div>
                        <ProgressBar 
                          progress={Math.round(percentage)} 
                          size="small"
                          tone={
                            rating.includes('Very Satisfied') || rating.includes('Satisfied') || rating.includes('Neutral')
                              ? 'success'
                              : 'critical'
                          }
                        />
                      </BlockStack>
                    );
                })}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

      
      </Layout>
    </Page>
  );
} 
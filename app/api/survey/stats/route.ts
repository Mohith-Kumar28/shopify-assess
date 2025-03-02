import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shop = searchParams.get('shop');

    if (!shop) {
      return new Response('Missing shop parameter', { status: 400 });
    }

    // Get shop data
    const shopData = await prisma.shop.findUnique({
      where: { domain: shop },
    });

    if (!shopData) {
      return new Response('Shop not found', { status: 404 });
    }

    // Get total surveys
    const totalSurveys = await prisma.survey.count({
      where: {
        shop: {
          domain: shop,
        },
      },
    });

    // Get total responses
    const totalResponses = await prisma.response.count({
      where: {
        survey: {
          shop: {
            domain: shop,
          },
        },
      },
    });

    // Get satisfaction distribution
    const surveys = await prisma.survey.findMany({
      where: {
        shop: {
          domain: shop,
        },
      },
      select: {
        satisfaction: true,
        foundItems: true,
      },
    });

    // Calculate satisfaction stats
    const satisfactionCounts = surveys.reduce((acc, survey) => {
      acc[survey.satisfaction] = (acc[survey.satisfaction] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate found items stats
    const foundItemsStats = surveys.reduce((acc, survey) => {
      acc[survey.foundItems] = (acc[survey.foundItems] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get recent responses with full survey data
    const recentResponses = await prisma.survey.findMany({
      where: {
        shop: {
          domain: shop,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        satisfaction: true,
        foundItems: true,
        improvements: true,
        createdAt: true,
      },
    });

    // Calculate improvement themes (if any)
    const improvementThemes = recentResponses
      .filter(s => s.improvements)
      .map(s => s.improvements)
      .reduce((acc, improvement) => {
        // Simple word frequency analysis
        const words = improvement.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 3) { // Only count words longer than 3 characters
            acc[word] = (acc[word] || 0) + 1;
          }
        });
        return acc;
      }, {} as Record<string, number>);

    // Get top 5 improvement themes
    const topImprovementThemes = Object.entries(improvementThemes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .reduce((acc, [word, count]) => {
        acc[word] = count;
        return acc;
      }, {} as Record<string, number>);

    return Response.json({
      totalSurveys,
      totalResponses,
      satisfactionDistribution: satisfactionCounts,
      foundItemsDistribution: foundItemsStats,
      recentResponses: recentResponses.map(response => ({
        ...response,
        createdAt: response.createdAt.toISOString(),
      })),
      improvementThemes: topImprovementThemes,
    });
  } catch (error) {
    console.error('Failed to fetch survey stats:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 
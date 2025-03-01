import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shop = searchParams.get('shop');

    if (!shop) {
      return new Response('Missing shop parameter', { status: 400 });
    }

    const totalSurveys = await prisma.survey.count({
      where: {
        shop: {
          domain: shop,
        },
      },
    });

    const totalResponses = await prisma.response.count({
      where: {
        survey: {
          shop: {
            domain: shop,
          },
        },
      },
    });

    const recentResponses = await prisma.response.findMany({
      where: {
        survey: {
          shop: {
            domain: shop,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        survey: true,
      },
    });

    return Response.json({
      totalSurveys,
      totalResponses,
      recentResponses,
    });
  } catch (error) {
    console.error('Failed to fetch survey stats:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 
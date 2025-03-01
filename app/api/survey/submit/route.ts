import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shopId, responses } = body;

    if (!shopId || !responses || !Array.isArray(responses)) {
      return new Response('Invalid request body', { status: 400 });
    }

    const shop = await prisma.shop.findUnique({
      where: { shopId },
    });

    if (!shop) {
      return new Response('Shop not found', { status: 404 });
    }

    const survey = await prisma.survey.create({
      data: {
        shop: {
          connect: {
            id: shop.id,
          },
        },
        responses: {
          create: responses.map(response => ({
            questionId: response.questionId,
            question: response.question,
            answer: response.answer,
          })),
        },
      },
      include: {
        responses: true,
      },
    });

    return Response.json(survey);
  } catch (error) {
    console.error('Survey submission error:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 
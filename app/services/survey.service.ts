import { prisma } from '../lib/prisma';

export interface CreateSurveyInput {
  shopId: string;
  customerId?: string;
  responses: {
    questionId: string;
    question: string;
    answer: string;
  }[];
}



export class SurveyService {
  static async createSurvey(data: { shopId: string; responses: CreateSurveyInput['responses'] }) {
    const response = await fetch('/api/survey/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to submit survey');
    }

    return response.json();
  }

  static async getSurveysByShop(shopId: string) {
    const surveys = await prisma.survey.findMany({
      where: {
        shop: {
          shopId,
        },
      },
      include: {
        responses: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return surveys;
  }

  static async getSurveyStats(shop: string) {
    const response = await fetch(`/api/survey/stats?shop=${encodeURIComponent(shop)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch survey stats');
    }

    return response.json();
  }
} 
import { prisma } from '../lib/prisma';
import { Response } from '@prisma/client';

export interface CreateSurveyInput {
  shopId: string;
  customerId?: string;
  responses: {
    questionId: string;
    question: string;
    answer: string;
  }[];
}

interface QuestionStat {
  question: string;
  answers: Record<string, number>;
  total: number;
}

export class SurveyService {
  static async createSurvey(data: CreateSurveyInput) {
    const survey = await prisma.survey.create({
      data: {
        shop: {
          connect: {
            shopId: data.shopId,
          },
        },
        customerId: data.customerId,
        responses: {
          create: data.responses,
        },
      },
      include: {
        responses: true,
      },
    });
    return survey;
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

  static async getSurveyStats(shopId: string) {
    const totalSurveys = await prisma.survey.count({
      where: {
        shop: {
          shopId,
        },
      },
    });

    const responses = await prisma.response.findMany({
      where: {
        survey: {
          shop: {
            shopId,
          },
        },
      },
      select: {
        questionId: true,
        question: true,
        answer: true,
      },
    });

    // Group responses by question
    const questionStats = responses.reduce((acc: Record<string, QuestionStat>, curr: Pick<Response, 'questionId' | 'question' | 'answer'>) => {
      if (!acc[curr.questionId]) {
        acc[curr.questionId] = {
          question: curr.question,
          answers: {},
          total: 0,
        };
      }
      
      if (!acc[curr.questionId].answers[curr.answer]) {
        acc[curr.questionId].answers[curr.answer] = 0;
      }
      
      acc[curr.questionId].answers[curr.answer]++;
      acc[curr.questionId].total++;
      
      return acc;
    }, {});

    return {
      totalSurveys,
      questionStats,
    };
  }
} 
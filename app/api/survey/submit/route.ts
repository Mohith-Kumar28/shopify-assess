import { NextRequest } from 'next/server';
import { SurveyService } from '../../../services/survey.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shopId, responses } = body;

    if (!shopId || !responses || !Array.isArray(responses)) {
      return new Response('Invalid request body', { status: 400 });
    }

    const survey = await SurveyService.createSurvey({
      shopId,
      responses,
    });

    return Response.json(survey);
  } catch (error) {
    console.error('Survey submission error:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 
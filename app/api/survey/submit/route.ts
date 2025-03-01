import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    console.log('Received survey submission');
    const data = await request.json();
    console.log('Survey data:', data);
    const { satisfaction, foundItems, improvements, shop } = data;

    if (!satisfaction || !foundItems || !shop) {
      console.error('Missing required fields:', { satisfaction, foundItems, shop });
      return new Response('Missing required fields', { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      });
    }

    // Get the shop from the database
    console.log('Looking up shop:', shop);
    const shopData = await prisma.shop.findUnique({
      where: { domain: shop }
    });
    console.log('Shop data found:', shopData);

    if (!shopData) {
      console.error('Shop not found:', shop);
      return new Response('Shop not found', { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      });
    }

    // Create the survey response
    console.log('Creating survey response');
    const survey = await prisma.survey.create({
      data: {
        shopId: shopData.id,
        satisfaction,
        foundItems,
        improvements: improvements || '',
        createdAt: new Date()
      }
    });
    console.log('Survey created:', survey);

    return new Response(JSON.stringify({ success: true, surveyId: survey.id }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  } catch (error: Error | unknown) {
    console.error('Failed to submit survey:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: errorMessage
    }), { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 
import { NextRequest } from 'next/server';
import { generateCartScript } from '../../../lib/cartScript';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shop = searchParams.get('shop');

    if (!shop) {
      return new Response('Missing shop parameter', { status: 400 });
    }

    const shopData = await prisma.shop.findUnique({
      where: { domain: shop },
    });

    if (!shopData) {
      return new Response('Shop not found', { status: 404 });
    }

    const script = generateCartScript(shopData.id);
    
    return new Response(script, {
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  } catch (error) {
    console.error('Failed to generate script:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 
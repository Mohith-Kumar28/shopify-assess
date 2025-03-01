import { NextRequest } from 'next/server';
import { generateAuthUrl, generateNonce, isValidShopDomain } from '../../lib/shopify';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shop = searchParams.get('shop');

  console.log('Auth request received for shop:', shop);

  if (!shop) {
    console.error('Missing shop parameter');
    return new Response('Missing shop parameter', { status: 400 });
  }

  if (!isValidShopDomain(shop)) {
    console.error('Invalid shop domain:', shop);
    return new Response('Invalid shop domain', { status: 400 });
  }

  try {
    // Generate a nonce for CSRF protection
    const state = generateNonce();

    // Generate the authorization URL
    const authUrl = generateAuthUrl(shop, state);
    
    console.log('Redirecting to Shopify OAuth:', authUrl);

    // Redirect to Shopify OAuth
    return Response.redirect(authUrl);
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
} 
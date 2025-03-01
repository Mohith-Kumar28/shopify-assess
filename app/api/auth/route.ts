import { NextRequest } from 'next/server';
import { generateAuthUrl, generateNonce } from '../../lib/shopify';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shop = searchParams.get('shop');

  if (!shop) {
    return new Response('Missing shop parameter', { status: 400 });
  }

  try {
    // Generate a nonce for CSRF protection
    const state = generateNonce();

    // Generate the authorization URL
    const authUrl = generateAuthUrl(shop, state);

    // Redirect to Shopify OAuth
    return Response.redirect(authUrl);
  } catch (error) {
    console.error('Auth error:', error);
    return new Response('Authentication error', { status: 500 });
  }
} 
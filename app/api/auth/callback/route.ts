import { NextRequest } from 'next/server';
import { verifyHmac, getAccessToken, createOrUpdateShop } from '../../../lib/shopify';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = Object.fromEntries(searchParams.entries());

  // Verify the request is authentic
  if (!verifyHmac(query)) {
    return new Response('Invalid hmac', { status: 400 });
  }

  try {
    const { shop, code } = query;
    const accessToken = await getAccessToken(shop, code);
    await createOrUpdateShop(shop, accessToken);

    // Redirect to app with shop parameter
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('shop', shop);
    
    return Response.redirect(redirectUrl.toString(), 302);
  } catch (error) {
    console.error('OAuth error:', error);
    return new Response('OAuth error', { status: 500 });
  }
} 
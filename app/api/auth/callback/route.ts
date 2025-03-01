import { NextRequest } from 'next/server';
import { verifyHmac, getAccessToken, createOrUpdateShop } from '../../../lib/shopify';

async function createScriptTag(shop: string, accessToken: string) {
  console.log('Creating script tag for shop:', shop);
  console.log('Script URL:', `${process.env.HOST}/api/survey/script?shop=${shop}`);
  
  try {
    const response = await fetch(`https://${shop}/admin/api/2024-01/script_tags.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        script_tag: {
          event: 'onload',
          src: `${process.env.HOST}/api/survey/script?shop=${shop}`,
          display_scope: 'online_store',
          cache: false
        }
      })
    });

    const responseText = await response.text();
    console.log('Script tag creation response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    });

    if (!response.ok) {
      throw new Error(`Failed to create script tag: ${responseText}`);
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Script tag creation error:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = Object.fromEntries(searchParams.entries());
  console.log('Received callback with params:', query);

  // Verify the request is authentic
  if (!verifyHmac(query)) {
    console.error('HMAC verification failed');
    return new Response('Invalid hmac', { status: 400 });
  }

  try {
    const { shop, code } = query;
    
    if (!shop || !code) {
      console.error('Missing required parameters:', { shop, code });
      return new Response('Missing required parameters', { status: 400 });
    }

    console.log('Getting access token for shop:', shop);
    const accessToken = await getAccessToken(shop, code);
    
    console.log('Creating/updating shop in database');
    await createOrUpdateShop(shop, accessToken);

    // Create script tag
    console.log('Creating script tag');
    await createScriptTag(shop, accessToken);

    // Redirect to app with shop parameter using HOST environment variable
    const host = process.env.HOST || process.env.SHOPIFY_APP_URL;
    if (!host) {
      throw new Error('HOST or SHOPIFY_APP_URL environment variable is not set');
    }
    
    const redirectUrl = new URL('/dashboard', host);
    redirectUrl.searchParams.set('shop', shop);
    
    console.log('Redirecting to:', redirectUrl.toString());
    return Response.redirect(redirectUrl.toString(), 302);
  } catch (error) {
    console.error('OAuth error:', error);
    // Return more detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(`OAuth error: ${errorMessage}`, { status: 500 });
  }
} 
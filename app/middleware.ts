import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from './lib/prisma';
import { generateAuthUrl, generateNonce } from './lib/shopify';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const shop = searchParams.get('shop');

  // Skip auth for API routes and auth callback
  if (pathname.startsWith('/api/') || !shop) {
    return NextResponse.next();
  }

  // Check if shop exists and has valid access token
  const shopData = await prisma.shop.findFirst({
    where: {
      domain: shop,
    },
  });

  if (!shopData?.accessToken) {
    const state = generateNonce();
    const authUrl = generateAuthUrl(shop, state);
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 
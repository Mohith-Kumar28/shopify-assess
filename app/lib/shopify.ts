import { prisma } from './prisma';
import crypto from 'crypto';

export interface ShopifyAuthQuery {
  shop: string;
  hmac: string;
  code: string;
  state: string;
  timestamp: string;
}

export const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES || '';

export function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

export function isValidShopDomain(shop: string): boolean {
  // Allow both custom domains and development store domains
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
  return shopRegex.test(shop);
}

export function verifyHmac(query: Record<string, string | string[]>) {
  try {
    const hmac = query.hmac as string;
    const params = { ...query };
    delete params.hmac;

    const message = Object.keys(params)
      .sort()
      .map(key => `${key}=${Array.isArray(params[key]) ? params[key][0] : params[key]}`)
      .join('&');

    const generatedHash = crypto
      .createHmac('sha256', process.env.SHOPIFY_API_SECRET!)
      .update(message)
      .digest('hex');

    return hmac === generatedHash;
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

export function generateAuthUrl(shop: string, state: string) {
  if (!isValidShopDomain(shop)) {
    throw new Error('Invalid shop domain');
  }

  const query = new URLSearchParams({
    client_id: process.env.SHOPIFY_API_KEY!,
    scope: SHOPIFY_SCOPES,
    redirect_uri: process.env.SHOPIFY_AUTH_CALLBACK_URL!,
    state,
    shop,
  });

  return `https://${shop}/admin/oauth/authorize?${query.toString()}`;
}

export async function getAccessToken(shop: string, code: string) {
  if (!isValidShopDomain(shop)) {
    throw new Error('Invalid shop domain');
  }

  console.log('Requesting access token for shop:', shop);
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Access token request failed:', {
      status: response.status,
      statusText: response.statusText,
      responseText: text,
    });
    throw new Error(`Failed to get access token: ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function createOrUpdateShop(shopDomain: string, accessToken: string) {
  if (!isValidShopDomain(shopDomain)) {
    throw new Error('Invalid shop domain');
  }

  console.log('Fetching shop data for:', shopDomain);
  const shopResponse = await fetch(`https://${shopDomain}/admin/api/2024-01/shop.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  });

  if (!shopResponse.ok) {
    const text = await shopResponse.text();
    console.error('Shop data request failed:', {
      status: shopResponse.status,
      statusText: shopResponse.statusText,
      responseText: text,
    });
    throw new Error(`Failed to get shop data: ${text}`);
  }

  const { shop } = await shopResponse.json();

  console.log('Upserting shop in database:', {
    shopId: shop.id.toString(),
    domain: shopDomain,
    name: shop.name,
  });

  return prisma.shop.upsert({
    where: {
      shopId: shop.id.toString(),
    },
    create: {
      shopId: shop.id.toString(),
      domain: shopDomain,
      name: shop.name,
      accessToken,
    },
    update: {
      name: shop.name,
      accessToken,
    },
  });
} 
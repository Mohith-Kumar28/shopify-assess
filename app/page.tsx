'use client';

import { useState } from 'react';
import { Page, Layout, Card, FormLayout, TextField, Button, Text, Banner } from '@shopify/polaris';

export default function Home() {
  const [shopDomain, setShopDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let domain = shopDomain.trim().toLowerCase();
      // Remove https:// or http:// if present
      domain = domain.replace(/^https?:\/\//, '');
      // Remove trailing slash if present
      domain = domain.replace(/\/$/, '');
      // Add .myshopify.com if not present
      if (!domain.includes('.myshopify.com')) {
        domain = `${domain}.myshopify.com`;
      }

      // Redirect to Shopify auth
      window.location.href = `/api/auth?shop=${domain}`;
    } catch {
      setError('Invalid shop domain');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: '20px' }}>
              <Text variant="headingLg" as="h1">
                Welcome to Survey App
              </Text>
              <div style={{ marginTop: '1rem' }}>
                <Text variant="bodyMd" as="p">
                  To get started, enter your Shopify store domain below.
                </Text>
              </div>

              {error && (
                <div style={{ marginTop: '1rem' }}>
                  <Banner tone="critical">{error}</Banner>
                </div>
              )}

              <div style={{ marginTop: '2rem' }}>
                <form onSubmit={handleSubmit}>
                  <FormLayout>
                    <TextField
                      label="Store Domain"
                      type="text"
                      value={shopDomain}
                      onChange={setShopDomain}
                      placeholder="your-store.myshopify.com"
                      autoComplete="off"
                    />
                    <Button variant="primary" submit loading={isLoading}>
                      Connect Store
                    </Button>
                  </FormLayout>
                </form>
              </div>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 
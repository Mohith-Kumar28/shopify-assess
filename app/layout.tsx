import '@shopify/polaris/build/esm/styles.css';
import { Inter } from 'next/font/google';
import { PolarisStyles } from './components/PolarisStyles';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Survey App - Shopify',
  description: 'A survey app for Shopify stores',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <PolarisStyles />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 
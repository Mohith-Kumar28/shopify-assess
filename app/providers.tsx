'use client';

import { PropsWithChildren } from 'react';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <AppProvider
      i18n={enTranslations}
      features={{
        polarisSummerEditions2023: true,
      }}
    >
      {children}
    </AppProvider>
  );
} 
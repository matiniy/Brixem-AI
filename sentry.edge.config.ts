// This file configures the initialization of Sentry for edge runtime.
// The config you add here will be used whenever one of the edge runtime routes is executed.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Custom tags for better filtering
  initialScope: {
    tags: {
      component: 'brixem-ai-edge',
      environment: process.env.NODE_ENV,
    },
  },
});

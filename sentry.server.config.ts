// This file configures the initialization of Sentry on the server side.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Performance monitoring
  beforeSend(event) {
    // Filter out non-critical errors in production
    if (process.env.NODE_ENV === 'production') {
      // Don't send 404s or other expected errors
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.type === 'NotFoundError' || error?.type === 'ValidationError') {
          return null;
        }
      }
    }
    return event;
  },
  
  // Custom tags for better filtering
  initialScope: {
    tags: {
      component: 'brixem-ai-server',
      environment: process.env.NODE_ENV,
    },
  },
});

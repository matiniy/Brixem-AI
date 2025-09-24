"use client";

import "./globals.css";
import { Inter, Albert_Sans } from "next/font/google";
import React, { useState, useEffect } from "react";
import OnboardingModal from "@/components/OnboardingModal";
import { Analytics } from '@vercel/analytics/react';
import { initializePerformanceMonitoring } from "@/lib/performance";
import { analytics } from "@/lib/analytics";
// import * as Sentry from "@sentry/nextjs";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const albert = Albert_Sans({ subsets: ["latin"], variable: "--font-albert" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use Next.js usePathname to determine the current route
  // Remove: const pathname = usePathname();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize performance monitoring
    initializePerformanceMonitoring();
    // Initialize analytics
    analytics.trackPageView('/', 'Brixem AI - Home');
    // Do not auto-show onboarding overlay on page load
  }, []);

  function handleSelectRole(role: string) {
    localStorage.setItem("brixem_role", role);
    setShowOnboarding(false);
  }

  return (
    <html lang="en" className={`${inter.variable} ${albert.variable}`}> 
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#23c6e6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Brixem AI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className="bg-white text-gray-dark font-sans min-h-screen overflow-x-hidden">
        <ErrorBoundary>
          {/* Only render OnboardingModal on client to avoid hydration mismatch */}
          {isClient && (
            <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} onSelectRole={handleSelectRole} />
          )}
          {children}
          <Analytics />
        </ErrorBoundary>
      </body>
    </html>
  );
}

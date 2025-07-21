"use client";

import "./globals.css";
import { Inter, Albert_Sans } from "next/font/google";
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from "react";
import OnboardingModal from "@/components/OnboardingModal";

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
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem("brixem_role");
      if (!role) setShowOnboarding(true);
    }
  }, []);

  function handleSelectRole(role: string) {
    localStorage.setItem("brixem_role", role);
    setShowOnboarding(false);
  }

  return (
    <html lang="en" className={`${inter.variable} ${albert.variable}`}> 
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#23c6e6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className="bg-sidebar-bg text-gray-dark font-sans min-h-screen overflow-x-hidden">
        {/* Only render OnboardingModal on client to avoid hydration mismatch */}
        {isClient && (
          <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} onSelectRole={handleSelectRole} />
        )}
        {children}
      </body>
    </html>
  );
}

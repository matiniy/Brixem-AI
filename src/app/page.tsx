"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import FeatureSection from "@/components/FeatureSection";
import AnimatedStats from "@/components/AnimatedStats";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import FloatingChat from "@/components/FloatingChat";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emailConfirmationStatus, setEmailConfirmationStatus] = useState<{
    type: 'success' | 'error' | 'loading' | null;
    message: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    // Handle email confirmation from Supabase
    const handleEmailConfirmation = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        console.error('Email confirmation error:', error, errorDescription);
        setEmailConfirmationStatus({
          type: 'error',
          message: `Email confirmation failed: ${errorDescription || error}`
        });
        return;
      }

      if (token_hash && type === 'signup') {
        setEmailConfirmationStatus({ type: 'loading', message: 'Confirming your email...' });
        
        try {
          console.log('Processing email confirmation with token_hash:', token_hash);
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'signup'
          });

          if (error) {
            console.error('Email confirmation error:', error);
            setEmailConfirmationStatus({
              type: 'error',
              message: `Email confirmation failed: ${error.message}`
            });
            return;
          }

          if (data.user) {
            console.log('Email confirmed successfully for user:', data.user.email);
            setEmailConfirmationStatus({
              type: 'success',
              message: 'Email confirmed successfully! Redirecting to dashboard...'
            });
            // Email confirmed successfully, redirect to homeowner dashboard
            setTimeout(() => {
              router.push('/dashboard/homeowner');
            }, 2000);
          }
        } catch (error) {
          console.error('Email confirmation error:', error);
          setEmailConfirmationStatus({
            type: 'error',
            message: 'An unexpected error occurred during email confirmation.'
          });
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Email Confirmation Status */}
      {emailConfirmationStatus.type && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg max-w-md w-full mx-4 ${
          emailConfirmationStatus.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : emailConfirmationStatus.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center space-x-3">
            {emailConfirmationStatus.type === 'loading' && (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {emailConfirmationStatus.type === 'success' && (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {emailConfirmationStatus.type === 'error' && (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <p className="text-sm font-medium">{emailConfirmationStatus.message}</p>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Smarter projects, powered by AI
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7]">
                built for construction
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Brixem gives homeowners and teams instant clarity across renovation and construction projects — from scoping to costing, scheduling, and contractor collaboration.
            </p>
            
            {/* Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { text: "I'm a homeowner planning a renovation", icon: "🏠" },
                { text: "I'm a contractor looking for projects", icon: "🔨" },
                { text: "I need help with project estimation", icon: "📊" },
                { text: "I want to learn about Brixem's features", icon: "✨" }
              ].map((item, index) => (
                <button
                  key={index}
                  className="group p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#23c6e6] text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-700 font-medium group-hover:text-[#23c6e6] transition-colors">
                      {item.text}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold rounded-lg hover:opacity-90 transition">
                Get Started
              </button>
              <button className="px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
                Request Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      <FeatureSection 
        title="Powerful features for every project"
        subtitle="From initial planning to final completion, Brixem provides the tools you need to succeed"
        features={[
          {
            icon: (
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} className="opacity-30" />
                <circle cx="12" cy="12" r="9" strokeWidth={1} className="opacity-20" />
              </svg>
            ),
            title: "AI-Powered Estimation",
            description: "Get accurate cost estimates in minutes, not days. Our AI analyzes thousands of projects to provide precise budgeting.",
            benefits: [
              "Instant cost calculations",
              "Material price tracking",
              "Labor cost estimation",
              "Market-based pricing"
            ]
          },
          {
            icon: (
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                <circle cx="12" cy="12" r="9" strokeWidth={1.5} className="opacity-30" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" className="opacity-50" />
              </svg>
            ),
            title: "Real-Time Collaboration",
            description: "Keep everyone on the same page with live updates, shared documents, and instant communication.",
            benefits: [
              "Live project updates",
              "Document sharing",
              "Team messaging",
              "Progress tracking"
            ]
          },
          {
            icon: (
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" className="opacity-50" />
                <circle cx="12" cy="12" r="9" strokeWidth={1} className="opacity-20" />
              </svg>
            ),
            title: "Smart Scheduling",
            description: "Optimize your project timeline with intelligent scheduling that accounts for dependencies and resources.",
            benefits: [
              "Automated scheduling",
              "Resource optimization",
              "Dependency management",
              "Milestone tracking"
            ]
          }
        ]}
      />
      <AnimatedStats />
      <TestimonialsSection 
        testimonials={[
          {
            name: "Sarah Johnson",
            role: "Project Manager",
            company: "BuildRight Construction",
            content: "Brixem has transformed how we manage projects. The AI estimation feature alone has saved us countless hours and improved our accuracy by 40%.",
            rating: 5,
            avatar: "S"
          },
          {
            name: "Mike Chen",
            role: "General Contractor",
            company: "Chen Construction Co.",
            content: "The real-time collaboration features are game-changing. My team can now work seamlessly across multiple projects without missing a beat.",
            rating: 5,
            avatar: "M"
          },
          {
            name: "Lisa Rodriguez",
            role: "Homeowner",
            company: "Renovation Project",
            content: "As a homeowner, I was overwhelmed by my renovation project. Brixem made everything clear and manageable. Highly recommend!",
            rating: 5,
            avatar: "L"
          }
        ]}
      />
      <PricingSection 
        plans={[
          {
            name: "Starter",
            price: "$0",
            period: "month",
            description: "Perfect for individual homeowners",
            features: [
              "Basic project management",
              "AI cost estimation (3/month)",
              "Document storage (100MB)",
              "Email support"
            ],
            cta: "Get Started Free",
            ctaVariant: "primary"
          },
          {
            name: "Professional",
            price: "$29",
            period: "month",
            description: "For contractors and small teams",
            features: [
              "Everything in Starter",
              "Unlimited AI estimations",
              "Team collaboration",
              "Advanced scheduling",
              "Priority support"
            ],
            popular: true,
            cta: "Start Free Trial",
            ctaVariant: "primary"
          },
          {
            name: "Enterprise",
            price: "$99",
            period: "month",
            description: "For large construction companies",
            features: [
              "Everything in Professional",
              "Custom integrations",
              "Dedicated account manager",
              "Advanced analytics",
              "API access"
            ],
            cta: "Contact Sales",
            ctaVariant: "secondary"
          }
        ]}
      />
      <Footer />
      <FloatingChat 
        onSend={(message) => {
          console.log('Chat message:', message);
          // Handle chat messages here
        }}
        messages={[]}
      />
    </div>
  );
}

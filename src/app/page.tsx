"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import GradientText from "@/components/GradientText";
import Orb from "@/components/Orb";
import ChatPanel from "@/components/ChatPanel";
import FeatureSection from "@/components/FeatureSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import AnimatedStats from "@/components/AnimatedStats";
import DebugAuth from "@/components/DebugAuth";

// Add Message type locally
interface Message {
  role: "user" | "ai";
  text: string;
}

function EmailConfirmationHandler() {
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

      // Also check for hash fragment parameters (for Supabase email links)
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.substring(1));
      const hashToken = hashParams.get('token_hash');
      const hashType = hashParams.get('type');
      const hashError = hashParams.get('error');
      const hashErrorDescription = hashParams.get('error_description');

      // Use either URL params or hash params
      const finalToken = token_hash || hashToken;
      const finalType = type || hashType;
      const finalError = error || hashError;
      const finalErrorDescription = errorDescription || hashErrorDescription;

      if (finalError) {
        console.error('Email confirmation error:', finalError, finalErrorDescription);
        setEmailConfirmationStatus({
          type: 'error',
          message: `Email confirmation failed: ${finalErrorDescription || finalError}`
        });
        return;
      }

      if (finalToken && finalType === 'signup') {
        setEmailConfirmationStatus({ type: 'loading', message: 'Confirming your email...' });
        
        try {
          console.log('Processing email confirmation with token_hash:', finalToken);
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: finalToken,
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
              message: 'Email confirmed successfully! Signing you in...'
            });
            
            // After email confirmation, automatically sign in the user
            try {
              // Get the user's profile to check if they've completed onboarding
              const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();

              if (profileError && profileError.code !== 'PGRST116') {
                console.error('Profile fetch error:', profileError);
              }

              // Check if user has completed onboarding (has role and basic info)
              const hasCompletedOnboarding = profileData && profileData.role && profileData.first_name;
              
              if (hasCompletedOnboarding) {
                // Check if user has any projects
                const { data: projectsData, error: projectsError } = await supabase
                  .from('projects')
                  .select('id')
                  .eq('user_id', data.user.id)
                  .limit(1);

                if (projectsError) {
                  console.error('Projects fetch error:', projectsError);
                }

                // If user has projects, go to regular dashboard, otherwise go to empty dashboard
                if (projectsData && projectsData.length > 0) {
                  setTimeout(() => {
                    router.push('/dashboard/homeowner');
                  }, 2000);
                } else {
                  setTimeout(() => {
                    router.push('/dashboard/homeowner/empty');
                  }, 2000);
                }
              } else {
                // User hasn't completed onboarding, go to onboarding flow
                setTimeout(() => {
                  router.push('/onboarding/homeowner');
                }, 2000);
              }
            } catch (signInError) {
              console.error('Auto sign-in error:', signInError);
              // If auto sign-in fails, redirect to login
              setTimeout(() => {
                router.push('/?message=email_confirmed_please_login');
              }, 2000);
            }
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
    <>
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
    </>
  );
}

function LandingPageContent() {
  const router = useRouter();
  
  // Ensure page starts at top
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [messages, setMessages] = React.useState<Message[]>([
    // Start with an empty chat
  ]);
  const [pendingRedirect, setPendingRedirect] = React.useState<string | null>(null);
  const [isChatActive, setIsChatActive] = React.useState(false);

  const preQuestions = [
    "I'm a homeowner planning a renovation",
    "I'm a contractor looking for projects",
    "I need help with project estimation",
    "I want to learn about Brixem's features"
  ];

  const handleSend = (message: string) => {
    // Activate chat when first message is sent
    if (messages.length === 0) {
      setIsChatActive(true);
    }
    
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    
    // Handle manual "yes" responses for signup confirmation
    if (message.toLowerCase().includes("yes") && pendingRedirect) {
      router.push(pendingRedirect);
      return;
    }
    
    // Handle role-based questions with confirmation
    if (message.includes("homeowner")) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { 
          role: "ai", 
          text: "Great! I can help you plan your renovation project. Let's get you set up with our homeowner tools. Would you like to sign up to start planning your renovation?" 
        }]);
        setPendingRedirect("/onboarding/homeowner");
      }, 1000);
      return;
    } else if (message.includes("contractor")) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { 
          role: "ai", 
          text: "Perfect! I can help you find projects and manage your business. Let's get you set up with our contractor tools. Would you like to sign up to access our contractor features?" 
        }]);
        setPendingRedirect("/onboarding/contractor");
      }, 1000);
      return;
    } else if (message.includes("consultant")) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { 
          role: "ai", 
          text: "Excellent! I can help you with project consultation tools. Let's get you set up with our consultant features. Would you like to sign up to access our consultant tools?" 
        }]);
        setPendingRedirect("/onboarding/contractor"); // Using contractor onboarding for consultants
      }, 1000);
      return;
    } else if (message.includes("estimation")) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { 
          role: "ai", 
          text: "I can help you with project estimation! Our AI-powered tools provide accurate cost estimates. Would you like to sign up to access our estimation features?" 
        }]);
        setPendingRedirect("/onboarding/contractor"); // Estimation tools typically for contractors
      }, 1000);
      return;
    } else if (message.includes("features")) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { 
          role: "ai", 
          text: "Brixem offers AI-powered project management, cost estimation, contractor matching, and real-time collaboration. Would you like to sign up to explore all our features?" 
        }]);
        setPendingRedirect("/onboarding/homeowner"); // Default to homeowner for general features
      }, 1000);
      return;
    }
    
    // Simulate AI response for other questions
    setTimeout(() => {
      const aiResponses = [
        "To start a renovation project, begin by defining your goals, setting a budget, and consulting with professionals.",
        "Key factors include clear planning, realistic budgeting, choosing the right contractor, and regular progress tracking.",
        "AI can analyze your project scope and local market data to provide accurate cost estimates quickly.",
        "Brixem streamlines project management with AI-driven insights, real-time collaboration, and automated scheduling.",
        "Unlike traditional tools, Brixem leverages AI to optimize every stage of your construction project for efficiency and clarity."
      ];
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setMessages((prev) => [...prev, { role: "ai", text: randomResponse }]);
    }, 1000);
  };

  const handleConfirmSignup = () => {
    if (pendingRedirect) {
      router.push(pendingRedirect);
    }
  };

  const handleDeclineSignup = () => {
    setMessages((prev) => [...prev, { 
      role: "ai", 
      text: "No problem! You can always sign up later. Is there anything else I can help you with?" 
    }]);
    setPendingRedirect(null);
  };

  return (
    <>
      {/* Hero Section - Mobile Optimized */}
      <section className={`relative bg-white overflow-hidden transition-all duration-500 ease-in-out min-h-screen flex items-center ${isChatActive ? 'py-8 sm:py-12 md:py-16 lg:py-20' : 'py-12 sm:py-16 md:py-20 lg:py-24'}`}>
        {/* Orb Background */}
        <div className="absolute inset-0 opacity-30 sm:opacity-50 pointer-events-none">
          <Orb
            hue={260}
            hoverIntensity={0.5}
            rotateOnHover={true}
            forceHoverState={false}
          />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center relative z-10 w-full">
          {/* Subtitle */}
          <div className={`mb-4 sm:mb-6 transition-all duration-500 ${isChatActive ? 'mb-2' : 'mb-4 sm:mb-6'}`}>
            <span className={`font-semibold tracking-wider text-gray-500 uppercase transition-all duration-500 ${
              isChatActive ? 'text-xs' : 'text-xs sm:text-sm'
            }`}>
              BRIXEM AI FOR EVERY PROJECT
            </span>
          </div>
          {/* Main Headline with animated gradient */}
          <h1 className={`font-bold mb-6 sm:mb-8 leading-tight max-w-4xl mx-auto text-center transition-all duration-500 ${isChatActive ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 sm:mb-6' : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-6 sm:mb-8'}`}>
            <span className="block">
              <span className="text-black">Smarter projects, </span>
              <GradientText
                className="inline"
                colors={["#62cff4", "#2c67f2", "#fab2ff", "#1904e5", "#12063b", "#09555c"]}
                animationSpeed={3}
              >
                powered by AI
              </GradientText>
              <span className="text-black"> built for construction</span>
            </span>
          </h1>
          {/* Smaller Subheadline */}
          <h2 className={`font-normal text-gray-900 transition-all duration-500 mb-8 sm:mb-10 ${isChatActive ? 'text-sm sm:text-base mb-6 sm:mb-8' : 'text-base sm:text-lg md:text-xl mb-8 sm:mb-10'}`}>
            Brixem gives homeowners and teams instant clarity across renovation and construction projects — from scoping to costing, scheduling, and contractor collaboration.
          </h2>
          {/* AI Chat Card with mobile-optimized spacing */}
          <div className={`flex flex-col justify-center items-center transition-all duration-500 w-full max-w-2xl mx-auto ${isChatActive ? 'mt-6 sm:mt-8' : 'mt-8 sm:mt-10'}`}>
            <div className="w-full">
              {/* Chat Area Only - no card styling */}
              <div className="px-2 pb-2 pt-0">
                <div className={`flex flex-col transition-all duration-500 ${
                  isChatActive ? 'h-72 sm:h-80 md:h-96 lg:h-[500px]' : 'h-32 sm:h-40 md:h-48 lg:h-56'
                }`}>
                  <ChatPanel 
                    messages={messages} 
                    onSend={handleSend}
                    onTaskConfirm={pendingRedirect ? (yes) => yes ? handleConfirmSignup() : handleDeclineSignup() : undefined}
                    pendingTask={pendingRedirect ? "Would you like to sign up?" : null}
                  />
                </div>
              </div>
              {/* Pre-existing questions - 2x2 grid with smaller cards */}
              <div className={`grid grid-cols-2 gap-3 justify-center transition-all duration-500 mt-6 sm:mt-8 ${isChatActive ? 'mt-4 sm:mt-6' : 'mt-6 sm:mt-8'}`}>
                {preQuestions.map((q, i) => (
                  <button
                    key={i}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-gray-100 text-gray-800 text-xs sm:text-sm font-medium hover:bg-[#e6eaff] border border-gray-200 transition shadow-sm touch-manipulation min-h-[40px] text-center leading-tight"
                    onClick={() => {
                      // Fill the input field instead of sending directly
                      const inputElement = document.querySelector('input[placeholder="Ask anything about your project..."]') as HTMLInputElement;
                      if (inputElement) {
                        inputElement.value = q;
                        inputElement.focus();
                      }
                    }}
                    type="button"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <AnimatedStats />

      {/* Role Cards Section - Mobile Optimized */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
              Built for every role in construction
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Whether you&apos;re planning a renovation, managing projects, or providing expert consultation, 
              Brixem adapts to your workflow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Homeowner Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  <circle cx="12" cy="12" r="9" strokeWidth={1.5} className="opacity-30" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Homeowner</h3>
              <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed flex-grow text-base sm:text-lg">
                Plan your renovation with confidence. Step-by-step project scoping with dynamic progress tracking 
                and AI-powered recommendations.
              </p>
              <button 
                className="w-full px-6 sm:px-8 py-4 rounded-xl bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold hover:opacity-90 active:scale-95 transition mt-auto text-base sm:text-lg touch-manipulation min-h-[48px]"
                onClick={() => router.push("/onboarding/homeowner")}
              >
                Get Started
              </button>
            </div>
            
            {/* Contractor Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} className="opacity-30" />
                  <circle cx="12" cy="12" r="9" strokeWidth={1} className="opacity-20" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Contractor</h3>
              <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed flex-grow text-base sm:text-lg">
                Quote faster. Win more jobs. Advanced feasibility & estimation tools with material & 
                construction cost analysis.
              </p>
              <button
                className="w-full px-6 sm:px-8 py-4 rounded-xl bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold hover:opacity-90 transition mt-auto text-base sm:text-lg touch-manipulation min-h-[48px]"
                onClick={() => router.push("/onboarding/contractor")}
              >
                Get Started
              </button>
            </div>
            
            {/* Consultant Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} className="opacity-30" />
                  <circle cx="12" cy="12" r="9" strokeWidth={1} className="opacity-20" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Consultant</h3>
              <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed flex-grow text-base sm:text-lg">
                Support smarter decisions. Faster. Comprehensive project roadmaps with AI-powered 
                insights and risk assessment.
              </p>
              <button className="w-full px-4 sm:px-6 py-3 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold hover:opacity-90 transition mt-auto text-sm sm:text-base">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* Testimonials Section */}
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

      {/* CTA Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-24 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Ready to see Brixem in action?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-blue-50 leading-relaxed">
            Find out why leading construction teams across the world turn to Brixem for their 
            project management and AI-powered estimation needs.
          </p>
          <button className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-transparent text-white font-semibold hover:bg-white/10 transition border-2 border-white text-sm sm:text-base">
            Request demo
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <Suspense fallback={null}>
        <EmailConfirmationHandler />
      </Suspense>
      
      {/* Debug component - remove in production */}
      <DebugAuth />
      
      <Suspense fallback={null}>
        <LandingPageContent />
      </Suspense>
    </div>
  );
}

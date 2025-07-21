"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import GradientText from "@/components/GradientText";
import { useRouter } from "next/navigation";
import Orb from "@/components/Orb";
import ChatPanel from "@/components/ChatPanel"; // Added import for ChatPanel
import FeatureSection from "@/components/FeatureSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import AnimatedStats from "@/components/AnimatedStats";

// Add Message type locally
interface Message {
  role: "user" | "ai";
  text: string;
}

export default function Home() {
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
    "I&apos;m a homeowner planning a renovation",
    "I&apos;m a contractor looking for projects",
    "I need help with project estimation",
    "I want to learn about Brixem&apos;s features",
    "I&apos;m a consultant seeking tools"
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
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section - now white background */}
      <section className={`relative bg-white overflow-hidden transition-all duration-500 ease-in-out ${
        isChatActive ? 'py-4 sm:py-6 md:py-8 lg:py-12' : 'py-12 sm:py-16 md:py-20 lg:py-24'
      }`}>
        {/* Orb Background */}
        <div className="absolute inset-0 opacity-30 sm:opacity-50 pointer-events-none">
          <Orb
            hue={260}
            hoverIntensity={0.5}
            rotateOnHover={true}
            forceHoverState={false}
          />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center relative z-10">
          {/* Subtitle */}
          <div className={`mb-4 sm:mb-6 transition-all duration-500 ${
            isChatActive ? 'mb-2' : 'mb-4 sm:mb-6'
          }`}>
            <span className={`font-semibold tracking-wider text-gray-500 uppercase transition-all duration-500 ${
              isChatActive ? 'text-xs' : 'text-xs sm:text-sm'
            }`}>
              BRIXEM AI FOR EVERY PROJECT
            </span>
          </div>
          {/* Main Headline with animated gradient */}
          <h1 className={`font-bold mb-6 sm:mb-8 leading-tight max-w-4xl mx-auto text-center transition-all duration-500 ${
            isChatActive ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4' : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-6 sm:mb-8'
          }`}>
            <span className="block">
              <GradientText
                className="inline"
                colors={["#62cff4", "#2c67f2", "#fab2ff", "#1904e5", "#12063b", "#09555c"]}
                animationSpeed={3}
              >
                Smarter projects, powered by AI
              </GradientText>
            </span>
            <span className="block text-black">built for construction</span>
          </h1>
          {/* Smaller Subheadline */}
          <h2 className={`font-normal text-gray-900 transition-all duration-500 ${
            isChatActive ? 'text-sm sm:text-base mb-4 sm:mb-6' : 'text-sm sm:text-base md:text-lg mb-3 sm:mb-4'
          }`}>
            Brixem gives homeowners and teams instant clarity across renovation and construction projects — from scoping to costing, scheduling, and contractor collaboration.
          </h2>
          {/* AI Chat Card with minimal spacing */}
          <div className={`flex justify-center items-center transition-all duration-500 ${
            isChatActive ? 'mt-4 sm:mt-6' : 'mt-3 sm:mt-4'
          }`}>
            <div className="w-full max-w-2xl">
              {/* Chat Area Only - no card styling */}
              <div className="px-1 pb-1 pt-0">
                <div className={`flex flex-col transition-all duration-500 ${
                  isChatActive ? 'h-64 sm:h-80 md:h-96' : 'h-24 sm:h-32 md:h-40'
                }`}>
                  <ChatPanel 
                    messages={messages} 
                    onSend={handleSend}
                    onTaskConfirm={pendingRedirect ? (yes) => yes ? handleConfirmSignup() : handleDeclineSignup() : undefined}
                    pendingTask={pendingRedirect ? "Would you like to sign up?" : null}
                  />
                </div>
              </div>
              {/* Pre-existing questions */}
              <div className={`flex flex-wrap gap-2 justify-center transition-all duration-500 ${
                isChatActive ? 'mt-2' : 'mt-3 sm:mt-4'
              }`}>
                {preQuestions.map((q, i) => (
                  <button
                    key={i}
                    className="px-3 sm:px-4 py-2 rounded-full bg-gray-100 text-gray-800 text-xs sm:text-sm font-medium hover:bg-[#e6eaff] border border-gray-200 transition shadow-sm"
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

      {/* Role Cards Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Built for every role in construction
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Whether you&apos;re planning a renovation, managing projects, or providing expert consultation, 
              Brixem adapts to your workflow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Homeowner Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Homeowner</h3>
              <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed flex-grow text-sm sm:text-base">
                Plan your renovation with confidence. Step-by-step project scoping with dynamic progress tracking 
                and AI-powered recommendations.
              </p>
              <button 
                className="w-full px-4 sm:px-6 py-3 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold hover:opacity-90 transition mt-auto text-sm sm:text-base"
                onClick={() => router.push("/onboarding/homeowner")}
              >
                Get Started
              </button>
            </div>
            
            {/* Contractor Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Contractor</h3>
              <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed flex-grow text-sm sm:text-base">
                Quote faster. Win more jobs. Advanced feasibility & estimation tools with material & 
                construction cost analysis.
              </p>
              <button
                className="w-full px-4 sm:px-6 py-3 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold hover:opacity-90 transition mt-auto text-sm sm:text-base"
                onClick={() => router.push("/onboarding/contractor")}
              >
                Get Started
              </button>
            </div>
            
            {/* Consultant Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Consultant</h3>
              <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed flex-grow text-sm sm:text-base">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white">
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
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const [activeValue, setActiveValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const coreValues = [
    {
      title: "Transparency",
      description: "We believe in open, honest communication. No hidden costs, no fine print, no surprises. Every user deserves clarity at every step of the journey.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Empowerment",
      description: "We put smart, intuitive tools in your hands so you can make confident decisions whether you&apos;re planning, building, or managing.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "Innovation",
      description: "We harness AI and technology to simplify complexity, reduce risk, and create real, measurable value across every stage of construction.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: "Collaboration",
      description: "We connect homeowners, contractors, and consultants in one unified platform. This improves coordination, accountability, and shared success.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  const whyBrixemFeatures = [
    {
      title: "Clarity from the Start",
      description: "Say goodbye to uncertainty. Brixem provides a clear roadmap of your project, outlining timelines, costs, responsibilities, and milestones all in one place.",
      icon: "🎯"
    },
    {
      title: "Intelligent Guidance, Instantly",
      description: "Powered by AI and backed by real-world expertise, our platform delivers tailored recommendations, documentation, and decision support when and where you need it.",
      icon: "🤖"
    },
    {
      title: "Designed for All Stakeholders",
      description: "From homeowners and independent contractors to consultants managing multi-site projects, Brixem adapts to your needs, offering tools that scale with your ambition.",
      icon: "👥"
    },
    {
      title: "Built on Trust and Transparency",
      description: "We prioritise open information, fair pricing, and full accountability. With Brixem, everyone stays aligned and surprises stay off your site.",
      icon: "🤝"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 lg:pb-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 sm:mb-8">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7]">Story</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Born from frustration, built for transformation
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
                From Frustration to Innovation
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Brixem was born from our own frustrations as contractors, consultants, and project owners. 
                  We experienced firsthand how confusing, risky, and overwhelming construction projects can be.
                </p>
                <p>
                  From endless paperwork and unclear costs to scattered communication and a lack of reliable guidance, 
                  every stage felt harder than it should.
                </p>
                <p className="text-xl font-semibold text-[#23c6e6]">
                  We knew there had to be a better way.
                </p>
                <p>
                  So we set out to build a platform that brings clarity, control, and confidence to everyone involved. 
                  Powered by intelligent tools, real industry expertise, and AI-driven insights, Brixem helps homeowners, 
                  contractors, and consultants work smarter from the first idea to the final handover.
                </p>
              </div>
            </div>
            
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] rounded-2xl p-8 sm:p-12 shadow-2xl">
                <div className="bg-white rounded-xl p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">The Problem We Solved</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-gray-700">Endless paperwork and unclear costs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-gray-700">Scattered communication</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-gray-700">Lack of reliable guidance</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-gray-700">Confusing and risky processes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Our Core Values
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-6 sm:p-8 shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl ${
                  activeValue === index
                    ? 'border-[#23c6e6] shadow-xl scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveValue(index)}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center mb-4 sm:mb-6 transition-all duration-300 ${
                  activeValue === index
                    ? 'bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {value.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {value.title}
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed transition-all duration-300 ${
                  activeValue === index ? 'text-gray-700' : 'text-gray-600'
                }`}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Brixem Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Why Brixem?
            </h2>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] mb-6 sm:mb-8">
              Smart Construction. Clear Decisions. Better Outcomes.
            </div>
            <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              At Brixem, the construction experience should be intelligent, accessible, and seamless for everyone involved. 
              Whether planning your first renovation or managing complex portfolios, Brixem empowers you to take control confidently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {whyBrixemFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl sm:text-4xl">{feature.icon}</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Transform Your Construction Experience?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-blue-50 leading-relaxed">
            Join thousands of construction professionals who've already discovered the Brixem difference
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-white text-[#4b1fa7] font-semibold hover:bg-gray-50 transition text-sm sm:text-base">
              Start Free Trial
            </button>
            <button className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-transparent text-white font-semibold hover:bg-white/10 transition border-2 border-white text-sm sm:text-base">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 
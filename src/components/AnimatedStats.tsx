"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

interface StatItem {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

export default function AnimatedStats() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0, 0]);
  const [animationsComplete, setAnimationsComplete] = useState([false, false, false, false]);
  const componentRef = useRef<HTMLDivElement>(null);

  const stats: StatItem[] = useMemo(() => [
    {
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          <circle cx="12" cy="12" r="9" strokeWidth={1.5} className="opacity-30" />
        </svg>
      ),
      value: 2.5,
      suffix: "B+",
      label: "in total projects managed",
      isCurrency: true
    },
    {
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" className="opacity-50" />
          <circle cx="12" cy="12" r="9" strokeWidth={1} className="opacity-20" />
        </svg>
      ),
      value: 500,
      suffix: "+",
      label: "leading contractors use Brixem"
    },
    {
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="opacity-50" />
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1} className="opacity-30" />
        </svg>
      ),
      value: 50,
      suffix: "K+",
      label: "project tasks completed"
    },
    {
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          <circle cx="12" cy="12" r="9" strokeWidth={1.5} className="opacity-30" />
          <circle cx="12" cy="12" r="6" strokeWidth={1} className="opacity-20" />
        </svg>
      ),
      value: 200,
      suffix: "+",
      label: "cities worldwide"
    }
  ], []);

  const startAnimation = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setAnimatedValues([0, 0, 0, 0]);
    setAnimationsComplete([false, false, false, false]);

    // Animate each stat with different durations
    const durations = [3000, 2500, 3500, 2000]; // 3s, 2.5s, 3.5s, 2s
    const intervals: NodeJS.Timeout[] = [];

    stats.forEach((stat, index) => {
      const interval = setInterval(() => {
        setAnimatedValues(prev => {
          const newValues = [...prev];
          const targetValue = stat.value;
          const increment = targetValue / (durations[index] / 100);
          
          if (newValues[index] >= targetValue) {
            clearInterval(interval);
            setAnimationsComplete(prev => {
              const newComplete = [...prev];
              newComplete[index] = true;
              return newComplete;
            });
            return newValues;
          }
          
          newValues[index] = Math.min(newValues[index] + increment, targetValue);
          return newValues;
        });
      }, 100);

      intervals.push(interval);
    });

    // Reset and restart animation after max duration + 5 seconds
    const maxDuration = Math.max(...durations);
    setTimeout(() => {
      setIsAnimating(false);
    }, maxDuration + 5000);
  }, [isAnimating, stats]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isAnimating) {
            startAnimation();
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of the component is visible
        rootMargin: "0px 0px -50px 0px"
      }
    );

    const currentRef = componentRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isAnimating, startAnimation]);

  const formatValue = (value: number, stat: StatItem) => {
    if (stat.isCurrency) {
      return `$${value.toFixed(1)}${stat.suffix}`;
    }
    return `${Math.round(value)}${stat.suffix}`;
  };

  return (
    <div ref={componentRef} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center">
                {stat.icon}
              </div>
              <div className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 transition-all duration-300 ${
                animationsComplete[index] ? 'text-white' : 'text-gray-400'
              }`}>
                {formatValue(animatedValues[index], stat)}
              </div>
              <div className={`text-gray-400 text-xs sm:text-sm transition-all duration-300 ${
                animationsComplete[index] ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

export default function HomeownerDashboard() {
  const [budgetUsed, setBudgetUsed] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [budgetAnimationComplete, setBudgetAnimationComplete] = useState(false);
  const [timelineAnimationComplete, setTimelineAnimationComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const startAnimation = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setBudgetUsed(0);
    setCurrentWeek(0);
    setBudgetAnimationComplete(false);
    setTimelineAnimationComplete(false);

    // Animate budget used from 0 to 28,450 over 3 seconds
    const budgetInterval = setInterval(() => {
      setBudgetUsed(prev => {
        if (prev >= 28450) {
          clearInterval(budgetInterval);
          setBudgetAnimationComplete(true);
          return 28450;
        }
        return prev + 950; // Increment by 950 to reach 28450 in ~3 seconds
      });
    }, 100);

    // Animate timeline from week 0 to week 4 over 2 seconds
    const timelineInterval = setInterval(() => {
      setCurrentWeek(prev => {
        if (prev >= 4) {
          clearInterval(timelineInterval);
          setTimelineAnimationComplete(true);
          return 4;
        }
        return prev + 0.2; // Increment by 0.2 to reach 4 in ~2 seconds
      });
    }, 100);

    // Reset and restart animation after 8 seconds (3s + 5s delay)
    setTimeout(() => {
      setIsAnimating(false);
    }, 8000);
  }, [isAnimating]);

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

  return (
    <div ref={componentRef} className="bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] rounded-2xl p-8 sm:p-12 shadow-2xl">
      <div className="bg-white rounded-xl p-6 sm:p-8">
        <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Homeowner Dashboard</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Project Status</span>
            <span className="text-sm font-semibold text-green-600">On Track</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Budget Used</span>
            <span className={`text-sm font-semibold transition-all duration-300 ${
              budgetAnimationComplete ? 'text-gray-700' : 'text-gray-500'
            }`}>
              ${budgetUsed.toLocaleString()} / $45,000
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Timeline</span>
            <span className={`text-sm font-semibold transition-all duration-300 ${
              timelineAnimationComplete ? 'text-gray-700' : 'text-gray-500'
            }`}>
              Week {Math.round(currentWeek)} of 8
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Next Milestone</span>
            <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7]">
              Cabinets Install
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 
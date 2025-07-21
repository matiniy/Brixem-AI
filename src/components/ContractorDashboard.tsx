"use client";
import React, { useState, useEffect, useRef } from "react";

export default function ContractorDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeProjects, setActiveProjects] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [teamUtilization, setTeamUtilization] = useState(0);
  const [pendingQuotes, setPendingQuotes] = useState(0);
  const [projectsAnimationComplete, setProjectsAnimationComplete] = useState(false);
  const [revenueAnimationComplete, setRevenueAnimationComplete] = useState(false);
  const [utilizationAnimationComplete, setUtilizationAnimationComplete] = useState(false);
  const [quotesAnimationComplete, setQuotesAnimationComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isAnimating) {
            setIsVisible(true);
            startAnimation();
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of the component is visible
        rootMargin: "0px 0px -50px 0px"
      }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => {
      if (componentRef.current) {
        observer.unobserve(componentRef.current);
      }
    };
  }, [isAnimating]);

  const startAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setActiveProjects(0);
    setRevenue(0);
    setTeamUtilization(0);
    setPendingQuotes(0);
    setProjectsAnimationComplete(false);
    setRevenueAnimationComplete(false);
    setUtilizationAnimationComplete(false);
    setQuotesAnimationComplete(false);

    // Animate active projects from 0 to 12 over 2 seconds
    const projectsInterval = setInterval(() => {
      setActiveProjects(prev => {
        if (prev >= 12) {
          clearInterval(projectsInterval);
          setProjectsAnimationComplete(true);
          return 12;
        }
        return prev + 0.6; // Increment by 0.6 to reach 12 in ~2 seconds
      });
    }, 100);

    // Animate revenue from 0 to 127,500 over 4 seconds
    const revenueInterval = setInterval(() => {
      setRevenue(prev => {
        if (prev >= 127500) {
          clearInterval(revenueInterval);
          setRevenueAnimationComplete(true);
          return 127500;
        }
        return prev + 3188; // Increment by 3188 to reach 127500 in ~4 seconds
      });
    }, 100);

    // Animate team utilization from 0% to 94% over 3 seconds
    const utilizationInterval = setInterval(() => {
      setTeamUtilization(prev => {
        if (prev >= 94) {
          clearInterval(utilizationInterval);
          setUtilizationAnimationComplete(true);
          return 94;
        }
        return prev + 3.13; // Increment by 3.13 to reach 94 in ~3 seconds
      });
    }, 100);

    // Animate pending quotes from 0 to 8 over 1.5 seconds
    const quotesInterval = setInterval(() => {
      setPendingQuotes(prev => {
        if (prev >= 8) {
          clearInterval(quotesInterval);
          setQuotesAnimationComplete(true);
          return 8;
        }
        return prev + 0.53; // Increment by 0.53 to reach 8 in ~1.5 seconds
      });
    }, 100);

    // Reset and restart animation after 9 seconds (4s + 5s delay)
    setTimeout(() => {
      setIsAnimating(false);
    }, 9000);
  };

  return (
    <div ref={componentRef} className="bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] rounded-2xl p-8 sm:p-12 shadow-2xl">
      <div className="bg-white rounded-xl p-6 sm:p-8">
        <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Contractor Dashboard</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Active Projects</span>
            <span className={`text-sm font-semibold transition-all duration-300 ${
              projectsAnimationComplete ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {Math.round(activeProjects)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Revenue This Month</span>
            <span className={`text-sm font-semibold transition-all duration-300 ${
              revenueAnimationComplete ? 'text-green-600' : 'text-gray-500'
            }`}>
              ${revenue.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Team Utilization</span>
            <span className={`text-sm font-semibold transition-all duration-300 ${
              utilizationAnimationComplete ? 'text-gray-700' : 'text-gray-500'
            }`}>
              {Math.round(teamUtilization)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pending Quotes</span>
            <span className={`text-sm font-semibold transition-all duration-300 ${
              quotesAnimationComplete ? 'text-orange-600' : 'text-gray-500'
            }`}>
              {Math.round(pendingQuotes)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 
"use client";
import React, { useState, useEffect, useRef } from "react";

export default function AIAnalysisExample() {
  const [estimatedCost, setEstimatedCost] = useState(30000);
  const [confidence, setConfidence] = useState(0);
  const [costAnimationComplete, setCostAnimationComplete] = useState(false);
  const [confidenceAnimationComplete, setConfidenceAnimationComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const startAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setEstimatedCost(30000);
    setConfidence(0);
    setCostAnimationComplete(false);
    setConfidenceAnimationComplete(false);

    // Animate estimated cost from 30,000 to 45,200 over 3 seconds
    const costInterval = setInterval(() => {
      setEstimatedCost(prev => {
        if (prev >= 45200) {
          clearInterval(costInterval);
          setCostAnimationComplete(true);
          return 45200;
        }
        return prev + 1520; // Increment by 1520 to reach 45200 in ~3 seconds
      });
    }, 100);

    // Animate confidence from 0% to 94% over 5 seconds
    const confidenceInterval = setInterval(() => {
      setConfidence(prev => {
        if (prev >= 94) {
          clearInterval(confidenceInterval);
          setConfidenceAnimationComplete(true);
          return 94;
        }
        return prev + 1.88; // Increment by 1.88 to reach 94 in ~5 seconds
      });
    }, 100);

    // Reset and restart animation after 8 seconds (3s + 5s delay)
    setTimeout(() => {
      setIsAnimating(false);
    }, 8000);
  };

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

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => {
      const ref = componentRef.current;
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [isAnimating, startAnimation]);

  return (
    <div ref={componentRef} className="relative">
      <div className="bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] rounded-2xl p-8 sm:p-12 shadow-2xl">
        <div className="bg-white rounded-xl p-6 sm:p-8">
          <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">AI Analysis Example</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Project Type</span>
              <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7]">
                Kitchen Renovation
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Estimated Cost</span>
              <span className={`text-sm font-semibold transition-all duration-300 ${
                costAnimationComplete ? 'text-green-600' : 'text-gray-600'
              }`}>
                ${estimatedCost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Timeline</span>
              <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7]">
                6-8 weeks
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Confidence</span>
              <span className={`text-sm font-semibold transition-all duration-300 ${
                confidenceAnimationComplete ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {Math.round(confidence)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
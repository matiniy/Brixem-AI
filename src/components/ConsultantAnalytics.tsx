"use client";
import React, { useState, useEffect, useRef } from "react";

export default function ConsultantAnalytics() {
  const [riskScore, setRiskScore] = useState(0);
  const [roiProjection, setRoiProjection] = useState(0);
  const [timelineVariance, setTimelineVariance] = useState(0);
  const [costEfficiency, setCostEfficiency] = useState(0);
  const [riskAnimationComplete, setRiskAnimationComplete] = useState(false);
  const [roiAnimationComplete, setRoiAnimationComplete] = useState(false);
  const [timelineAnimationComplete, setTimelineAnimationComplete] = useState(false);
  const [efficiencyAnimationComplete, setEfficiencyAnimationComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const startAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setRiskScore(0);
    setRoiProjection(0);
    setTimelineVariance(0);
    setCostEfficiency(0);
    setRiskAnimationComplete(false);
    setRoiAnimationComplete(false);
    setTimelineAnimationComplete(false);
    setEfficiencyAnimationComplete(false);

    // Animate risk score from 0 to 6.2 over 2.5 seconds
    const riskInterval = setInterval(() => {
      setRiskScore(prev => {
        if (prev >= 6.2) {
          clearInterval(riskInterval);
          setRiskAnimationComplete(true);
          return 6.2;
        }
        return prev + 0.248; // Increment by 0.248 to reach 6.2 in ~2.5 seconds
      });
    }, 100);

    // Animate ROI projection from 0% to 127% over 4 seconds
    const roiInterval = setInterval(() => {
      setRoiProjection(prev => {
        if (prev >= 127) {
          clearInterval(roiInterval);
          setRoiAnimationComplete(true);
          return 127;
        }
        return prev + 3.175; // Increment by 3.175 to reach 127 in ~4 seconds
      });
    }, 100);

    // Animate timeline variance from 0 to 2 over 1.5 seconds
    const timelineInterval = setInterval(() => {
      setTimelineVariance(prev => {
        if (prev >= 2) {
          clearInterval(timelineInterval);
          setTimelineAnimationComplete(true);
          return 2;
        }
        return prev + 0.133; // Increment by 0.133 to reach 2 in ~1.5 seconds
      });
    }, 100);

    // Animate cost efficiency from 0% to 94% over 3.5 seconds
    const efficiencyInterval = setInterval(() => {
      setCostEfficiency(prev => {
        if (prev >= 94) {
          clearInterval(efficiencyInterval);
          setEfficiencyAnimationComplete(true);
          return 94;
        }
        return prev + 2.69; // Increment by 2.69 to reach 94 in ~3.5 seconds
      });
    }, 100);

    // Reset and restart animation after 9.5 seconds (4s + 5s delay)
    setTimeout(() => {
      setIsAnimating(false);
    }, 9500);
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

  const getRiskLevel = (score: number) => {
    if (score < 3) return "Low";
    if (score < 7) return "Medium";
    return "High";
  };

  const getRiskColor = (score: number) => {
    if (score < 3) return "text-green-600";
    if (score < 7) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div ref={componentRef} className="bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] rounded-2xl p-8 sm:p-12 shadow-2xl">
      <div className="bg-white rounded-xl p-6 sm:p-8">
        <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Consultant Analytics</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Risk Score</span>
            <span className={`text-sm font-semibold transition-all duration-300 ${
              riskAnimationComplete ? getRiskColor(riskScore) : 'text-gray-500'
            }`}>
              {getRiskLevel(riskScore)} ({riskScore.toFixed(1)}/10)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">ROI Projection</span>
            <span className={`text-sm font-semibold transition-all duration-300 ${
              roiAnimationComplete ? 'text-green-600' : 'text-gray-500'
            }`}>
              {Math.round(roiProjection)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Timeline Variance</span>
            <span className={`text-sm font-semibold transition-all duration-300 ${
              timelineAnimationComplete ? 'text-blue-600' : 'text-gray-500'
            }`}>
              +{Math.round(timelineVariance)} weeks
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Cost Efficiency</span>
            <span className={`text-sm font-semibold transition-all duration-300 ${
              efficiencyAnimationComplete ? 'text-green-600' : 'text-gray-500'
            }`}>
              {Math.round(costEfficiency)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 
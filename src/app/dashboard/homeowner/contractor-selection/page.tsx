'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Contractor {
  id: string;
  name: string;
  logo: string;
  image: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  specialties: string[];
  location: string;
  experience: string;
  description: string;
  verified: boolean;
  responseTime: string;
  completedProjects: number;
}

interface ProjectData {
  projectType: string;
  location: string;
  budgetRange: string;
  size: string;
  timeline: string;
  goals: string[];
  challenges: string[];
  additionalDetails: string;
}

// Mock contractor data
const MOCK_CONTRACTORS: Contractor[] = [
  {
    id: '1',
    name: 'Premier Construction Ltd',
    logo: '🏗️',
    image: '/api/placeholder/300/200',
    rating: 4.8,
    reviewCount: 127,
    priceRange: '£25k - £75k',
    specialties: ['Kitchen Renovations', 'Extensions', 'Bathroom Refits'],
    location: 'London & Surrounding Areas',
    experience: '15+ years',
    description: 'Specializing in high-end residential renovations with a focus on modern design and quality craftsmanship.',
    verified: true,
    responseTime: 'Within 24 hours',
    completedProjects: 450
  },
  {
    id: '2',
    name: 'Elite Home Improvements',
    logo: '🏠',
    image: '/api/placeholder/300/200',
    rating: 4.9,
    reviewCount: 89,
    priceRange: '£40k - £120k',
    specialties: ['Whole House Renovations', 'Loft Conversions', 'Kitchen Design'],
    location: 'Greater London',
    experience: '12+ years',
    description: 'Award-winning contractor known for innovative designs and exceptional attention to detail.',
    verified: true,
    responseTime: 'Within 12 hours',
    completedProjects: 320
  },
  {
    id: '3',
    name: 'Swift Build Solutions',
    logo: '⚡',
    image: '/api/placeholder/300/200',
    rating: 4.7,
    reviewCount: 203,
    priceRange: '£20k - £60k',
    specialties: ['Quick Renovations', 'Bathroom Fitting', 'Small Extensions'],
    location: 'London & Home Counties',
    experience: '8+ years',
    description: 'Fast, reliable, and affordable construction services with guaranteed completion times.',
    verified: true,
    responseTime: 'Within 6 hours',
    completedProjects: 680
  },
  {
    id: '4',
    name: 'Luxury Living Builders',
    logo: '✨',
    image: '/api/placeholder/300/200',
    rating: 4.9,
    reviewCount: 156,
    priceRange: '£60k - £200k+',
    specialties: ['Luxury Renovations', 'Bespoke Kitchens', 'High-End Extensions'],
    location: 'Central London',
    experience: '20+ years',
    description: 'Premium construction services for discerning clients who demand the highest quality and finish.',
    verified: true,
    responseTime: 'Within 48 hours',
    completedProjects: 280
  }
];

function ContractorSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null);
  const [showProjectCreated, setShowProjectCreated] = useState(false);

  // Simulate loading time (10-15 seconds)
  useEffect(() => {
    const loadingTime = Math.random() * 5000 + 10000; // 10-15 seconds
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, loadingTime);

    // Get project data from URL params
    const projectType = searchParams.get('type') || 'Renovation';
    const location = searchParams.get('location') || 'London';
    const budgetRange = searchParams.get('budget') || '£25k - £75k';
    const size = searchParams.get('size') || 'Medium';
    const timeline = searchParams.get('timeline') || 'Next 3 months';
    const goals = searchParams.get('goals')?.split(',') || ['Modern Design'];
    const challenges = searchParams.get('challenges')?.split(',') || ['Planning Permission'];
    const additionalDetails = searchParams.get('details') || 'Eco-friendly materials';

    setProjectData({
      projectType,
      location,
      budgetRange,
      size,
      timeline,
      goals,
      challenges,
      additionalDetails
    });

    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleContractorSelect = (contractorId: string) => {
    setSelectedContractor(contractorId);
    setShowProjectCreated(true);
    
    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      router.push('/dashboard/homeowner');
    }, 3000);
  };

  const handleSkipSelection = () => {
    setShowProjectCreated(true);
    
    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      router.push('/dashboard/homeowner');
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Project</h2>
          <p className="text-gray-600 mb-4">We&apos;re analyzing your requirements and finding the best contractors...</p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div className="bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">This may take 10-15 seconds</p>
        </div>
      </div>
    );
  }

  if (showProjectCreated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedContractor ? 'Contractor Selected!' : 'Project Created!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {selectedContractor 
              ? 'Your project has been created and contractor has been notified. Redirecting to dashboard...'
              : 'Your project has been created successfully. Redirecting to dashboard...'
            }
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Choose Your Contractor</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">
                Based on your {projectData?.projectType} project in {projectData?.location}
              </p>
            </div>
            <button
              onClick={handleSkipSelection}
              className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base flex-shrink-0"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>

      {/* Project Summary */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Your Project Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <span className="text-sm text-gray-500">Project Type</span>
              <p className="font-medium text-gray-900">{projectData?.projectType}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Location</span>
              <p className="font-medium text-gray-900">{projectData?.location}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Budget Range</span>
              <p className="font-medium text-gray-900">{projectData?.budgetRange}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Timeline</span>
              <p className="font-medium text-gray-900">{projectData?.timeline}</p>
            </div>
          </div>
        </div>

        {/* Contractors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {MOCK_CONTRACTORS.map((contractor) => (
            <div
              key={contractor.id}
              className={`bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                selectedContractor === contractor.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleContractorSelect(contractor.id)}
            >
              {/* Contractor Image */}
              <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  {contractor.verified && (
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="text-3xl">{contractor.logo}</div>
                </div>
              </div>

              {/* Contractor Details */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-2 sm:space-y-0">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{contractor.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm truncate">{contractor.location}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="flex items-center mb-1">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{contractor.rating}</span>
                      <span className="text-gray-500 text-xs sm:text-sm ml-1">({contractor.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{contractor.description}</p>

                {/* Price Range */}
                <div className="mb-3 sm:mb-4">
                  <span className="text-xs sm:text-sm text-gray-500">Price Range:</span>
                  <p className="font-semibold text-green-600 text-base sm:text-lg">{contractor.priceRange}</p>
                </div>

                {/* Specialties */}
                <div className="mb-3 sm:mb-4">
                  <span className="text-xs sm:text-sm text-gray-500 block mb-2">Specialties:</span>
                  <div className="flex flex-wrap gap-1">
                    {contractor.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm mb-3 sm:mb-4">
                  <div>
                    <span className="text-gray-500">Experience:</span>
                    <p className="font-medium text-gray-900">{contractor.experience}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Projects:</span>
                    <p className="font-medium text-gray-900">{contractor.completedProjects}+</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Response:</span>
                    <p className="font-medium text-gray-900">{contractor.responseTime}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p className="font-medium text-green-600">Available</p>
                  </div>
                </div>

                {/* Select Button */}
                <button
                  className={`w-full mt-3 sm:mt-4 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    selectedContractor === contractor.id
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {selectedContractor === contractor.id ? 'Selected ✓' : 'Select Contractor'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
            Don&apos;t see the right contractor? We&apos;ll help you find more options in your project dashboard.
          </p>
          <button
            onClick={handleSkipSelection}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
          >
            Continue to Project Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContractorSelectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contractor selection...</p>
        </div>
      </div>
    }>
      <ContractorSelectionContent />
    </Suspense>
  );
}

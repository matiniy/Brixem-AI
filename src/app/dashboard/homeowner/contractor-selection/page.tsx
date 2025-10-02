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
  phone: string;
  email: string;
  website: string;
  certifications: string[];
  insurance: string;
  warranty: string;
  portfolio: string[];
  availability: string;
  teamSize: number;
  languages: string[];
  paymentMethods: string[];
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

// Enhanced mock contractor data
const MOCK_CONTRACTORS: Contractor[] = [
  {
    id: '1',
    name: 'Premier Construction Ltd',
    logo: '🏗️',
    image: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2f4c4?w=400&h=200&fit=crop&crop=center',
    rating: 4.8,
    reviewCount: 127,
    priceRange: '£25k - £75k',
    specialties: ['Kitchen Renovations', 'Extensions', 'Bathroom Refits'],
    location: 'London & Surrounding Areas',
    experience: '15+ years',
    description: 'Specializing in high-end residential renovations with a focus on modern design and quality craftsmanship.',
    verified: true,
    responseTime: 'Within 24 hours',
    completedProjects: 450,
    phone: '+44 20 7123 4567',
    email: 'info@premierconstruction.co.uk',
    website: 'www.premierconstruction.co.uk',
    certifications: ['CSCS', 'CITB', 'FMB Member'],
    insurance: '£2M Public Liability',
    warranty: '5 years structural',
    portfolio: ['Modern Kitchen', 'Victorian Extension', 'Bathroom Suite'],
    availability: 'Available in 2 weeks',
    teamSize: 12,
    languages: ['English', 'Polish', 'Spanish'],
    paymentMethods: ['Bank Transfer', 'Cheque', 'Card']
  },
  {
    id: '2',
    name: 'Elite Home Improvements',
    logo: '🏠',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=200&fit=crop&crop=center',
    rating: 4.9,
    reviewCount: 89,
    priceRange: '£40k - £120k',
    specialties: ['Whole House Renovations', 'Loft Conversions', 'Kitchen Design'],
    location: 'Greater London',
    experience: '12+ years',
    description: 'Award-winning contractor known for innovative designs and exceptional attention to detail.',
    verified: true,
    responseTime: 'Within 12 hours',
    completedProjects: 320,
    phone: '+44 20 7987 6543',
    email: 'hello@elitehomeimprovements.com',
    website: 'www.elitehomeimprovements.com',
    certifications: ['CSCS', 'CITB', 'RIBA Associate'],
    insurance: '£5M Public Liability',
    warranty: '10 years structural',
    portfolio: ['Luxury Loft', 'Contemporary Kitchen', 'Period Restoration'],
    availability: 'Available in 3 weeks',
    teamSize: 8,
    languages: ['English', 'French', 'Italian'],
    paymentMethods: ['Bank Transfer', 'Card', 'Finance Available']
  },
  {
    id: '3',
    name: 'Swift Build Solutions',
    logo: '⚡',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=200&fit=crop&crop=center',
    rating: 4.7,
    reviewCount: 203,
    priceRange: '£20k - £60k',
    specialties: ['Quick Renovations', 'Bathroom Fitting', 'Small Extensions'],
    location: 'London & Home Counties',
    experience: '8+ years',
    description: 'Fast, reliable, and affordable construction services with guaranteed completion times.',
    verified: true,
    responseTime: 'Within 6 hours',
    completedProjects: 680,
    phone: '+44 20 3456 7890',
    email: 'contact@swiftbuildsolutions.co.uk',
    website: 'www.swiftbuildsolutions.co.uk',
    certifications: ['CSCS', 'CITB'],
    insurance: '£1M Public Liability',
    warranty: '3 years workmanship',
    portfolio: ['Quick Kitchen', 'Bathroom Makeover', 'Small Extension'],
    availability: 'Available next week',
    teamSize: 6,
    languages: ['English', 'Portuguese'],
    paymentMethods: ['Bank Transfer', 'Card', 'Cash']
  },
  {
    id: '4',
    name: 'Luxury Living Builders',
    logo: '✨',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=200&fit=crop&crop=center',
    rating: 4.9,
    reviewCount: 156,
    priceRange: '£60k - £200k+',
    specialties: ['Luxury Renovations', 'Bespoke Kitchens', 'High-End Extensions'],
    location: 'Central London',
    experience: '20+ years',
    description: 'Premium construction services for discerning clients who demand the highest quality and finish.',
    verified: true,
    responseTime: 'Within 48 hours',
    completedProjects: 280,
    phone: '+44 20 9876 5432',
    email: 'enquiries@luxurylivingbuilders.com',
    website: 'www.luxurylivingbuilders.com',
    certifications: ['CSCS', 'CITB', 'RIBA', 'FMB Fellow'],
    insurance: '£10M Public Liability',
    warranty: '15 years structural',
    portfolio: ['Mansion Renovation', 'Bespoke Kitchen', 'Luxury Extension'],
    availability: 'Available in 6 weeks',
    teamSize: 15,
    languages: ['English', 'French', 'German', 'Russian'],
    paymentMethods: ['Bank Transfer', 'Card', 'Private Banking']
  },
  {
    id: '5',
    name: 'EcoBuild Solutions',
    logo: '🌱',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=200&fit=crop&crop=center',
    rating: 4.6,
    reviewCount: 94,
    priceRange: '£30k - £80k',
    specialties: ['Eco Renovations', 'Sustainable Materials', 'Energy Efficiency'],
    location: 'London & Surrey',
    experience: '10+ years',
    description: 'Leading sustainable construction specialists focused on eco-friendly materials and energy-efficient solutions.',
    verified: true,
    responseTime: 'Within 18 hours',
    completedProjects: 180,
    phone: '+44 20 2468 1357',
    email: 'info@ecobuildsolutions.co.uk',
    website: 'www.ecobuildsolutions.co.uk',
    certifications: ['CSCS', 'CITB', 'BREEAM', 'Passivhaus'],
    insurance: '£3M Public Liability',
    warranty: '7 years structural',
    portfolio: ['Eco Kitchen', 'Passivhaus Extension', 'Sustainable Bathroom'],
    availability: 'Available in 4 weeks',
    teamSize: 10,
    languages: ['English', 'German', 'Swedish'],
    paymentMethods: ['Bank Transfer', 'Card', 'Green Finance']
  },
  {
    id: '6',
    name: 'Heritage Restoration Co',
    logo: '🏛️',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=200&fit=crop&crop=center',
    rating: 4.8,
    reviewCount: 67,
    priceRange: '£50k - £150k',
    specialties: ['Period Properties', 'Heritage Restoration', 'Listed Buildings'],
    location: 'London & Kent',
    experience: '25+ years',
    description: 'Specialists in period property restoration and heritage building conservation with traditional craftsmanship.',
    verified: true,
    responseTime: 'Within 36 hours',
    completedProjects: 120,
    phone: '+44 20 1357 2468',
    email: 'restoration@heritagebuilders.co.uk',
    website: 'www.heritagebuilders.co.uk',
    certifications: ['CSCS', 'CITB', 'SPAB', 'IHBC'],
    insurance: '£5M Public Liability',
    warranty: '10 years structural',
    portfolio: ['Georgian Restoration', 'Victorian Renovation', 'Listed Building'],
    availability: 'Available in 8 weeks',
    teamSize: 8,
    languages: ['English', 'Latin'],
    paymentMethods: ['Bank Transfer', 'Cheque', 'Heritage Grants']
  }
];

function ContractorSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null);
  const [showProjectCreated, setShowProjectCreated] = useState(false);
  const [selectedContractorDetails, setSelectedContractorDetails] = useState<Contractor | null>(null);
  const [showContractorModal, setShowContractorModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Simulate loading time (3-5 seconds)
  useEffect(() => {
    const loadingTime = Math.random() * 2000 + 3000; // 3-5 seconds
    
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

  const handleContractorClick = (contractor: Contractor) => {
    setSelectedContractorDetails(contractor);
    setShowContractorModal(true);
  };

  const handleContractorSelect = (contractorId: string) => {
    setSelectedContractor(contractorId);
    setShowProjectCreated(true);
    setShowContractorModal(false);
    
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Finding Best Contractors</h2>
          <p className="text-gray-600 mb-4">We&apos;re analyzing your requirements and matching you with verified contractors...</p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div className="bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Choose Your Contractor</h1>
              <p className="text-gray-600 mt-1">
                Based on your {projectData?.projectType} project in {projectData?.location}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition font-medium"
              >
                Submit as Contractor
              </button>
              <button
                onClick={handleSkipSelection}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Summary */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Project Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Contractors Grid - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_CONTRACTORS.map((contractor) => (
            <div
              key={contractor.id}
              className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleContractorClick(contractor)}
            >
              {/* Contractor Image */}
              <div className="relative h-32 rounded-t-xl overflow-hidden">
                <img 
                  src={contractor.image} 
                  alt={contractor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute top-3 right-3">
                  {contractor.verified && (
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </div>
                  )}
                </div>
                <div className="absolute bottom-3 left-3">
                  <div className="text-2xl">{contractor.logo}</div>
                </div>
              </div>

              {/* Contractor Details */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{contractor.name}</h3>
                    <p className="text-gray-600 text-sm truncate">{contractor.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold text-gray-900">{contractor.rating}</span>
                      <span className="text-gray-500 text-sm ml-1">({contractor.reviewCount})</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{contractor.description}</p>

                <div className="mb-3">
                  <span className="text-sm text-gray-500">Price Range:</span>
                  <p className="font-semibold text-green-600 text-lg">{contractor.priceRange}</p>
                </div>

                <div className="mb-3">
                  <span className="text-sm text-gray-500 block mb-1">Specialties:</span>
                  <div className="flex flex-wrap gap-1">
                    {contractor.specialties.slice(0, 2).map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                    {contractor.specialties.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{contractor.specialties.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                  <span>Experience: {contractor.experience}</span>
                  <span>Projects: {contractor.completedProjects}+</span>
                </div>

                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Don&apos;t see the right contractor? We&apos;ll help you find more options in your project dashboard.
          </p>
          <button
            onClick={handleSkipSelection}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Continue to Project Dashboard
          </button>
        </div>
      </div>

      {/* Contractor Details Modal */}
      {showContractorModal && selectedContractorDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{selectedContractorDetails.name}</h2>
              <button
                onClick={() => setShowContractorModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Header Info */}
              <div className="flex flex-col lg:flex-row gap-6 mb-6">
                <div className="lg:w-1/3">
                  <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                    <img 
                      src={selectedContractorDetails.image} 
                      alt={selectedContractorDetails.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      {selectedContractorDetails.verified && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl mb-2">{selectedContractorDetails.logo}</div>
                    <div className="flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-xl">{selectedContractorDetails.rating}</span>
                      <span className="text-gray-500 ml-1">({selectedContractorDetails.reviewCount} reviews)</span>
                    </div>
                    <p className="text-gray-600">{selectedContractorDetails.location}</p>
                  </div>
                </div>

                <div className="lg:w-2/3">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedContractorDetails.name}</h3>
                  <p className="text-gray-600 mb-4">{selectedContractorDetails.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <span className="text-sm text-gray-500">Price Range</span>
                      <p className="font-bold text-green-600 text-xl">{selectedContractorDetails.priceRange}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Experience</span>
                      <p className="font-semibold text-gray-900">{selectedContractorDetails.experience}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Completed Projects</span>
                      <p className="font-semibold text-gray-900">{selectedContractorDetails.completedProjects}+</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Response Time</span>
                      <p className="font-semibold text-gray-900">{selectedContractorDetails.responseTime}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Availability</span>
                      <p className="font-semibold text-gray-900">{selectedContractorDetails.availability}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Team Size</span>
                      <p className="font-semibold text-gray-900">{selectedContractorDetails.teamSize} people</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedContractorDetails.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-900">{selectedContractorDetails.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-900">{selectedContractorDetails.email}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                      <span className="text-gray-900">{selectedContractorDetails.website}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Certifications & Insurance</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Certifications:</span>
                      <p className="text-gray-900">{selectedContractorDetails.certifications.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Insurance:</span>
                      <p className="text-gray-900">{selectedContractorDetails.insurance}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Warranty:</span>
                      <p className="text-gray-900">{selectedContractorDetails.warranty}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleContractorSelect(selectedContractorDetails.id)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Select This Contractor
                </button>
                <button
                  onClick={() => setShowContractorModal(false)}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit as Contractor Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Submit as Contractor</h2>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Join Our Contractor Network</h3>
                <p className="text-gray-600">Get verified and start receiving project opportunities from homeowners in your area.</p>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Areas</label>
                  <input type="text" placeholder="e.g., London, Surrey, Kent" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                  <input type="text" placeholder="e.g., Kitchen Renovations, Extensions, Bathroom Fitting" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select experience level</option>
                    <option>1-2 years</option>
                    <option>3-5 years</option>
                    <option>6-10 years</option>
                    <option>11-15 years</option>
                    <option>16+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                  <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tell us about your company and what makes you unique..."></textarea>
                </div>

                <div className="flex items-start">
                  <input type="checkbox" id="terms" className="mt-1 mr-3" />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition font-medium"
                  >
                    Submit Application
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
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
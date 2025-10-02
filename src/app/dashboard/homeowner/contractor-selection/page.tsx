'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface Contractor {
  id: string;
  name: string;
  image: string;
  logo?: string;
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
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  certifications: string[];
  insurance: string;
  teamSize: string;
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
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=200&fit=crop&crop=center&auto=format&q=80',
    logo: '🏗️',
    rating: 4.8,
    reviewCount: 127,
    priceRange: '£25k - £75k',
    specialties: ['Kitchen Renovations', 'Extensions', 'Bathroom Refits'],
    location: 'London & Surrounding Areas',
    experience: '15+ years',
    description: 'Specializing in high-end residential renovations with a focus on modern design and quality craftsmanship. We pride ourselves on delivering exceptional results and exceeding client expectations.',
    verified: true,
    responseTime: 'Within 24 hours',
    completedProjects: 450,
    contact: { phone: '020 7123 4567', email: 'info@premierconstruction.co.uk', website: 'https://www.premierconstruction.co.uk' },
    certifications: ['CITB', 'NICEIC', 'Gas Safe'],
    insurance: '£5M Public Liability',
    teamSize: '10-20'
  },
  {
    id: '2',
    name: 'Elite Home Improvements',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=200&fit=crop&crop=center&auto=format&q=80',
    logo: '🏠',
    rating: 4.9,
    reviewCount: 89,
    priceRange: '£40k - £120k',
    specialties: ['Whole House Renovations', 'Loft Conversions', 'Kitchen Design'],
    location: 'Greater London',
    experience: '12+ years',
    description: 'Award-winning contractor known for innovative designs and exceptional attention to detail. We transform homes into bespoke living spaces tailored to your vision.',
    verified: true,
    responseTime: 'Within 12 hours',
    completedProjects: 320,
    contact: { phone: '020 7987 6543', email: 'contact@elitehome.co.uk', website: 'https://www.elitehome.co.uk' },
    certifications: ['RIBA', 'FENSA', 'TrustMark'],
    insurance: '£10M Public Liability',
    teamSize: '20-50'
  },
  {
    id: '3',
    name: 'Swift Build Solutions',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=200&fit=crop&crop=center&auto=format&q=80',
    logo: '⚡',
    rating: 4.7,
    reviewCount: 203,
    priceRange: '£20k - £60k',
    specialties: ['Quick Renovations', 'Bathroom Fitting', 'Small Extensions'],
    location: 'London & Home Counties',
    experience: '8+ years',
    description: 'Fast, reliable, and affordable construction services with guaranteed completion times. Your project, delivered on time and within budget.',
    verified: true,
    responseTime: 'Within 6 hours',
    completedProjects: 680,
    contact: { phone: '020 7555 1234', email: 'info@swiftbuild.co.uk', website: 'https://www.swiftbuild.co.uk' },
    certifications: ['CHAS', 'SMAS', 'ISO 9001'],
    insurance: '£2M Public Liability',
    teamSize: '5-15'
  },
  {
    id: '4',
    name: 'Luxury Living Builders',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=200&fit=crop&crop=center&auto=format&q=80',
    logo: '✨',
    rating: 4.9,
    reviewCount: 156,
    priceRange: '£60k - £200k+',
    specialties: ['Luxury Renovations', 'Bespoke Kitchens', 'High-End Extensions'],
    location: 'Central London',
    experience: '20+ years',
    description: 'Premium construction services for discerning clients who demand the highest quality and finish. We create masterpieces, not just homes.',
    verified: true,
    responseTime: 'Within 48 hours',
    completedProjects: 280,
    contact: { phone: '020 7222 8888', email: 'enquiries@luxuryliving.co.uk', website: 'https://www.luxuryliving.co.uk' },
    certifications: ['NHBC', 'LABC', 'Considerate Constructors'],
    insurance: '£15M Public Liability',
    teamSize: '50+'
  }
];

function ContractorSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [selectedContractorId, setSelectedContractorId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
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

  const handleContractorClick = (contractorId: string) => {
    setSelectedContractorId(contractorId);
    setShowDetailModal(true);
  };

  const handleSelectContractor = (contractorId: string) => {
    // In a real app, this would trigger an API call to assign the contractor
    console.log(`Contractor ${contractorId} selected for the project.`);
    setShowDetailModal(false);
    router.push('/dashboard/homeowner'); // Redirect to dashboard after selection
  };

  const handleSkipSelection = () => {
    router.push('/dashboard/homeowner'); // Redirect to dashboard
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Finding Your Perfect Match</h2>
          <p className="text-gray-600 mb-4">We&apos;re analyzing your requirements and finding the best contractors...</p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div className="bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  const selectedContractor = MOCK_CONTRACTORS.find(c => c.id === selectedContractorId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Choose Your Contractor
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Based on your {projectData?.projectType} project in {projectData?.location}
              </p>
            </div>
            <div className="mt-0 ml-4 flex-shrink-0">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] hover:from-[#1a9cb3] hover:to-[#3a1780] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit as Contractor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Project Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Project Type</span>
              <p className="font-medium text-gray-900">{projectData?.projectType}</p>
            </div>
            <div>
              <span className="text-gray-500">Location</span>
              <p className="font-medium text-gray-900">{projectData?.location}</p>
            </div>
            <div>
              <span className="text-gray-500">Budget Range</span>
              <p className="font-medium text-gray-900">{projectData?.budgetRange}</p>
            </div>
            <div>
              <span className="text-gray-500">Timeline</span>
              <p className="font-medium text-gray-900">{projectData?.timeline}</p>
            </div>
          </div>
        </div>

        {/* Contractors Grid - 4 cards in 2x2 layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_CONTRACTORS.map((contractor) => (
            <div
              key={contractor.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={() => handleContractorClick(contractor.id)}
            >
              <div className="relative h-40 w-full">
                <Image
                  src={contractor.image}
                  alt={contractor.name}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                {contractor.verified && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{contractor.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{contractor.location}</p>
                <div className="flex items-center text-sm text-gray-700 mb-3">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{contractor.rating} ({contractor.reviewCount} reviews)</span>
                </div>
                <p className="text-green-600 font-bold text-lg mb-3">{contractor.priceRange}</p>
                <div className="flex flex-wrap gap-2">
                  {contractor.specialties.slice(0, 3).map((specialty, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSkipSelection}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-base"
          >
            Continue to Project Dashboard
          </button>
        </div>
      </div>

      {/* Contractor Detail Modal */}
      {showDetailModal && selectedContractor && (
        <ContractorDetailModal
          contractor={selectedContractor}
          onClose={() => setShowDetailModal(false)}
          onSelect={handleSelectContractor}
        />
      )}

      {/* Submit as Contractor Modal */}
      {showSubmitModal && (
        <SubmitContractorModal
          onClose={() => setShowSubmitModal(false)}
        />
      )}
    </div>
  );
}

// Contractor Detail Modal Component
interface ContractorDetailModalProps {
  contractor: Contractor;
  onClose: () => void;
  onSelect: (contractorId: string) => void;
}

const ContractorDetailModal: React.FC<ContractorDetailModalProps> = ({ contractor, onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Image */}
        <div className="relative h-48 w-full">
          <Image
            src={contractor.image}
            alt={contractor.name}
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4">
            <h2 className="text-white text-2xl font-bold">{contractor.name}</h2>
            <p className="text-gray-200 text-sm">{contractor.location}</p>
          </div>
          {contractor.verified && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center text-lg text-gray-700 mb-4">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{contractor.rating} ({contractor.reviewCount} reviews)</span>
          </div>

          <p className="text-gray-700 mb-4">{contractor.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Details</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li><span className="font-medium">Price Range:</span> {contractor.priceRange}</li>
                <li><span className="font-medium">Experience:</span> {contractor.experience}</li>
                <li><span className="font-medium">Completed Projects:</span> {contractor.completedProjects}+</li>
                <li><span className="font-medium">Response Time:</span> {contractor.responseTime}</li>
                <li><span className="font-medium">Team Size:</span> {contractor.teamSize}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {contractor.specialties.map((specialty, index) => (
                  <span key={index} className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full">
                    {specialty}
                  </span>
                ))}
              </div>
              <h4 className="font-semibold text-gray-800 mt-4 mb-2">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {contractor.certifications.map((cert, index) => (
                  <span key={index} className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <h4 className="font-semibold text-gray-800 mb-2">Contact Information</h4>
          <ul className="space-y-1 text-gray-600 text-sm mb-6">
            <li><span className="font-medium">Phone:</span> {contractor.contact.phone}</li>
            <li><span className="font-medium">Email:</span> {contractor.contact.email}</li>
            <li><span className="font-medium">Website:</span> <a href={contractor.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{contractor.contact.website}</a></li>
            <li><span className="font-medium">Insurance:</span> {contractor.insurance}</li>
          </ul>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={() => onSelect(contractor.id)}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Select {contractor.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Submit Contractor Modal Component
interface SubmitContractorModalProps {
  onClose: () => void;
}

const SubmitContractorModal: React.FC<SubmitContractorModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    specialties: '',
    experience: '',
    insurance: '',
    certifications: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(false);
    setSubmitSuccess(false);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Contractor submission data:', formData);
      setSubmitSuccess(true);
      // In a real app, you'd send this to your backend
    } catch (error) {
      console.error('Error submitting contractor application:', error);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Become a Verified Brixem Contractor</h2>
          <p className="text-gray-600 mb-6">Fill out the form below to submit your company for verification and join our network of trusted contractors.</p>

          {submitSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Your application has been submitted. We will review it shortly.</span>
            </div>
          )}

          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> There was an issue submitting your application. Please try again.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                name="companyName"
                id="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                id="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website (Optional)</label>
              <input
                type="url"
                name="website"
                id="website"
                value={formData.website}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="specialties" className="block text-sm font-medium text-gray-700">Specialties (e.g., Kitchens, Extensions)</label>
              <input
                type="text"
                name="specialties"
                id="specialties"
                value={formData.specialties}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <input
                type="text"
                name="experience"
                id="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="insurance" className="block text-sm font-medium text-gray-700">Insurance Details (e.g., £5M Public Liability)</label>
              <input
                type="text"
                name="insurance"
                id="insurance"
                value={formData.insurance}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="certifications" className="block text-sm font-medium text-gray-700">Certifications (e.g., Gas Safe, NICEIC)</label>
              <input
                type="text"
                name="certifications"
                id="certifications"
                value={formData.certifications}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Additional Message</label>
              <textarea
                name="message"
                id="message"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

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
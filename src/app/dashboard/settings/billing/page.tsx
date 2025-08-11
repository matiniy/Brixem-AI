'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/PrimaryButton';

interface UsageSummary {
  plan: 'free' | 'plus';
  usage: Record<string, { current: number; limit: number; percentage: number }>;
}

export default function BillingPage() {
  const router = useRouter();
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsageSummary();
  }, []);

  const loadUsageSummary = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement actual usage summary loading
      // For now, show mock data
      setUsageSummary({
        plan: 'free',
        usage: {
          generate_doc: { current: 2, limit: 5, percentage: 40 },
          chat: { current: 15, limit: 50, percentage: 30 },
          export_pdf: { current: 3, limit: 10, percentage: 30 }
        }
      });
    } catch (error) {
      console.error('Error loading usage summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    // TODO: Implement Stripe checkout
    alert('Upgrade to Plus feature coming soon! This will integrate with Stripe for secure payments.');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/homeowner')}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              
              <h1 className="text-xl font-semibold text-gray-900">Billing & Usage</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Plan</h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900">
                      {usageSummary?.plan === 'plus' ? 'Plus Plan' : 'Free Plan'}
                    </h3>
                    <p className="text-blue-700">
                      {usageSummary?.plan === 'plus' 
                        ? 'Unlimited access to all features' 
                        : 'Basic features with usage limits'
                      }
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-900">
                      {usageSummary?.plan === 'plus' ? '$29' : '$0'}
                    </div>
                    <div className="text-blue-700">per month</div>
                  </div>
                </div>

                {usageSummary?.plan === 'free' && (
                  <PrimaryButton
                    onClick={handleUpgrade}
                    className="w-full"
                  >
                    Upgrade to Plus
                  </PrimaryButton>
                )}
              </div>

              {/* Plan Features */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">AI Document Generation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">PDF Export</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">AI Chat Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Project Management</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Usage</h3>
              
              <div className="space-y-4">
                {usageSummary && Object.entries(usageSummary.usage).map(([event, data]) => (
                  <div key={event} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 capitalize">
                        {event.replace('_', ' ')}
                      </span>
                      <span className="text-gray-500">
                        {data.current} / {data.limit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          data.percentage >= 80 ? 'bg-red-500' :
                          data.percentage >= 60 ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Usage Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Usage Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Documents are counted per generation</li>
                  <li>• Chat messages include AI responses</li>
                  <li>• PDF exports count toward monthly limit</li>
                  <li>• Limits reset on the 1st of each month</li>
                </ul>
              </div>
            </div>

            {/* Billing History */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
              
              {usageSummary?.plan === 'free' ? (
                <div className="text-center text-gray-500 py-4">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">No billing history for free plan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Plus Plan</div>
                      <div className="text-sm text-gray-500">Monthly subscription</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">$29.00</div>
                      <div className="text-sm text-gray-500">Jan 1, 2025</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

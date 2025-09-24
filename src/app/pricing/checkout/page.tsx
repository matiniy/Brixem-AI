"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

function CheckoutPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "monthly";
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [cardNumberError, setCardNumberError] = useState("");

  const getPlanDetails = () => {
    switch (plan) {
      case "free":
        return {
          name: "Free Plan",
          price: 0,
          description: "Explore the basics. No credit card needed.",
          features: ["1,000 Brixem Tokens", "1 active project slot", "Basic AI features"]
        };
      case "monthly":
        return {
          name: "Monthly Plan",
          price: 9.99,
          description: "Ideal for homeowners managing projects step by step.",
          features: ["50,000 Brixem Tokens", "Up to 3 active project slots", "Full access to all tools", "Export documents", "Editable templates"]
        };
      case "one-time-project":
        return {
          name: "One-Time Project Plan",
          price: 99,
          description: "Everything you need for one complete project.",
          features: ["Unlimited Brixem Tokens", "All premium tools unlocked", "Export unlimited documents", "Access compliance checkers", "Priority support"]
        };
      default:
        return {
          name: "Monthly Plan",
          price: 9.99,
          description: "Ideal for homeowners managing projects step by step.",
          features: ["50,000 Brixem Tokens", "Up to 3 active project slots", "Full access to all tools", "Export documents", "Editable templates"]
        };
    }
  };

  const planDetails = getPlanDetails();
  const subtotal = planDetails.price;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
    
    if (cleaned.length < 16) {
      setCardNumberError("Please enter a valid card number");
    } else {
      setCardNumberError("");
    }
  };

  const handleExpiryDateChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const formatted = cleaned.replace(/(\d{2})(\d{2})/, "$1/$2");
    setExpiryDate(formatted);
  };

  const handleCvvChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    setCvv(cleaned);
  };

  const handleCompletePayment = () => {
    // Mock payment processing
    localStorage.setItem("brixem_plan", plan);
    router.push("/dashboard/homeowner");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Order Summary</h2>
              
              {/* Plan Details */}
              <div className="space-y-4 mb-6 sm:mb-8">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{planDetails.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{planDetails.description}</p>
                    <div className="space-y-1">
                      {planDetails.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">
                      ${planDetails.price === 0 ? "0" : planDetails.price.toFixed(2)}
                    </span>
                    <div className="text-sm text-gray-500">
                      {plan === "monthly" ? "/month" : plan === "one-time-project" ? "/project" : ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 mb-6 sm:mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">30-Day Returns</span>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">Free Setup</span>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">Secure Payment</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Payment Information</h2>
              
              {/* Payment Method Selection */}
              <div className="mb-6 sm:mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === "card"
                        ? "border-[#23c6e6] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="font-medium">Credit/Debit Card</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod("paypal")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === "paypal"
                        ? "border-[#23c6e6] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-600 rounded"></div>
                      <span className="font-medium">PayPal</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod("apple")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === "apple"
                        ? "border-[#23c6e6] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-black rounded"></div>
                      <span className="font-medium">Apple Pay</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod("google")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === "google"
                        ? "border-[#23c6e6] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-500 rounded"></div>
                      <span className="font-medium">Google Pay</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Card Details */}
              {paymentMethod === "card" && (
                <div className="space-y-4 mb-6 sm:mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="4532 1234 5678 9012"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#23c6e6] focus:border-transparent ${
                          cardNumberError ? "border-red-500" : "border-gray-300"
                        }`}
                        maxLength={19}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                        <div className="w-6 h-4 bg-blue-600 rounded-sm opacity-60"></div>
                        <div className="w-6 h-4 bg-red-600 rounded-sm opacity-60"></div>
                        <div className="w-6 h-4 bg-yellow-600 rounded-sm opacity-60"></div>
                      </div>
                    </div>
                    {cardNumberError && (
                      <p className="text-red-500 text-sm mt-1">{cardNumberError}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => handleExpiryDateChange(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23c6e6] focus:border-transparent"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => handleCvvChange(e.target.value)}
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23c6e6] focus:border-transparent"
                          maxLength={4}
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23c6e6] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Billing Address Options */}
              <div className="space-y-3 mb-6 sm:mb-8">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="w-4 h-4 text-[#23c6e6] border-gray-300 rounded-sm focus:ring-[#23c6e6]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Same as shipping address</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={savePaymentMethod}
                    onChange={(e) => setSavePaymentMethod(e.target.checked)}
                    className="w-4 h-4 text-[#23c6e6] border-gray-300 rounded-sm focus:ring-[#23c6e6]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Save this payment method for future purchases</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  ← Back to Plans
                </button>
                <button
                  onClick={handleCompletePayment}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Complete Payment ${total.toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutPageInner />
    </Suspense>
  );
} 
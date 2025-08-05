"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LoginModal from "./LoginModal";
import ContactModal from "./ContactModal";
import SignupModal from "./SignupModal";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactModalType, setContactModalType] = useState<"sales" | "demo">("sales");

  return (
    <header className="relative flex items-center px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 bg-white border-b border-gray-100">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center">
          <span className="text-white font-bold text-xs sm:text-sm">B</span>
        </div>
        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-[#23c6e6] transition">brixem</span>
      </Link>
      <div className="flex-1 flex justify-center">
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-gray-700 font-medium">
          <Link href="/platform" className={`text-sm xl:text-base hover:text-gray-900 transition ${pathname.startsWith('/platform') ? 'text-[#23c6e6] font-semibold' : ''}`}>
            Platform
          </Link>
          <Link href="/solutions" className={`text-sm xl:text-base hover:text-gray-900 transition ${pathname.startsWith('/solutions') ? 'text-[#23c6e6] font-semibold' : ''}`}>
            Solutions
          </Link>
          <Link href="/pricing" className={`text-sm xl:text-base hover:text-gray-900 transition ${pathname.startsWith('/pricing') ? 'text-[#23c6e6] font-semibold' : ''}`}>
            Pricing
          </Link>
          <Link href="/" className={`text-sm xl:text-base hover:text-gray-900 transition ${pathname === '/' ? 'text-[#23c6e6] font-semibold' : ''}`}>
            Brixem AI
          </Link>
          <Link href="/about" className={`text-sm xl:text-base hover:text-gray-900 transition ${pathname.startsWith('/about') ? 'text-[#23c6e6] font-semibold' : ''}`}>
            About Us
          </Link>
        </nav>
      </div>

      {/* Desktop CTA Buttons */}
      <div className="hidden lg:flex items-center gap-3 xl:gap-4">
        <button 
          onClick={() => setShowLoginModal(true)}
          className="text-gray-700 hover:text-gray-900 font-medium transition text-sm xl:text-base"
        >
          Log in
        </button>
        <button 
          onClick={() => {
            setContactModalType("demo");
            setShowContactModal(true);
          }}
          className="px-3 xl:px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition text-sm xl:text-base"
        >
          Request demo
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition touch-manipulation"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu - Full Screen Modal */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 lg:hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
              <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="text-xl font-bold text-gray-900">brixem</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition touch-manipulation"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Navigation Links */}
            <div className="flex-1 px-6 py-8 space-y-6">
              <Link 
                href="/platform" 
                className={`block text-lg font-medium py-3 ${pathname.startsWith('/platform') ? 'text-[#23c6e6]' : 'text-gray-700'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Platform
              </Link>
              <Link 
                href="/solutions" 
                className={`block text-lg font-medium py-3 ${pathname.startsWith('/solutions') ? 'text-[#23c6e6]' : 'text-gray-700'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Solutions
              </Link>
              <Link 
                href="/pricing" 
                className={`block text-lg font-medium py-3 ${pathname.startsWith('/pricing') ? 'text-[#23c6e6]' : 'text-gray-700'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/" 
                className={`block text-lg font-medium py-3 ${pathname === '/' ? 'text-[#23c6e6]' : 'text-gray-700'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Brixem AI
              </Link>
              <Link 
                href="/about" 
                className={`block text-lg font-medium py-3 ${pathname.startsWith('/about') ? 'text-[#23c6e6]' : 'text-gray-700'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
            </div>
            
            {/* Action Buttons */}
            <div className="px-6 py-8 space-y-4 border-t border-gray-200">
              <button 
                onClick={() => {
                  setShowLoginModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-6 py-4 text-lg font-medium text-gray-700 hover:text-gray-900 transition"
              >
                Log in
              </button>
              <button 
                onClick={() => {
                  setContactModalType("demo");
                  setShowContactModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-6 py-4 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition text-lg touch-manipulation min-h-[48px]"
              >
                Request demo
              </button>
            </div>
          </div>
        </div>
      )}

            {/* Mobile CTA Buttons */}
            <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4">
              <button 
                className="w-full text-left text-gray-700 font-medium text-sm py-2 touch-manipulation"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowLoginModal(true);
                }}
              >
                Log in
              </button>
              <button 
                className="w-full text-left text-gray-700 font-medium text-sm py-2 touch-manipulation"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setContactModalType("demo");
                  setShowContactModal(true);
                }}
              >
                Request demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile CTA Button (visible when menu is closed) */}
      <button 
        onClick={() => {
          setContactModalType("demo");
          setShowContactModal(true);
        }}
        className="lg:hidden px-2 sm:px-3 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition text-xs sm:text-sm touch-manipulation"
      >
        <span className="hidden sm:inline">Demo</span>
        <span className="sm:hidden">Demo</span>
      </button>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      
      <SignupModal 
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
      
      <ContactModal 
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        type={contactModalType}
      />
    </header>
  );
} 
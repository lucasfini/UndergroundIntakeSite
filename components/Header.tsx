'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface HeaderProps {
  currentPage?: string
}

export const Header: React.FC<HeaderProps> = ({ currentPage = 'home' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/prices', label: 'Prices', id: 'prices' },
    { href: '/resources', label: 'Resources', id: 'resources' },
    { href: '/about', label: 'About Us', id: 'about' },
    { href: '/contact', label: 'Contact Us', id: 'contact' },
    { href: '/track', label: 'Track Progress', id: 'track' },
  ]

  const handleLogoClick = () => {
    // Clear all form-related sessionStorage when navigating to homepage
    sessionStorage.removeItem('formData')
    sessionStorage.removeItem('selectedPackage')
    sessionStorage.removeItem('selectedAddOns')
    sessionStorage.removeItem('totalPrice')
  }

  return (
    <>
      {/* Main Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 sm:h-20 lg:h-24">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition flex-shrink-0" onClick={handleLogoClick}>
            <Image
              src="/images/UG-Logo-Secondary-Colour.svg"
              alt="Underground Design Logo"
              width={300}
              height={300}
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56"
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6 xl:gap-8 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`px-3 lg:px-4 py-2 rounded transition text-sm lg:text-base whitespace-nowrap ${
                  currentPage === link.id
                    ? 'text-white'
                    : 'text-gray-700 hover:text-underground-teal'
                }`}
                style={currentPage === link.id ? { backgroundColor: '#A6E7DE', color: '#1C3450' } : {}}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section: Order Now Button and Login */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4 flex-shrink-0">
            <Link
              href="/select-service"
              className="px-4 lg:px-6 py-2 rounded hover:opacity-80 transition flex items-center gap-2 text-sm lg:text-base whitespace-nowrap"
              style={{ backgroundColor: '#A6E7DE', color: '#1C3450' }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              ORDER NOW
            </Link>

            <Link
              href="/admin"
              className={`px-3 lg:px-4 py-2 rounded transition text-sm lg:text-base whitespace-nowrap ${
                currentPage === 'admin'
                  ? ''
                  : 'text-gray-700 hover:text-underground-teal'
              }`}
              style={currentPage === 'admin' ? { backgroundColor: '#A6E7DE', color: '#1C3450' } : {}}
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 p-2 hover:bg-gray-100 rounded transition flex-shrink-0"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2 px-2">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded transition font-medium ${
                    currentPage === link.id
                      ? ''
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={currentPage === link.id ? { backgroundColor: '#A6E7DE', color: '#1C3450' } : {}}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/select-service"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded hover:opacity-80 transition text-center font-bold mt-2"
                style={{ backgroundColor: '#A6E7DE', color: '#1C3450' }}
              >
                ORDER NOW
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded transition font-medium ${
                  currentPage === 'admin'
                    ? ''
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={currentPage === 'admin' ? { backgroundColor: '#A6E7DE', color: '#1C3450' } : {}}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hours Banner */}
      <div className="py-2 px-4 sm:px-6 text-center" style={{ backgroundColor: '#A6E7DE', color: '#1C3450' }}>
        <p className="text-xs sm:text-sm font-medium">
          We are open Monday - Friday | 10am - 4pm
        </p>
      </div>
    </>
  )
}

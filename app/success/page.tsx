import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

interface SearchParams {
  ticketId?: string
  queuePosition?: string
}

export default async function SuccessPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const ticketId = params?.ticketId
  const queuePosition = params?.queuePosition

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header />

      {/* Success Message */}
      <div className="flex-1 max-w-3xl mx-auto px-6 py-16">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Request Submitted Successfully!
          </h2>

          <p className="text-lg text-gray-600 mb-8">
            Thank you for submitting your project request. Our team will review your
            submission and get back to you within 1-2 business days.
          </p>

          {/* Tracking Information */}
          {ticketId && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 text-left">
              <h3 className="font-bold text-lg mb-3 text-blue-900">Track Your Project</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-blue-700 mb-1">Your Tracking ID:</p>
                  <p className="font-mono font-bold text-blue-900 text-lg">{ticketId}</p>
                </div>
                {queuePosition && (
                  <div>
                    <p className="text-sm text-blue-700 mb-1">Current Queue Position:</p>
                    <p className="font-bold text-blue-900">#{queuePosition}</p>
                  </div>
                )}
                <Link
                  href={`/track/${ticketId}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mt-2"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Track Your Project Status
                </Link>
              </div>
            </div>
          )}

          <div className="bg-gray-50 border-l-4 border-underground-teal p-6 mb-8 text-left">
            <h3 className="font-bold text-lg mb-2">What happens next?</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-underground-teal mr-2">1.</span>
                <span>
                  You&rsquo;ll receive a confirmation email with your tracking link
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-underground-teal mr-2">2.</span>
                <span>Our team will review your project requirements</span>
              </li>
              <li className="flex items-start">
                <span className="text-underground-teal mr-2">3.</span>
                <span>We&rsquo;ll contact you to discuss next steps and timeline</span>
              </li>
              <li className="flex items-start">
                <span className="text-underground-teal mr-2">4.</span>
                <span>Track your project progress anytime using your tracking ID</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-blue-900">
              <strong>Need to make changes?</strong> Contact us at{' '}
              <a
                href="mailto:ugmanager@msu.mcmaster.ca"
                className="text-underground-teal hover:underline"
              >
                ugmanager@msu.mcmaster.ca
              </a>
            </p>
            <p className="text-sm text-blue-900 mt-2">
              <strong>Office Hours:</strong> Monday - Friday | 10am - 4pm
            </p>
          </div>

          <div className="space-x-4">
            <Link
              href="/select-service"
              className="inline-block px-6 py-3 bg-underground-teal text-white rounded-md hover:bg-underground-green transition"
            >
              Submit Another Request
            </Link>
            <Link
              href="/"
              className="inline-block px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-md hover:border-gray-400 transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}

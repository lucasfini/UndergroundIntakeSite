import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function ResourcesPage() {
  const resources = [
    { name: 'Postering Guidelines', href: '/PDFS/POSTER_Guidelines_2025.pdf' },
    { name: 'Large Format Pricing', href: '/PDFS/Large-format-cheat-sheet-01.webp' },
    { name: 'Poster Boards Zone 1', href: '/PDFS/Board-Maps-Zone-1.pdf' },
    { name: 'Poster Boards Zone 2', href: '/PDFS/Board-Maps-Zone-2.pdf' },
    { name: 'Poster Boards Zone 3', href: '/PDFS/Board-Maps-Zone-3.pdf' },
    { name: '18x24 Power Point Template', href: '/PDFS/18x24-Template.pptx' },
    { name: '24x36 Power Point Template', href: '/PDFS/36x24-Template.pptx' },
    { name: '36x48 Power Point Template', href: '/PDFS/48x36-Template.pptx' },
  ]

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#1C3450' }}>
      <Header currentPage="resources" />

      <div className="flex-1 w-full flex flex-col">
        {/* Resources Title */}
        <div className="w-full py-8 text-center" style={{ backgroundColor: '#1C3450', color: '#A6E7DE' }}>
          <h1 className="text-5xl md:text-6xl font-bold" style={{ fontFamily: 'Gotham Bold, Helvetica, Arial, sans-serif' }}>
            Resources
          </h1>
        </div>

        {/* Resources Links */}
        <div className="flex-1 w-full py-12 flex items-center justify-center" style={{ backgroundColor: '#A6E7DE' }}>
          <div className="max-w-5xl w-full px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-3xl md:text-5xl font-bold text-center py-6 px-6 hover:opacity-70 transition"
                  style={{ color: '#1C3450' }}
                >
                  {resource.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

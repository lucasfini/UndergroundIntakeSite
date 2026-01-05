import Link from 'next/link'

export const Footer: React.FC = () => {
  return (
    <footer className="py-6 sm:py-8 px-4 sm:px-6" style={{ backgroundColor: '#1C3450' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-2">
            <div className="h-px flex-1 max-w-32" style={{ backgroundColor: '#A6E7DE' }}></div>
            <p className="text-xs sm:text-sm font-semibold" style={{ color: '#A6E7DE' }}>
              UNDERGROUND MEDIA + DESIGN
            </p>
            <div className="h-px flex-1 max-w-32" style={{ backgroundColor: '#A6E7DE' }}></div>
          </div>
          <p className="text-xs sm:text-sm text-white/90 font-medium">
            © 2025 Underground Media + Design - McMaster Students Union
          </p>
          <div className="flex justify-center gap-4 text-xs text-white/75">
            <Link href="/about" className="hover:text-white transition" style={{ color: '#A6E7DE' }}>
              About Us
            </Link>
            <span className="text-white/50">|</span>
            <Link href="/contact" className="hover:text-white transition" style={{ color: '#A6E7DE' }}>
              Contact
            </Link>
            <span className="text-white/50">|</span>
            <Link href="/prices" className="hover:text-white transition" style={{ color: '#A6E7DE' }}>
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

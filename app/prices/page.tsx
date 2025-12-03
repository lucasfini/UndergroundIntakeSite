import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function PricesPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#1C3450' }}>
      <Header currentPage="prices" />

      <div className="flex-1 w-full">
        {/* 2025 Price List Title */}
        <div className="w-full py-6 sm:py-8 md:py-10 lg:py-12 text-center px-4" style={{ backgroundColor: '#1C3450', color: '#A6E7DE' }}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold" style={{ fontFamily: 'Gotham Bold, Helvetica, Arial, sans-serif' }}>
            2025 Price List
          </h1>
        </div>

        {/* Disclaimer Text */}
        <div className="w-full py-4 sm:py-5 md:py-6 text-center px-4 sm:px-6" style={{ backgroundColor: '#A6E7DE', color: '#1C3450' }}>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1">*Prices subject to change.</p>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">*Additional charges may be incurred for setup fees.</p>
        </div>

        {/* Price List Image */}
        <div className="w-full py-6 sm:py-8 md:py-10 lg:py-12 flex justify-center items-center" style={{ backgroundColor: '#1C3450' }}>
          <div className="max-w-7xl w-full px-4 sm:px-6 md:px-8 lg:px-12">
            <Image
              src="/images/TV_Price-List_Web_2025_UG_PriceSCREEN_sep2022-1024x475.webp"
              alt="Underground Design Price List"
              width={1024}
              height={475}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* Click here to order */}
        <div className="w-full py-6 sm:py-8 md:py-10 text-center px-4" style={{ backgroundColor: '#A6E7DE', color: '#1C3450' }}>
          <Link href="/select-service" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold hover:opacity-80 transition">
            Click here to order!
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}

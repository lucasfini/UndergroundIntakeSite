import Image from 'next/image'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#1C3450' }}>
      <Header currentPage="about" />

      <div className="flex-1 w-full flex flex-col">
        {/* About Us Title */}
        <div className="w-full py-8 text-center" style={{ backgroundColor: '#1C3450', color: '#A6E7DE' }}>
          <h1 className="text-5xl md:text-6xl font-bold" style={{ fontFamily: 'Gotham Bold, Helvetica, Arial, sans-serif' }}>
            About Us
          </h1>
        </div>

        {/* Main Content */}
        <div className="w-full py-12" style={{ backgroundColor: '#A6E7DE' }}>
          <div className="max-w-5xl mx-auto px-6">
            {/* The MSU Underground Section */}
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#1C3450' }}>
                The MSU Underground
              </h2>
              <p className="text-lg md:text-xl leading-relaxed mb-8" style={{ color: '#1C3450' }}>
                We are a full service graphic design studio and print shop located on the McMaster University Campus. We service both the McMaster Community and the Hamilton Community at large. Our student-centric origins give us a unique edge when it comes to making designs that are trending and topical.
              </p>
              <p className="text-lg md:text-xl leading-relaxed" style={{ color: '#1C3450' }}>
                What makes us special is that we not only design your project, but we also take care of the printing and production, making us a one-stop shop for all your marketing collateral. Our staff has extensive experience in the Design and Printing industries so you know we have seen it all! Apparel, stickers, signage, printed material, vinyl are all part of our daily lives at The Underground. You can trust that we will do everything we can to make your idea into a reality.
              </p>
            </div>

            {/* Image */}
            <div className="mb-12 flex justify-center">
              <Image
                src="/images/DSC0042-min-1024x683.jpg"
                alt="Underground Design Studio"
                width={1024}
                height={683}
                className="w-full max-w-4xl h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Three Columns Section */}
        <div className="w-full py-12" style={{ backgroundColor: '#1C3450' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Experienced */}
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#A6E7DE' }}>
                  Experienced
                </h3>
                <p className="text-lg" style={{ color: '#A6E7DE' }}>
                  Our staff has a combined 35 years of experience in Design and Production at our disposal to help make your vision a reality.
                </p>
              </div>

              {/* Versatile */}
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#A6E7DE' }}>
                  Versatile
                </h3>
                <p className="text-lg" style={{ color: '#A6E7DE' }}>
                  We spend just as much time designing for students on campus as we do for businesses in the Hamilton community.
                </p>
              </div>

              {/* Well Equipped */}
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#A6E7DE' }}>
                  Well Equipped
                </h3>
                <p className="text-lg" style={{ color: '#A6E7DE' }}>
                  We don&apos;t just design your project, we also make sure it is printed to perfection and meets our high standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

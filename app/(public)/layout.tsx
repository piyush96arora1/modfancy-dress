import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { MobileBottomNav } from '@/components/public/MobileBottomNav'
import { EnquiryBasketProvider } from '@/lib/context/EnquiryBasketContext'
import { PricingModeProvider } from '@/lib/context/PricingModeContext'
import { FloatingEnquiryBadge } from '@/components/public/FloatingEnquiryBadge'
import { LocalBusinessSchema } from '@/lib/seo/structured-data'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const localBusinessJsonLd = LocalBusinessSchema()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
    <PricingModeProvider>
      <EnquiryBasketProvider>
        <div className="min-h-screen flex flex-col bg-[#FAFAF8] overflow-x-hidden">
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 pb-24 md:pb-8 page-enter overflow-x-hidden">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <FloatingEnquiryBadge />
        </div>
      </EnquiryBasketProvider>
    </PricingModeProvider>
    </>
  )
}

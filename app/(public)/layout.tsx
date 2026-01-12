import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 bg-white">{children}</main>
      <Footer />
    </div>
  )
}







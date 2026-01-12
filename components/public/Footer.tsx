import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-gray-50 to-white mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-2">
            <h3 className="font-bold text-2xl mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mod Fancy Dress
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed max-w-md">
              Your one-stop shop for premium fancy dress costumes and accessories. Discover unique outfits for every occasion.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-indigo-600 transition-colors inline-block">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-600 hover:text-indigo-600 transition-colors inline-block">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-indigo-600 transition-colors inline-block">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Contact</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              For inquiries, please contact us through the order form.
            </p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Mod Fancy Dress. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}







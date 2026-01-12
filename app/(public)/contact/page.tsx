import Link from 'next/link'
import { Phone, MessageCircle, MapPin, Calendar, Award, ExternalLink, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { ReviewSchema, OrganizationSchema } from '@/lib/seo/structured-data'

export const metadata = generatePageMetadata({
  title: 'Contact Us - Mod Fancy Dress | Delhi Fancy Dress Shop',
  description: 'Contact Mod Fancy Dress in Delhi. 15+ years experience, 400+ school functions. Call +91 92110 77110 or WhatsApp. Visit us at S64 South Anarkali, Krishna Nagar, Delhi 110051.',
  path: '/contact',
})

export default function ContactPage() {
  const reviewSchema = ReviewSchema()
  const localBusinessSchema = OrganizationSchema()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <div className="px-4 md:px-0 bg-white">
      <div className="max-w-4xl mx-auto py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600">
            We're here to help you find the perfect fancy dress costume
          </p>
        </div>

        {/* About Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 md:p-8 mb-8 border border-indigo-100">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">About Us</h2>
              <p className="text-gray-700 leading-relaxed">
                We have been in the fancy dress business for over <strong>15 years</strong>. 
                We have successfully completed more than <strong>400 school functions</strong> of all sizes - 
                from small events to large celebrations. Our experience and dedication make us your trusted 
                partner for all your fancy dress costume needs.
              </p>
            </div>
          </div>
        </div>

        {/* Bulk Orders Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 mb-8 border-2 border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Bulk Orders</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Planning a large event or need multiple costumes? We specialize in bulk orders for school functions, 
                dance performances, and large celebrations. <strong>Contact us first</strong> and we'll create a 
                customized quotation tailored to your specific needs and budget.
              </p>
              <div className="bg-white rounded-xl p-4 mb-4 border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-2">Why Contact Us First?</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>Better pricing and discounts for bulk orders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>Customized quotation based on your requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>Flexible payment and delivery options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>Expert guidance on costume selection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>Dedicated support for your event</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="tel:+919211077110" className="flex-1">
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg">
                    <Phone className="w-5 h-5 mr-2" />
                    Call for Bulk Order Quote
                  </Button>
                </a>
                <a href="https://wa.me/919211077110?text=Hi, I'm interested in placing a bulk order. Can you help me with a quotation?" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-50">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp for Quote
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Phone Numbers */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Call Us</h3>
            </div>
            <div className="space-y-3">
              <a 
                href="tel:+919211077110" 
                className="block text-lg text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                +91 92110 77110
              </a>
              <a 
                href="tel:+919311365366" 
                className="block text-lg text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                +91 93113 65366
              </a>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">WhatsApp</h3>
            </div>
            <p className="text-gray-600 mb-4">Chat with us on WhatsApp</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="https://wa.me/919211077110" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Visit Us</h3>
            </div>
            <address className="text-gray-700 leading-relaxed not-italic">
              S64, South Anarkali<br />
              Som Bazar<br />
              Krishna Nagar<br />
              Delhi - 110051<br />
              India
            </address>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Business Hours</h3>
            </div>
            <div className="text-gray-700 space-y-2">
              <p><strong>Daily:</strong> 10:00 AM - 9:30 PM</p>
              <p className="text-sm text-gray-500">Open all days</p>
            </div>
          </div>
        </div>

        {/* Google Business Links */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Find Us Online</h3>
          <div className="space-y-4">
            <a 
              href="https://share.google/j5z6wKKjqsCHJKajh" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Google Business Profile</p>
                  <p className="text-sm text-gray-600">View our business information</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </a>
            
            <a 
              href="https://g.page/r/CdvlhuNtrqb5EAI/review" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Leave a Review</p>
                  <p className="text-sm text-gray-600">Share your experience with us</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </a>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Need help choosing the perfect costume?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+919211077110">
              <Button size="lg" className="w-full sm:w-auto">
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </Button>
            </a>
            <a href="https://wa.me/919211077110" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp Us
              </Button>
            </a>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
              <p className="text-gray-600">4.7 out of 5 stars from 700+ reviews</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Review 1 */}
            <div className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-bold text-lg">PS</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">Priya Sharma</h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">January 15, 2024</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Excellent service! They provided amazing costumes for our school annual function. 
                    Very professional and on-time delivery. Highly recommended!
                  </p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-lg">RK</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">Rajesh Kumar</h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">February 20, 2024</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Great quality costumes at reasonable prices. They have a huge collection and 
                    helped us choose the perfect outfits for our dance performance. Will definitely come back!
                  </p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-lg">AM</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">Anita Mehta</h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">March 10, 2024</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    15 years of experience shows! They understand school requirements perfectly. 
                    Completed our function smoothly. Highly recommended for school functions.
                  </p>
                </div>
              </div>
            </div>

            {/* Review 4 */}
            <div className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-pink-600 font-bold text-lg">VS</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">Vikram Singh</h4>
                    <div className="flex items-center gap-1">
                      {[...Array(4)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                      <Star className="w-4 h-4 text-gray-300" />
                    </div>
                    <span className="text-sm text-gray-500">April 5, 2024</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Best fancy dress shop in Delhi. They have completed 400+ school functions and 
                    it shows in their service quality. Great collection and reasonable prices.
                  </p>
                </div>
              </div>
            </div>

            {/* Review 5 */}
            <div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600 font-bold text-lg">SD</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">Sunita Devi</h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">May 12, 2024</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Very reliable and professional. They delivered exactly what we needed for our 
                    school event. Will definitely use their services again. Thank you!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Reviews Link */}
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-gray-600 mb-4">Read more reviews or share your experience</p>
            <a 
              href="https://g.page/r/CdvlhuNtrqb5EAI/review" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              <Award className="w-5 h-5" />
              Leave a Review on Google
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}


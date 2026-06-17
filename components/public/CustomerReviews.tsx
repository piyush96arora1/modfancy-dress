import { Star } from 'lucide-react'

// Visible testimonials only — intentionally NO Review/AggregateRating JSON-LD,
// per Google's policy against marking up third-party (Google) reviews as
// first-party rich-result data.

export function CustomerReviews({
  reviews,
  gbpUrl,
}: {
  reviews: { author: string; text: string }[]
  gbpUrl?: string
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-[#1B2A4A] mb-1 font-[family-name:var(--font-outfit)]">
        What Our Customers Say
      </h2>
      <p className="text-sm text-[#6B6B6B] mb-4">
        Rated 4.7&#9733; across 726+ Google reviews
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((review) => (
          <div
            key={review.author}
            className="bg-white rounded-xl p-4 border border-[#E8E5E0]"
          >
            <div className="flex items-center gap-0.5 mb-2" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-[#C8956C] text-[#C8956C]"
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
              {review.text}
            </p>
            <p className="text-sm font-medium text-[#2D2D2D]">&mdash; {review.author}</p>
          </div>
        ))}
      </div>

      {gbpUrl && (
        <a
          href={gbpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#C8956C] hover:underline mt-4"
        >
          Read all reviews on Google &rarr;
        </a>
      )}
    </section>
  )
}

import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { GenderCollectionPage } from '@/components/public/GenderCollectionPage'

export const revalidate = 604800 // weekly; edits revalidate on demand via /api/revalidate

const PATH = '/fancy-dress-for-girls'

export const metadata = generatePageMetadata({
  title: 'Fancy Dress for Girls: Kids Costumes',
  description:
    'Fancy dress for girls: sarees, lehengas, Kathak dresses, frocks, Jhansi ki Rani and more. Buy with delivery across India or rent in Delhi NCR.',
  path: PATH,
  keywords: [
    'fancy dress for girls',
    'fancy dress for kids girl',
    'girls fancy dress costume',
    'fancy dress competition for girls',
    'girls fancy dress on rent',
  ],
})

const link = 'text-[#8F6240] hover:underline font-medium'

const FAQS = [
  {
    question: 'What are good fancy dress ideas for girls?',
    answer:
      'For Republic Day and Independence Day, Jhansi ki Rani, Bharat Mata, Indira Gandhi and Mother Teresa are the classics. For festivals and school plays, Radha, Sita and Maa Durga. For state or Unity in Diversity days, a saree or lehenga from Punjab, Haryana, Rajasthan, Bengal, Assam or Maharashtra. Younger girls love an angel, Snow White, a mermaid or a frock for a western dance.',
  },
  {
    question: 'Which ages do your girls’ costumes fit?',
    answer:
      'Most girls’ costumes come in kids’ sizes from about 3 to 13 years, and several dance dresses also come in teen sizes. Send your daughter’s age and height on WhatsApp and we will confirm the size before you buy or rent.',
  },
  {
    question: 'Can I rent a fancy dress for my daughter instead of buying?',
    answer:
      'Yes. Every costume on this page is available on rent for your event in Delhi NCR. You pay the rent with a refundable deposit, and the deposit comes back in full when the costume is returned. WhatsApp us the costume name for the rent and to book it.',
  },
  {
    question: 'Do you deliver girls’ fancy dress outside Delhi?',
    answer:
      'Bought costumes are sent by courier anywhere in India. Rentals are for Delhi NCR: pick up from our Krishna Nagar shop in East Delhi, or book a Porter or Rapido and we send it to your door in Delhi, Noida, Gurgaon, Ghaziabad or Faridabad.',
  },
  {
    question: 'Can a school order costumes for a whole class or dance group?',
    answer:
      'Yes. Send the list of costumes and sizes on WhatsApp for a group rate. Schools and dance academies also buy in bulk through our wholesale page. Book a week ahead between November and February, when annual functions keep costumes busy.',
  },
]

export default function FancyDressForGirlsPage() {
  return (
    <GenderCollectionPage
      audience="girls"
      path={PATH}
      heading="Fancy Dress for Girls"
      intro={(count) => (
        <>
          {count} girls’ costumes for school competitions, annual functions and dance. Buy online or rent in Delhi NCR.
        </>
      )}
      faqs={FAQS}
      whatsappText="Hi, I am looking for a fancy dress for my daughter. Can you help with the size?"
      guide={
        <>
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
            Choosing a fancy dress for your daughter
          </h2>
          <p>
            <strong className="text-[#2D2D2D]">Annual function.</strong> Dance items need a costume that spins well:
            a <Link href="/category/kathak-dress" className={link}>Kathak dress</Link>, a Bharatnatyam set, a Haryanvi or
            Rajasthani lehenga, a Giddha suit or a sequin frock for a western number. Group items look best in one design
            in matching sizes.
          </p>
          <p>
            <strong className="text-[#2D2D2D]">Republic Day.</strong> Pick a leader or a symbol of India: Jhansi ki Rani,
            Bharat Mata, Indira Gandhi or a Tiranga dress from our{' '}
            <Link href="/category/leaders-freedom-fighters" className={link}>freedom fighter costumes</Link>. One clear
            prop, like Rani Laxmi Bai’s sword or Bharat Mata’s flag, makes the character easy to recognise from the back row.
          </p>
          <p>
            <strong className="text-[#2D2D2D]">Children’s Day and competitions.</strong> Little girls of 3 to 6 do well
            with a character the judges know at a glance, such as an angel, Snow White, a mermaid or Chutki. Older girls
            can carry a role with a line or two of dialogue, like Sita, Radha or Mother Teresa.
          </p>
          <p>
            <strong className="text-[#2D2D2D]">Christmas.</strong> An angel dress or a Santa costume covers the school
            Christmas programme and the nativity play.
          </p>
          <p>
            <strong className="text-[#2D2D2D]">Buy or rent.</strong> Buy if she will wear it again or you live outside
            Delhi NCR; we courier across India. For a one-day event, rent it: every costume here is available on rent with
            a refundable deposit. Try sizes at our{' '}
            <Link href="/fancy-dress-delhi" className={link}>Krishna Nagar shop</Link> or get delivery across Delhi NCR.
            See <Link href="/rent" className={link}>how renting works</Link>.
          </p>
        </>
      }
    />
  )
}

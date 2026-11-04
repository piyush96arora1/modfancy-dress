import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { GenderCollectionPage } from '@/components/public/GenderCollectionPage'

export const revalidate = 604800 // weekly; edits revalidate on demand via /api/revalidate

const PATH = '/fancy-dress-for-boys'

export const metadata = generatePageMetadata({
  title: 'Fancy Dress for Boys: Competition Costumes',
  description:
    'Fancy dress for boys: Krishna, Ram, Hanuman, Nehru, Gandhi, police, army, Bhangra and state dresses for school competitions. Buy or rent in Delhi NCR.',
  path: PATH,
  keywords: [
    'fancy dress for boys',
    'fancy dress for boys competition',
    'boys fancy dress costume',
    'fancy dress for kids boy',
    'boys fancy dress on rent',
  ],
})

const link = 'text-[#8F6240] hover:underline font-medium'

const FAQS = [
  {
    question: 'What are good fancy dress ideas for boys in a school competition?',
    answer:
      'Freedom fighters win often because the judges know them instantly: Jawaharlal Nehru for Children’s Day, Mahatma Gandhi, Subhash Chandra Bose or Bal Gangadhar Tilak for Republic Day. Krishna, Ram, Laxman and Hanuman suit festivals and Ramleela plays. Police, army, air force and fire fighter costumes work for a community-helpers theme, and Iron Man, Hulk or Balveer for a superhero day.',
  },
  {
    question: 'Which ages do your boys’ costumes fit?',
    answer:
      'Most boys’ costumes come in kids’ sizes from about 3 to 13 years. Send your son’s age and height on WhatsApp and we will confirm the size before you buy or rent.',
  },
  {
    question: 'Can I rent a fancy dress for my son instead of buying?',
    answer:
      'Yes. Every costume on this page is available on rent for your event in Delhi NCR. You pay the rent with a refundable deposit, and the deposit comes back in full when the costume is returned. WhatsApp us the costume name for the rent and to book it.',
  },
  {
    question: 'Do you deliver boys’ fancy dress outside Delhi?',
    answer:
      'Bought costumes are sent by courier anywhere in India. Rentals are for Delhi NCR: pick up from our Krishna Nagar shop in East Delhi, or book a Porter or Rapido and we send it to your door in Delhi, Noida, Gurgaon, Ghaziabad or Faridabad.',
  },
  {
    question: 'Can a school order costumes for a whole class or Bhangra group?',
    answer:
      'Yes. Send the list of costumes and sizes on WhatsApp for a group rate. Schools and dance academies also buy in bulk through our wholesale page. Book a week ahead between November and February, when annual functions keep costumes busy.',
  },
]

export default function FancyDressForBoysPage() {
  return (
    <GenderCollectionPage
      audience="boys"
      path={PATH}
      heading="Fancy Dress for Boys"
      intro={(count) => (
        <>
          {count} boys’ costumes for fancy dress competitions, annual functions and plays. Buy online or rent in Delhi NCR.
        </>
      )}
      faqs={FAQS}
      whatsappText="Hi, I am looking for a fancy dress for my son. Can you help with the size?"
      guide={
        <>
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
            Choosing a fancy dress for your son
          </h2>
          <p>
            <strong className="text-[#2D2D2D]">Fancy dress competition.</strong> Pick a character the judges recognise
            from the back row, then add one prop and one line. A Nehru jacket with a rose, Gandhi’s lathi and glasses or
            Krishna’s flute and mukut do more than an elaborate outfit nobody can place.
          </p>
          <p>
            <strong className="text-[#2D2D2D]">Children’s Day and Republic Day.</strong> Nehru on 14 November; Gandhi,
            Bose, Tilak, Mangal Pandey or an army uniform on 26 January. See all our{' '}
            <Link href="/category/leaders-freedom-fighters" className={link}>freedom fighter costumes</Link> and{' '}
            <Link href="/category/republic-day-dress" className={link}>Republic Day dresses</Link>.
          </p>
          <p>
            <strong className="text-[#2D2D2D]">Annual function.</strong> Dance items need a costume that moves:{' '}
            <Link href="/category/bhangra-dress" className={link}>Bhangra kurta and lungi</Link>, a Gujarati kediyu,
            Rajasthani angrakha and dhoti, a state dress for a Unity in Diversity item, or a ballroom suit for a western
            number. For a Ramayan play, choose Ram, Laxman, Hanuman, Raja Dashrath or Ravan from our{' '}
            <Link href="/category/ramleela-costumes" className={link}>Ramleela costumes</Link>.
          </p>
          <p>
            <strong className="text-[#2D2D2D]">Christmas.</strong> A Santa costume in kids’ sizes covers the school
            Christmas programme.
          </p>
          <p>
            <strong className="text-[#2D2D2D]">Buy or rent.</strong> Buy if he will wear it again or you live outside
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

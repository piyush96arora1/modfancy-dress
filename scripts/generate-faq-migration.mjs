/**
 * Generates supabase/migrations/026_faqs.sql from seed rows.
 * Run: node scripts/generate-faq-migration.mjs
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const rows = [
  {
    section: 'general',
    question: 'How do I place an order?',
    answer:
      "Browse our collection online and add items to your cart, or WhatsApp us directly at +91 92110 77110 with the costume name and your child's size. We're available daily from 10 AM to 9:30 PM.",
    sort_order: 1,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'general',
    question: 'Do you sell online or only from your Krishna Nagar store?',
    answer:
      'Both. You can order online through our website and we ship across India, or visit us in person at S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051. Walk-in customers can see and try costumes before buying.',
    sort_order: 2,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'general',
    question: 'How many days before the event should I order?',
    answer:
      'Order at least 10–15 days before the event. This gives time for delivery, checking the fit, and making any adjustments if needed. For bulk school orders, we recommend 3–4 weeks minimum.',
    sort_order: 3,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'general',
    question: 'Do you offer Cash on Delivery (COD)?',
    answer:
      'WhatsApp us to confirm COD availability for your location. Prepaid orders are processed and dispatched faster.',
    sort_order: 4,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'sizing',
    question: 'How do I choose the right size for my child?',
    answer:
      'Our costumes are available in age-based sizes — 3-5 yrs, 6-8 yrs, 8-10 yrs, and 11-13 yrs for most dance and performance costumes. If your child is between sizes, always go one size up. This gives more room for movement on stage and allows for minor alterations. For accessories like pagdis and turbans, one size fits all.',
    sort_order: 1,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'sizing',
    question: "What if the costume doesn't fit after delivery?",
    answer:
      'WhatsApp us immediately with a photo showing the fit issue. We will guide you on alteration options or exchange. Please contact us within 24 hours of receiving the order.',
    sort_order: 2,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'sizing',
    question: 'Do you offer costumes for adults?',
    answer:
      "Yes. Several categories including Bhangra suits, Lavani sarees, Bharatnatyam costumes, and some folk dance costumes are available in adult sizes. WhatsApp us and we'll confirm availability for your specific requirement.",
    sort_order: 3,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'school_bulk',
    question: 'Do you take bulk orders for schools?',
    answer:
      'Yes, this is one of our specialities. We have supplied costumes to 400+ school functions across Delhi NCR. For bulk orders of 5 or more pieces, contact us on WhatsApp for special pricing. For large school orders (20+ pieces), we recommend placing the order 3–4 weeks in advance.',
    sort_order: 1,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'school_bulk',
    question: 'Can our school order matching costumes for a group dance performance?',
    answer:
      "Absolutely. We stock multiple pieces of the same costume in matching colours and sizes — perfect for group items at annual functions and inter-school dance competitions. Share your requirements (costume type, quantity, sizes, event date) on WhatsApp and we'll send availability and pricing within 24 hours.",
    sort_order: 2,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'school_bulk',
    question: 'What is the minimum order quantity for wholesale pricing?',
    answer:
      'Wholesale prices apply from 5 pieces of the same costume. You can see our per-piece wholesale prices on our wholesale page. For larger quantities, contact us for a custom quote.',
    sort_order: 3,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'school_bulk',
    question: 'How long does delivery take for bulk school orders?',
    answer:
      'For ready stock, delivery takes 3–5 days across India. For specific colour combinations or large quantities that need to be arranged, allow 7–10 days. We recommend contacting us well before your event date to confirm stock.',
    sort_order: 4,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'costume_guidance',
    question: 'Which costume is best for a school annual function?',
    answer:
      'It depends on the theme your school has assigned. For cultural programmes, Rajasthani, Kashmiri, and Bharatnatyam costumes are always popular. For national events like Republic Day and Independence Day, freedom fighter costumes like Bhagat Singh, Mangal Pandey, and Mother Teresa work well. For younger children, fruit, vegetable, animal, and cartoon costumes are always crowd favourites. Browse our blog for detailed ideas by occasion.',
    sort_order: 1,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'costume_guidance',
    question: 'Which Kathak dress style is better for a school performance — anarkali or lehenga?',
    answer:
      'For school performances, anarkali style is more practical. It is easier to put on backstage quickly, and the single-piece design means nothing comes loose during spins and chakkars. Lehenga style looks more traditional and works well for recitals where there is more preparation time available.',
    sort_order: 2,
    show_on_blog: true,
    show_on_category: false,
    category_slugs: null,
  },
  {
    section: 'costume_guidance',
    question: 'What colours work best for stage performances?',
    answer:
      'Deep jewel tones photograph and perform best under stage lighting — red and gold, blue and gold, green and gold, purple and silver. Pastel colours tend to wash out under bright stage lights. If in doubt, go with red and gold — it is the most versatile and always looks rich on camera.',
    sort_order: 3,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'costume_guidance',
    question: 'Do your costumes come with accessories?',
    answer:
      'Most dance costumes are supplied as shown in the product photos. Accessories like pagdis, turbans, gadas, swords, and wings are available separately in our Accessories category. For bulk school orders, we can discuss including accessories as a package — WhatsApp us.',
    sort_order: 4,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: ['accessories'],
  },
  {
    section: 'delivery',
    question: 'Do you ship across India?',
    answer:
      'Yes, we ship pan-India. Delivery typically takes 3–5 days for Delhi NCR and major metro cities, and 5–7 days for other locations.',
    sort_order: 1,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'delivery',
    question: 'Can I return or exchange a costume?',
    answer:
      "We accept exchanges if the costume is unused, unwashed, and in original condition. Contact us within 24 hours of delivery via WhatsApp with photos. Return shipping charges are the buyer's responsibility for size exchanges. We do not accept returns for bulk school orders.",
    sort_order: 2,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'delivery',
    question: 'How should I wash and care for the costume after use?',
    answer:
      'Most of our costumes are made from polyester satin and net fabrics. Hand wash gently in cold water with mild detergent. Do not machine wash or wring. Dry in shade — not direct sunlight as colours can fade. Iron on low heat from the reverse side.',
    sort_order: 3,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'about_shop',
    question: 'Where is Mod Fancy Dress located?',
    answer:
      'We are located at S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051. Open daily from 10 AM to 9:30 PM including Sundays.',
    sort_order: 1,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'about_shop',
    question: 'How many years have you been in business?',
    answer:
      'Mod Fancy Dress has been serving schools, dance academies, and families in Delhi for over 15 years. We have successfully supplied costumes for 400+ school annual functions and cultural events.',
    sort_order: 2,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
  {
    section: 'about_shop',
    question: 'Do you have a physical store I can visit?',
    answer:
      'Yes. You are welcome to visit our Krishna Nagar store to see the costumes in person and confirm the fit before buying. We are open all 7 days from 10 AM to 9:30 PM.',
    sort_order: 3,
    show_on_blog: true,
    show_on_category: true,
    category_slugs: null,
  },
]

function escLiteral(s) {
  return s.replace(/'/g, "''")
}

const inserts = rows
  .map(
    (r) => `  ('${escLiteral(r.section)}', '${escLiteral(r.question)}', '${escLiteral(r.answer)}', ${r.sort_order}, ${r.show_on_blog}, ${r.show_on_category}, ${r.category_slugs === null ? 'NULL' : `ARRAY[${r.category_slugs.map((x) => `'${escLiteral(x)}'`).join(',')}]::text[]`})`
  )
  .join(',\n')

const sql = `-- FAQ content for /faq, blog footers, and category pages (public read)
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  show_on_blog BOOLEAN NOT NULL DEFAULT FALSE,
  show_on_category BOOLEAN NOT NULL DEFAULT FALSE,
  category_slugs TEXT[] NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_published_sort ON faqs (is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_faqs_section ON faqs (section, sort_order);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FAQs are viewable by everyone" ON faqs
  FOR SELECT USING (is_published = true);

CREATE POLICY "FAQs can be managed by admins" ON faqs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

DO $seed$
BEGIN
  IF EXISTS (SELECT 1 FROM faqs LIMIT 1) THEN
    RETURN;
  END IF;
  INSERT INTO faqs (section, question, answer, sort_order, show_on_blog, show_on_category, category_slugs)
  SELECT * FROM (VALUES
${inserts}
) AS v(section, question, answer, sort_order, show_on_blog, show_on_category, category_slugs);
END $seed$;
`

const out = join(__dirname, '../supabase/migrations/026_faqs.sql')
writeFileSync(out, sql, 'utf8')
console.log('Wrote', out)

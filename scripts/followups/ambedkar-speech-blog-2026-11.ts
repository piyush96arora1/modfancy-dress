/**
 * Blog post for the Dr Ambedkar fancy dress speech cluster (4 Nov 2026).
 *
 * Semrush India (Nov 2026): competitors rank 3–5 with plain blog pages, we
 * have nothing:
 *   ambedkar fancy dress competition 9,900 (sanskritifancydresses.in #5)
 *   dr ambedkar fancy dress speech 5,400 (sanskriti #3)
 *   related: freedom fighters fancy dress 2,900 · national leaders fancy dress ideas 1,900
 * Seasons: Constitution Day 26 Nov (Samvidhan Diwas, three weeks away),
 * Republic Day 26 Jan and Ambedkar Jayanti 14 Apr.
 *
 * We do not sell an Ambedkar costume, so the post says how to put the look
 * together from a blazer at home and links only leader costumes we do stock.
 * /blog/republic-independence-day-fancy-dress-ideas is unpublished (published_at
 * null on 4 Nov), so the post links the Republic Day ideas post instead.
 *
 * Dry run:  npx tsx scripts/followups/ambedkar-speech-blog-2026-11.ts
 * Apply:    npx tsx scripts/followups/ambedkar-speech-blog-2026-11.ts --apply
 */
import { run, upsertPost } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const AMBEDKAR = `Dr B.R. Ambedkar is a powerful choice for a school fancy dress competition. The look is simple, every judge recognises it, and the message is strong: education, equality and the Constitution of India. Below you will find how to dress your child as Dr Ambedkar, short speeches sorted by age, a Hindi version, and facts your child can say with confidence.

## When to choose Dr Ambedkar

- **26 November, Constitution Day (Samvidhan Diwas).** The Constitution of India was adopted on 26 November 1949. Schools hold speech and fancy dress events in the week before, so this year it is coming up soon.
- **26 January, Republic Day.** The Constitution came into force on 26 January 1950, and Dr Ambedkar chaired the committee that drafted it.
- **14 April, Ambedkar Jayanti.** His birthday, celebrated across India.
- **National leaders or freedom fighters themes** at annual functions, any time of year.

## How to dress as Dr Ambedkar

We do not stock a ready-made Ambedkar costume, and you do not really need one. Most families already have the main pieces at home.

1. **A blue suit or blazer.** Dr Ambedkar is almost always shown in a blue three-piece suit. A navy or royal blue school blazer works well, with a waistcoat if you have one.
2. **A white shirt and a tie.** A plain white school shirt and a dark or red tie.
3. **Dark trousers and black shoes.**
4. **Round black glasses.** This is the detail that makes the look. Buy plain frames from a stationery or toy shop, or pop the lenses out of an old pair.
5. **Hair.** Comb it neatly with a side parting and a little oil or gel.
6. **The Constitution book.** This is the most important prop. Cover a thick notebook in blue chart paper and write "Constitution of India" on the front in gold or white. Your child holds it against the chest, in the left arm, just like the statues.
7. **A pen (optional).** A fountain pen in the shirt or blazer pocket, a reminder that he was a scholar and a writer.

If the blazer is too big, roll the sleeves in and pin them on the inside. A neat fit matters more than an expensive suit.

## Ambedkar speech for nursery and KG

Two lines are plenty. Let your child hold up the book on the last word.

- "I am Dr B.R. Ambedkar. I wrote the Constitution of India!"
- "My name is Babasaheb Ambedkar. Study hard and treat everyone as equal."

## Ambedkar speech for classes 1 to 3

Four short lines, said slowly.

"Good morning everyone. I am Dr Bhimrao Ambedkar, and people lovingly call me Babasaheb. I led the team that drafted the Constitution of India, the book that gives every Indian equal rights. My message to you is simple: educate, agitate, organise. Study hard, speak up for what is right, and work together. Thank you."

## Ambedkar speech for classes 4 to 6

This speech is about 120 words and takes a little under a minute.

"Respected judges, teachers and my dear friends, good morning. I am Dr Bhimrao Ramji Ambedkar. I was born on 14 April 1891 in Mhow. As a child, I was made to sit apart from the other students in class, only because of my caste. But I did not give up. I kept studying and went on to study at Columbia University in America and the London School of Economics. When India became free, I became our first Law Minister. I chaired the committee that drafted the Constitution of India, which gives every citizen equal rights, whatever their caste, religion or gender. My message to you is: educate, agitate, organise. Education is the key that opens every door. Jai Bhim, Jai Hind!"

## Ambedkar speech in Hindi

Many schools allow the speech in Hindi. These lines are short and easy to learn.

- "मैं हूँ डॉ. भीमराव अंबेडकर। लोग मुझे प्यार से बाबासाहेब कहते हैं।"
- "मैंने भारत का संविधान बनाने वाली समिति का नेतृत्व किया। संविधान हर भारतीय को बराबरी का अधिकार देता है।"
- "मेरा संदेश है: शिक्षित बनो, संगठित रहो, संघर्ष करो। पढ़ाई ही सबसे बड़ी ताकत है। जय भीम, जय हिंद!"

## Facts your child can say

Judges often ask one question after the speech.

- Full name: Bhimrao Ramji Ambedkar, called Babasaheb.
- Born on 14 April 1891 in Mhow, in today's Madhya Pradesh.
- Chairman of the Drafting Committee of the Constitution of India.
- First Law Minister of independent India.
- Awarded the Bharat Ratna, India's highest civilian honour, in 1990.
- Famous message: "Educate, agitate, organise."
- He fought all his life against untouchability and for equal rights.

## Tips for the stage

- **Walk in slowly** with the book held against the chest. Babasaheb was calm and serious, not rushed.
- **Point to the book** when your child says "Constitution". One clear action is better than many.
- **Pause before the last line** and say it a little louder. Judges remember the ending.
- **Practise in the blazer** at least twice, so the sleeves and glasses do not distract on the day.
- **Keep the glasses on a string** for very young children, so they do not slip off mid-speech.

## Other national leader costumes

If you want a ready-made costume for the same theme, we stock several leaders and freedom fighters. Try [Subhash Chandra Bose](/products/subhash-chandra-bose-fancy-dress), [Mahatma Gandhi](/products/mahatma-gandhi-fancy-dress-costume), [Jawaharlal Nehru](/products/jawahar-lal-nehru-fancy-dress) or [Bal Gangadhar Tilak](/products/bal-gangadhar-tilak-fancy-dress-costume). For girls, [Bharat Mata](/products/bharat-mata-fancy-dress-costume) and [Rani Laxmi Bai](/products/jhansi-ki-rani-laxmi-bai-fancy-dress-costume) are favourites. See the full range of [freedom fighters and leaders](/category/leaders-freedom-fighters), or read our [freedom fighter fancy dress ideas](/blog/freedom-fighter-fancy-dress-ideas) and [Republic Day fancy dress ideas](/blog/republic-day-fancy-dress-ideas-kids).

## Rent or buy

Every costume in our shop can be rented for an event with a refundable deposit, or bought outright. Pick it up from our Krishna Nagar shop in East Delhi, or get it delivered across Delhi NCR by Porter or Rapido. See how renting works on our [rent page](/rent), or WhatsApp us your child's age and height and we will suggest a size.`

const APPLY = process.argv.includes('--apply')
let pass = 0

run(async (cat) => {
  pass++
  await upsertPost(cat, {
    slug: 'ambedkar-fancy-dress-speech',
    title: 'Dr Ambedkar Fancy Dress Speech for Kids – By Age',
    excerpt:
      'Dr Ambedkar fancy dress speech for kids by age, in English and Hindi, with how to dress as Babasaheb, key facts and stage tips for Constitution Day.',
    content: AMBEDKAR,
  })
  if (APPLY && pass === 2) await revalidateSite('content')
})

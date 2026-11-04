/**
 * Blog posts for big "ideas / dialogue / speech" searches (4 Nov 2026).
 *
 * Semrush keyword gap B (4 Nov): competitors rank 3–8 with plain blog pages, we
 * have nothing:
 *   dialogues for angel fancy dress competition 14,800
 *   princess speech for fancy dress competition 4,400 · fancy dress competition dialogue for princess 2,900
 *   1st prize fancy dress ideas on save nature 3,600 · nature theme fancy dress 720×2 ·
 *   tree fancy dress competition 590 · save earth fancy dress 480 · environment day fancy dress ideas 390
 * Angel/princess peak with Christmas and annual functions (Dec–Feb); nature themes
 * run all year and peak for Earth Day (22 Apr) and Environment Day (5 Jun).
 *
 * Also corrects the Children's Day post: it described the Nehru costume as a white
 * achkan with churidar. The costume is a navy Nehru jacket over a white
 * kurta-pyjama (owner confirmed 3 Nov; product copy fixed then). Children's Day
 * is 14 Nov, schools celebrate Fri 13 Nov.
 *
 * Dry run:  npx tsx scripts/followups/dialogue-and-nature-blogs-2026-11.ts
 * Apply:    npx tsx scripts/followups/dialogue-and-nature-blogs-2026-11.ts --apply
 */
import { run, sb, upsertPost } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const ANGEL = `Angel is one of the most loved fancy dress ideas for girls, and for good reason: the costume is simple, it looks lovely on stage, and the message is easy for a small child to say. The hard part is the dialogue. Below are short angel dialogues for fancy dress competitions, sorted by age, plus a Hindi version and tips on how to make the angel look at home or with a few pieces from our shop.

## What makes a good angel dialogue

Judges in school fancy dress competitions look for three things: a costume that is instantly recognisable, a child who speaks clearly and confidently, and a message. An angel speech works best when it is short, rhymes or repeats, and ends with a kind wish for the audience. For children under six, two or three lines are plenty. Older children can say five or six lines and add a simple action, such as spreading their wings or touching their halo.

## Angel dialogues for nursery and KG (ages 3 to 5)

Keep it to two lines and let your child smile and wave at the end.

- "I am a little angel, sent from up above. I bring you smiles and lots and lots of love!"
- "Twinkle, twinkle, I'm an angel bright. I spread kindness all day and all night."
- "My wings are white, my heart is gold. Be kind to everyone, young and old."
- "I am an angel with a shining halo. Wherever I go, happiness will follow."

## Angel dialogues for classes 1 to 3 (ages 6 to 8)

Four lines with a clear message work well at this age.

- "Hello everyone, I am an angel. I live among the clouds, but today I came down to tell you a secret. The secret to being happy is being kind. Share your toys, help your friends, and always say thank you."
- "I am a guardian angel. I watch over children while they sleep, and I keep them safe while they play. But you can be an angel too: help someone who is sad, and you will see a smile that shines brighter than my halo."
- "I am the angel of peace. I carry a white flower because white means peace. Let us stop fighting, stop shouting, and live together like one big family."

## Angel speech for classes 4 to 6 (ages 9 to 12)

Older children can give a short speech and add an action at the end.

"Good morning to the respected judges, teachers and my dear friends. I am an angel. People think angels live only in the sky, but I have a secret to tell you: angels are all around us. A mother who wakes up early to make your tiffin is an angel. A teacher who explains a sum for the third time is an angel. A friend who shares half of their lunch is an angel. So you do not need wings to be an angel. You only need a kind heart. Thank you." (Spread the wings and bow.)

## Christmas angel dialogue

For a Christmas programme in December, an angel can open the show.

"Glory, glory, the stars are bright! I am the Christmas angel with a message tonight. Love one another, share and care, and happiness will be everywhere. Merry Christmas to all!"

## Angel dialogue in Hindi

Many schools allow the speech in Hindi. These are short and easy to learn.

- "मैं हूँ एक नन्ही परी, आसमान से आई हूँ। सबके लिए प्यार और मुस्कान लाई हूँ।"
- "मेरे पंख सफ़ेद हैं, दिल है सोने जैसा। सबसे प्यार करो, यही है मेरा संदेसा।"
- "मैं शांति की परी हूँ। झगड़ा छोड़ो, हाथ मिलाओ, सबके साथ मिलकर रहना सीखो।"

## How to make an angel costume

An angel look has four parts, and you can put it together in an evening:

1. **A white or pale dress.** A white frock or a long white gown is the base. A light pink or gold frock also works for a fairy-angel look. Our [princess frock](/products/princess-frock-fancy-dress) and [frill frock](/products/frill-frock-fancy-dress) are easy bases to rent.
2. **Wings.** White feather wings are classic. For a fairy angel, coloured wings such as our [butterfly fairy wings](/products/orange-butterfly-fairy-wings-fancy-dress) look lovely on stage.
3. **A halo.** Bend a gold or silver tinsel strip into a ring and fix it to a hairband with a piece of wire, so it floats just above the head.
4. **A wand or a star.** A small wand or a star on a stick gives your child something to hold, which helps with stage nerves.

Finish with white or silver shoes and a little shimmer. Avoid long gowns that touch the floor for very young children, because they trip on the steps to the stage.

## More ideas in the same theme

If your child prefers a different character with the same feel, try a princess (see our [princess speech for fancy dress competition](/blog/princess-speech-for-fancy-dress-competition)), [Snow White](/products/snow-white-fancy-dress), a [mermaid](/products/mermaid-fancy-dress) or a fairy. For nature themes, a [sunflower costume](/products/sun-flower-fancy-dress) or a [peacock](/products/peacock-fancy-dress) is a cheerful alternative.

## Rent or buy

All our costumes can be rented for an event from our Krishna Nagar shop in East Delhi, with a refundable deposit, or bought outright. We deliver across Delhi NCR by Porter or Rapido. See how renting works on our [rent page](/rent), or WhatsApp us your child's age and height and we will suggest a size.`

const PRINCESS = `A princess is the dream costume for many little girls, and it is a safe choice for a fancy dress competition because every judge recognises it. What wins the prize is a confident speech. Here are princess speeches and dialogues for fancy dress competitions, from two-line rhymes for nursery to a short speech for older girls, plus ideas for which princess to choose.

## Tips before you start

- Keep the speech short: two lines for ages 3 to 5, four to six lines for ages 6 to 9.
- Add one action: a curtsy at the start, a twirl in the middle, or a wave at the end.
- Give the princess a message. Judges reward a princess who is kind, brave or clever, not just pretty.

## Princess dialogues for nursery and KG

- "I am a pretty princess with a crown upon my head. I am kind to everyone, that's what my mother said!"
- "Twirl and swirl, I'm a princess girl! I share my sweets with the whole wide world."
- "I am a princess, and I have a magic wand. With one wave, I make everyone friends."

## Princess speech for classes 1 to 3

"Good morning everyone. I am Princess Kindness. I live in a big castle, but my favourite thing is not my crown or my dress. My favourite thing is helping people. When someone is sad, I give them a hug. When someone is hungry, I share my food. A real princess is not the one with the most jewels. A real princess is the one with the kindest heart. Thank you." (Curtsy.)

"I am a brave princess. I do not wait for anyone to save me. I study hard, I play hard, and I am not afraid of the dark! Every girl can be a brave princess like me."

## Princess speech for classes 4 to 6

"Respected judges, teachers and friends, good morning. Once upon a time, princesses waited in towers for someone to rescue them. But I am a princess of today. My crown is my knowledge, my sword is my pen, and my kingdom is my school. I believe every girl deserves an education and the chance to follow her dreams. Rani Laxmi Bai was a real princess who fought for her people, and Kalpana Chawla flew all the way to space. So remember, a true princess is strong, smart and kind. Thank you."

## Character speeches for popular princesses

- **Snow White:** "I am Snow White. I live with seven little friends in the forest. I learnt that we should never take things from strangers, and that true friends will always stand by you." Our [Snow White costume](/products/snow-white-fancy-dress) is ready to rent.
- **A mermaid princess:** "I am a mermaid princess from the deep blue sea. Please do not throw plastic in the ocean, because it is my home and my fish friends' home too." Pair it with our [mermaid costume](/products/mermaid-fancy-dress) for a save-the-ocean message.
- **An Indian princess:** "I am a princess from Rajasthan. I wear a lehenga with mirror work and a bright dupatta. I am proud of my culture, and I am proud to be Indian." A [Rajasthani lehenga](/category/rajasthani-dress) makes this an easy look.

## Princess dialogue in Hindi

- "मैं हूँ एक प्यारी राजकुमारी, सबसे करती हूँ मैं यारी।"
- "मेरा ताज है मेरी पढ़ाई, मेहनत से ही मंज़िल पाई।"
- "असली राजकुमारी वो है जिसका दिल सबसे अच्छा है।"

## Princess costume ideas

- A full-length [princess frock](/products/princess-frock-fancy-dress) or a [purple frock](/products/purple-frock-fancy-dress), with a tiara and a wand.
- [Snow White](/products/snow-white-fancy-dress) for a story character judges know instantly.
- An Indian princess in a lehenga, or a warrior princess like [Jhansi ki Rani](/products/jhansi-ki-rani-laxmi-bai-fancy-dress-costume) for a strong message.
- For a softer look, an angel: see our [angel dialogues for fancy dress competition](/blog/angel-dialogues-for-fancy-dress-competition).

Keep the dress above the ankle for young children so they do not trip on the stage steps, and practise the curtsy in the costume at least once.

## Rent or buy

Every costume can be rented for an event from our Krishna Nagar shop in East Delhi, with a refundable deposit, or bought outright, with delivery across Delhi NCR. See our [rent page](/rent), or send your child's age and height on WhatsApp for a size.`

const NATURE = `"Save nature" is one of the most common fancy dress themes in Indian schools, from Earth Day in April and Environment Day in June to annual functions with a green message. It is also one of the easiest themes to win, because a clear message counts for as much as the costume. Here are save nature fancy dress ideas that win prizes, with a one-line message for each, and which ones you can rent ready-made.

## Why nature themes win

Judges look for three things: a costume they recognise from the back of the hall, a confident child, and a message. Nature costumes carry a built-in message (save trees, save water, stop pollution), so even a three-year-old has something meaningful to say.

## 1. Tree

The tree is the classic save-nature costume and the first one judges look for. A green leafy top with a brown trunk makes it instantly clear.

Message: "I am a tree. I give you fresh air, cool shade and sweet fruit. Please do not cut me, plant one more like me!"

Rent a [tree fancy dress](/products/tree-fancy-dress-costume) or the [hooded tree costume](/products/tree-fancy-dress). Add a small paper bird on the shoulder for an extra touch.

## 2. Water drop or "save water"

Water conservation is a strong message for summer and for Environment Day.

Message: "I am a drop of water. Without me there is no life. Close the tap while brushing, and save every drop!"

Our [water drop costume](/products/water-drop-fancy-dress) and [water fancy dress](/products/water-fancy-dress) suit this theme.

## 3. Sunflower and other flowers

Flowers are a cheerful choice for the youngest children, and they work for spring and nature themes.

Message: "I am a sunflower. I always turn towards the sun. Plant flowers, and the bees and butterflies will come too!"

Try the [sunflower costume](/products/sun-flower-fancy-dress) or the [sunflower face-frame costume](/products/sun-flower-fancy-dress-costume).

## 4. Cloud and rain

A cloud costume is a fun way to talk about rain, trees and the water cycle.

Message: "I am a cloud. When there are many trees, I bring rain. Cut the trees, and I will go away. Save trees to bring me back!"

See our [cloud fancy dress](/products/cloud-fancy-dress).

## 5. Mountain, grass and earth

For older children, a mountain or a patch of grass is unusual, which helps them stand out.

- Mountain: "I am a mountain. I give you rivers, forests and fresh air. Please keep me clean, do not leave plastic on my slopes." See the [mountain costume](/products/mountain-fancy-dress).
- Grass: "I am the green grass. I hold the soil together. Do not walk on me, let me grow!" See the [grass costume](/products/grass-fancy-dress).
- Earth: a child holding a painted globe or wearing a blue-and-green cape can say "I am Mother Earth. I am getting warmer every year. Plant trees, save energy and save me."

## 6. Birds and bees

Birds and insects show why nature matters to every living thing.

- [Honeybee](/products/honeybee-fancy-dress): "I am a honeybee. I help flowers grow into fruit. Without me, there would be no mangoes! Do not spray poison on flowers."
- [Peacock](/products/peacock-fancy-dress), [parrot](/products/parrot-fancy-dress) or [crow](/products/crow-fancy-dress): "I am a bird. I need trees to build my nest. When you cut a tree, you take away my home."

## 7. Best out of waste

Some competitions ask for a costume made from waste. Old newspapers, plastic bottles and cardboard make good material for a "stop pollution" message: a dress made of newspapers, a bottle-cap crown, or a robot from cartons. The message writes itself: "I am made of waste. Reduce, reuse, recycle!"

## Which idea suits which age

- **Ages 3 to 5:** sunflower, tree, honeybee or water drop, with one line.
- **Ages 6 to 8:** tree, cloud or bird, with a two- or three-line message.
- **Ages 9 to 12:** mountain, Mother Earth or best out of waste, with a short speech about climate change.

## Rent instead of making it

Making a costume takes time and materials. Every costume above can be rented for an event from our Krishna Nagar shop in East Delhi, with a refundable deposit, and delivered across Delhi NCR. See all [nature costumes](/category/nature-costumes), [flower costumes](/category/flower-costumes) and [bird costumes](/category/bird-costumes), or read how renting works on our [rent page](/rent).`

const NEHRU_FIXES: [string, string][] = [
  [
    'The look is simple and instantly recognisable: a white achkan (long coat) with churidar, a white cap, and a red rose pinned on the left side of the chest.',
    'The look is simple and instantly recognisable: a navy Nehru jacket over a white kurta-pyjama, a white cap, and a red rose pinned on the left side of the chest.',
  ],
  [
    'comes as the full achkan, churidar and cap set with the rose.',
    'comes as the navy Nehru jacket, white kurta-pyjama and cap with the rose.',
  ],
  [
    'For long costumes like the achkan, check the length at the ankle,',
    'For long costumes like a kurta-pyjama or a lehenga, check the length at the ankle,',
  ],
]

const APPLY = process.argv.includes('--apply')
let pass = 0

run(async (cat) => {
  pass++
  await upsertPost(cat, {
    slug: 'angel-dialogues-for-fancy-dress-competition',
    title: 'Angel Dialogues for Fancy Dress Competition – By Age',
    excerpt:
      'Angel dialogues for fancy dress competitions by age, from two-line rhymes for nursery to a speech for class 6, in English and Hindi, with costume tips.',
    content: ANGEL,
  })
  await upsertPost(cat, {
    slug: 'princess-speech-for-fancy-dress-competition',
    title: 'Princess Speech for Fancy Dress Competition – By Age',
    excerpt:
      'Princess speeches and dialogues for fancy dress competitions, from two-line rhymes for KG to a speech for class 6, with Hindi lines and costume ideas.',
    content: PRINCESS,
  })
  await upsertPost(cat, {
    slug: 'save-nature-fancy-dress-ideas',
    title: 'Save Nature Fancy Dress Ideas That Win Prizes',
    excerpt:
      'Save nature fancy dress ideas for school competitions: tree, water drop, sunflower, cloud, mountain, birds and best out of waste, with a message for each.',
    content: NATURE,
  })

  const { data: post, error } = await sb.from('blog_posts').select('id, content').eq('slug', 'childrens-day-fancy-dress-ideas').single()
  if (error) throw new Error(error.message)
  let content = (post as { content: string }).content
  for (const [from, to] of NEHRU_FIXES) {
    if (!content.includes(from)) throw new Error(`Children's Day post: text not found: ${from.slice(0, 60)}`)
    content = content.replace(from, to)
  }
  console.log(`\n--- blog: childrens-day-fancy-dress-ideas: ${NEHRU_FIXES.length} Nehru corrections`)
  if (APPLY && pass === 2) {
    const { error: e } = await sb.from('blog_posts').update({ content }).eq('id', (post as { id: string }).id)
    console.log(e ? `   ❌ ${e.message}` : '   ✅ corrected')
    await revalidateSite('content')
  }
})

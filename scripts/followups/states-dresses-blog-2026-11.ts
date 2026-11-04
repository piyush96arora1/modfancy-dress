/**
 * Blog post for the "states of India traditional dresses" cluster (4 Nov 2026).
 *
 * Semrush India (4 Nov): a big informational cluster where we have no page, and
 * where the reader is often a parent whose child has been given a state for a
 * school programme:
 *   29 states of india and their dresses names list 3,600 ·
 *   ... names with pictures 1,000 · top 10 traditional dresses of india with states 1,000 ·
 *   state wise traditional dresses of india 480 · ... names in hindi 320 ·
 *   states of india fancy dress competition 210 · fancy dress representing states of india 140
 * India has 28 states and 8 UTs today; people still search "29" (Telangana was
 * the 29th in 2014, J&K became a UT in 2019), so the post says so plainly.
 * Peaks: annual functions Nov–Feb and Republic Day (26 Jan) "unity in diversity"
 * programmes.
 *
 * BlogContent does not render markdown tables (only headings, bullet blocks and
 * paragraphs), so the state lists are bullet lists, one state per line.
 *
 * Dry run:  npx tsx scripts/followups/states-dresses-blog-2026-11.ts
 * Apply:    npx tsx scripts/followups/states-dresses-blog-2026-11.ts --apply
 */
import { run, upsertPost } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const STATES = `India has 28 states and 8 union territories, and almost every one of them has its own traditional dress. Many lists online still say "29 states". That was true from 2014, when Telangana became the 29th state, until 2019, when Jammu and Kashmir became a union territory. So the correct number today is 28.

Below is the full state-wise list of traditional dresses of India, for women and for men, followed by the union territories, a short list in Hindi, and the best states to pick for a school fancy dress competition. If your child has been given a state for an annual function or a Republic Day "unity in diversity" programme, you will find the costume, a line to say on stage, and where to rent it.

## 28 states of India and their traditional dresses

Each line gives the state, then the women's dress, then the men's dress. These are the names most commonly used. Many states have several communities, and each has its own variations.

- **Andhra Pradesh:** women wear a saree, and girls wear a langa voni (half saree); men wear a dhoti (pancha) with a kurta or shirt and an angavastram.
- **Arunachal Pradesh:** women wear a woven wrap skirt (gale among the Adi) with a blouse; men wear a sleeveless jacket (galuk) with a woven shawl or wrap.
- **Assam:** women wear the mekhela chador; men wear a dhoti and kurta with a gamosa.
- **Bihar:** women wear a saree, often draped with the pallu in front; men wear a dhoti and kurta with a gamchha.
- **Chhattisgarh:** women wear a lugda (saree) with a polka (blouse); men wear a dhoti and kurta, often with a pagdi.
- **Goa:** women wear the Kunbi saree; men wear a dhoti or shorts with a shirt, and the kashti among the Kunbi community.
- **Gujarat:** women wear the chaniya choli, or a saree with the pallu in front; men wear the kediyu with a chorno or dhoti and a pagdi.
- **Haryana:** women wear the daaman (a full skirt) with a kurti and an odhni (chunder); men wear a dhoti and kurta with a pagdi.
- **Himachal Pradesh:** women wear a salwar kurta with a pattu shawl and a dhatu (headscarf); men wear a kurta, churidar, woollen jacket and the Himachali topi.
- **Jharkhand:** women wear a saree (the panchi and parhan among the Santhal); men wear a dhoti with a kurta or bandi.
- **Karnataka:** women wear the Mysore silk or Ilkal saree; men wear a panche (dhoti) with a shirt, an angavastra and the Mysore peta.
- **Kerala:** women wear the kasavu saree or the two-piece mundum neriyathum; men wear the mundu with a shirt.
- **Madhya Pradesh:** women wear a lehenga choli with an odhni, or a saree; men wear a dhoti and kurta with a safa.
- **Maharashtra:** women wear the nauvari (nine-yard) saree; men wear a dhoti and kurta with a pheta (turban).
- **Manipur:** women wear the phanek (wrap skirt) and innaphi (shawl); men wear a dhoti and kurta.
- **Meghalaya:** Khasi women wear the jainsem and Garo women the dakmanda; men wear the jymphong (sleeveless coat) with a dhoti.
- **Mizoram:** women wear the puan (woven wrap skirt) with a blouse; men wear a woven shawl over a shirt.
- **Nagaland:** women wear a woven wrap skirt with a tribal shawl and beads; men wear a tribal shawl, a wrap and, for dances, a headgear.
- **Odisha:** women wear the Sambalpuri saree; men wear a dhoti and kurta with a gamchha.
- **Punjab:** women wear a salwar kameez with a phulkari dupatta; men wear a kurta, tehmat (lungi) and pagri.
- **Rajasthan:** women wear the ghagra, choli and odhni; men wear a dhoti and angarkha with a safa (turban).
- **Sikkim:** women wear the bakhu (kho) with a honju blouse; men wear the bakhu with a belt, and Nepali Sikkimese men wear the daura suruwal.
- **Tamil Nadu:** women wear the Kanjeevaram silk saree, and girls wear the pavadai; men wear a veshti with a shirt and angavastram.
- **Telangana:** women wear a saree (Pochampally and Gadwal are famous), and girls the langa voni; men wear a dhoti (pancha) and kurta.
- **Tripura:** women wear the rignai (wrap skirt) and risa; men wear a dhoti and shirt with a rikutu gamchha.
- **Uttar Pradesh:** women wear a saree or lehenga choli; men wear a kurta-pyjama or dhoti-kurta, with a sherwani for formal wear.
- **Uttarakhand:** women wear a ghagra with an angra (blouse) and a pichhora (dupatta); men wear a kurta-pyjama or dhoti with a Pahadi topi.
- **West Bengal:** women wear a saree, often a white saree with a red border; men wear a dhoti and panjabi (kurta).

## Union territories and their dresses

- **Andaman and Nicobar Islands:** settlers wear the saree and salwar kameez; Nicobarese communities wear woven wraps.
- **Chandigarh:** salwar kameez for women; kurta-pyjama, often with a pagri, for men.
- **Dadra and Nagar Haveli and Daman and Diu:** saree and chaniya choli for women; dhoti or kediyu with a shirt for men.
- **Delhi:** salwar kameez and saree for women; kurta-pyjama for men.
- **Jammu and Kashmir:** the pheran for both, with a headscarf for women and a cap or turban for men.
- **Ladakh:** the goncha (a long woollen robe) for both, with the perak headdress for women.
- **Lakshadweep:** a long kurta with a head cloth for women; a mundu and shirt for men.
- **Puducherry:** saree for women; veshti and shirt for men.

## Best states for a fancy dress competition

Some states read better on stage than others. A judge at the back of the hall should know the state before your child speaks. These eight are easy to recognise, and we stock them in kids' sizes.

### Punjab

The turban and the bright kurta say "Punjab" from across the room. Say: "Sat Sri Akal! I am from Punjab, the land of five rivers, golden wheat and bhangra!" Rent a [Bhangra fancy dress](/products/bhangra-fancy-dress), the [Punjabi fancy dress costume for boy and girl](/products/punjabi-fancy-dress-costume-boy-girl), the [Punjabi Giddha fancy dress costume](/products/punjabi-giddha-fancy-dress-costume) or a [Sikh Punjabi safa](/products/sikh-punjabi-safa-red-fancy-dress). See all [Bhangra dresses](/category/bhangra-dress) and [Giddha dresses](/category/gidda-dress).

### Rajasthan

The ghagra and the safa are the most famous state costumes in India. Say: "Padharo mhare desh! I am from Rajasthan, the land of forts, camels and the golden desert." Try the [Rajasthani fancy dress](/products/rajasthani-fancy-dress), the [Rajasthani boy fancy dress](/products/rajasthani-boy-fancy-dress), the [Rajasthani lehenga](/products/rajasthani-lehenga-fancy-dress) or the [angrakha and dhoti costume](/products/angrakha-and-dhoti-fancy-dress-costume). More in [Rajasthani dresses](/category/rajasthani-dress).

### Gujarat

A girl in a chaniya choli and a boy in a kediyu make a lovely pair. Say: "Kem cho! I am from Gujarat. We dance garba all nine nights of Navratri." Rent the [Gujrati boy fancy dress](/products/gujrati-boy-fancy-dress), the [Gujarati garba dance costume](/products/gujarati-garba-dance-fancy-dress-costume) or a [garba chaniya choli for girls](/products/garba-chaniya-choli-for-girls). See all [garba dresses](/category/garba-dress).

### Maharashtra

The nauvari saree and the pheta are easy to spot. Say: "Namaskar! I am from Maharashtra, the land of Chhatrapati Shivaji Maharaj and Ganpati Bappa." Try the [Maharashtra fancy dress](/products/maharashtra-fancy-dress), the [Maharashtra boy fancy dress](/products/maharashtra-boy-fancy-dress) or a [Lavani saree costume](/products/lavani-saree-fancy-dress-costume-red).

### Kerala

The cream-and-gold kasavu look is simple and elegant. Say: "Namaskaram! I am from Kerala, God's own country, with coconut trees, backwaters and boat races." Rent the [Kerala fancy dress](/products/kerala-fancy-dress), the [Kathakali fancy dress](/products/kathakali-fancy-dress) or the [South Indian boy fancy dress](/products/south-indian-boy-fancy-dress).

### Assam

The mekhela chador and the gamosa stand out because few children pick the North-East. Say: "Namaskar! I am from Assam, the land of tea gardens, the one-horned rhino and Bihu." Rent the [Assam fancy dress](/products/assam-fancy-dress), the [Bihu mekhla chador](/products/bihu-mekhla-chador-fancy-dress-costumes) or the [Bihu costume for boys](/products/bihu-folk-dance-fancy-dress-costume-for-boys), and add an [Assam cap](/products/assam-cap).

### West Bengal

A white saree with a red border is the easiest girl's look to put together. Say: "Nomoshkar! I am from West Bengal, the land of Rabindranath Tagore, rosogolla and Durga Puja." Rent the [Bengali saree fancy dress](/products/bengali-saree-fancy-dress) or the [Bengali boy fancy dress](/products/bengali-boy-fancy-dress).

### Haryana

The daaman swings beautifully when a girl turns on stage. Say: "Ram Ram ji! I am from Haryana, the land of milk, curd and brave wrestlers." Try the [red Haryanvi lehenga](/products/red-haryanvi-lehnga-fancy-dress), the [Daaman costume](/products/daaman-fancy-dress-traditional-costume) or the [Haryanvi boy fancy dress](/products/boy-haryanvi-dress). See all [Haryanvi dresses](/category/haryanvi-dress).

### More states we stock

- North-East: [Manipur](/products/manipur-fancy-dress), [Manipur boy](/products/manipur-boy-fancy-dress), [Nagaland girl](/products/nagaland-girl-fancy-dress), [Nagaland boy](/products/nagaland-boy-fancy-dress), [Mizoram](/products/mizoram-fancy-dress) and [Sikkim](/products/sikkim-fancy-dress).
- Hills: [Himachal](/products/himachal-fancy-dress), [Pahadi boy](/products/pahadi-boy-fancy-dress) for Uttarakhand, and [Kashmiri](/products/kashmiri-fancy-dress).
- East and South: [Sambhalpuri](/products/sambhalpuri-fancy-dress) and [Sambhalpuri boy](/products/sambhalpuri-boy-fancy-dress) for Odisha, and the [South Indian girl fancy dress](/products/south-indian-girl-fancy-dress) for Tamil Nadu or Karnataka.

Browse the full range in [states fancy dress](/category/states-fancy-dress) and [folk dance dresses](/category/folk-dance-dress).

## Tips for a states fancy dress competition

- **Pick a look that reads from the back.** A turban, a big skirt or a bright border is seen from far away. Small details like embroidery are not.
- **Add one prop.** A small pot for Rajasthan, dandiya sticks for Gujarat, a tea basket for Assam or a toy boat for Kerala tells the story without words.
- **Say the greeting in the state's language.** "Kem cho", "Namaskaram" or "Sat Sri Akal" at the start always gets a smile from the judges.
- **Go as a pair.** A brother and sister, or two friends, in the boy and girl versions of one state look complete. Some children do a 20-second dance step together.
- **Keep it short.** Two lines for ages 3 to 5, four lines for ages 6 to 9.
- **For a "unity in diversity" group,** give each child a different state so the line-up shows the whole country.

## राज्यों की पारंपरिक वेशभूषा (हिंदी में)

- पंजाब: महिलाएँ सलवार-कमीज़ और फुलकारी दुपट्टा, पुरुष कुर्ता, तहमत और पगड़ी।
- राजस्थान: महिलाएँ घाघरा, चोली और ओढ़नी, पुरुष धोती, अंगरखा और साफ़ा।
- गुजरात: महिलाएँ चनिया चोली, पुरुष केडियू और पगड़ी।
- महाराष्ट्र: महिलाएँ नौवारी साड़ी, पुरुष धोती, कुर्ता और फेटा।
- केरल: महिलाएँ कसावु साड़ी, पुरुष मुंडू।
- असम: महिलाएँ मेखला चादर, पुरुष धोती, कुर्ता और गमोसा।
- पश्चिम बंगाल: महिलाएँ लाल बॉर्डर वाली सफ़ेद साड़ी, पुरुष धोती और पंजाबी कुर्ता।
- हरियाणा: महिलाएँ दामन, कुर्ती और ओढ़नी, पुरुष धोती, कुर्ता और पगड़ी।
- तमिलनाडु: महिलाएँ कांजीवरम साड़ी, पुरुष वेष्टि और अंगवस्त्रम।
- मणिपुर: महिलाएँ फनेक और इनाफ़ी, पुरुष धोती और कुर्ता।
- कश्मीर: महिलाएँ और पुरुष दोनों फेरन पहनते हैं।

## Rent or buy

A state costume is usually worn once, for one programme, so renting makes sense. Every costume above rents per event with a refundable deposit: ₹500 for costumes that rent for up to ₹200, ₹1,000 for ₹201 to ₹500, and ₹2,000 above that. Pick it up from our Krishna Nagar shop in East Delhi, or get it delivered by Porter or Rapido across Delhi NCR. Schools and teachers dressing a whole class can WhatsApp us for group rates on 10 or more costumes. If you would rather keep the costume, every piece can be bought too. Read [how renting works](/rent), see our [rent or buy guide](/blog/rent-or-buy-fancy-dress-costume), or find more ideas for 26 January in [Republic Day fancy dress ideas for kids](/blog/republic-day-fancy-dress-ideas-kids).`

const APPLY = process.argv.includes('--apply')
let pass = 0

run(async (cat) => {
  pass++
  await upsertPost(cat, {
    slug: 'states-of-india-traditional-dresses',
    title: '28 States of India and Their Traditional Dresses (List)',
    excerpt:
      'All 28 states of India (once 29) and their traditional dresses for women and men, plus UTs, a Hindi list and costume ideas for school competitions.',
    content: STATES,
  })
  if (APPLY && pass === 2) await revalidateSite('content')
})

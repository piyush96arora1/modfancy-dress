/**
 * Teachers' fancy dress post (new) and the kids' competition ideas hub (refresh),
 * 4 Nov 2026.
 *
 * Semrush (4 Nov):
 *   fancy dress competition for teachers 4,400 · teacher fancy dress 1,600 ·
 *   fancy dress ideas for teachers · teachers day fancy dress (5 Sep).
 *   fantasycreators.in ranks #13 and nobody owns the query, so a plain, complete
 *   page can take it. "Teacher fancy dress" is also searched by parents whose
 *   child is dressing up AS a teacher, so the post covers that too.
 *
 *   fancy dress competition for kids 4,400: we rank #12 with
 *   /blog/fancy-dress-competition-ideas (June post, six themes, no product
 *   links, no ages). bookmycostume's school-competitions ideas page gets ~1.4K
 *   visits a month from 137 keywords. The refresh keeps the slug and turns the
 *   post into the hub: ideas by age and by theme, a two-line stage intro for
 *   each, judging tips, and links to every competition post we have.
 *
 * Adult sizes: every product the teachers' post presents as adult-size is in
 * ADULT below and is checked against the live row (size = Adult, or the
 * description says adult). Kid-only leader costumes are not offered to
 * teachers; the post points them to caps, pagdis and props instead.
 *
 * Also sets cover_image_url (a real product photo) and related_category_slugs
 * for both posts so the page shows a cover and the "Shop this guide" grid.
 *
 * Dry run:  npx tsx scripts/followups/teachers-and-competition-hub-blogs-2026-11.ts
 * Apply:    npx tsx scripts/followups/teachers-and-competition-hub-blogs-2026-11.ts --apply
 */
import { run, sb, upsertPost } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const TEACHERS = `A fancy dress competition for teachers is one of the most fun events in the school year, and teachers dress up more often than people think: a competition on Teachers' Day, a staff item at the annual function, a surprise for the children on Children's Day, or a B.Ed or D.El.Ed college competition. The best fancy dress ideas for teachers are easy to wear over your own clothes, read clearly from the back of the hall, and come with a short message. Below are ideas grouped by theme, each with a one-line stage intro, plus group ideas for staff and the adult-size costumes we stock at our Krishna Nagar shop in East Delhi.

## When teachers dress up

- **Teachers' Day, 5 September.** It is the birthday of Dr Sarvepalli Radhakrishnan, India's second President and a teacher all his life. Students often run the school for the day, and many schools hold a fun fancy dress round for the staff.
- **Children's Day, 14 November.** In 2026 it falls on a Saturday, so most schools celebrate on Friday 13 November. Teachers perform for the children, and a costume gets the loudest cheer of the day.
- **Annual function, December to February.** Teachers often open the show, play a role in the school play, or join a staff dance.
- **Christmas, Diwali and Dussehra programmes.** Santa, Ram, Ravan and Krishna are often played by a teacher, because the role needs an adult on stage.
- **Teacher training colleges.** B.Ed and D.El.Ed students are often asked to dress as a leader or a character and give a short talk, so the costume must carry a message.

## How to choose your costume

- **Pick a character you can talk about for a minute.** The judges and the children want to hear why you chose it.
- **Choose something you can wear for hours.** You may have to run the stage, manage children or teach a class in it. A costume that goes over a kurta or a saree is easier than a full bodysuit.
- **Think about the back row.** One strong colour, a crown, a cap or a prop makes you recognisable from the back of the hall.
- **Keep it respectful.** For leaders and gods, a dignified look and a clear message score better than comedy.

## Freedom fighters and leaders

Leader costumes suit Teachers' Day, Republic Day and Independence Day, and they give you a ready-made message. Most of our full leader costumes are cut for children, so for an adult look, wear your own white kurta-pyjama, dhoti or saree and add the cap, pagdi or prop that makes the character.

- **Dr Sarvepalli Radhakrishnan:** "I was a teacher before I was President. When my students wanted to celebrate my birthday, I asked them to celebrate all teachers instead." A white turban, a long coat and round glasses make the look.
- **Savitribai Phule:** "I am Savitribai Phule. People threw mud at me on my way to school, but I kept teaching girls to read." A plain saree with the pallu over the head and a slate or a book in hand.
- **Dr APJ Abdul Kalam:** "Dream, dream, dream. Dreams become thoughts, and thoughts become action." A dark bandhgala or simple shirt, side-parted silver hair, and a small rocket model.
- **Mahatma Gandhi:** "Be the change you wish to see in the world." A white dhoti, a shawl, round glasses and a stick.
- **Shaheed Bhagat Singh:** "They may kill me, but they cannot kill my ideas." A white kurta-pyjama and our [Bhagat Singh cap](/products/bhagat-singh-cap).
- **Mangal Pandey:** "I fired the first shot of 1857." Add the red [Mangal Pandey cap](/products/freedom-fighter-mangal-pandey-red-hat-cap-fancy-dress) to a white kurta.
- **Chhatrapati Shivaji Maharaj:** "I built Hindavi Swarajya with courage, one fort at a time." Our [Shivaji Maharaj pagdi](/products/chatrapati-shivaji-maharaj-pagdi-fancy-dress) and a [sword](/products/sword-for-drama-fancy-dress) or the [shield and sword set](/products/dhal-with-talwar-set-for-drama-fancy-dress).
- **Sarojini Naidu:** "I am the Nightingale of India. I fought for freedom with my poems." A bright saree, a shawl and a small book of poems.

For the full speeches, see our [freedom fighter fancy dress ideas](/blog/freedom-fighter-fancy-dress-ideas) and the [Dr Ambedkar fancy dress speech](/blog/ambedkar-fancy-dress-speech). WhatsApp us your height before you visit and we will tell you which pieces fit an adult.

## Mythology characters

Mythology looks are the most striking on stage, and our adult range is strongest here.

- **Krishna:** "Do your duty and do not worry about the result. That is what I taught Arjun." Our [adult Krishna costume](/products/krishna-fancy-dress) is the full jhanki look, and the [Krishna King costume](/products/krishna-fancy-dress-king) is a regal option sized for teens and adults.
- **Radha:** "I am Radha. Where there is love, there is Krishna." The [adult Radha Rani costume](/products/radha-rani-fancy-dress) is cut in the same colours as our adult Krishna, so two teachers can go as a pair.
- **Ravan:** "I was the most learned king in the world, and pride still brought me down. Never be proud of what you know." The [adult Ravan costume](/products/ravan-costume-for-adults) comes with the mukut and gada, and you can add the [ten-head mask](/products/ravan-mask).
- **Mahishasur:** "I thought no one could defeat me. Then came Maa Durga." The [Mahishasur costume](/products/mahishasur-fancy-dress) is shown on an adult in our photos; ask us for your size.
- **Hanuman:** "I can cross the ocean for my Lord Ram. Nothing is impossible for a true heart." Wear a red or orange kurta with our [Hanuman mask](/products/hanuman-mask) and the [gada](/products/hanuman-gada-for-drama-fancy-dress).
- **A rishi or Narad Muni:** "नारायण, नारायण! I bring news from every world." A saffron or white dhoti with a [rudraksha mala set](/products/rudraksha-mala-set) and a veena or ektara made of card.
- **Saraswati:** "I am the goddess of learning. Every teacher carries a little of my light." A white or yellow saree, a veena of card and a book.

For more characters and their stories, read our [list of Indian mythological characters for fancy dress](/blog/indian-mythological-characters-for-fancy-dress) and the [Dussehra and Ramleela costume guide](/blog/dussehra-ramleela-costume-ideas).

## States of India

A states theme is ideal for a staff item, because every teacher can represent a different state and the whole group reads as "Unity in Diversity". These come in adult sizes:

- **Rajasthan:** "Padharo mhare desh! Welcome to the land of forts and colours." For men, the [Rajasthani dance costume for men](/products/rajasthani-dance-fancy-dress-for-men); for women, the [green Rajasthani lehenga](/products/rajasthani-lehenga-fancy-dress) or the [Kalbelia dance dress](/products/kalbelia-dance-dress-costume-fancy-dress).
- **Punjab:** "Sat Sri Akal! Punjab feeds India and dances while it works." The [orange Bhangra costume](/products/bhangra-dance-costume-for-boys-orange-fancy-dress) and the [blue and yellow Bhangra costume](/products/bhangra-dance-fancy-dress-costume-blue-yellow) are stocked in adult size, and the [yellow Punjabi suit](/products/punjabi-suit) comes in an adult size for women.
- **Haryana:** "Ram Ram! I am from the land of wrestlers and farmers." The [yellow Haryanvi lehenga](/products/yellow-haryanvi-lehnga-fancy-dress) is adult size.
- **Gujarat:** "Kem cho! Come, let us dance the garba." Any of our women's chaniya cholis, such as the [white Kutchi mirror work chaniya choli](/products/white-kutchi-mirror-work-dandiya-chaniya-choli) or the [rainbow bandhani lehenga](/products/rainbow-bandhani-dandiya-lehenga).
- **Assam:** "I come from the land of tea and the Bihu dance." The [Assam costume](/products/assam-fancy-dress) is available for adults too.
- **West Bengal:** "Nomoshkar! I come from the land of Tagore and Durga Puja." The [Bengali saree](/products/bengali-saree-fancy-dress), for kids and adults.
- **Manipur:** "I come from the jewelled land of the North East." The [Manipur costume](/products/manipur-fancy-dress) is stocked in adult size.

Our guide to the [28 states of India and their traditional dresses](/blog/states-of-india-traditional-dresses) has a line for every state.

## Professions and community helpers

These are quick to put together from your own wardrobe, and they make a good message for younger classes.

- **Astronaut:** "I trained for years to see the Earth from space. Study science, and you can too." Our [astronaut costume](/products/astronaut-fancy-dress) is available for kids and adults.
- **Police officer:** "I keep your city safe. Follow the rules and help me do my job." Wear khaki with our [police officer cap](/products/police-officer-cap) or [sub-inspector cap](/products/sub-inspector-cap).
- **Pilot or Air Force officer:** "I guard the skies of India." A blue shirt with the [Air Force cap](/products/air-force-cap).
- **Army officer:** "I stand at the border so that you can sleep in peace." An olive shirt and the [officer ceremonial cap](/products/premium-officer-ceremonial-cap).
- **Farmer:** "I grow the food on your plate. Never waste a grain." A kurta, a dhoti, a gamchha and a sickle made of card.
- **Doctor or nurse:** "I take care of you when you are sick. Wash your hands and eat well." A white coat and a toy stethoscope.

## Cartoon, film and fun characters

Children's Day and Christmas are the days for fun. A teacher in a cartoon costume is the photo every child remembers.

- **Doraemon:** "I have a gadget for every problem, but the best gadget is your own brain." Our [full-body Doraemon mascot](/products/doraemon-cartoon) is a walk-around costume for an adult performer; send us your height to check the fit.
- **Santa Claus:** "Ho ho ho! Santa only brings gifts to children who share." The [Santa Claus dress](/products/santa-claus-dress) comes in a kids size and an adult size, so a teacher can be Santa while the class dresses as elves or a [reindeer](/products/reindeer-fancy-dress).
- **Gabbar Singh:** "कितने आदमी थे?" and then a twist: "Only one, and he did his homework!" The [Gabbar costume](/products/gabbar-fancy-dress) is sized for adults and suits a Bollywood theme or a staff skit.
- **A joker or a clown:** "My job is to make you laugh. Smile, it is free!" Add our [multicolour joker wig](/products/multi-color-joker-wig-fancy-dress) to a bright outfit.

## Group and couple ideas for staff

- **Radha and Krishna:** our adult pair, above, for two teachers or a teacher couple.
- **Ram darbar:** Ram, Sita, Laxman and Hanuman for four teachers, with Ravan as the surprise fifth.
- **Unity in Diversity:** each teacher in a different state costume, walking in to a medley of folk songs.
- **Freedom fighters' parade:** Gandhi, Bhagat Singh, Sarojini Naidu and Dr Kalam, each saying one line.
- **Bhangra or garba:** a two-minute staff dance in matching [Bhangra dresses](/category/bhangra-dress) or [garba dresses](/category/garba-dress) always brings the house down.
- **Teacher and student pair:** our [white and pink Kathak dress](/products/kathak-fancy-dress) is stocked in a kids size and an adult size, so a dance teacher and her student can match.

## Dressing a child as a teacher

On Teachers' Day, children often dress up as teachers. This is the easiest costume of the year.

- **For girls:** a saree, glasses, a bun, a register and a pointer. Our [kids saree costume](/products/kids-saree-fancy-dress-costume) or the [white saree with red border](/products/white-saree-red-border-fancy-dress) fits ages 3 to 9.
- **For boys:** a shirt, a tie, trousers, glasses and a duster in hand.
- **Stage intro:** "I am a teacher. I teach you to read and write, and I also teach you to be kind. Happy Teachers' Day!"

## Rent or buy

Every costume above can be rented for an event with a refundable deposit, or bought outright, from our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR. Annual-function season (December to February) is our busiest time, so book adult sizes early and send us your height and chest size on WhatsApp. If you are dressing a whole class or the staff for one programme, see our [school orders page](/wholesale/schools). For your students' costumes, start with our [fancy dress competition ideas for kids](/blog/fancy-dress-competition-ideas) and the [Children's Day fancy dress ideas](/blog/childrens-day-fancy-dress-ideas), and read how renting works on our [rent page](/rent).`

const KIDS = `A fancy dress competition for kids is judged on three things: a costume the judges recognise at once, a child who speaks clearly, and a message. So the best idea is a character your child likes, can wear comfortably, and can introduce in two lines. Below are fancy dress competition ideas for kids sorted by age (3 to 5, 6 to 8 and 9 to 12) and by the themes schools announce, each with a short stage intro your child can learn tonight. After 15+ years of dressing children for school competitions across Delhi NCR, these are the ideas we see win.

## How judges score a fancy dress competition

Most schools give marks under three heads. Plan for all three, not just the costume.

- **Costume:** Is it neat, complete and right for the theme? A clear outline (a crown, a cap, a colour) matters more than an expensive dress.
- **Confidence:** Does your child walk on, face the audience and speak loudly without looking at you? This is where most marks are won or lost.
- **Message:** Does the intro say something? "I am a tree" is fine. "I am a tree, please plant one more like me" wins.

Keep the intro short: two lines for ages 3 to 5, four lines for ages 6 to 8, and up to a minute for ages 9 to 12. Add one action, such as a salute, a roar or a twirl, and end with "Thank you."

## Ideas for ages 3 to 5 (nursery, LKG and UKG)

Pick something bright and soft, with one line to say. Avoid masks that cover the face and long dresses that trip on the steps.

- **Tomato:** "I am a tomato, red and round. Eat me and grow healthy and sound!" See our [tomato costume](/products/tomato-fancy-dress).
- **Carrot:** "I am a carrot, orange and long. Eat me daily to grow up strong." See the [carrot costume](/products/carrot-fancy-dress-costume).
- **Mango:** "I am a mango, the king of fruits. Summer is sweet because of me!" See the [mango costume](/products/mango-fancy-dress).
- **Sunflower:** "I am a sunflower. I always smile at the sun. Can you smile too?" See the [sunflower costume](/products/sun-flower-fancy-dress-costume).
- **Honeybee:** "Buzz, buzz! I make honey and help flowers grow." See the [honeybee costume](/products/honeybee-fancy-dress).
- **Peacock:** "I am a peacock, India's national bird. I dance when it rains!" See the [peacock costume](/products/peacock-fancy-dress).
- **Little Krishna:** "I am Kanha. I love butter and I love my friends." Our [Krishna costume for little ones](/products/krishna-fancy-dress-kid) is sized 3 to 5 years.
- **Star or moon:** "Twinkle, twinkle, I am a star. Work hard and you will go far!" See the [star costume](/products/star-fancy-dress) and the [moon costume](/products/moon-fancy-dress).
- **Cartoon friends:** [Doraemon](/products/doraemon-fancy-dress), [Tweety](/products/tweety-fancy-dress) or [Pooh Bear](/products/pooh-fancy-dress) for a child who is shy, because a wave and a smile are enough.

## Ideas for ages 6 to 8 (classes 1 to 3)

Children of this age can say four lines and hold a prop. Community helpers and leaders work very well.

- **Police officer:** "I am a police officer. I keep you safe. Follow traffic rules and always wear a helmet." See the [police costume](/products/police-fancy-dress).
- **Traffic light:** "Red means stop, yellow means wait, green means go. Follow me and you will never be late!" See the [traffic light costume](/products/traffic-light-fancy-dress-costumes).
- **Astronaut:** "I am an astronaut. I fly to space to learn about the stars. One day, I will go to the Moon!" See the [astronaut costume](/products/astronaut-fancy-dress).
- **Chef:** "I am a chef. I cook healthy food. Say yes to dal and roti, and no to junk food!" See the [chef costume](/products/chef-fancy-dress-costume).
- **Mahatma Gandhi:** "I am Bapu. I won freedom without a single weapon. Always speak the truth." The [Mahatma Gandhi costume](/products/mahatma-gandhi-fancy-dress-costume) is {{price:mahatma-gandhi-fancy-dress-costume}} to buy, or available on rent.
- **Chacha Nehru:** "I am Chacha Nehru. I loved children, so my birthday is Children's Day." See the [Jawaharlal Nehru costume](/products/jawahar-lal-nehru-fancy-dress).
- **Tree:** "I am a tree. I give you fresh air and shade. Please plant one more like me!" See the [tree costume](/products/tree-fancy-dress).
- **Angel or princess:** see our [angel dialogues](/blog/angel-dialogues-for-fancy-dress-competition) and [princess speeches](/blog/princess-speech-for-fancy-dress-competition), with the [angel costume](/products/angel-fancy-dress) or [Snow White](/products/snow-white-fancy-dress).

## Ideas for ages 9 to 12 (classes 4 to 7)

Older children can give a short speech of 45 seconds to a minute, so pick a character with a story.

- **Rani Laxmi Bai:** "I was a queen, but I picked up the sword for my people. I fought till my last breath, and I never gave up." See the [Rani Laxmi Bai costume](/products/jhansi-ki-rani-laxmi-bai-fancy-dress-costume).
- **Subhash Chandra Bose:** "I formed the Azad Hind Fauj and said: तुम मुझे ख़ून दो, मैं तुम्हें आज़ादी दूँगा।" See the [Netaji costume](/products/subhash-chandra-bose-fancy-dress).
- **Dr B R Ambedkar:** "I wrote the Constitution of India. Educate, agitate, organise." Read our [Ambedkar fancy dress speech](/blog/ambedkar-fancy-dress-speech) for a full version.
- **Mother Teresa:** "I served the poorest of the poor. Not all of us can do great things, but we can do small things with great love." See the [Mother Teresa costume](/products/mother-teresa-fancy-dress-costume).
- **Mother Earth:** "I am the Earth. I am getting warmer every year. Save water, plant trees and save me." See the [Earth costume](/products/earth-fancy-dress) and our [save nature fancy dress ideas](/blog/save-nature-fancy-dress-ideas).
- **A state of India:** "I am from Kerala, God's own country, where boats race on the backwaters." See the [Kerala costume](/products/kerala-fancy-dress) and our list of [28 states of India and their traditional dresses](/blog/states-of-india-traditional-dresses).
- **Maa Durga:** "I am Maa Durga. I fight evil, and I give strength to every girl." See the [Maa Durga costume](/products/maa-durga-fancy-dress).

## Ideas by theme

Schools usually announce a theme. Here is what to pick for the common ones, with the full range in each category.

### Freedom fighters and leaders

The most common theme, especially for Republic Day and Independence Day. Bhagat Singh, Gandhi, Netaji, Rani Laxmi Bai, Bharat Mata and Chacha Nehru are the safest picks, because the judges know them from the back row.

- **Bharat Mata:** "I am Bharat Mata. All of you are my children. Live together in peace." See the [Bharat Mata costume](/products/bharat-mata-fancy-dress-costume).
- **Bhagat Singh:** "I gave my life at 23 so that you could be free. इंक़लाब ज़िंदाबाद!" Add the [Bhagat Singh cap](/products/bhagat-singh-cap) to a white kurta.
- **Indira Gandhi:** "I was India's first woman Prime Minister. Girls can lead the nation." See the [Indira Gandhi costume](/products/indira-gandhi-fancy-dress-costume).

See all [freedom fighter and leader costumes](/category/leaders-freedom-fighters) and our [freedom fighter fancy dress ideas](/blog/freedom-fighter-fancy-dress-ideas).

### Indian mythology

Krishna, Ram, Sita, Hanuman, Durga and Ganesh photograph beautifully and every judge knows the story.

- **Ram:** "I am Ram. I kept my promise even when it was hard. Always keep your word." See the [Vanvasi Ram costume](/products/vanvasi-ram-fancy-dress).
- **Hanuman:** "जय श्री राम! Nothing is impossible if your heart is strong." See the [Hanuman costume with crown and gada](/products/hanuman-ji-fancy-dress-for-ramleela).
- **Ganesh:** "I am Ganesh. I remove obstacles. Start every good work with a smile." See the [Ganesh costume](/products/ganesh-fancy-dress).

See all [Indian mythology costumes](/category/indian-mythology-costumes) and our [list of Indian mythological characters](/blog/indian-mythological-characters-for-fancy-dress).

### Fruits, vegetables and healthy food

Unbeatable for nursery when the theme is "Eat Healthy". A junk food costume with a "say no" message is a clever twist for older children.

- **Cauliflower or lady finger:** "Eat your greens and you will never be mean!" See the [cauliflower](/products/cauliflower-fancy-dress) and [lady finger](/products/lady-finger-fancy-dress) costumes.
- **Watermelon:** "I am a watermelon. I keep you cool in summer." See the [watermelon costume](/products/watermelon-fancy-dress).
- **Burger or pizza:** "I look tasty, but too much of me makes you sick. Choose fruit instead!" See the [burger](/products/burger-fancy-dress) and [pizza](/products/pizza-fancy-dress) costumes.

Browse [vegetable costumes](/category/vegetable-costumes), [fruit costumes](/category/fruit-costumes) and [junk food costumes](/category/junk-food).

### Save nature and animals

Nature costumes carry their own message, which is why they win so often. Our [save nature fancy dress ideas](/blog/save-nature-fancy-dress-ideas) has a line for each.

- **Water drop:** "Without me there is no life. Close the tap while you brush!" See the [water drop costume](/products/water-drop-fancy-dress).
- **Lion, elephant or monkey:** a roar, a trunk swing or a hop counts as a performance, so animals suit shy children. See the [elephant](/products/elephant-fancy-dress) and [monkey](/products/monkey-fancy-dress) costumes.
- **Parrot or crow:** "I need trees to build my nest. Do not cut my home." See the [parrot costume](/products/parrot-fancy-dress).

Browse [animal costumes](/category/animal-costumes), [bird costumes](/category/bird-costumes) and [nature costumes](/category/nature-costumes).

### Community helpers and "when I grow up"

Doctor, police officer, firefighter, pilot, soldier, chef and teacher. The intro writes itself: "I am a firefighter. I put out fires and save lives." See the [firefighter costume](/products/fire-fighter-fancy-dress-costume), the [Air Force costume](/products/indian-air-force-fancy-dress-costume) and all [helper costumes](/category/helper-costumes).

### States of India and Unity in Diversity

Great for a class item, with each child as a different state. See [states fancy dress](/category/states-fancy-dress), [folk dance dresses](/category/folk-dance-dress) and [Rajasthani dresses](/category/rajasthani-dress).

### Cartoon, superhero and story characters

Good for Children's Day and fun rounds. Try [Balveer](/products/balveer-fancy-dress-costumes), [Harry Potter](/products/harry-potter-fancy-dress), a [mermaid](/products/mermaid-fancy-dress) with a save-the-ocean message, or browse [cartoon characters](/category/cartoon-characters) and [superhero costumes](/category/superhero-costumes).

### Unusual ideas that stand out

When every class has five Gandhis, an object with a message gets noticed.

- **Pencil:** "I am a pencil. I make mistakes, but I have an eraser. Learn from your mistakes!" See the [pencil costume](/products/pencil-fancy-dress-costume-for-kids).
- **Laptop or social media:** "I am a laptop. Use me to learn, not just to play games." See the [laptop costume](/products/laptop-fancy-dress-costumes).
- **The world:** "I am the world. We are all one family." See the [world costume](/products/world-fancy-dress-costume).

## Ideas by occasion

- [Children's Day fancy dress ideas](/blog/childrens-day-fancy-dress-ideas) for 14 November.
- [Republic Day fancy dress ideas](/blog/republic-day-fancy-dress-ideas-kids) for 26 January, and [Independence Day ideas](/blog/independence-day-fancy-dress-ideas) for 15 August.
- [Diwali fancy dress competition ideas](/blog/diwali-fancy-dress-competition-ideas) and the [Janmashtami Krishna dress guide](/blog/janmashtami-krishna-dress-guide).
- [Annual function fancy dress ideas](/blog/fancy-dress-ideas-school-annual-function) for December to February.
- Teachers dressing up too? See our [fancy dress ideas for teachers](/blog/fancy-dress-ideas-for-teachers).

## Checklist for competition day

- Try the costume on two days early and fix loose hooks or itchy edges.
- Practise the intro out loud, in the costume, in front of the family.
- Secure props with tape, safety pins or elastic. Keep them light.
- Carry spare safety pins, a comb, wet wipes and a water bottle.
- Reach early so your child sees the stage before going on it.

## Rent or buy

A competition costume is usually worn once, so renting often makes more sense. Every costume above can be rented for an event from our Krishna Nagar shop in East Delhi, with a refundable deposit, or bought outright, with delivery across Delhi NCR. If the same costume will be needed again (Gandhi and Nehru come back every 15 August and 26 January), buying can be cheaper. Read [should you rent or buy](/blog/rent-or-buy-fancy-dress-costume), see how renting works on our [rent page](/rent), or WhatsApp us your child's age and height and we will suggest a size.`

/** Products the teachers' post presents as adult-size: must say so in the DB. */
const ADULT = [
  'krishna-fancy-dress',
  'krishna-fancy-dress-king',
  'radha-rani-fancy-dress',
  'ravan-costume-for-adults',
  'mahishasur-fancy-dress',
  'rajasthani-dance-fancy-dress-for-men',
  'rajasthani-lehenga-fancy-dress',
  'kalbelia-dance-dress-costume-fancy-dress',
  'bhangra-dance-costume-for-boys-orange-fancy-dress',
  'bhangra-dance-fancy-dress-costume-blue-yellow',
  'punjabi-suit',
  'yellow-haryanvi-lehnga-fancy-dress',
  'white-kutchi-mirror-work-dandiya-chaniya-choli',
  'rainbow-bandhani-dandiya-lehenga',
  'assam-fancy-dress',
  'bengali-saree-fancy-dress',
  'manipur-fancy-dress',
  'astronaut-fancy-dress',
  'santa-claus-dress',
  'gabbar-fancy-dress',
  'kathak-fancy-dress',
]

const POSTS = [
  {
    slug: 'fancy-dress-ideas-for-teachers',
    title: 'Fancy Dress Competition for Teachers: Ideas by Theme',
    excerpt:
      "Fancy dress ideas for teachers for Teachers' Day, Children's Day and annual functions: leaders, gods, states and fun looks, with a stage line for each.",
    content: TEACHERS,
    coverFrom: 'ravan-costume-for-adults',
    related: ['indian-mythology-costumes', 'dandiya-dress', 'bhangra-dress', 'rajasthani-dress'],
  },
  {
    slug: 'fancy-dress-competition-ideas',
    title: 'Fancy Dress Competition for Kids: Ideas by Age & Theme',
    excerpt:
      'Fancy dress competition ideas for kids by age (3–12) and theme, with a two-line stage intro for each, judging tips and costumes to rent in Delhi.',
    content: KIDS,
    coverFrom: 'jhansi-ki-rani-laxmi-bai-fancy-dress-costume',
    related: ['leaders-freedom-fighters', 'indian-mythology-costumes', 'vegetable-costumes', 'animal-costumes', 'helper-costumes'],
  },
]

const APPLY = process.argv.includes('--apply')
let pass = 0

run(async (cat) => {
  pass++

  // Adult-size claims must match the live rows.
  const { data: adultRows, error: ae } = await sb.from('products').select('slug, size, description').in('slug', ADULT)
  if (ae) throw new Error(ae.message)
  const bySlug = new Map((adultRows ?? []).map((r) => [r.slug as string, r as { size: string | null; description: string | null }]))
  const notAdult = ADULT.filter((s) => {
    const r = bySlug.get(s)
    return !r || !(r.size === 'Adult' || /\badults?\b|\bwomen\b|\bmen\b/i.test(r.description ?? ''))
  })
  if (notAdult.length) throw new Error(`not adult-size in DB: ${notAdult.join(', ')}`)
  for (const s of ADULT) if (!TEACHERS.includes(`/products/${s})`)) throw new Error(`ADULT lists ${s} but the teachers' post does not link it`)
  console.log(`   ✔ ${ADULT.length} adult-size claims match the DB`)

  // /blog/ links are not checked by assertLinks: each must be a published post or one written here.
  const { data: live } = await sb.from('blog_posts').select('slug').not('published_at', 'is', null)
  const posts = new Set([...(live ?? []).map((p) => p.slug as string), ...POSTS.map((p) => p.slug)])
  for (const p of POSTS) {
    const dead = [...p.content.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)].map((m) => m[1]).filter((s) => !posts.has(s) || s === p.slug)
    if (dead.length) throw new Error(`${p.slug}: bad blog links: ${dead.join(', ')}`)
    if (/^\s*\d+\.\s/m.test(p.content)) throw new Error(`${p.slug}: numbered list (BlogContent renders it as a paragraph)`)
    if (/^\|/m.test(p.content)) throw new Error(`${p.slug}: table`)
  }

  const { data: cats } = await sb.from('categories').select('slug').eq('is_active', true)
  const active = new Set((cats ?? []).map((c) => c.slug as string))

  for (const p of POSTS) {
    await upsertPost(cat, { slug: p.slug, title: p.title, excerpt: p.excerpt, content: p.content })
    const blogLinks = [...p.content.matchAll(/\]\(\/blog\//g)].length
    console.log(`   blog links ${blogLinks} | title ${p.title.length} | excerpt ${p.excerpt.length}`)

    for (const c of p.related) if (!active.has(c)) throw new Error(`${p.slug}: ${c} is not an active category`)
    const { data: prod, error } = await sb.from('products').select('images:product_images(image_url,is_primary)').eq('slug', p.coverFrom).single()
    if (error) throw new Error(`${p.coverFrom}: ${error.message}`)
    const imgs = (prod as { images: { image_url: string; is_primary: boolean }[] }).images
    const cover = (imgs.find((i) => i.is_primary) ?? imgs[0])?.image_url
    if (!cover) throw new Error(`${p.coverFrom}: no image`)
    const update = { cover_image_url: cover, related_category_slugs: p.related }
    console.log(`   cover from ${p.coverFrom}: ${cover.split('/').pop()}\n   related: ${p.related.join(', ')}`)
    if (APPLY && pass === 2) {
      const { error: e } = await sb.from('blog_posts').update(update).eq('slug', p.slug)
      console.log(e ? `   ❌ ${e.message}` : '   ✅ cover + grid written')
    }
  }
  if (APPLY && pass === 2) await revalidateSite('content')
})

# modfancydress.com catalog DB audit (read-only) — 2026-09-23
Data dumped via service-role selects (dump.ts); analysis scripts an1-an4.py; image HEAD+magic-byte results in heads.tsv.

## Key synthesis
- 554 products total; 323 live; 57 categories; 20 blog posts (no meta column: excerpt is used as meta description).
- Text SEO fields now nearly complete: only krishna-fancy-dress and radha-rani-fancy-dress (24 Aug batch) lack desc+meta+seo_title.
- alt_text empty on images of 152 live products (every batch incl. 19 Sep Ramleela/garba). Frontend falls back to product name / "<name> Main Image".
- Orphans: school-fancy-dress-red-color, odisi-fancy-dress, radha-rani-fancy-dress, astronaut-fancy-dress.
- Meta >160: jhansi-ki-rani-laxmi-bai-fancy-dress-costume (164), indira-gandhi-fancy-dress-costume (161). No seo_title >60, no duplicate seo_title/meta.
- Redirects: /products/vanvasi-ram is a LIVE product but redirects to vanvasi-ram-fancy-dress (live page unreachable). 48 redirects end at dead (deleted) product slugs -> 404. 227/231 dead products have no redirect.
- Broken images: mother-teresa-fancy-dress-costume-1/2.jpg and traffic-police-fancy-dress-costume-1/2.jpg are an HTML 404 page from "Sanskriti Fancy Dresses", not images.
- Images: 644 live-product images, 191 MB total, median 62 KB; 189 images >300KB across 165 products; 111 >500KB; 49 >1MB (up to 2.8MB). 84 live images are PNG bytes under .webp names.


---- out1.txt ----
total products 554 live 323 inactive/deleted 231

## 1 missing fields by batch date
2026-01-12 63
    maratha-safa-pagdi-red-and-golden-fancy-dress alt(3/3)
    mughal-fancy-pagdi-mughal-pagdi-fancy-dress alt(4/4)
    army-fancy-dress-costume-kargil-print alt(1/1)
    sikh-punjabi-safa-pagadi-orange-fancy-dress alt(3/3)
    wooden-gun-weapons-for-drama-fancy-dress alt(3/3)
    sikh-punjabi-safa-red-fancy-dress alt(3/3)
    kalbelia-dress-costume-for-girls-fancy-dress alt(4/4)
    angrakha-and-dhoti-fancy-dress-costume alt(2/2)
    bengali-fancy-dress-costume-for-boy alt(3/3)
    haryanvi-dance-lehenga-fancy-dress alt(4/4)
    kalbelia-dance-dress-costume-fancy-dress alt(4/4)
    kathak-dress-blue-colour-fancy-dress alt(5/5)
    tiranga-color-costume-for-boys-girls-fancy-dress alt(1/1)
    freedom-fighter-mangal-pandey-red-hat-cap-fancy-dress alt(1/1)
    traditional-navratri-chaniya-choli-fancy-dress alt(5/5)
    kathak-dance-dress-anarkali-style-costume-fancy-dress alt(2/2)
    indian-air-force-fancy-dress-costume alt(1/1)
    kathak-dress-green-colour-fancy-dress alt(3/3)
    kathak-dance-dress-costume-yellow-with-purple-fancy-dress alt(4/4)
    golden-fancy-mughal-pagdi-turban-fancy-dress alt(3/3)
    rajasthani-dance-fancy-dress-for-men alt(3/3)
    dhal-with-talwar-set-for-drama-fancy-dress alt(4/4)
    navratri-chaniya-choli-fancy-dress alt(3/3)
    kathak-dance-dress-anarkali-style-fancy-dress alt(4/4)
    anarkali-kathak-fancy-dress-costume-white alt(2/2)
    kathak-anarkali-costume-fancy-dress alt(5/5)
    kathak-dance-costume-fancy-dress alt(3/3)
    kathak-costume-fancy-dress alt(5/5)
    kathak-dance-dress-fancy-dress alt(4/4)
    haryanvi-safa-pagdi-green-fancy-dress alt(4/4)
    crocodile-fancy-dress-animal-costume-for-kids alt(3/3)
    rajasthani-folk-dance-fancy-dress alt(2/2)
    manipuri-folk-dance-fancy-dress-costume alt(3/3)
    hanuman-ji-fancy-dress-for-ramleela alt(3/3)
    deer-fancy-dress-costume-for-kids alt(4/4)
    chatrapati-shivaji-maharaj-pagdi-fancy-dress alt(4/4)
    noddy-fancy-dress-costumes alt(3/3)
    krishna-fancy-dress-costume alt(4/4)
    kediya-garba-dance-fancy-dress-costume alt(5/5)
    rani-laxmi-bai-pagdi-turban-for-girls-fancy-dress alt(1/1)
    dog-fancy-dress-costume-for-kids alt(3/3)
    sikh-punjabi-safa-pagadi-black-fancy-dress alt(3/3)
    kedia-dress-fancy-dress alt(3/3)
    hanuman-gada-for-drama-fancy-dress alt(3/3)
    multicolor-haryanvi-lehenga-choli-costume-fancy-dress alt(3/3)
    daaman-fancy-dress-traditional-costume alt(3/3)
    angarkha-dhoti-fancy-dress-costume-yellow alt(2/2)
    manipuri-dance-fancy-dress-costume-for-girls alt(4/4)
    gujarati-garba-dance-fancy-dress-costume alt(3/3)
    mahatma-gandhi-fancy-dress-costume alt(1/1)
    sword-for-drama-fancy-dress alt(3/3)
    hindu-raja-fancy-dress-costume-for-boys alt(3/3)
    rajasthani-traditional-fancy-dress-costume alt(3/3)
    pooh-fancy-dress-costumes alt(3/3)
    squirrel-fancy-dress-animal-costume-for-kids alt(3/3)
    jhansi-ki-rani-laxmi-bai-fancy-dress-costume alt(1/1)
    rani-sita-fancy-dress-costume-for-ramleela alt(4/4)
    bharat-mata-fancy-dress-costume alt(1/1)
    bal-gangadhar-tilak-fancy-dress-costume alt(1/1)
    cow-animal-fancy-dress-costume alt(3/3)
    mughal-fancy-pagdi-green-fancy-dress alt(4/4)
    sikh-punjabi-safa-pagadi-yellow-fancy-dress alt(3/3)
    turtle-fancy-dress-costume-for-kids alt(2/2)
2026-01-23 1
    haryanvi-shirt-and-lehenga-fancy-dress alt(1/1)
2026-02-27 4
    duck-fancy-dress alt(1/1)
    elephant-fancy-dress alt(1/1)
    horse-fancy-dress alt(1/1)
    monkey-fancy-dress alt(1/1)
2026-03-02 12
    pooh-fancy-dress alt(1/1)
    polar-bear-fancy-dress alt(1/1)
    angry-bird-fancy-dress alt(1/1)
    cow-fancy-dress alt(1/1)
    water-melon-fancy-dress alt(1/1)
    octopus-fancy-dress alt(1/1)
    earth-fancy-dress alt(1/1)
    doraemon-fancy-dress alt(1/1)
    fox-fancy-dress alt(1/1)
    tweety-fancy-dress alt(1/1)
    giraffe-fancy-dress alt(1/1)
    chutki-fancy-dress alt(1/1)
2026-03-03 10
    crow-fancy-dress alt(1/1)
    white-saree-red-border-fancy-dress alt(1/1)
    bhangra-fancy-dress alt(1/1)
    bhangra-dress-fancy-dress alt(1/1)
    green-bharatnatyam-fancy-dress alt(1/1)
    bharatnatyam-fancy-dress alt(1/1)
    yellow-and-red-bharatnatyam-fancy-dress alt(1/1)
    bhangra-suit-for-adult-fancy-dress alt(1/1)
    bhangra-suit-fancy-dress alt(2/2)
    parrot-fancy-dress alt(1/1)
2026-03-07 1
    mermaid-fancy-dress alt(1/1)
2026-03-08 2
    pigeon-fancy-dress alt(1/1)
    peacock-fancy-dress alt(1/1)
2026-03-10 3
    odissi-fancy-dress alt(2/2)
    bharatnatyam-fancy-dress-1 alt(2/2)
    kathak-fancy-dress alt(1/1)
2026-03-31 3
    pink-bharatnatyam-fancy-dress alt(1/1)
    orange-bharatnatyam-fancy-dress alt(1/1)
    green-orange-bharatnatyam-fancy-dress alt(1/1)
2026-04-01 1
    snow-white-fancy-dress alt(1/1)
2026-04-02 2
    gujrati-boy-fancy-dress alt(1/1)
    boy-haryanvi-dress alt(1/1)
2026-04-03 2
    maratha-fancy-dress alt(1/1)
    nagaland-girl-fancy-dress alt(2/2)
2026-04-06 2
    rajasthani-boy-fancy-dress alt(1/1)
    rajasthani-lehenga-fancy-dress alt(1/1)
2026-04-07 8
    kerala-fancy-dres alt(1/1)
    kathakali-fancy-dress alt(1/1)
    manipur-boy-fancy-dress alt(1/1)
    sikkim-fancy-dress alt(2/2)
    himachal-fancy-dress alt(1/1)
    pahdi-boy-fancy-dress alt(1/1)
    rajasthani-fancy-dress alt(1/1)
    sambhalpuri-boy-fancy-dress alt(1/1)
2026-04-08 5
    air-force-cap alt(1/1)
    police-officer-cap alt(1/1)
    premium-officer-ceremonial-cap alt(1/1)
    red-band-master-officer-cap alt(1/1)
    sub-inspector-cap alt(1/1)
2026-04-09 2
    krishna-blue-and-yellow-fancy-dress alt(1/1)
    pink-and-yellow-krishna-fancy-dress alt(1/1)
2026-04-16 1
    kargil-fancy-dress alt(1/1)
2026-04-17 1
    odisi-fancy-dress alt(2/2)
2026-06-26 3
    subhash-chander-bose-fancy-dress alt(1/1)
    mangal-pandey-fancy-dress alt(1/1)
    police-fancy-dress alt(1/1)
2026-07-11 2
    bhagat-singh-cap alt(1/1)
    indira-gandhi-fancy-dress-costume alt(1/1)
2026-07-31 1
    kashmiri-fancy-dress alt(1/1)
2026-08-02 2
    blue-lehenga-dandiya-dress alt(2/2)
    pink-lehenga-dandiya-dress alt(1/1)
2026-08-04 5
    dandiya-gujarati-fancy-dress alt(1/1)
    dandiya-fancy-dress-yellow alt(1/1)
    dandiya-fancy-dress-cream alt(1/1)
    dandiya-fancy-dress-pink alt(1/1)
    dandiya-fancy-dress-lehenga alt(1/1)
2026-08-24 2
    krishna-fancy-dress desc+meta+title+alt(2/2)
    radha-rani-fancy-dress desc+meta+title+alt(2/2)
2026-09-19 14
    hanuman-red-fancy-dress alt(2/2)
    raja-ram-fancy-dress alt(2/2)
    jatayu-fancy-dress alt(2/2)
    kumbhkaran-fancy-dress alt(2/2)
    hanuman-ji-fancy-dress alt(2/2)
    rishi-fancy-dress alt(2/2)
    vanvasi-ram alt(2/2)
    jaamvant-fancy-dress alt(2/2)
    ravan-fancy-dress alt(9/9)
    hulk-muscle-fancy-dress-with-mask alt(2/2)
    iron-man-muscle-fancy-dress-with-mask alt(1/1)
    black-red-triangle-border-garba-lehenga alt(1/1)
    white-peacock-palace-print-ghoomar-lehenga alt(1/1)
    meghnath-fancy-dress alt(2/2)
total needing 152
Counter({'alt': 152, 'description': 2, 'meta_description': 2, 'seo_title': 2})

## long meta >160
2
   ('jhansi-ki-rani-laxmi-bai-fancy-dress-costume', 164)
   ('indira-gandhi-fancy-dress-costume', 161)
## short meta <70
0
## long title >60
0
## dup titles
seo_title dups 0
meta_description dups 0
name dups 3
    bharatnatyam fancy dress -> ['bharatnatyam-fancy-dress-1', 'bharatnatyam-fancy-dress']
    rajasthani lehenga fancy dress -> ['rajasthani-lehenga-fancy-dress', 'rajasthani-lehnga-fancy-dress']
    doraemon fancy dress -> ['doraemon-cartoon', 'doraemon-fancy-dress']

## 2 orphans
   school-fancy-dress-red-color School Fancy Dress Red Color 2026-03-31
   odisi-fancy-dress Odisi Fancy Dress 2026-04-17
   radha-rani-fancy-dress Radha Rani Fancy Dress 2026-08-24
   astronaut-fancy-dress Astronaut Fancy Dress 2026-04-01
bad category refs []

---- out2.txt ----
## 3 keyword groups
# krishna (9)
  krishna-blue-and-yellow-fancy-dress | Krishna Blue And Yellow Fancy Dress | Rs1300 rent500 | indian-mythology-costumes,janmashtami-dress | img1 | 2026-04-09 | meta:Y
  krishna-fancy-dress | Krishna Fancy Dress | Rs3500 rent1000 | janmashtami-dress | img2 | 2026-08-24 | meta:N
  krishna-fancy-dress-costume | Krishna Fancy Dress Costume | Rs799 rent300 | indian-mythology-costumes,mythological-characters-costume | img4 | 2026-01-12 | meta:Y
  krishna-fancy-dress-kid | Krishna Fancy Dress Kid | Rs250 rent200 | indian-mythology-costumes,janmashtami-dress | img1 | 2026-04-09 | meta:Y
  krishna-fancy-dress-king | Krishna Fancy Dress King | Rs1100 rent800 | indian-mythology-costumes,janmashtami-dress | img1 | 2026-04-09 | meta:Y
  krishna-green-fancy-dress | Krishna Green Fancy Dress | Rs450 rent300 | indian-mythology-costumes,janmashtami-dress | img1 | 2026-04-16 | meta:Y
  krishna-yellow-dhoti-kurta-fancy-dress | Krishna Yellow Dhoti Kurta Fancy Dress | Rs650 rent450 | indian-mythology-costumes,janmashtami-dress | img1 | 2026-04-09 | meta:Y
  krishna-yellow-fancy-dress | Krishna Yellow Fancy Dress | Rs400 rent300 | indian-mythology-costumes,janmashtami-dress | img1 | 2026-04-16 | meta:Y
  pink-and-yellow-krishna-fancy-dress | Pink And Yellow Krishna Fancy Dress | Rs1300 rent600 | indian-mythology-costumes,janmashtami-dress | img1 | 2026-04-09 | meta:Y
# radha (4)
  radha-rani-dress-kids-fancy-dress | Radha Rani Dress Kids Fancy Dress | Rs750 rent300 | janmashtami-dress,lehenga | img4 | 2026-01-12 | meta:Y
  radha-rani-fancy-dress | Radha Rani Fancy Dress | Rs3500 rent1000 |  | img2 | 2026-08-24 | meta:N
  radha-rani-lehenga-choli-fancy-dress | Radha Rani Lehenga Choli Fancy Dress | Rs750 rent300 | janmashtami-dress,lehenga | img3 | 2026-01-12 | meta:Y
  radha-rani-lehenga-dress-pink-golden-fancy-dress | Radha Rani Lehenga Dress Pink Golden Fancy Dress | Rs750 rent300 | janmashtami-dress,lehenga | img3 | 2026-01-12 | meta:Y
# doraemon (2)
  doraemon-cartoon | Doraemon Fancy Dress | Rs2250 rent1000 | cartoon-characters,doraemon | img1 | 2026-03-30 | meta:Y
  doraemon-fancy-dress | Doraemon Fancy Dress | Rs800 rent300 | cartoon-characters | img1 | 2026-03-02 | meta:Y
# bharatnatyam (7)
  bharatnatyam-fancy-dress | Bharatnatyam Fancy Dress | Rs2250 rent550 | bharatnatyam | img1 | 2026-03-03 | meta:Y
  bharatnatyam-fancy-dress-1 | Bharatnatyam Fancy Dress | Rs2250 rent400 | bharatnatyam,classical-dance-dress | img2 | 2026-03-10 | meta:Y
  green-bharatnatyam-fancy-dress | Green Bharatnatyam Fancy Dress | Rs2250 rent750 | bharatnatyam | img1 | 2026-03-03 | meta:Y
  green-orange-bharatnatyam-fancy-dress | Green Orange Bharatnatyam Fancy Dress | Rs2250 rent1000 | bharatnatyam | img1 | 2026-03-31 | meta:Y
  orange-bharatnatyam-fancy-dress | Orange Bharatnatyam Fancy Dress | Rs2250 rent1000 | bharatnatyam | img1 | 2026-03-31 | meta:Y
  pink-bharatnatyam-fancy-dress | Pink Bharatnatyam Fancy Dress | Rs2250 rent1000 | bharatnatyam | img1 | 2026-03-31 | meta:Y
  yellow-and-red-bharatnatyam-fancy-dress | Yellow And Red Bharatnatyam Fancy Dress | Rs2250 rent350 | bharatnatyam | img1 | 2026-03-03 | meta:Y
# kathak (14)
  anarkali-kathak-fancy-dress-costume-white | Anarkali Kathak Fancy Dress Costume White | Rs1200 rent300 | kathak-dress | img2 | 2026-01-12 | meta:Y
  kathak-anarkali-costume-fancy-dress | Kathak Anarkali Costume Fancy Dress | Rs1200 rent300 | kathak-dress | img5 | 2026-01-12 | meta:Y
  kathak-anarkali-fancy-dress-style-white-red | Kathak Anarkali Fancy Dress Style White Red | Rs400 rent300 | kathak-dress | img3 | 2026-01-12 | meta:Y
  kathak-costume-fancy-dress | Kathak Costume Fancy Dress | Rs1200 rent300 | kathak-dress | img5 | 2026-01-12 | meta:Y
  kathak-dance-costume-fancy-dress | Kathak Dance Costume Fancy Dress | Rs1200 rent300 | kathak-dress | img3 | 2026-01-12 | meta:Y
  kathak-dance-dress-anarkali-style-costume-fancy-dress | Kathak Dance Dress Anarkali Style Costume Fancy Dress | Rs1200 rent300 | kathak-dress | img2 | 2026-01-12 | meta:Y
  kathak-dance-dress-anarkali-style-fancy-dress | Kathak Dance Dress Anarkali Style Fancy Dress | Rs1200 rent300 | kathak-dress | img4 | 2026-01-12 | meta:Y
  kathak-dance-dress-costume-yellow-with-purple-fancy-dress | Kathak Dance Dress Costume Yellow With Purple Fancy Dress | Rs1200 rent300 | kathak-dress | img4 | 2026-01-12 | meta:Y
  kathak-dance-dress-fancy-dress | Kathak Dance Dress Fancy Dress | Rs1200 rent300 | kathak-dress | img4 | 2026-01-12 | meta:Y
  kathak-dress-blue-colour-fancy-dress | Kathak Dress Blue Colour Fancy Dress | Rs1200 rent300 | kathak-dress | img5 | 2026-01-12 | meta:Y
  kathak-dress-green-colour-fancy-dress | Kathak Dress Green Colour Fancy Dress | Rs1200 rent300 | kathak-dress | img3 | 2026-01-12 | meta:Y
  kathak-fancy-dress | Kathak Fancy Dress | Rs1200 rent400 | classical-dance-dress,folk-dance-dress | img1 | 2026-03-10 | meta:Y
  kathak-fancy-dress-costume-for-classical-dance | Kathak Fancy Dress Costume For Classical Dance | Rs1050 rent300 | kathak-dress | img4 | 2026-01-12 | meta:Y
  kathakali-fancy-dress | Kathakali Fancy Dress | Rs7500 rent2500 | folk-dance-dress,states-fancy-dress | img1 | 2026-04-07 | meta:Y
# dandiya/garba/chaniya (30)
  black-and-red-medallion-garba-chaniya-choli | Black and Red Medallion Garba Chaniya Choli | Rs2300 rent800 | dandiya-dress,garba-dress | img1 | 2026-09-19 | meta:Y
  black-multicolour-mirror-work-garba-lehenga | Black Multicolour Mirror Work Garba Lehenga | Rs2300 rent800 | dandiya-dress,garba-dress | img1 | 2026-09-19 | meta:Y
  black-red-triangle-border-garba-lehenga | Black And Red Triangle Border Garba Lehenga | Rs2500 rent800 | dandiya-dress,garba-dress | img1 | 2026-09-19 | meta:Y
  blue-lehenga-dandiya-dress | Blue Lehenga Dandiya Dress | Rs1800 rent350 | dandiya-dress | img2 | 2026-08-02 | meta:Y
  blue-polyester-garba-dance-costume-fancy-dress | Blue Polyester Garba Dance Costume Fancy Dress | Rs550 rent400 | folk-dance-dress | img2 | 2026-01-12 | meta:Y
  dandiya-fancy-dress | Dandiya Fancy Dress | Rs1350 rent1000 | dandiya-dress | img1 | 2026-03-21 | meta:Y
  dandiya-fancy-dress-cream | Dandiya Fancy Dress Cream | Rs2000 rent800 | dandiya-dress | img1 | 2026-08-04 | meta:Y
  dandiya-fancy-dress-lehenga | Dandiya Fancy Dress Lehenga | Rs2000 rent800 | dandiya-dress | img1 | 2026-08-04 | meta:Y
  dandiya-fancy-dress-pink | Dandiya Fancy Dress Pink | Rs2000 rent800 | dandiya-dress | img1 | 2026-08-04 | meta:Y
  dandiya-fancy-dress-yellow | Dandiya Fancy Dress Yellow | Rs2000 rent800 | dandiya-dress | img1 | 2026-08-04 | meta:Y
  dandiya-gujarati-fancy-dress | Dandiya Gujarati Fancy Dress | Rs2250 rent1000 | dandiya-dress | img1 | 2026-08-04 | meta:Y
  garba-dancer-print-navratri-chaniya-choli | Garba Dancer Print Navratri Chaniya Choli | Rs2300 rent800 | dandiya-dress,garba-dress | img1 | 2026-09-19 | meta:Y
  green-printed-gujarati-garba-chaniya-choli | Green Printed Gujarati Garba Chaniya Choli | Rs2300 rent800 | dandiya-dress,garba-dress | img1 | 2026-09-19 | meta:Y
  gujarati-garba-dance-fancy-dress-costume | Gujarati Garba Dance Fancy Dress Costume | Rs1500 rent500 | garba-dress | img3 | 2026-01-12 | meta:Y
  kedia-dress-fancy-dress | Kedia Dress Fancy Dress | Rs1000 rent350 | garba-dress | img3 | 2026-01-12 | meta:Y
  kediya-garba-dance-fancy-dress-costume | Kediya Garba Dance Fancy Dress Costume | Rs1000 rent350 | garba-dress | img5 | 2026-01-12 | meta:Y
  magenta-diamond-panel-dandiya-lehenga | Magenta Diamond Panel Dandiya Lehenga | Rs2300 rent800 | dandiya-dress,garba-dress | img1 | 2026-09-19 | meta:Y
  maroon-gold-embroidered-dandiya-night-lehenga | Maroon Gold Embroidered Dandiya Night Lehenga | Rs2300 rent800 | dandiya-dress,garba-dress | img1 | 2026-09-19 | meta:Y
  maroon-kutchi-embroidered-dandiya-lehenga | Maroon Kutchi Embroidered Dandiya Lehenga | Rs2300 rent800 | dandiya-dress,garba-dress | img1 | 2026-09-19 | meta:Y
  multicolour-patchwork-mirror-work-garba-lehenga | Multicolour Patchwork Mirror Work Garba Lehenga | Rs2300 rent800 | dandiya-dress,garba-dress | img1 | 2026-09-19 | meta:Y
  navratri-chaniya-choli-fancy-dress | Navratri Chaniya Choli Fancy Dress | Rs1500 rent2500 | garba-dress | img3 | 2026-01-12 | meta:Y
  pink-lehenga-dandiya-dress | Pink Lehenga Dandiya Dress | Rs2200 rent500 | dandiya-dress | img1 | 2026-08-02 | meta:Y
  rainbow-panel-mirror-work-garba-chaniya-choli | Rainbow Panel Mirror Work Garba Chaniya Choli | Rs2300 rent800 | dandiya-dress,garba-dress | img1 | 2026-09-19 | meta:Y
  red-and-black-mirror-work-garba-lehenga | Red and Black Mirror Work Garba Lehenga | Rs2300 rent800 | dandiya-dress,garba-dress | img1 | 2026-09-19 | meta:Y
  traditional-navratri-chaniya-choli-fancy-dress | Traditional Navratri Chaniya Choli Fancy Dress | Rs1800 rent300 | garba-dress | img5 | 2026-01-12 | meta:Y
  white-dandiya-fancy-dress | White Dandiya Fancy Dress | Rs2550 rent1000 | dandiya-dress | img1 | 2026-03-21 | meta:Y
  white-kutchi-mirror-work-dandiya-chaniya-choli | White Kutchi Mirror Work Dandiya Chaniya Choli | Rs2300 rent800 | dandiya-dress,garba-dress | img1 | 2026-09-19 | meta:Y
  white-peacock-palace-print-ghoomar-lehenga | White Peacock And Palace Print Ghoomar Lehenga | Rs3000 rent800 | dandiya-dress,garba-dress | img1 | 2026-09-19 | meta:Y
  yellow-elephant-motif-garba-chaniya-choli | Yellow Elephant Motif Garba Chaniya Choli | Rs2300 rent800 | dandiya-dress,garba-dress | img1 | 2026-09-19 | meta:Y
  yellow-peacock-panel-garba-chaniya-choli | Yellow Peacock Panel Garba Chaniya Choli | Rs2300 rent800 | dandiya-dress,garba-dress | img1 | 2026-09-19 | meta:Y
# rajasthani (8)
  jaipuri-print-rajasthani-pagdi-turban-fancy-dress | Jaipuri Print Rajasthani Pagdi Turban Fancy Dress | Rs400 rent300 | accessories | img3 | 2026-01-12 | meta:Y
  rajasthani-boy-fancy-dress | Rajasthani Boy Fancy Dress | Rs750 rent400 | rajasthani-dress | img1 | 2026-04-06 | meta:Y
  rajasthani-dance-fancy-dress-for-men | Rajasthani Dance Fancy Dress For Men | Rs1000 rent300 | rajasthani-dress | img3 | 2026-01-12 | meta:Y
  rajasthani-fancy-dress | Rajasthani Fancy Dress | Rs750 rent400 | rajasthani-dress | img1 | 2026-04-07 | meta:Y
  rajasthani-folk-dance-fancy-dress | Rajasthani Folk Dance Fancy Dress | Rs500 rent300 | rajasthani-dress | img2 | 2026-01-12 | meta:Y
  rajasthani-lehenga-fancy-dress | Rajasthani Lehenga Fancy Dress | Rs850 rent500 | rajasthani-dress | img1 | 2026-04-06 | meta:Y
  rajasthani-lehnga-fancy-dress | Rajasthani Lehenga Fancy Dress | Rs750 rent500 | rajasthani-dress | img1 | 2026-03-31 | meta:Y
  rajasthani-traditional-fancy-dress-costume | Rajasthani Traditional Fancy Dress Costume | Rs1100 rent300 | rajasthani-dress | img3 | 2026-01-12 | meta:Y
# bhangra (6)
  bhangra-dance-costume-for-boys-orange-fancy-dress | Bhangra Dance Costume For Boys Orange Fancy Dress | Rs1100 rent800 | folk-dance-dress | img3 | 2026-01-12 | meta:Y
  bhangra-dance-fancy-dress-costume-blue-yellow | Bhangra Dance Fancy Dress Costume Blue Yellow | Rs1100 rent300 | folk-dance-dress | img3 | 2026-01-12 | meta:Y
  bhangra-dress-fancy-dress | Bhangra Dress Fancy Dress | Rs1000 rent250 | bhangra-dress | img1 | 2026-03-03 | meta:Y
  bhangra-fancy-dress | Bhangra Fancy Dress | Rs2500 rent400 | bhangra-dress | img1 | 2026-03-03 | meta:Y
  bhangra-suit-fancy-dress | Bhangra Suit Fancy Dress | Rs750 rent250 | bhangra-dress | img2 | 2026-03-03 | meta:Y
  bhangra-suit-for-adult-fancy-dress | Bhangra Suit For Adult Fancy Dress | Rs1500 rent400 | bhangra-dress | img1 | 2026-03-03 | meta:Y
# haryanvi (7)
  boy-haryanvi-dress | Haryanvi Boy Fancy Dress | Rs850 rent400 | haryanvi-dress | img1 | 2026-04-02 | meta:Y
  haryanvi-dance-lehenga-fancy-dress | Kid Haryanvi Dance Lehenga Fancy Dress | Rs700 rent300 | haryanvi-dress | img4 | 2026-01-12 | meta:Y
  haryanvi-safa-pagdi-green-fancy-dress | Haryanvi Safa Pagdi Green Fancy Dress | Rs600 rent300 | accessories | img4 | 2026-01-12 | meta:Y
  haryanvi-shirt-and-lehenga-fancy-dress | Haryanvi Shirt And Lehenga Fancy Dress | Rs750 rent300 | haryanvi-dress | img1 | 2026-01-23 | meta:Y
  multicolor-haryanvi-lehenga-choli-costume-fancy-dress | Multicolor Haryanvi Lehenga Choli Costume Fancy Dress | Rs1500 rent300 | haryanvi-dress | img3 | 2026-01-12 | meta:Y
  red-haryanvi-lehnga-fancy-dress | Red Haryanvi Lehenga Fancy Dress | Rs1100 rent800 | haryanvi-dress | img1 | 2026-04-01 | meta:Y
  yellow-haryanvi-lehnga-fancy-dress | Yellow Haryanvi Lehenga Fancy Dress | Rs1100 rent800 | haryanvi-dress | img1 | 2026-04-01 | meta:Y
# hanuman (5)
  hanuman-gada-for-drama-fancy-dress | Hanuman Gada For Drama Fancy Dress | Rs400 rent300 | accessories,ramleela-costumes | img3 | 2026-01-12 | meta:Y
  hanuman-ji-fancy-dress | Hanuman Ji Fancy Dress | Rs650 rent450 | ramleela-costumes | img2 | 2026-09-19 | meta:Y
  hanuman-ji-fancy-dress-for-ramleela | Hanuman Ji Fancy Dress For Ramleela | Rs750 rent300 | indian-mythology-costumes,ramleela-costumes | img3 | 2026-01-12 | meta:Y
  hanuman-red-fancy-dress | Hanuman Red Fancy Dress | Rs1200 rent800 | ramleela-costumes | img2 | 2026-09-19 | meta:Y
  hanuman-yellow-fancy-dress | Hanuman Yellow Fancy Dress | Rs1100 rent800 | ramleela-costumes | img1 | 2026-09-19 | meta:Y
# ram (4)
  raja-ram-fancy-dress | Raja Ram Fancy Dress | Rs1300 rent1000 | ramleela-costumes | img2 | 2026-09-19 | meta:Y
  vanvasi-ram | Vanvasi Ram | Rs900 rent600 | ramleela-costumes | img2 | 2026-09-19 | meta:Y
  vanvasi-ram-fancy-dress | Vanvasi Ram Fancy Dress | Rs900 rent450 | indian-mythology-costumes,ramleela-costumes | img1 | 2026-03-27 | meta:Y
  vanvasi-sita-saree-dress | Vanvasi Sita Saree Dress | Rs900 rent450 | ramleela-costumes | img1 | 2026-09-19 | meta:Y
# sita (2)
  rani-sita-fancy-dress-costume-for-ramleela | Rani Sita Fancy Dress Costume For Ramleela | Rs1199 rent300 | indian-mythology-costumes,ramleela-costumes | img4 | 2026-01-12 | meta:Y
  vanvasi-sita-saree-dress | Vanvasi Sita Saree Dress | Rs900 rent450 | ramleela-costumes | img1 | 2026-09-19 | meta:Y
# ravan (1)
  ravan-fancy-dress | Ravan Fancy Dress | Rs1100 rent800 | ramleela-costumes | img9 | 2026-09-19 | meta:Y
# odissi (2)
  odisi-fancy-dress | Odisi Fancy Dress | Rs2550 rent800 |  | img2 | 2026-04-17 | meta:Y
  odissi-fancy-dress | Odissi Fancy Dress | Rs2550 rent400 | classical-dance-dress | img2 | 2026-03-10 | meta:Y
# pooh (2)
  pooh-fancy-dress | Pooh Fancy Dress | Rs800 rent300 | cartoon-characters | img1 | 2026-03-02 | meta:Y
  pooh-fancy-dress-costumes | Pooh Fancy Dress Costumes | Rs800 rent300 | cartoon-characters | img3 | 2026-01-12 | meta:Y
# cow (3)
  cow-animal-fancy-dress-costume | Cow Animal Fancy Dress Costume | Rs850 rent300 | animal-costumes | img3 | 2026-01-12 | meta:Y
  cow-fancy-dress | Cow Fancy Dress | Rs850 rent300 | animal-costumes | img1 | 2026-03-02 | meta:Y
  cowboy-black-hat-fancy-dress | Cowboy Black Hat Fancy Dress | Rs400 rent300 | accessories | img3 | 2026-01-12 | meta:Y
# nehru (1)
  jawahar-lal-nehru-fancy-dress | Jawahar Lal Nehru Fancy Dress | Rs750 rent500 | independence-day-dress,leaders-freedom-fighters | img1 | 2026-06-26 | meta:Y
# gandhi (2)
  indira-gandhi-fancy-dress-costume | Indira Gandhi Fancy Dress Costume | Rs650 rent300 | independence-day-dress,leaders-freedom-fighters,republic-day-dress | img1 | 2026-07-11 | meta:Y
  mahatma-gandhi-fancy-dress-costume | Mahatma Gandhi Fancy Dress Costume | Rs550 rent300 | independence-day-dress,leaders-freedom-fighters,republic-day-dress | img1 | 2026-01-12 | meta:Y
# bhagat (1)
  bhagat-singh-cap | Bhagat Singh Cap | Rs250 rent100 | accessories,leaders-freedom-fighters | img1 | 2026-07-11 | meta:Y
# laxmi bai (2)
  jhansi-ki-rani-laxmi-bai-fancy-dress-costume | Jhansi Ki Rani Laxmi Bai Fancy Dress Costume | Rs1600 rent300 | independence-day-dress,leaders-freedom-fighters,republic-day-dress | img1 | 2026-01-12 | meta:Y
  rani-laxmi-bai-pagdi-turban-for-girls-fancy-dress | Rani Laxmi Bai Pagdi Turban For Girls Fancy Dress | Rs600 rent300 | accessories,independence-day-dress,leaders-freedom-fighters | img1 | 2026-01-12 | meta:Y
# shivaji (1)
  chatrapati-shivaji-maharaj-pagdi-fancy-dress | Chatrapati Shivaji Maharaj Pagdi Fancy Dress | Rs550 rent300 | accessories | img4 | 2026-01-12 | meta:Y
# subhash (1)
  subhash-chander-bose-fancy-dress | Subhash Chander Bose Fancy Dress | Rs750 rent400 | independence-day-dress | img1 | 2026-06-26 | meta:Y
# army (1)
  army-fancy-dress-costume-kargil-print | Army Fancy Dress Costume Kargil Print | Rs700 rent300 | helper-costumes,independence-day-dress | img1 | 2026-01-12 | meta:Y
# police (3)
  police-fancy-dress | Police Fancy Dress | Rs650 rent400 | independence-day-dress | img1 | 2026-06-26 | meta:Y
  police-officer-cap | Police Officer Cap | Rs550 rent200 | accessories,helper-costumes | img1 | 2026-04-08 | meta:Y
  traffic-police-fancy-dress-costume | Traffic Police Fancy Dress Costume | Rs550 rent400 | helper-costumes,republic-day-dress | img3 | 2026-01-12 | meta:Y
# doctor (0)
# mermaid (1)
  mermaid-fancy-dress | Mermaid Fancy Dress | Rs1000 rent400 | animal-costumes,imaginary-character | img1 | 2026-03-07 | meta:Y
# santa (0)
# halloween (2)
  ghost-bhoot-skeleton-halloween-costume-fancy-dress | Ghost Bhoot Skeleton Halloween Costume Fancy Dress | Rs400 rent300 | halloween | img3 | 2026-01-12 | meta:Y
  multi-color-joker-wig-fancy-dress | Multi Color Joker Wig Fancy Dress | Rs400 rent300 | accessories | img3 | 2026-01-12 | meta:Y
# superhero (2)
  hulk-muscle-fancy-dress-with-mask | Hulk Muscle Fancy Dress With Mask | Rs3000 rent600 | superhero-costumes | img2 | 2026-09-19 | meta:Y
  iron-man-muscle-fancy-dress-with-mask | Iron Man Muscle Fancy Dress With Mask | Rs3000 rent600 | superhero-costumes | img1 | 2026-09-19 | meta:Y

---- out3.txt ----
## 6 categories 57
  accessories | Accessories | live 31 | active True | title 36 | meta 111 | desc 762 | img Y
  dandiya-dress | Dandiya Dress | live 25 | active True | title 41 | meta 152 | desc 791 | img N
  states-fancy-dress | States Fancy Dress | live 22 | active True | title 42 | meta 149 | desc 794 | img N
  garba-dress | Garba Dress | live 21 | active True | title 50 | meta 127 | desc 730 | img Y
  ramleela-costumes | Ramleela Costumes | live 18 | active True | title 35 | meta 111 | desc 838 | img Y
  western-dance-dress | Western Dance Dress | live 18 | active True | title 37 | meta 139 | desc 841 | img Y
  animal-costumes | Animal Costumes | live 17 | active True | title 36 | meta 123 | desc 785 | img Y
  independence-day-dress | Independence Day Dress | live 15 | active True | title 45 | meta 145 | desc 959 | img Y
  folk-dance-dress | Folk Dance Dress | live 13 | active True | title 36 | meta 119 | desc 806 | img Y
  kathak-dress | Kathak Dress | live 12 | active True | title 49 | meta 136 | desc 786 | img Y
  janmashtami-dress | Janmashtami Dress | live 11 | active True | title 38 | meta 113 | desc 819 | img Y
  kids-saree | Kids Saree | live 11 | active True | title 31 | meta 121 | desc 803 | img Y
  rajasthani-dress | Rajasthani Dress | live 11 | active True | title 37 | meta 118 | desc 857 | img Y
  indian-mythology-costumes | Indian Mythology Costumes | live 11 | active True | title 44 | meta 137 | desc 793 | img Y
  cartoon-characters | Cartoon Characters | live 11 | active True | title 50 | meta 144 | desc 740 | img Y
  junk-food | Junk Food Costumes | live 10 | active True | title 43 | meta 140 | desc 694 | img N
  fruit-costumes | Fruit Costumes | live 9 | active True | title 39 | meta 143 | desc 681 | img Y
  leaders-freedom-fighters | Leaders Freedom Fighters | live 9 | active True | title 44 | meta 154 | desc 810 | img Y
  republic-day-dress | Republic Day Dress | live 8 | active True | title 43 | meta 145 | desc 783 | img Y
  vegetable-costumes | Vegetable Costumes | live 8 | active True | title 47 | meta 148 | desc 751 | img Y
  bharatnatyam | Bharatnatyam | live 7 | active True | title 38 | meta 123 | desc 798 | img Y
  helper-costumes | Helper Costumes | live 7 | active True | title 48 | meta 134 | desc 771 | img Y
  haryanvi-dress | Haryanvi Dress | live 7 | active True | title 46 | meta 151 | desc 758 | img Y
  vegetables | Vegetables | live 6 | active False | title 0 | meta 0 | desc 0 | img Y
  costumes | Costumes | live 6 | active True | title 33 | meta 141 | desc 797 | img Y
  nature-costumes | Nature Costumes | live 6 | active True | title 36 | meta 134 | desc 832 | img Y
  bhangra-dress | Bhangra Dress | live 5 | active True | title 34 | meta 121 | desc 812 | img Y
  lehenga | Lehenga | live 4 | active True | title 32 | meta 114 | desc 787 | img Y
  manipuri-dance-costume | Manipuri Dance Costume | live 4 | active True | title 35 | meta 132 | desc 834 | img Y
  space-costumes | Space Costumes | live 4 | active True | title 35 | meta 130 | desc 855 | img Y
  bird-costumes | Bird Costumes | live 4 | active True | title 34 | meta 142 | desc 791 | img Y
  superhero-costumes | Superhero Costumes | live 3 | active True | title 39 | meta 115 | desc 781 | img Y
  flower-costumes | Flower Costumes | live 3 | active True | title 36 | meta 134 | desc 823 | img Y
  lavani-costume | Lavani Costume | live 3 | active True | title 33 | meta 134 | desc 866 | img Y
  classical-dance-dress | Classical Dance Dress | live 3 | active True | title 43 | meta 147 | desc 800 | img N
  gidda-dress | Gidda Dress | live 3 | active True | title 34 | meta 139 | desc 804 | img Y
  saree | Saree | live 3 | active True | title 30 | meta 134 | desc 858 | img N
  kids | Kids | live 3 | active True | title 50 | meta 148 | desc 813 | img Y
  dance-dress | Dance Dress | live 2 | active True | title 38 | meta 143 | desc 840 | img Y
  imaginary-character | Imaginary Character | live 2 | active True | title 27 | meta 122 | desc 846 | img N
  mizoram-costume | Mizoram Costume | live 2 | active True | title 34 | meta 136 | desc 830 | img Y
  insect-costumes | Insect Costumes | live 2 | active True | title 36 | meta 131 | desc 774 | img N
  qawwali-dress | Qawwali Dress | live 2 | active True | title 34 | meta 132 | desc 790 | img Y
  animal-wildlife-fancy-dress-costumes | Animal Wildlife Fancy Dress Costumes | live 1 | active False | title 0 | meta 0 | desc 0 | img Y
  kashmiri-dress | Kashmiri Dress | live 1 | active True | title 46 | meta 137 | desc 822 | img Y
  doraemon | Doraemon | live 1 | active False | title 41 | meta 141 | desc 0 | img N
  mohiniyattam-dress | Mohiniyattam Dress | live 1 | active True | title 38 | meta 137 | desc 843 | img Y
  mythological-characters-costume | Mythological Characters Costume | live 1 | active False | title 30 | meta 128 | desc 848 | img Y
  halloween | Halloween | live 1 | active True | title 36 | meta 131 | desc 821 | img Y
  world-costumes | World Costumes | live 1 | active True | title 32 | meta 132 | desc 855 | img Y
  ramleela-collection | Ramleela Collection | live 0 | active False | title 0 | meta 0 | desc 0 | img Y
  fairy-tales-halloween | Fairy Tales Halloween | live 0 | active False | title 0 | meta 0 | desc 0 | img N
  indo-western-dance-dress | Indo Western Dance Dress | live 0 | active True | title 37 | meta 120 | desc 821 | img Y
  festival-costumes | Festival Costumes | live 0 | active True | title 35 | meta 137 | desc 791 | img N
  frock-dress | Frock Dress | live 0 | active True | title 32 | meta 139 | desc 838 | img Y
  international-dance-dress | International Dance Dress | live 0 | active True | title 38 | meta 139 | desc 846 | img N
  jewellery-accessories | Jewellery & Accessories | live 0 | active True | title 35 | meta 139 | desc 829 | img N
garba -> ['garba-dress']
dandiya -> ['dandiya-dress']
ramleela -> ['ramleela-collection', 'ramleela-costumes']
dussehra -> []
halloween -> ['fairy-tales-halloween', 'halloween']
christmas -> []
santa -> []
children -> []
diwali -> []
navratri -> []
annual -> []
cartoon -> ['cartoon-characters']
helper -> ['helper-costumes']
profession -> []
community -> []

## per-festival category members
ramleela-costumes 18 ['hanuman-red-fancy-dress', 'raja-ram-fancy-dress', 'ganesh-fancy-dress', 'jatayu-fancy-dress', 'hanuman-yellow-fancy-dress', 'kumbhkaran-fancy-dress', 'hanuman-ji-fancy-dress', 'vanvasi-ram-fancy-dress', 'rishi-fancy-dress', 'hanuman-ji-fancy-dress-for-ramleela', 'vanvasi-ram', 'jaamvant-fancy-dress', 'ravan-fancy-dress', 'vanvasi-sita-saree-dress', 'hanuman-gada-for-drama-fancy-dress', 'hindu-raja-fancy-dress-costume-for-boys', 'rani-sita-fancy-dress-costume-for-ramleela', 'meghnath-fancy-dress']
halloween 1 ['ghost-bhoot-skeleton-halloween-costume-fancy-dress']
cartoon-characters 11 ['pooh-fancy-dress', 'angry-bird-fancy-dress', 'doraemon-cartoon', 'mickey-mouse', 'teddy-bear', 'doraemon-fancy-dress', 'noddy-fancy-dress-costumes', 'snow-white-fancy-dress', 'tweety-fancy-dress', 'chutki-fancy-dress', 'pooh-fancy-dress-costumes']
helper-costumes 7 ['traffic-police-fancy-dress-costume', 'army-fancy-dress-costume-kargil-print', 'fire-fighter-fancy-dress-costume', 'police-officer-cap', 'chef-fancy-dress-costume', 'fisherman-fancy-dress', 'air-hostess-fancy-dress']
folk-dance-dress 13 ['blue-polyester-garba-dance-costume-fancy-dress', 'bihu-folk-dance-fancy-dress-costume-for-boys', 'punjabi-folk-dance-fancy-dress-costume', 'sambalpuri-dance-costume-ghumra-dance-fancy-dress', 'kathakali-fancy-dress', 'bengali-fancy-dress-costume-for-boy', 'punjabi-fancy-dress-costume-boy-girl', 'bhangra-dance-fancy-dress-costume-blue-yellow', 'punjabi-suit', 'kathak-fancy-dress', 'folk-dance-dress-for-boys-fancy-dress', 'kajari-folk-dance-fancy-dress-costume', 'bhangra-dance-costume-for-boys-orange-fancy-dress']
states-fancy-dress 22 ['gujrati-boy-fancy-dress', 'assam-saree-fancy-dress', 'bengali-saree-fancy-dress', 'maharashtra-fancy-dress', 'maratha-fancy-dress', 'kerala-fancy-dres', 'nagaland-boy-fancy-dress', 'kathakali-fancy-dress', 'maharashtra-boy-fancy-dress', 'nagaland-girl-fancy-dress', 'manipur-fancy-dress', 'south-indian-boy-fancy-dress', 'manipur-boy-fancy-dress', 'mizoram-fancy-dress', 'sikkim-fancy-dress', 'himachal-fancy-dress', 'pahdi-boy-fancy-dress', 'sambhalpuri-boy-fancy-dress', 'sambhalpuri-fancy-dress', 'south-indian-girl-fancy-dress', 'assam-fancy-dress', 'bengali-boy-fancy-dress']
classical-dance-dress 3 ['odissi-fancy-dress', 'bharatnatyam-fancy-dress-1', 'kathak-fancy-dress']
superhero-costumes 3 ['balveer-fancy-dress-costumes', 'hulk-muscle-fancy-dress-with-mask', 'iron-man-muscle-fancy-dress-with-mask']
leaders-freedom-fighters 9 ['freedom-fighter-mangal-pandey-red-hat-cap-fancy-dress', 'rani-laxmi-bai-pagdi-turban-for-girls-fancy-dress', 'jawahar-lal-nehru-fancy-dress', 'bhagat-singh-cap', 'mahatma-gandhi-fancy-dress-costume', 'mughal-king-fancy-dress-costume', 'indira-gandhi-fancy-dress-costume', 'jhansi-ki-rani-laxmi-bai-fancy-dress-costume', 'bal-gangadhar-tilak-fancy-dress-costume']

## all live slugs matching laxman|lakshman|sita|ravan|meghnath|kumbh|jatayu|rishi|sugriv|bali|shiv|durga|kali|diwali|lakshmi|ganesh|santa|christmas|nehru|doctor|nurse|chef|farmer|postman|teacher|fireman|pilot|astronaut|engineer|lawyer|cartoon|chota|bheem|motu|shinchan
   anarkali-cap-topi-fancy-dress | accessories
   anarkali-kathak-fancy-dress-costume-white | kathak-dress
   astronaut-fancy-dress | 
   chatrapati-shivaji-maharaj-pagdi-fancy-dress | accessories
   chef-fancy-dress-costume | helper-costumes
   doraemon-cartoon | cartoon-characters,doraemon
   fire-fighter-fancy-dress-costume | helper-costumes
   ganesh-fancy-dress | ramleela-costumes
   jatayu-fancy-dress | ramleela-costumes
   jawahar-lal-nehru-fancy-dress | independence-day-dress,leaders-freedom-fighters
   kathak-anarkali-costume-fancy-dress | kathak-dress
   kathak-anarkali-fancy-dress-style-white-red | kathak-dress
   kathak-dance-dress-anarkali-style-costume-fancy-dress | kathak-dress
   kathak-dance-dress-anarkali-style-fancy-dress | kathak-dress
   kathakali-fancy-dress | folk-dance-dress,states-fancy-dress
   kiwi-fruit-fancy-dress | fruit-costumes
   kumbhkaran-fancy-dress | ramleela-costumes
   meghnath-fancy-dress | ramleela-costumes
   mickey-mouse | cartoon-characters
   orange-butterfly-fairy-wings-fancy-dress | accessories
   princess-frock-fancy-dress | costumes
   ravan-fancy-dress | ramleela-costumes
   rishi-fancy-dress | ramleela-costumes

## inactive/deleted festival-ish slugs
   garba-dance-fancy-dress-boys-costume active True deleted 2026-06-18
   garba-dance-fancy-dress-costume-combo active True deleted 2026-06-18
   garba-dance-fancy-dress-costumes active True deleted 2026-06-18
   gujrati-garba-dance-dress-lehenga-fancy-dress active True deleted 2026-03-27
   sita-saree-fancy-dress-costume-for-girls active True deleted 2026-03-02
   gujarati-garba-dance-chaniya-choli-for-girls-fancy-dress active True deleted 2026-08-02
   garba-dance-fancy-dress-for-boys active True deleted 2026-08-02
   garba-dance-fancy-dress-costume-combo-set active True deleted 2026-06-18
   garba-dance-chaniya-choli-fancy-dress-costume active True deleted 2026-06-18
   gujarati-garba-chaniya-choli-costume-girls-fancy-dress active True deleted 2026-08-02
   vanvasi-sita-saree-fancy-dress-costume active True deleted 2026-03-02
   doraemon-fancy-dress-costume active True deleted 2026-03-23

---- out4.txt ----
redirects 345
gabbar ['gabbar-fancy-dress LIVE'] []
dandiya-fancy-dress-lehnga [] ['/products/dandiya-fancy-dress-lehnga', '/wholesale/dandiya-fancy-dress-lehnga']
kerala ['kerala-fancy-dres LIVE'] []
## redirect sources that are live slugs (loop/shadow): ['/products/vanvasi-ram']
## redirect destinations not live: ['/products/krishna-dress-yellow-2023-fancy-dress', '/products/indian-fancy-folk-dance-costume-fancy-dress', '/products/western-dance-dress-for-boy-magenta-black-colour-fancy-dress', '/products/pathani-fancy-dress', '/products/rouf-dance-costume-fancy-dress', '/products/contemporary-and-indo-western-costume-fancy-dress', '/products/tiranga-color-costume-for-boys-fancy-dress', '/products/western-dance-dress-for-boys-orange-fancy-dress', '/products/radha-rani-lehenga-choli-dress-pink-fancy-dress', '/products/contemporary-and-indo-western-dance-costume-fancy-dress', '/products/bharatnatyam-dance-costume-pink-fancy-dress', '/products/kashmiri-traditional-dress-with-cap-for-boys-fancy-dress', '/products/kathak-dance-dress-anarkali-style-gajri-golden-fancy-dress', '/products/achkan-churidar-suit-for-boy-fancy-dress', '/products/minnie-mouse-fancy-dress-costumes', '/products/gujarati-garba-chaniya-choli-costume-girls-fancy-dress', '/products/achkan-dhoti-dress-for-boy-fancy-dress', '/products/ghoomar-lehenga-fancy-dress', '/products/orange-bhangra-dance-costume-fancy-dress', '/products/radha-dress-lehenga-choli-costume-fancy-dress', '/products/western-dance-dress-in-red-and-black-color-fancy-dress', '/products/bharatnatyam-dance-costume-fancy-dress', '/products/krishna-dress-fancy-dress', '/products/western-dance-frock-costume-purple-fancy-dress', '/products/western-dance-costume-red-silver-fancy-dress', '/products/western-dance-dress-in-golden-and-black-color-fancy-dress', '/products/gujrati-garba-dance-dress-lehenga-fancy-dress', '/products/indo-western-dance-dress-in-silver-and-blue-fancy-dress', '/products/western-dance-dress-for-girl-in-magenta-black-colour-fancy-dress', '/products/krishna-costume-for-janmashtami-fancy-dress', '/products/kids-radha-dress-lehenga-fancy-costume-fancy-dress', '/products/krishna-dress-for-janmashtami-fancy-dress', '/products/indo-western-dance-dress-for-boy-fancy-dress', '/products/captain-america-fancy-dress-costumes', '/products/indo-western-dance-fancy-dress-1', '/products/semi-classical-dance-costume-dress-fancy-dress', '/products/bharatanatyam-dress-costume-white-red-fancy-dress', '/products/gujarati-garba-dance-chaniya-choli-for-girls-fancy-dress', '/products/kashmiri-traditional-dress-for-boys-with-cap-fancy-dress', '/products/kids-bhangra-dance-dresses-for-boys-fancy-dress', '/products/western-dance-frock-georgette-fancy-dress', '/products/folk-dance-dress-with-pagri-for-boys-fancy-dress', '/products/radha-rani-dress-lehenga-choli-fancy-dress', '/products/krishna-dress-2023-fancy-dress', '/products/western-dance-dress-long-skirt-top-fancy-dress', '/products/black-and-golden-chhau-dance-costume-fancy-dress', '/products/kuchipudi-fancy-dress', '/products/indian-semi-classical-dance-costumes-boy-fancy-dress']
## dead products without /products redirect: 227 of 231
   ['nmnm', 'brinjal', 'apple', 'onion', 'german2', 'pant-shirt-and-gallace-western-dance-fancy-dress-costume', 'minnie-mouse-fancy-dress-costumes', 'western-dance-frock-fancy-dress-green', 'western-frock-fancy-dress-costume-pink', 'indo-western-style-long-skirt-top-fancy-dress', 'german-dress', 'semi-classical-fusion-fancy-dress-costume', 'western-frock-fancy-dress-costume-red', 'western-dance-frock-costume-purple-fancy-dress', 'ice-cream-fancy-dress-costume', 'pink-western-dance-frock-fancy-dress', 'western-dance-frock-fancy-dress-costume-yellow', 'kathak-dance-dress-anarkali-style-gajri-golden-fancy-dress', 'garba-dance-fancy-dress-boys-costume', 'pink-donald-duck-fancy-dress-costumes', 'test2', 'chota-bheem-fancy-dress-costumes', 'test3', 'tiranga-color-costume-for-boys-fancy-dress', 'krishna-dress-2023-fancy-dress', 'indian-fusion-dance-fancy-dress-costume', 'kathak-dance-anarkali-fancy-dress', 'garba-dance-fancy-dress-costume-combo', 'western-dance-dress-for-boy-magenta-black-colour-fancy-dress', 'bharatnatyam-dance-costume-fancy-dress', 'western-dance-fancy-dress-kids-adults', 'green-hulk-fancy-dress', 'garba-dance-fancy-dress-costumes', 'western-dance-dress-in-red-and-black-color-fancy-dress', 'brinjal-fancy-dress-costume', 'radha-rani-lehenga-choli-dress-pink-fancy-dress', 'gujrati-garba-dance-dress-lehenga-fancy-dress', 'tomato', 'western-dance-frock-fancy-dress-pink', 'sita-saree-fancy-dress-costume-for-girls', 'indo-western-dance-dress-in-silver-and-blue-fancy-dress', 'goddess-saraswati-mata-fancy-dress-costume', 'hindu-king-fancy-dress-costume-for-boys', 'pathani-fancy-dress', 'muslim-pathani-suit-fancy-dress-costume-cap', 'western-style-skirt-top-fancy-dress-costume', 'indian-semi-classical-dance-costumes-boy-fancy-dress', 'anarkali-kathak-fancy-dress', 'long-skirt-top-western-dance-fancy-dress', 'folk-dance-dress-with-pagri-for-boys-fancy-dress', 'skirt-and-top-western-dance-fancy-dress-costume', 'gujarati-garba-dance-chaniya-choli-for-girls-fancy-dress', 'garba-dance-fancy-dress-for-boys', 'garba-dance-fancy-dress-costume-combo-set', 'japanese-fancy-dress-costume-for-girls', 'western-dance-dress-for-girl-in-magenta-black-colour-fancy-dress', 'western-dance-dress-long-skirt-top-fancy-dress', 'western-dance-dress-for-boys-orange-fancy-dress', 'indian-semi-classical-dance-fancy-dress', 'fusion-dance-fancy-dress-costume-for-girls', 'western-dance-fancy-dress-costume-skirt-and-top', 'indo-western-dance-fancy-dress-costume', 'western-dance-fancy-dress-costume-skirt-top', 'skirt-top-western-dance-fancy-dress', 'indo-western-dance-dress-for-boy-fancy-dress', 'dance-dress', 'kashmiri-boy-fancy-dress', 'western-dance-fancy-dress-skirt-top-black', 'angry-bird-fancy-dress-costumes', 'western-dance-fancy-dress-costume-for-boys', 'western-frock-fancy-dress-costume-girls', 'western-dance-frock-georgette-fancy-dress', 'garba-dance-chaniya-choli-fancy-dress-costume', 'dog-fancy-dress-animal-costume-for-kids', 'dairy-milk-fancy-dress-costumes', 'bhartnatyam-dress', 'sufi-dance-fancy-dress-costume', 'western-king-fancy-dress-costume', 'parrot-fancy-dress-costumes', 'donald-duck-fancy-dress-costumes', 'mango-fancy-dress-costume', 'bharatanatyam-dress-costume-white-red-fancy-dress', 'bharatanatyam-dance-fancy-dress-in-yellow-purple-colour', 'kuchipudi-fancy-dress', 'bharatnatyam-dance-fancy-dress', 'cat-fancy-dress-costume-for-children', 'krishna-fancy-dress-costume-yellow', 'orange-bhangra-dance-costume-fancy-dress', 'western', 'krishna-fancy-dress-costume-green-yellow', 'harem-style-western-dance-fancy-dress', 'watermelon-fancy-dress-costume', 'captain-america-fancy-dress-costumes', 'shinchan-fancy-dress-costumes', 'magenta-kids-saree-fancy-dress', 'multicolor-indo-western-fancy-dress-costume', 'krishna-dress-yellow-2023-fancy-dress', 'ravan-fancy-dress-legacy-2026-03', 'indo-western-dance-fancy-dress-1', 'mughal-king-fancy-dress-costume-for-boys', 'western-dance-fancy-dress-costume', 'indo-western-fancy-dress-boys', 'popcorn-fancy-dress-costume', 'bharatanatyam-dance-dress-costume', 'achkan-churidar-suit-for-boy-fancy-dress', 'lychee-fancy-dress-costumes', 'shark-fancy-dress-costume-grey', 'western-dance-fancy-dress-costume-skirt-top-pink', 'indo-western-dance-kurta-fancy-dress-costume', 'western-dance-frock-fancy-dress-costume', 'western-dance-fancy-dress-costume-white', 'shivaji-maharaj-fancy-dress-costume', 'rouf-dance-costume-fancy-dress', 'western-dance-skirt-top-fancy-dress-costume', 'potato-fancy-dress-costume', 'meera-bai-fancy-dress-costume-for-girls', 'bharatnatyam-dance-costume-pink-fancy-dress', 'western-dance-frock-fancy-dress-costumes', 'penguin-fancy-dresss-costume-for-kids', 'krishna-dress-fancy-dress', 'rajasthani-dance-fancy-dress-costume', 'mother-india-saree-fancy-dress-costume', 'owl-bird-fancy-dress-costumes', 'indo-western-dance-fancy-dress-costume-boy', 'indian-fancy-folk-dance-costume-fancy-dress', 'radha-fancy-dress-costume-in-yellow', 'indo-western-fancy-dress-costume-magenta-green', 'krishna-costume-for-janmashtami-fancy-dress', 'krishna-fancy-dress-costume-japanese-satin', 'lord-shiva-fancy-dress-costume-for-boys', 'rabbit-fancy-dress-costume', 'western-frock-dance-fancy-dress', 'contemporary-and-indo-western-costume-fancy-dress', 'tiranga-tricolour-sash', 'japanese-kimono-fancy-dress-costume-girls', 'kumaoni', 'western-dance-dress-in-golden-and-black-color-fancy-dress', 'kids-saree-fancy-dress-costume-firozi', 'western-dance-fancy-dress-for-boys', 'king-fancy-dress-costume-for-boys', 'monkey-animal-fancy-dress', 'frock-western-dance-fancy-dress-costume', 'subhash-chandra-bose-cap', 'water-drop-fancy-dress-costumes', 'yellow-hulk-fancy-dress-costumes', 'king-fancy-dress', 'peacock-bird-fancy-dress-costumes', 'western-dance-fancy-dress-skirt', 'joker-fancy-dress-costume', 'angry-bird-fancy-dress-costume-selina', 'hanuman-costume', 'achkan-dhoti-dress-for-boy-fancy-dress', 'western-style-frock-fancy-dress-costume', 'shark-fancy-dress-costume-red', 'king-akbar-fancy-dress-costume', 'umbrella-dance-fancy-dress-costume', 'gujarati-garba-chaniya-choli-costume-girls-fancy-dress', 'frog-animal-costume', 'japanese-kimono-fancy-dress-costume', 'black-and-golden-chhau-dance-costume-fancy-dress', 'indian-army-fancy-dress-costume', 'bharatanatyam-dance-dress-in-blue-magenta-colour', 'odissi-dance-fancy-dress-costume', 'zebra-fancy-dress-costume', 'bhangra-dance-fancy-dress-costume-for-girls', 'honey-bee-fancy-dress-costumes', 'kashmiri-traditional-dress-for-boys-with-cap-fancy-dress', 'vanvasi-sita-saree-fancy-dress-costume', 'chanakya-fancy-dress-costume', 'western-dance-fancy-dress-costume-boys', 'indian-navy-fancy-dress-costume', 'kathak-dance-costume-golden', 'pathani-suit-fancy-dress-costume-for-boys', 'kashmiri-dance-fancy-dress-costume', 'snake-fancy-dress-kids-costume', 'doraemon-fancy-dress-costume', 'indian-pilot-fancy-dress-costume', 'kids-saree-fancy-dress-costume-girls', 'vanvasi-ram-fancy-dress-costume-for-boys', 'sample-2', 'south-indian-fancy-dress-costume', 'pathani-fancy-dress-costume', 'pant-shirt-gallace-western-dance-fancy-dress-costume', 'eagle-birds-fancy-dress-costumes', 'leopard-animal-fancy-dress-costume', 'lehenga-fancy-dress-costume-for-girls', 'elephant-fancy-dress-costume', 'shark-fancy-dress-costume-orange', 'rajasthani-folk-dance-fancy-dress-costume', 'western-dance-fancy-dress-costumes-skirt', 'octopus-animal-fancy-dress', 'shark-fancy-dress-costume-yellow', 'mahishasur-fancy-dress-costume', 'semi-classical-dance-costume-dress-fancy-dress', 'western-dance-fancy-dress', 'seahorse-fancy-dress-costume-for-kids', 'panda-fancy-dress-animal-costume-for-kids', 'bona-fancy-dress-costume', 'caterpillar-fancy-dress-costume', 'indo-western-dance-fancy-dress', 'contemporary-and-indo-western-fancy-dress', 'contemporary-and-indo-western-dance-costume-fancy-dress', 'bharatanatyam-dance-dress-green-orange', 'kashmiri-traditional-dress-with-cap-for-boys-fancy-dress', 'british-soldier-fancy-dress-costumes', 'indian-semi-classical-fancy-dress-costume', 'hindu-king-fancy-dress-for-boys', 'narad-muni-fancy-dress-costume-for-boys', 'chhau-dance-fancy-dress-costume', 'western-dance-fancy-dress-boys', 'krishna-fancy-dress-costume-pink-yellow', 'hindu-rani-fancy-dress-costume-for-girls', 'kids-radha-dress-lehenga-fancy-costume-fancy-dress', 'bhagat-singh-fancy-dress-costume', 'children-police-fancy-dress-costume', 'krishna-dress-for-janmashtami-fancy-dress', 'western-dance-frock-fancy-dress', 'radha-rani-fancy-dress-pink-orange', 'radha-rani-dress-lehenga-choli-fancy-dress', 'lehenga-fancy-dress-costume', 'western-dance-costume-red-silver-fancy-dress', 'kids-bhangra-dance-dresses-for-boys-fancy-dress', 'fancy-dress-lehenga-costume', 'radha-rani-fancy-dress-lehenga-golden-red', 'kids-lehenga-fancy-dress-costume', 'ghoomar-lehenga-fancy-dress', 'radha-dress-lehenga-choli-costume-fancy-dress']
## suspicious live slugs
   air-force-cap | Air Force Cap
   assam-cap | Assam Cap Fancy Dress
   ballroom-dance-fancy-dress-costume-2 | Ballroom Dance Fancy Dress Costume 2
   balveer-fancy-dress-costumes | Balveer Fancy Dress Costumes
   bhagat-singh-cap | Bhagat Singh Cap
   bharatnatyam-fancy-dress-1 | Bharatnatyam Fancy Dress
   big-size-elephant | Big Size Elephant Fancy Dress
   bihu-mekhla-chador-fancy-dress-costumes | Bihu Mekhla Chador Fancy Dress Costumes
   black-and-red-medallion-garba-chaniya-choli | Black and Red Medallion Garba Chaniya Choli
   black-multicolour-mirror-work-garba-lehenga | Black Multicolour Mirror Work Garba Lehenga
   black-red-triangle-border-garba-lehenga | Black And Red Triangle Border Garba Lehenga
   chatrapati-shivaji-maharaj-pagdi-fancy-dress | Chatrapati Shivaji Maharaj Pagdi Fancy Dress
   doraemon-cartoon | Doraemon Fancy Dress
   garba-dancer-print-navratri-chaniya-choli | Garba Dancer Print Navratri Chaniya Choli
   green-printed-gujarati-garba-chaniya-choli | Green Printed Gujarati Garba Chaniya Choli
   green-western-dance-fancy-dress-costumes | Green Western Dance Fancy Dress Costumes
   gujrati-boy-fancy-dress | Gujrati Boy Fancy Dress
   jaamvant-fancy-dress | Jaamvant Fancy Dress
   kathak-dress-blue-colour-fancy-dress | Kathak Dress Blue Colour Fancy Dress
   kathak-dress-green-colour-fancy-dress | Kathak Dress Green Colour Fancy Dress
   kedia-dress-fancy-dress | Kedia Dress Fancy Dress
   kerala-fancy-dres | Kerala Fancy Dres
   laptop-fancy-dress-costumes | Laptop Fancy Dress Costumes
   magenta-diamond-panel-dandiya-lehenga | Magenta Diamond Panel Dandiya Lehenga
   maroon-gold-embroidered-dandiya-night-lehenga | Maroon Gold Embroidered Dandiya Night Lehenga
   maroon-kutchi-embroidered-dandiya-lehenga | Maroon Kutchi Embroidered Dandiya Lehenga
   mickey-mouse | Mickey Mouse Fancy Dress
   multicolour-patchwork-mirror-work-garba-lehenga | Multicolour Patchwork Mirror Work Garba Lehenga
   noddy-fancy-dress-costumes | Noddy Fancy Dress Costumes
   odisi-fancy-dress | Odisi Fancy Dress
   orange-fancy-dress-costumes | Orange Fancy Dress Costumes
   pahdi-boy-fancy-dress | Pahdi Boy Fancy Dress
   papaya-fancy-dress-costumes | Papaya Fancy Dress Costumes
   police-officer-cap | Police Officer Cap
   pooh-fancy-dress-costumes | Pooh Fancy Dress Costumes
   premium-officer-ceremonial-cap | Premium Officer Ceremonial Cap
   punjabi-suit | Yellow Punjabi Suit Fancy Dress
   rainbow-panel-mirror-work-garba-chaniya-choli | Rainbow Panel Mirror Work Garba Chaniya Choli
   rajasthani-lehnga-fancy-dress | Rajasthani Lehenga Fancy Dress
   red-and-black-mirror-work-garba-lehenga | Red and Black Mirror Work Garba Lehenga
   red-band-master-officer-cap | Red Band Master Officer Cap
   red-haryanvi-lehnga-fancy-dress | Red Haryanvi Lehenga Fancy Dress
   sambhalpuri-boy-fancy-dress | Sambhalpuri Boy Fancy Dress
   sambhalpuri-fancy-dress | Sambhalpuri Fancy Dress
   sub-inspector-cap | Sub Inspector Cap
   subhash-chander-bose-fancy-dress | Subhash Chander Bose Fancy Dress
   teddy-bear | Teddy Bear Mascot Fancy Dress
   traffic-light-fancy-dress-costumes | Traffic Light Fancy Dress Costumes
   vanvasi-ram | Vanvasi Ram
   water-melon-fancy-dress | Water Melon Fancy Dress
   white-kutchi-mirror-work-dandiya-chaniya-choli | White Kutchi Mirror Work Dandiya Chaniya Choli
   white-peacock-palace-print-ghoomar-lehenga | White Peacock And Palace Print Ghoomar Lehenga
   yellow-elephant-motif-garba-chaniya-choli | Yellow Elephant Motif Garba Chaniya Choli
   yellow-haryanvi-lehnga-fancy-dress | Yellow Haryanvi Lehenga Fancy Dress
   yellow-peacock-panel-garba-chaniya-choli | Yellow Peacock Panel Garba Chaniya Choli

---- out_img.txt ----
no size 0 []
images 644 total MB 191.0 median KB 62
ext/content mismatch 98 Counter({('webp', 'png', 'image/png'): 84, ('jpg', '? < ! D O C T Y P E h t', 'image/jpeg'): 4, ('webp', '? R I F F 306 021 001 \\0 W E B ', 'image/webp'): 1, ('webp', '? R I F F 300 026 001 \\0 W E B ', 'image/webp'): 1, ('webp', '? R I F F 322 245 006 \\0 W E B ', 'image/webp'): 1, ('webp', '? R I F F 276 235 005 \\0 W E B ', 'image/webp'): 1, ('webp', '? R I F F 274 260 006 \\0 W E B ', 'image/webp'): 1, ('webp', '? R I F F 216 230 001 \\0 W E B ', 'image/webp'): 1, ('webp', '? R I F F 226 354 001 \\0 W E B ', 'image/webp'): 1, ('webp', '? R I F F 024 264 006 \\0 W E B ', 'image/webp'): 1, ('webp', '? R I F F 226 244 004 \\0 W E B ', 'image/webp'): 1, ('webp', '? R I F F 360 252 002 \\0 W E B ', 'image/webp'): 1})
>200KB 217
>300KB 189
>500KB 111
>1000KB 49
products with image>300KB 165
   mermaid-fancy-dress [(2786, 'png', True)]
   lady-finger-fancy-dress [(2456, 'png', True)]
   elephant-fancy-dress [(2398, 'png', True)]
   bottle-gourd-lauki-fancy-dress [(2372, 'png', True)]
   horse-fancy-dress [(2341, 'png', True)]
   cauliflower-fancy-dress [(2340, 'png', True)]
   lemon-fancy-dress [(2305, 'png', True)]
   crow-fancy-dress [(2300, 'png', True)]
   kathak-fancy-dress [(2280, 'png', True)]
   pea-fancy-dress [(2246, 'png', True)]
   monkey-fancy-dress [(2231, 'png', True)]
   harem-and-tshirt-fancy-dress [(2230, 'png', True)]
   pooh-fancy-dress [(2186, 'png', True)]
   radish-fancy-dress [(2161, 'png', True)]
   haryanvi-shirt-and-lehenga-fancy-dress [(2159, 'png', True)]
   green-bharatnatyam-fancy-dress [(2106, 'png', True)]
   fisherman-fancy-dress [(2103, 'png', True)]
   western-frock-and-top-fancy-dress [(2102, 'png', True)]
   doraemon-fancy-dress [(2069, 'png', True)]
   tweety-fancy-dress [(2060, 'png', True)]
   duck-fancy-dress [(2030, 'png', True)]
   bhangra-dress-fancy-dress [(2006, 'png', True)]
   yellow-and-red-bharatnatyam-fancy-dress [(1983, 'png', True)]
   octopus-fancy-dress [(1948, 'png', True)]
   angry-bird-fancy-dress [(1884, 'png', True)]
   polar-bear-fancy-dress [(1874, 'png', True)]
   giraffe-fancy-dress [(1792, 'png', True)]
   pink-saree-pink-border-fancy-dress [(1777, 'png', True)]
   pink-saree-fancy-dress [(1725, 'png', True)]
   chutki-fancy-dress [(1638, 'png', True)]
   bhangra-suit-for-adult-fancy-dress [(1607, 'png', True)]
   bharatnatyam-fancy-dress [(1545, 'png', True)]
   bhangra-fancy-dress [(1465, 'png', True)]
   cow-fancy-dress [(1453, 'png', True)]
   white-saree-red-border-fancy-dress [(1387, 'png', True)]
   printed-saree-fancy-dress [(1383, 'png', True)]
   grapes-fancy-dress [(1314, 'png', True)]
   cloud-fancy-dress [(1310, 'png', True)]
   water-melon-fancy-dress [(1307, 'png', True)]
   fox-fancy-dress [(1306, 'png', True)]
   sun-fancy-dress [(1299, 'png', True)]
   peacock-fancy-dress [(1274, 'png', True)]
   mango-fancy-dress [(1268, 'png', True)]
   blue-saree-golden-border-fancy-dress [(1237, 'png', True)]
   bhangra-suit-fancy-dress [(1177, 'png', True), (564, 'png', False)]
   mountain-fancy-dress [(1113, 'png', True)]
   star-fancy-dress [(1112, 'png', True)]
   tomato-fancy-dress [(1067, 'png', True)]
   tree-fancy-dress [(1048, 'png', True)]
   moon-fancy-dress [(986, 'png', True)]
   earth-fancy-dress [(975, 'png', True)]
   water-fancy-dress [(960, 'png', True)]
   water-drop-fancy-dress [(926, 'png', True)]
   parrot-fancy-dress [(921, 'png', True)]
   radha-rani-fancy-dress [(547, 'jpeg', True), (918, 'jpeg', False)]
   pigeon-fancy-dress [(887, 'png', True)]
   kiwi-fruit-fancy-dress [(885, 'jpeg', False), (315, 'jpeg', True)]
   krishna-fancy-dress [(472, 'jpeg', True), (882, 'jpeg', False)]
   carrot-fancy-dress-costume [(881, 'png', True)]
   maggi-fancy-dress [(863, 'jpeg', False), (359, 'jpeg', True)]
   frooti-fancy-dress [(794, 'jpeg', False)]
   pizza-fancy-dress [(328, 'jpeg', True), (738, 'jpeg', False)]
   lays-fancy-dress [(738, 'jpeg', False)]
   strawberry-fancy-dress [(736, 'jpeg', False)]
   white-dandiya-fancy-dress [(733, 'png', True)]
   raspberry-fancy-dress [(726, 'jpeg', False), (316, 'jpeg', True)]
   pomegranate-fancy-dress [(318, 'jpeg', True), (700, 'jpeg', False)]
   ice-cream-fancy-dress [(695, 'jpeg', False)]
   strawberry-cake-fancy-dress [(320, 'jpeg', True), (688, 'jpeg', False)]
   burger-fancy-dress [(352, 'jpeg', True), (688, 'jpeg', False)]
   red-and-blue-sequence-fancy-dress [(672, 'png', True)]
   cup-cake-fancy-dress [(669, 'jpeg', False)]
   check-school-fancy-dress [(665, 'png', True)]
   krishna-yellow-fancy-dress [(658, 'png', True)]
   blue-lehenga-dandiya-dress [(658, 'png', False), (415, 'png', True)]
   french-fries-fancy-dress [(658, 'jpeg', False)]
   coca-cola-fancy-dress [(646, 'jpeg', False)]
   punjabi-suit [(634, 'png', True)]
   green-sequence-dance-fancy-dress [(630, 'png', True)]
   sun-flower-fancy-dress [(623, 'png', True)]
   orange-sequence-fancy-dress [(620, 'png', True)]
   grass-fancy-dress [(615, 'png', True)]
   bharatnatyam-fancy-dress-1 [(614, 'png', True), (423, 'png', False)]
   pink-lehenga-dandiya-dress [(610, 'png', True)]
   ravan-fancy-dress [(505, 'webp', False), (496, 'webp', False), (609, 'webp', False), (439, '? R I F F 024 264 006 \\0 W E B ', False), (417, 'webp', False), (398, 'jpeg', True), (484, 'webp', False), (304, '? R I F F 226 244 004 \\0 W E B ', False)]
   krishna-green-fancy-dress [(608, 'png', True)]
   school-fancy-dress-red-color [(598, 'png', True)]
   odisi-fancy-dress [(390, 'png', False), (595, 'png', True)]
   odissi-fancy-dress [(390, 'png', True), (595, 'png', False)]
   south-indian-boy-fancy-dress [(590, 'png', True)]
   kathakali-fancy-dress [(587, 'png', True)]
   gabbar-fancy-dress [(568, 'png', True)]
   kargil-fancy-dress [(568, 'png', True)]
   princess-frock-fancy-dress [(564, 'png', True)]
   rajasthani-boy-fancy-dress [(563, 'png', True)]
   vanvasi-ram-fancy-dress [(553, 'png', True)]
   dandiya-fancy-dress-lehenga [(550, 'jpeg', True)]
   bug-fancy-dress [(537, 'png', True)]
   dandiya-fancy-dress [(520, 'png', True)]
   kumbhkaran-fancy-dress [(519, 'jpeg', True)]
   rajasthani-lehnga-fancy-dress [(512, 'png', True)]
   red-and-black-mirror-work-garba-lehenga [(510, 'webp', True)]
   bengali-boy-fancy-dress [(504, 'png', True)]
   kumaoni-dress-fancy-dress [(324, 'png', True), (503, 'png', False)]
   maroon-gold-embroidered-dandiya-night-lehenga [(503, 'webp', True)]
   green-printed-gujarati-garba-chaniya-choli [(502, 'webp', True)]
   western-white-and-red-fancy-dress [(502, 'png', True)]
   pink-and-yellow-krishna-fancy-dress [(501, 'png', True)]
   multicolour-patchwork-mirror-work-garba-lehenga [(491, 'webp', True)]
   kerala-fancy-dres [(485, 'png', True)]
   rainbow-panel-mirror-work-garba-chaniya-choli [(484, 'webp', True)]
   rajasthani-fancy-dress [(480, 'png', True)]
   white-kutchi-mirror-work-dandiya-chaniya-choli [(469, 'webp', True)]
   yellow-elephant-motif-garba-chaniya-choli [(468, 'webp', True)]
   south-indian-girl-fancy-dress [(463, 'png', True)]
   krishna-blue-and-yellow-fancy-dress [(452, 'png', True)]
   assam-saree-fancy-dress [(440, 'png', True)]
   magenta-diamond-panel-dandiya-lehenga [(440, 'webp', True)]
   black-and-red-medallion-garba-chaniya-choli [(438, '? R I F F 274 260 006 \\0 W E B ', True)]
   maroon-kutchi-embroidered-dandiya-lehenga [(437, 'webp', True)]
   dandiya-fancy-dress-yellow [(436, 'jpeg', True)]
   garba-dancer-print-navratri-chaniya-choli [(435, '? R I F F 322 245 006 \\0 W E B ', True)]
   mangal-pandey-fancy-dress [(433, 'png', True)]
   black-red-triangle-border-garba-lehenga [(423, 'webp', True)]
   police-fancy-dress [(423, 'png', True)]
   green-fancy-dress-frock [(420, 'png', True)]
   green-orange-bharatnatyam-fancy-dress [(419, 'png', True)]
   maharashtra-fancy-dress [(418, 'png', True)]
   sikkim-fancy-dress [(417, 'jpeg', True), (395, 'jpeg', False)]
   dandiya-fancy-dress-cream [(416, 'jpeg', True)]
   black-multicolour-mirror-work-garba-lehenga [(416, 'webp', True)]
   red-band-master-officer-cap [(414, 'png', True)]
   subhash-chander-bose-fancy-dress [(409, 'png', True)]
   white-peacock-palace-print-ghoomar-lehenga [(408, 'webp', True)]
   assam-fancy-dress [(407, 'png', True)]
   bhagat-singh-cap [(406, 'png', True)]
   meghnath-fancy-dress [(400, 'jpeg', True)]
   dandiya-fancy-dress-pink [(399, 'jpeg', True)]
   indira-gandhi-fancy-dress-costume [(398, 'png', True)]
   jatayu-fancy-dress [(398, 'jpeg', False)]
   maratha-fancy-dress [(395, 'png', True)]
   dandiya-gujarati-fancy-dress [(394, 'webp', True)]
   hanuman-ji-fancy-dress [(391, 'jpeg', True)]
   jawahar-lal-nehru-fancy-dress [(388, 'png', True)]
   pink-bharatnatyam-fancy-dress [(383, 'png', True)]
   frill-frock-fancy-dress [(381, 'png', True)]
   maharashtra-boy-fancy-dress [(373, 'png', True)]
   yellow-peacock-panel-garba-chaniya-choli [(368, '? R I F F 276 235 005 \\0 W E B ', True)]
   rajasthani-lehenga-fancy-dress [(366, 'png', True)]
   yellow-haryanvi-lehnga-fancy-dress [(362, 'png', True)]
   kashmiri-fancy-dress [(360, 'png', True)]
   turtle-fancy-dress-costume-for-kids [(300, 'jpeg', True), (359, 'jpeg', False)]
   raja-ram-fancy-dress [(359, 'jpeg', True)]
   krishna-yellow-dhoti-kurta-fancy-dress [(356, 'png', True)]
   hanuman-red-fancy-dress [(355, 'jpeg', True)]
   jaamvant-fancy-dress [(350, 'jpeg', True)]
   orange-bharatnatyam-fancy-dress [(349, 'png', True)]
   yellow-frock-fancy-dress [(345, 'png', True)]
   rishi-fancy-dress [(342, 'jpeg', True)]
   boy-haryanvi-dress [(339, 'jpeg', True)]
   vanvasi-ram [(338, 'jpeg', True)]
   blue-western-fancy-dress [(329, 'png', True)]
   mahatma-gandhi-fancy-dress-costume [(319, 'jpeg', True)]
   army-fancy-dress-costume-kargil-print [(319, 'jpeg', True)]
   assam-cap [(308, 'png', True)]
## focus products
gabbar-fancy-dress [(568, 'png', '1773980871135-ym14vpds5l.webp')]
rajasthani-boy-fancy-dress [(563, 'png', '1775461243265-2opk0bop7zq.webp')]
jawahar-lal-nehru-fancy-dress [(388, 'png', '1782468102590-s6hzo8rfpu.webp')]
krishna-green-fancy-dress [(608, 'png', '1776313536491-0wy3ejgsm1ba.webp')]
## garba/dandiya images
   traditional-navratri-chaniya-choli-fancy-dress 64 KB jpeg jpg
   traditional-navratri-chaniya-choli-fancy-dress 70 KB ? R I F F 306 021 001 \0 W E B  webp
   traditional-navratri-chaniya-choli-fancy-dress 60 KB jpeg jpg
   kediya-garba-dance-fancy-dress-costume 50 KB jpeg jpg
   traditional-navratri-chaniya-choli-fancy-dress 97 KB jpeg jpg
   kediya-garba-dance-fancy-dress-costume 63 KB jpeg jpg
   kediya-garba-dance-fancy-dress-costume 55 KB jpeg jpg
   kediya-garba-dance-fancy-dress-costume 60 KB jpeg jpg
   traditional-navratri-chaniya-choli-fancy-dress 77 KB jpeg jpg
   kediya-garba-dance-fancy-dress-costume 63 KB jpeg jpg
   kedia-dress-fancy-dress 59 KB webp webp
   kedia-dress-fancy-dress 53 KB jpeg jpg
   kedia-dress-fancy-dress 62 KB jpeg jpg
   dandiya-fancy-dress-cream 416 KB jpeg jpg
   dandiya-fancy-dress-lehenga 550 KB jpeg jpg
   pink-lehenga-dandiya-dress 610 KB png webp
   yellow-elephant-motif-garba-chaniya-choli 468 KB webp webp
   multicolour-patchwork-mirror-work-garba-lehenga 491 KB webp webp
   rainbow-panel-mirror-work-garba-chaniya-choli 484 KB webp webp
   maroon-kutchi-embroidered-dandiya-lehenga 437 KB webp webp
   garba-dancer-print-navratri-chaniya-choli 435 KB ? R I F F 322 245 006 \0 W E B  webp
   red-and-black-mirror-work-garba-lehenga 510 KB webp webp
   dandiya-fancy-dress-pink 399 KB jpeg jpg
   white-kutchi-mirror-work-dandiya-chaniya-choli 469 KB webp webp
   yellow-peacock-panel-garba-chaniya-choli 368 KB ? R I F F 276 235 005 \0 W E B  webp
   black-multicolour-mirror-work-garba-lehenga 416 KB webp webp
   green-printed-gujarati-garba-chaniya-choli 502 KB webp webp
   maroon-gold-embroidered-dandiya-night-lehenga 503 KB webp webp
   magenta-diamond-panel-dandiya-lehenga 440 KB webp webp
   black-and-red-medallion-garba-chaniya-choli 438 KB ? R I F F 274 260 006 \0 W E B  webp
   dandiya-gujarati-fancy-dress 394 KB webp webp
   dandiya-fancy-dress-yellow 436 KB jpeg jpg
   blue-lehenga-dandiya-dress 658 KB png webp
   blue-lehenga-dandiya-dress 415 KB png webp
   black-red-triangle-border-garba-lehenga 423 KB webp webp
   white-peacock-palace-print-ghoomar-lehenga 408 KB webp webp
   blue-polyester-garba-dance-costume-fancy-dress 22 KB webp webp
   blue-polyester-garba-dance-costume-fancy-dress 63 KB jpeg jpg
   dandiya-fancy-dress 520 KB png webp
   white-dandiya-fancy-dress 733 KB png webp
   navratri-chaniya-choli-fancy-dress 174 KB ? R I F F 360 252 002 \0 W E B  webp
   navratri-chaniya-choli-fancy-dress 86 KB jpeg jpg
   gujarati-garba-dance-fancy-dress-costume 65 KB jpeg jpg
   navratri-chaniya-choli-fancy-dress 135 KB jpeg jpg
   gujarati-garba-dance-fancy-dress-costume 52 KB webp webp
   gujarati-garba-dance-fancy-dress-costume 66 KB jpeg jpg

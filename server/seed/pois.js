require('dotenv').config();
const mongoose = require('mongoose');
const POI = require('../models/POI');

const pois = [
  // ============ National Parks ============
  {
    name: 'Mount Kenya National Park',
    description: 'UNESCO World Heritage site featuring Africa\'s second-highest mountain at 5,199m. The park encompasses diverse ecosystems ranging from dense montane forest to alpine meadows and glaciers. Home to elephants, buffalo, leopards, hyenas, and the rare Mount Kenya mouse shrew. Three main climbing routes lead to the peaks: Batian (5,199m), Nelion (5,188m), and the trekking summit Point Lenana (4,985m). The Naro Moru, Sirimon, and Chogoria routes each offer unique landscapes and difficulty levels.',
    type: 'park',
    location: { lat: -0.1521, lng: 37.3084 },
    region: 'Central Kenya',
    images: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801',
      'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6',
      'https://images.unsplash.com/photo-1535224206242-8b2e10e4a3ac'
    ],
    features: ['Wildlife viewing', 'Camping', 'Hiking', 'Rock climbing', 'Mountain huts', 'Fishing', 'Bird watching', 'Photography'],
    elevation_m: 5199,
    difficulty: 4,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 52, currency: 'USD' },
    contact: { phone: '+254-20-2379407', email: 'info@kws.go.ke', website: 'https://www.kws.go.ke' },
    rating_avg: 4.8,
    review_count: 156,
    verified: true
  },
  {
    name: 'Hell\'s Gate National Park',
    description: 'One of the few parks where you can walk and cycle freely among wildlife. Named after a narrow break in the cliffs by early explorers, Hell\'s Gate features dramatic red cliffs, water-gouged gorges, and volcanic rock towers. Fischer\'s Tower and Central Tower are iconic volcanic plugs. The Ol Njorowa Gorge is a dramatic slot canyon with hot springs. Inspired the landscapes in Disney\'s The Lion King. Wildlife includes zebras, giraffes, elands, hartebeests, and over 100 bird species including the rare lammergeyer vulture.',
    type: 'park',
    location: { lat: -0.9137, lng: 36.3094 },
    region: 'Naivasha',
    images: [
      'https://images.unsplash.com/photo-1547970810-dc1e684757a9',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801',
      'https://images.unsplash.com/photo-1504006833117-8886a355efbf'
    ],
    features: ['Cycling', 'Rock climbing', 'Hot springs', 'Camping', 'Gorge walking', 'Bird watching', 'Wildlife viewing', 'Geothermal spa'],
    elevation_m: 1900,
    difficulty: 2,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 26, currency: 'USD' },
    contact: { phone: '+254-722-123456', email: 'hellsgate@kws.go.ke', website: 'https://www.kws.go.ke' },
    rating_avg: 4.7,
    review_count: 203,
    verified: true
  },
  {
    name: 'Aberdare National Park',
    description: 'A mountainous park in the Central Highlands featuring bamboo forests, moorlands, and some of Kenya\'s most spectacular waterfalls. The park is home to the rare bongo antelope, black rhino, elephants, giant forest hogs, and over 250 bird species. The Salient is the lower-altitude eastern zone famous for The Ark and Treetops lodges where visitors can watch wildlife from elevated platforms at night. Upper moorlands above 3,000m offer an eerie, misty landscape with giant lobelias and tussock grass.',
    type: 'park',
    location: { lat: -0.3833, lng: 36.7000 },
    region: 'Central Kenya',
    images: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
      'https://images.unsplash.com/photo-1448375240586-882707db888b'
    ],
    features: ['Waterfalls', 'Wildlife viewing', 'Trout fishing', 'Hiking', 'Night game drives', 'Bird watching', 'Bamboo forests', 'Moorland walks'],
    elevation_m: 3999,
    difficulty: 3,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 52, currency: 'USD' },
    contact: { phone: '+254-20-2379407', email: 'aberdare@kws.go.ke', website: 'https://www.kws.go.ke' },
    rating_avg: 4.6,
    review_count: 89,
    verified: true
  },

  // ============ Viewpoints ============
  {
    name: 'Ngong Hills Viewpoint',
    description: 'A series of four rounded peaks rising to 2,460m on the edge of the Great Rift Valley. The name "Ngong" means "knuckles" in Maasai, describing the shape of the hills. The ridge walk offers breathtaking 360-degree views: the vast Rift Valley floor to the west, the Nairobi skyline and plains to the east, and on clear days, Mount Kilimanjaro to the south. Made famous by Karen Blixen\'s "Out of Africa" — her companion Denys Finch Hatton is buried near the hills. The 14km ridge walk takes 4-5 hours and is one of Nairobi\'s most popular day hikes.',
    type: 'viewpoint',
    location: { lat: -1.3786, lng: 36.6511 },
    region: 'Ngong',
    images: [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'
    ],
    features: ['Panoramic views', 'Photography', 'Picnic area', 'Ridge walking', 'Rift Valley views', 'Armed ranger escort', 'Historical significance'],
    elevation_m: 2460,
    difficulty: 2,
    openingHours: { open: '06:30', close: '17:30' },
    fees: { hasEntry: true, amount: 5, currency: 'USD' },
    contact: { phone: '+254-722-555123', email: 'ngonghills@kfs.go.ke', website: 'https://www.kfs.go.ke' },
    rating_avg: 4.5,
    review_count: 124,
    verified: true
  },
  {
    name: 'Menengai Crater Viewpoint',
    description: 'The Menengai Crater is one of the largest volcanic calderas in the world, spanning 12km across and 500m deep. The name means "place of the corpse" in Maasai, linked to an ancient battle between Maasai clans. The crater rim offers stunning views of the caldera floor, steam vents from geothermal activity, and Lake Nakuru in the distance. Surrounding forest has colobus monkeys and abundant birdlife. A paved road leads to the viewpoint, making it easily accessible. Geothermal energy development on the crater floor adds a modern technological dimension to this ancient landscape.',
    type: 'viewpoint',
    location: { lat: -0.2167, lng: 36.0667 },
    region: 'Nakuru',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470'
    ],
    features: ['Crater views', 'Geothermal activity', 'Photography', 'Forest walks', 'Colobus monkeys', 'Historical site', 'Easy access'],
    elevation_m: 2278,
    difficulty: 1,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: false },
    contact: { phone: '+254-711-456789' },
    rating_avg: 4.4,
    review_count: 67,
    verified: true
  },

  // ============ Waterfalls ============
  {
    name: 'Karuru Falls',
    description: 'Kenya\'s tallest waterfall at 273 meters, cascading in three magnificent drops through ancient montane forest in the Aberdare Ranges. The first drop is 117m, the second is 26m, and the third is 130m. The falls are fed by streams originating from the Aberdare moorlands and are most impressive during the rainy seasons (March-May and October-December). The trail to the falls passes through dense bamboo forest and requires a moderate 3-hour hike. The mist from the falls supports a microecosystem of rare ferns, mosses, and orchids. Early morning visits offer the best light for photography.',
    type: 'waterfall',
    location: { lat: -0.4000, lng: 36.7167 },
    region: 'Aberdares',
    images: [
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9',
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d',
      'https://images.unsplash.com/photo-1475113548554-5a36f1f523d6'
    ],
    features: ['Hiking', 'Photography', 'Nature trails', 'Bamboo forest', 'Rare orchids', 'Bird watching', 'Guided tours'],
    elevation_m: 2750,
    difficulty: 3,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 52, currency: 'USD' },
    contact: { phone: '+254-20-2379407', website: 'https://www.kws.go.ke' },
    rating_avg: 4.9,
    review_count: 145,
    verified: true
  },
  {
    name: 'Fourteen Falls',
    description: 'A wide, horseshoe-shaped series of cascading waterfalls on the Athi River, approximately 60km from Nairobi. During the rainy season, the river swells and up to fourteen separate streams pour over a 27-meter cliff face, creating a dramatic wall of water. In drier months, the falls reduce to a few streams but remain picturesque. The surrounding area has well-maintained picnic grounds, walking paths, and viewpoints. Local guides offer boat rides to the base of the falls. Swimming is possible in designated safe zones during low water. Popular weekend getaway for Nairobi residents.',
    type: 'waterfall',
    location: { lat: -1.1167, lng: 37.2333 },
    region: 'Thika',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9',
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d'
    ],
    features: ['Swimming', 'Picnic area', 'Photography', 'Boat rides', 'Walking paths', 'Local food vendors', 'Guided tours'],
    elevation_m: 1520,
    difficulty: 1,
    openingHours: { open: '08:00', close: '17:00' },
    fees: { hasEntry: true, amount: 500, currency: 'KES' },
    contact: { phone: '+254-733-222111', email: 'info@fourteenfalls.co.ke' },
    rating_avg: 4.3,
    review_count: 98,
    verified: true
  },
  {
    name: 'Thomson\'s Falls',
    description: 'A dramatic 72-meter waterfall on the Ewaso Narok River in Nyahururu, named after Scottish explorer Joseph Thomson who first documented them in 1883. The falls cascade into a deep, forested gorge with a hippo pool at the base. A steep trail leads down to the base where you can feel the spray and see rainbows in the mist. The surrounding town of Nyahururu is the highest town in Kenya at 2,360m. The area is popular for day trips combining the falls with nearby Thomson\'s Falls Lodge, one of Kenya\'s oldest colonial-era hotels.',
    type: 'waterfall',
    location: { lat: 0.0500, lng: 36.3667 },
    region: 'Nyahururu',
    images: [
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9',
      'https://images.unsplash.com/photo-1475113548554-5a36f1f523d6'
    ],
    features: ['Gorge trail', 'Photography', 'Hippo pool', 'Historical site', 'Rainbow viewing', 'Picnic area'],
    elevation_m: 2360,
    difficulty: 2,
    openingHours: { open: '07:00', close: '18:00' },
    fees: { hasEntry: true, amount: 300, currency: 'KES' },
    contact: { phone: '+254-720-334455' },
    rating_avg: 4.4,
    review_count: 112,
    verified: true
  },

  // ============ Climbing Walls ============
  {
    name: 'Fischer\'s Tower',
    description: 'An iconic 25-meter volcanic plug standing alone in Hell\'s Gate National Park, named after German explorer Gustav Fischer. This remnant of ancient volcanic activity offers some of East Africa\'s most famous rock climbing routes. The rock is phonolite — a type of volcanic rock providing excellent holds. Routes range from 5.6 to 5.12 in difficulty. The classic route follows a chimney system on the south face. Climbers share the park with zebras, buffalo, and giraffes grazing at the tower\'s base. Best climbing conditions are during the dry seasons (January-February, July-September). Bring your own gear; no rentals available on site.',
    type: 'climbing_wall',
    location: { lat: -0.9200, lng: 36.3150 },
    region: 'Hell\'s Gate',
    images: [
      'https://images.unsplash.com/photo-1522163182402-834f871fd851',
      'https://images.unsplash.com/photo-1564769625905-50e93615e769',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4'
    ],
    features: ['Sport climbing', 'Traditional climbing', 'Bouldering', 'Multi-pitch routes', 'Wildlife at base', 'Photography', 'Camping nearby'],
    elevation_m: 1950,
    difficulty: 4,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 26, currency: 'USD' },
    contact: { phone: '+254-722-123456', email: 'climbing@kws.go.ke', website: 'https://www.kws.go.ke' },
    rating_avg: 4.7,
    review_count: 52,
    verified: true
  },
  {
    name: 'Lukenya Hills Climbing Area',
    description: 'East Africa\'s premier sport climbing destination located just 45 minutes from Nairobi. The granite and gneiss cliffs host over 400 bolted routes across dozens of crags, from beginner-friendly 5.5s to project-level 5.14s. Popular crags include The Dome, Far Side, and Main Wall. The rock quality is excellent with crimps, slopers, and pockets. The climbing community runs regular weekend meetups, and the Mountain Club of Kenya maintains route information. Several flat camping areas with fire pits make it ideal for weekend climbing trips. The area also has bouldering fields with over 100 documented problems.',
    type: 'climbing_wall',
    location: { lat: -1.5167, lng: 37.0333 },
    region: 'Machakos',
    images: [
      'https://images.unsplash.com/photo-1564769625905-50e93615e769',
      'https://images.unsplash.com/photo-1522163182402-834f871fd851',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4'
    ],
    features: ['Sport climbing', 'Bouldering', 'Camping', '400+ routes', 'Weekend meetups', 'Beginner-friendly areas', 'Night camping allowed'],
    elevation_m: 1750,
    difficulty: 3,
    openingHours: { open: '06:00', close: '19:00' },
    fees: { hasEntry: true, amount: 500, currency: 'KES' },
    contact: { phone: '+254-700-123456', email: 'lukenya@mck.or.ke', website: 'https://www.mck.or.ke' },
    rating_avg: 4.6,
    review_count: 78,
    verified: true
  },

  // ============ Camping Sites ============
  {
    name: 'Ol Donyo Sabuk Campsite',
    description: 'A peaceful campsite at the base of Ol Donyo Sabuk (Kilimambogo) mountain, meaning "big mountain" in Maasai. The 2,146m mountain offers a well-maintained trail through indigenous forest to the summit where Lord Macmillan and his wife are buried. The campsite has flat grassy areas for tents, communal fire pits, and basic pit latrines. Natural water from a nearby stream (treat before drinking). Wildlife including buffalo, colobus monkeys, baboons, and bushbuck roam freely. Night sounds include tree hyrax screams and owl calls. The sunrise from the summit is spectacular — start the hike at 5:30am.',
    type: 'camping',
    location: { lat: -1.1667, lng: 37.2333 },
    region: 'Kyanzavi',
    images: [
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
      'https://images.unsplash.com/photo-1487730116645-74489c95b41b'
    ],
    features: ['Tents allowed', 'Firewood', 'Water source', 'Wildlife', 'Summit trail', 'Fire pits', 'Pit latrines', 'Bird watching'],
    elevation_m: 1800,
    difficulty: 2,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 15, currency: 'USD' },
    contact: { phone: '+254-20-2379407', website: 'https://www.kws.go.ke' },
    rating_avg: 4.2,
    review_count: 34,
    verified: true
  },
  {
    name: 'Karura Forest Picnic Site',
    description: 'An urban oasis in the heart of Nairobi — 1,041 hectares of indigenous forest just 10 minutes from the CBD. The picnic site has well-maintained grounds with shaded tables, barbecue grills, and clean restrooms. Over 50km of trails wind through the forest for walking, jogging, and cycling. Highlights include the Karura waterfall, WWII-era caves, and the Mau Mau detention caves. The forest is home to bushbuck, sykes monkeys, duikers, and over 200 bird species. Bike rental available at the main gate. The River Cafe at the entrance serves excellent coffee and meals. A perfect weekend escape without leaving the city.',
    type: 'camping',
    location: { lat: -1.2373, lng: 36.8511 },
    region: 'Nairobi',
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
      'https://images.unsplash.com/photo-1448375240586-882707db888b'
    ],
    features: ['Picnic tables', 'Restrooms', 'Cycling trails', 'Waterfalls', 'BBQ grills', 'Bike rental', 'Bird watching', 'Historical caves'],
    elevation_m: 1700,
    difficulty: 1,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 100, currency: 'KES' },
    contact: { phone: '+254-20-2020000', email: 'karura@friendsofkarura.org', website: 'https://www.friendsofkarura.org' },
    rating_avg: 4.4,
    review_count: 112,
    verified: true
  },

  // ============ Parking Areas ============
  {
    name: 'Ngong Hills Main Parking',
    description: 'The main access point for Ngong Hills hiking, located at the Kenya Forest Service (KFS) gate. The parking area has 24/7 security guards and CCTV coverage. Facilities include clean restrooms, a registration desk for hikers, and several vendor stalls selling snacks, water, and souvenirs. KFS rangers are available for mandatory escort and can be arranged at the gate. The parking area fills up quickly on weekends — arrive before 7am for a spot. Motorcycle parking available. Local vendors also sell packed lunches for the hike.',
    type: 'parking',
    location: { lat: -1.3792, lng: 36.6485 },
    region: 'Ngong',
    images: [
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a'
    ],
    features: ['24/7 Security', 'Restrooms', 'Vendor stalls', 'CCTV surveillance', 'Hiker registration', 'Ranger arrangement', 'Motorcycle parking'],
    elevation_m: 2300,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 300, currency: 'KES' },
    contact: { phone: '+254-722-555123' },
    rating_avg: 3.8,
    review_count: 45,
    verified: true
  },
  {
    name: 'Mount Longonot Trailhead Parking',
    description: 'Secure parking area at the base of Mount Longonot volcano, serving as the starting point for the popular crater rim hike. The KWS gate has clean restroom facilities, an information center with trail maps and safety briefings, and a small shop for last-minute supplies. Parking attendants are on duty during park hours. The area accommodates about 150 vehicles. On busy weekends, overflow parking extends along the access road. Matatu (local minibuses) from Nairobi and Naivasha drop off at the nearby Mai Mahiu junction, from where it\'s a 3km walk to the gate.',
    type: 'parking',
    location: { lat: -0.9143, lng: 36.4458 },
    region: 'Longonot',
    images: [
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a'
    ],
    features: ['Security', 'Restrooms', 'Information center', 'Trail maps', 'Small shop', 'Overflow parking', 'Public transport access'],
    elevation_m: 2100,
    difficulty: 1,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 200, currency: 'KES' },
    contact: { phone: '+254-20-2379407', website: 'https://www.kws.go.ke' },
    rating_avg: 4.0,
    review_count: 56,
    verified: true
  },

  // ============ Water Sources ============
  {
    name: 'Nithi Falls Natural Spring',
    description: 'A pristine natural spring along the Nithi River on the Chogoria route of Mount Kenya. The spring produces clean, cold water filtered through volcanic rock — one of the best refill points on the mountain. The water emerges from a moss-covered rock face into a small pool before joining the Nithi River. Hikers on multi-day ascents rely on this spring as one of the last reliable water sources before reaching the higher camps. The surrounding area is lush with giant heather and St. John\'s wort. Located about 2 hours above Minto\'s Hut, it\'s an essential waypoint for climbers. Water quality is excellent but purification is still recommended.',
    type: 'water',
    location: { lat: -0.1833, lng: 37.4833 },
    region: 'Mount Kenya',
    images: [
      'https://images.unsplash.com/photo-1504006833117-8886a355efbf',
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9'
    ],
    features: ['Drinking water', 'Refill point', 'Scenic area', 'Rest stop', 'Giant heather forest', 'Photography'],
    elevation_m: 2800,
    difficulty: 2,
    fees: { hasEntry: false },
    contact: { phone: '+254-20-2379407' },
    rating_avg: 4.5,
    review_count: 23,
    verified: true
  },

  // ============ Lookout Towers ============
  {
    name: 'Mount Longonot Crater Rim Lookout',
    description: 'The ultimate reward for the Mount Longonot hike — a panoramic lookout at 2,776m on the crater rim of this dormant stratovolcano. The 360-degree views encompass the vast Rift Valley floor, Lake Naivasha shimmering to the northwest, the Mau Escarpment, and on clear days, Mount Kenya to the northeast. The steam vents inside the crater remind visitors that Longonot last erupted in the 1860s. The hike from the gate is 7.2km (3-4 hours) with a steep ascent gaining 700m of elevation. The full crater rim circuit adds another 7.2km and 2-3 hours. The trail is well-marked but exposed — bring sun protection and at least 2 liters of water.',
    type: 'lookout',
    location: { lat: -0.9145, lng: 36.4430 },
    region: 'Longonot',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470'
    ],
    features: ['Panoramic views', 'Photography', 'Rest area', 'Crater views', 'Steam vents', 'Rift Valley views', 'Lake Naivasha views'],
    elevation_m: 2776,
    difficulty: 4,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 26, currency: 'USD' },
    contact: { phone: '+254-20-2379407', website: 'https://www.kws.go.ke' },
    rating_avg: 4.9,
    review_count: 187,
    verified: true
  },

  // ============ Lakes ============
  {
    name: 'Lake Naivasha',
    description: 'A stunning freshwater lake in the Rift Valley at 1,884m, one of only two freshwater lakes in the Rift (the other being Lake Baringo). The lake spans about 139 sq km and its shores are lined with papyrus and acacia woodland. Famous for its hippo population — an estimated 1,500 hippos live in and around the lake. Over 400 bird species have been recorded, including fish eagles, pelicans, cormorants, and jacanas. Crescent Island, accessible by boat, is a wildlife sanctuary where you can walk among giraffes, zebras, and wildebeest. The lake is surrounded by flower farms producing roses for the European market. Boat rides at sunset with hippos surfacing are unforgettable.',
    type: 'lake',
    location: { lat: -0.7667, lng: 36.3500 },
    region: 'Naivasha',
    images: [
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000',
      'https://images.unsplash.com/photo-1504006833117-8886a355efbf',
      'https://images.unsplash.com/photo-1547970810-dc1e684757a9'
    ],
    features: ['Boat rides', 'Birdwatching', 'Fishing', 'Hippos', 'Crescent Island', 'Sunset cruises', 'Photography', 'Walking safaris'],
    elevation_m: 1884,
    difficulty: 1,
    openingHours: { open: '06:00', close: '18:30' },
    fees: { hasEntry: false },
    contact: { phone: '+254-722-888999', email: 'lakenaivasha@tourism.go.ke', website: 'https://www.magicalkenya.com' },
    rating_avg: 4.6,
    review_count: 234,
    verified: true
  },
  {
    name: 'Lake Bogoria',
    description: 'A soda lake in the Rift Valley famous for hosting up to 2 million flamingos at peak times, creating a surreal pink shoreline. The lake is also renowned for its hot springs and geysers — some shooting boiling water 5 meters into the air. The 107 sq km reserve protects the lake and surrounding acacia woodland. Greater kudu, a rare antelope in Kenya, are found in the lakeside cliffs. The hot springs area has boardwalks allowing safe viewing of the geothermal activity. Warning: the water near hot springs can cause severe burns. Best visited early morning when flamingos are most active and the light is ideal for photography.',
    type: 'lake',
    location: { lat: 0.2667, lng: 36.1000 },
    region: 'Baringo',
    images: [
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470'
    ],
    features: ['Flamingos', 'Hot springs', 'Geysers', 'Bird watching', 'Greater kudu', 'Photography', 'Boardwalks', 'Nature trails'],
    elevation_m: 990,
    difficulty: 1,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 1000, currency: 'KES' },
    contact: { phone: '+254-720-567890', website: 'https://www.kws.go.ke' },
    rating_avg: 4.7,
    review_count: 178,
    verified: true
  },

  // ============ Caves ============
  {
    name: 'Kitum Cave',
    description: 'A remarkable 200-meter-deep cave on the slopes of Mount Elgon, carved over millennia by elephants mining salt from the cave walls with their tusks. The cave entrance is wide and cathedral-like, narrowing into dark passages where elephant tusk marks are visible on the walls. At night, elephants still visit to lick salt deposits — a behavior found nowhere else on Earth. The cave is also home to thousands of fruit bats and a unique ecosystem of cave-adapted insects. Important: the cave was linked to Marburg virus cases in the 1980s — visitors should avoid contact with bat droppings. KWS rangers provide mandatory guided tours. Flashlights and sturdy footwear required.',
    type: 'cave',
    location: { lat: 1.1167, lng: 34.7667 },
    region: 'Mount Elgon',
    images: [
      'https://images.unsplash.com/photo-1544552866-d3ed42536cfd',
      'https://images.unsplash.com/photo-1504006833117-8886a355efbf'
    ],
    features: ['Elephant viewing', 'Geology', 'Photography', 'Guided tours', 'Bat colony', 'Salt mining marks', 'Unique ecosystem'],
    elevation_m: 2500,
    difficulty: 2,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 30, currency: 'USD' },
    contact: { phone: '+254-20-2379407', email: 'mtelgon@kws.go.ke', website: 'https://www.kws.go.ke' },
    rating_avg: 4.7,
    review_count: 67,
    verified: true
  },

  // ============ Wildlife Viewing ============
  {
    name: 'Giraffe Centre',
    description: 'A world-renowned conservation center in the Langata suburb of Nairobi, dedicated to the endangered Rothschild\'s giraffe. Founded in 1979 by Jock and Betty Leslie-Melville to protect this subspecies — fewer than 800 remain in the wild. Visitors stand on an elevated platform at eye-level with the giraffes and can hand-feed them specially prepared food pellets. The center also has a nature trail through indigenous forest where warthogs, dik-diks, and weaver birds can be spotted. An education center teaches about giraffe conservation and breeding programs. The gift shop supports conservation projects. One of Nairobi\'s most popular attractions for families.',
    type: 'wildlife',
    location: { lat: -1.3230, lng: 36.7520 },
    region: 'Nairobi',
    images: [
      'https://images.unsplash.com/photo-1547970810-dc1e684757a9',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801',
      'https://images.unsplash.com/photo-1504006833117-8886a355efbf'
    ],
    features: ['Giraffe feeding', 'Education center', 'Nature trail', 'Gift shop', 'Photography', 'Family-friendly', 'Conservation programs', 'Guided tours'],
    elevation_m: 1680,
    difficulty: 1,
    openingHours: { open: '09:00', close: '17:00' },
    fees: { hasEntry: true, amount: 1500, currency: 'KES' },
    contact: { phone: '+254-20-8070804', email: 'info@giraffecentre.org', website: 'https://giraffecentre.org' },
    rating_avg: 4.8,
    review_count: 542,
    verified: true
  },
  {
    name: 'David Sheldrick Wildlife Trust',
    description: 'The world\'s most successful orphan elephant rescue and rehabilitation center, located within Nairobi National Park. Founded by Dame Daphne Sheldrick in 1977, the trust has hand-raised over 300 orphaned elephants and successfully reintegrated them into wild herds in Tsavo. The daily 11am-12pm public visiting hour allows visitors to watch baby elephants being fed, playing in mud baths, and socializing. Each elephant has a unique personality and story — keepers share their backgrounds. Visitors can adopt an orphan elephant for $50/year and receive monthly updates. The trust also rescues orphaned rhinos and other wildlife. Book visits in advance — capacity is limited.',
    type: 'wildlife',
    location: { lat: -1.3680, lng: 36.7360 },
    region: 'Nairobi',
    images: [
      'https://images.unsplash.com/photo-1547970810-dc1e684757a9',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801'
    ],
    features: ['Baby elephants', 'Mud bath viewing', 'Adoption program', 'Education center', 'Photography', 'Conservation', 'Gift shop', 'Guided feeding'],
    elevation_m: 1700,
    difficulty: 1,
    openingHours: { open: '11:00', close: '12:00' },
    fees: { hasEntry: true, amount: 1500, currency: 'KES' },
    contact: { phone: '+254-20-2301396', email: 'rc-info@sheldrickwildlifetrust.org', website: 'https://www.sheldrickwildlifetrust.org' },
    rating_avg: 4.9,
    review_count: 876,
    verified: true
  },

  // ============ Facilities ============
  {
    name: 'Karura Forest Visitor Center',
    description: 'The main gateway to Karura Forest, Nairobi\'s largest urban forest. The visitor center houses an information desk where staff provide trail maps and route suggestions based on your fitness level and interests. Mountain bike rental is available (KES 500/hour for adults, KES 300/hour for children). The center has clean flush restrooms, a first aid station, and lockers for valuables. The Friends of Karura Forest organization operates from here, running conservation programs and community events. Weekend mornings see runners, cyclists, and families streaming in. The adjacent River Cafe is an excellent stop for coffee before or after your forest adventure.',
    type: 'facility',
    location: { lat: -1.2350, lng: 36.8500 },
    region: 'Nairobi',
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
      'https://images.unsplash.com/photo-1448375240586-882707db888b'
    ],
    features: ['Restrooms', 'Information', 'Bike rental', 'First aid', 'Trail maps', 'Lockers', 'River Cafe nearby', 'Parking'],
    elevation_m: 1680,
    difficulty: 1,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: false },
    contact: { phone: '+254-20-2020000', email: 'info@friendsofkarura.org', website: 'https://www.friendsofkarura.org' },
    rating_avg: 4.1,
    review_count: 78,
    verified: true
  },

  // ============ Restaurants ============
  {
    name: 'Trout Tree Restaurant',
    description: 'A one-of-a-kind dining experience in a centuries-old fig tree overlooking a trout farm and the Burguret River on the slopes of Mount Kenya. The restaurant is literally built in the branches of a massive mugumu tree, with platforms at different levels connected by wooden staircases. The menu focuses on fresh trout prepared in various styles — smoked, grilled, pan-fried, or in a creamy garlic sauce. Non-fish options include lamb, chicken, and vegetarian dishes. The river below is stocked with rainbow and brown trout; fishing rods available for catch-and-cook experiences. Reservations recommended for weekend lunch. The drive from Nanyuki town passes through beautiful highland farmland.',
    type: 'restaurant',
    location: { lat: -0.4100, lng: 36.6900 },
    region: 'Nanyuki',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0'
    ],
    features: ['Trout specialty', 'River views', 'Outdoor seating', 'Treehouse dining', 'Catch-and-cook', 'Full bar', 'Vegetarian options', 'Reservations recommended'],
    elevation_m: 2050,
    difficulty: 1,
    openingHours: { open: '12:00', close: '22:00' },
    fees: { hasEntry: false },
    contact: { phone: '+254-722-333444', email: 'reservations@trouttree.co.ke', website: 'https://trouttree.co.ke' },
    rating_avg: 4.5,
    review_count: 289,
    verified: true
  },
  {
    name: 'Tamambo Karen Blixen',
    description: 'An elegant restaurant set in the lush gardens of the Karen Blixen Coffee Garden, named after the famous Danish author of "Out of Africa." The open-air restaurant blends African and international cuisine with dishes like Swahili coconut fish, nyama choma (grilled meat), and wood-fired pizza. The setting features manicured gardens, ancient trees, and a colonial-era ambiance. Live jazz on Friday evenings. The adjacent coffee garden has a boutique selling Kenyan crafts and coffee. An excellent dining option after visiting the nearby Karen Blixen Museum or before/after a Ngong Hills hike. Brunch on Sundays is a Nairobi institution.',
    type: 'restaurant',
    location: { lat: -1.3200, lng: 36.7100 },
    region: 'Nairobi',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'
    ],
    features: ['African cuisine', 'International menu', 'Garden dining', 'Live jazz (Fridays)', 'Sunday brunch', 'Wine selection', 'Historical setting', 'Craft shop'],
    elevation_m: 1760,
    difficulty: 1,
    openingHours: { open: '07:00', close: '23:00' },
    fees: { hasEntry: false },
    contact: { phone: '+254-20-3882138', email: 'info@tamambo.co.ke', website: 'https://tamambo.co.ke' },
    rating_avg: 4.4,
    review_count: 345,
    verified: true
  },

  // ============ Trailheads ============
  {
    name: 'Sirimon Gate Trailhead',
    description: 'The most popular and accessible starting point for Mount Kenya climbs, located on the mountain\'s northwest side. The Sirimon route is considered the most gradual and scenic approach, passing through bamboo forest, giant heather zone, and alpine moorland before reaching the summit circuit. The gate has a registration office, basic camping area, and porters available for hire. The track is motorable for the first 9km to Old Moses Camp (3,300m), reducing the walking distance. Most climbers take 4-5 days for the return trip via Sirimon. The route offers the best wildlife sighting opportunities of all Mount Kenya routes — elephants, buffalo, and colobus monkeys are regularly seen.',
    type: 'trailhead',
    location: { lat: -0.0500, lng: 37.2167 },
    region: 'Mount Kenya',
    images: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'
    ],
    features: ['Registration office', 'Camping', 'Porter hire', 'Vehicle access (9km)', 'Wildlife sightings', 'Gradual ascent', 'Most scenic route', 'Guide services'],
    elevation_m: 2650,
    difficulty: 3,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 52, currency: 'USD' },
    contact: { phone: '+254-20-2379407', email: 'sirimon@kws.go.ke', website: 'https://www.kws.go.ke' },
    rating_avg: 4.6,
    review_count: 134,
    verified: true
  },
  {
    name: 'Chogoria Gate Trailhead',
    description: 'The eastern approach to Mount Kenya, widely regarded as the most beautiful route on the mountain. The trail ascends through pristine bamboo forest, passing Lake Ellis, the stunning Gorges Valley with its vertical cliff walls, and the vivid turquoise Lake Michaelson. The gate has a registration office, a basic bandas (huts) for overnight stays, and a campsite. The motorable track extends 18km to Road Head (3,300m). The Chogoria route is often combined with Sirimon for a traverse — ascending via Chogoria and descending via Sirimon for the best of both worlds. The Giant\'s Billiard Table, a perfectly flat marshy meadow at 3,700m, is a surreal highlight.',
    type: 'trailhead',
    location: { lat: -0.1833, lng: 37.5667 },
    region: 'Mount Kenya',
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801'
    ],
    features: ['Registration office', 'Bandas available', 'Camping', 'Vehicle access (18km)', 'Lake Michaelson', 'Gorges Valley', 'Guide services', 'Most scenic views'],
    elevation_m: 2950,
    difficulty: 4,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 52, currency: 'USD' },
    contact: { phone: '+254-20-2379407', email: 'chogoria@kws.go.ke', website: 'https://www.kws.go.ke' },
    rating_avg: 4.8,
    review_count: 98,
    verified: true
  },

  // ============ Bridges ============
  {
    name: 'Ol Njorowa Gorge Suspension Bridge',
    description: 'A thrilling narrow suspension bridge spanning the Ol Njorowa Gorge in Hell\'s Gate National Park. The gorge was carved by ancient water flows from a prehistoric lake, creating dramatic 20-meter-high cliff walls of red and grey volcanic rock. The bridge swings gently as you cross, offering vertigo-inducing views of the gorge floor below where hot springs bubble up. The gorge walk continues beyond the bridge through narrow passages where you wade through warm water. Flash flood warnings apply during rainy season — always check conditions with rangers before entering. The gorge is best explored with a local guide who knows the safe routes and can explain the geology.',
    type: 'bridge',
    location: { lat: -0.9180, lng: 36.3200 },
    region: 'Hell\'s Gate',
    images: [
      'https://images.unsplash.com/photo-1504006833117-8886a355efbf',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
    ],
    features: ['Gorge crossing', 'Hot springs', 'Photography', 'Guided tours', 'Geological formations', 'Wading through water', 'Dramatic views'],
    elevation_m: 1850,
    difficulty: 3,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 26, currency: 'USD' },
    contact: { phone: '+254-722-123456', website: 'https://www.kws.go.ke' },
    rating_avg: 4.5,
    review_count: 89,
    verified: true
  },

  // ============ Monuments ============
  {
    name: 'Denys Finch Hatton Memorial',
    description: 'A simple but moving brass plaque memorial on the edge of the Ngong Hills marking the grave of Denys Finch Hatton (1887-1931), the British aristocrat, aviator, and big game hunter immortalized in Karen Blixen\'s "Out of Africa" and played by Robert Redford in the film. He died in a plane crash at Voi and was buried here per his wishes, overlooking the Rift Valley he loved. The memorial site offers the same panoramic views that drew Finch Hatton to this spot. A short path leads from the Ngong Hills trail to the gravesite. Lions were once reported sleeping on his grave, as described in Blixen\'s memoir. A pilgrimage site for literature and film enthusiasts.',
    type: 'monument',
    location: { lat: -1.3750, lng: 36.6480 },
    region: 'Ngong',
    images: [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
    ],
    features: ['Historical site', 'Literary significance', 'Rift Valley views', 'Photography', 'Quiet reflection', 'Part of Ngong Hills hike'],
    elevation_m: 2400,
    difficulty: 2,
    openingHours: { open: '06:30', close: '17:30' },
    fees: { hasEntry: true, amount: 5, currency: 'USD' },
    contact: { phone: '+254-722-555123' },
    rating_avg: 4.3,
    review_count: 56,
    verified: true
  },

  // ============ Picnic Areas ============
  {
    name: 'Nairobi Arboretum Picnic Grounds',
    description: 'A 30-hectare botanical garden in the heart of Nairobi, originally established in 1907 to test which exotic tree species could thrive in Kenya\'s climate. Today it has over 350 tree species from around the world, labeled with identification tags. The well-maintained picnic grounds have shaded tables, open lawns for sports, and quiet corners for reading. The arboretum is popular with yoga groups, joggers, and families. Vervet monkeys and sykes monkeys are resident, along with many bird species. The medicinal plant garden showcases traditional Kenyan herbal remedies. One of the most peaceful green spaces in Nairobi — a perfect midday escape.',
    type: 'picnic',
    location: { lat: -1.2700, lng: 36.8000 },
    region: 'Nairobi',
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
      'https://images.unsplash.com/photo-1448375240586-882707db888b'
    ],
    features: ['Shaded tables', 'Open lawns', 'Botanical garden', 'Bird watching', 'Monkey viewing', 'Jogging paths', 'Medicinal plants', 'Yoga-friendly'],
    elevation_m: 1670,
    difficulty: 1,
    openingHours: { open: '08:00', close: '18:00' },
    fees: { hasEntry: true, amount: 100, currency: 'KES' },
    contact: { phone: '+254-20-2725471', email: 'arboretum@kfs.go.ke' },
    rating_avg: 4.2,
    review_count: 156,
    verified: true
  },

  // ============ Shelters ============
  {
    name: 'Old Moses Camp',
    description: 'A vital mountain shelter at 3,300m on the Sirimon route of Mount Kenya, serving as the first overnight stop for most climbers. The camp has a stone bunkhouse with 30 beds (bring your own sleeping bag), a cooking shelter with gas stoves, and clean pit latrines. Running water from a nearby stream. The camp sits in the transition zone between montane forest and moorland, offering beautiful views of the peaks above. Nights are cold (often below freezing) — warm clothing essential. The camp is managed by KWS and maintains a resident caretaker. Camp fires are not permitted to protect the fragile ecosystem. The bunkhouse fills up on weekends — camping is the overflow option.',
    type: 'shelter',
    location: { lat: -0.1167, lng: 37.2500 },
    region: 'Mount Kenya',
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'
    ],
    features: ['30-bed bunkhouse', 'Cooking shelter', 'Gas stoves', 'Pit latrines', 'Running water', 'Caretaker on site', 'Camping area', 'Summit base'],
    elevation_m: 3300,
    difficulty: 3,
    openingHours: { open: '00:00', close: '23:59' },
    fees: { hasEntry: true, amount: 52, currency: 'USD' },
    contact: { phone: '+254-20-2379407', website: 'https://www.kws.go.ke' },
    rating_avg: 4.0,
    review_count: 89,
    verified: true
  }
];

async function seedPOIs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing POIs
    await POI.deleteMany({});
    console.log('Cleared existing POIs');

    // Insert new POIs
    const result = await POI.insertMany(pois);
    console.log(`Inserted ${result.length} POIs`);

    // Log type distribution
    const types = await POI.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('\nPOI Distribution:');
    types.forEach(t => console.log(`  ${t._id}: ${t.count}`));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding POIs:', error);
    process.exit(1);
  }
}

seedPOIs();

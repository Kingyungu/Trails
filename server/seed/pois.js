require('dotenv').config();
const mongoose = require('mongoose');
const POI = require('../models/POI');

const pois = [
  // National Parks
  {
    name: 'Mount Kenya National Park',
    description: 'UNESCO World Heritage site featuring Africa\'s second-highest mountain with diverse ecosystems and abundant wildlife.',
    type: 'park',
    location: { lat: -0.1521, lng: 37.3084 },
    region: 'Central Kenya',
    images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801'],
    features: ['Wildlife viewing', 'Camping', 'Hiking', 'Rock climbing'],
    elevation_m: 5199,
    fees: { hasEntry: true, amount: 52, currency: 'USD' },
    contact: { website: 'https://www.kws.go.ke' },
    rating_avg: 4.8,
    review_count: 156,
    verified: true
  },
  {
    name: 'Hell\'s Gate National Park',
    description: 'Unique park where visitors can walk, cycle, and rock climb among wildlife including zebras, giraffes, and gazelles.',
    type: 'park',
    location: { lat: -0.9137, lng: 36.3094 },
    region: 'Naivasha',
    images: ['https://images.unsplash.com/photo-1547970810-dc1e684757a9'],
    features: ['Cycling', 'Rock climbing', 'Hot springs', 'Camping'],
    elevation_m: 1900,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 26, currency: 'USD' },
    contact: { phone: '+254-722-123456', website: 'https://www.kws.go.ke' },
    rating_avg: 4.7,
    review_count: 203,
    verified: true
  },
  {
    name: 'Aberdare National Park',
    description: 'Mountainous park with stunning waterfalls, bamboo forests, and rare wildlife including the bongo antelope.',
    type: 'park',
    location: { lat: -0.3833, lng: 36.7000 },
    region: 'Central Kenya',
    images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801'],
    features: ['Waterfalls', 'Wildlife viewing', 'Trout fishing', 'Hiking'],
    elevation_m: 3999,
    fees: { hasEntry: true, amount: 52, currency: 'USD' },
    rating_avg: 4.6,
    review_count: 89,
    verified: true
  },

  // Viewpoints
  {
    name: 'Ngong Hills Viewpoint',
    description: 'Spectacular viewpoint offering panoramic views of the Great Rift Valley and Nairobi cityscape.',
    type: 'viewpoint',
    location: { lat: -1.3786, lng: 36.6511 },
    region: 'Ngong',
    images: ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'],
    features: ['Panoramic views', 'Photography', 'Picnic area'],
    elevation_m: 2460,
    difficulty: 2,
    fees: { hasEntry: true, amount: 5, currency: 'USD' },
    rating_avg: 4.5,
    review_count: 124,
    verified: true
  },
  {
    name: 'Menengai Crater Viewpoint',
    description: 'One of the largest volcanic calderas in the world with breathtaking views of the crater floor.',
    type: 'viewpoint',
    location: { lat: -0.2167, lng: 36.0667 },
    region: 'Nakuru',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4'],
    features: ['Crater views', 'Geothermal activity', 'Photography'],
    elevation_m: 2278,
    difficulty: 1,
    fees: { hasEntry: false },
    rating_avg: 4.4,
    review_count: 67,
    verified: true
  },

  // Waterfalls
  {
    name: 'Karuru Falls',
    description: 'Kenya\'s tallest waterfall plunging 273 meters in three spectacular drops through pristine forest.',
    type: 'waterfall',
    location: { lat: -0.4000, lng: 36.7167 },
    region: 'Aberdares',
    images: ['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9'],
    features: ['Hiking', 'Photography', 'Nature trails'],
    elevation_m: 2750,
    difficulty: 3,
    fees: { hasEntry: true, amount: 52, currency: 'USD' },
    rating_avg: 4.9,
    review_count: 145,
    verified: true
  },
  {
    name: 'Fourteen Falls',
    description: 'Series of waterfalls on the Athi River, creating a spectacular cascade during rainy season.',
    type: 'waterfall',
    location: { lat: -1.1167, lng: 37.2333 },
    region: 'Thika',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'],
    features: ['Swimming', 'Picnic area', 'Photography'],
    elevation_m: 1520,
    difficulty: 1,
    openingHours: { open: '08:00', close: '17:00' },
    fees: { hasEntry: true, amount: 500, currency: 'KES' },
    rating_avg: 4.3,
    review_count: 98,
    verified: true
  },

  // Climbing Walls
  {
    name: 'Fischer\'s Tower',
    description: 'Iconic volcanic plug in Hell\'s Gate offering excellent traditional rock climbing routes.',
    type: 'climbing_wall',
    location: { lat: -0.9200, lng: 36.3150 },
    region: 'Hell\'s Gate',
    images: ['https://images.unsplash.com/photo-1522163182402-834f871fd851'],
    features: ['Sport climbing', 'Traditional climbing', 'Bouldering'],
    elevation_m: 1950,
    difficulty: 4,
    fees: { hasEntry: true, amount: 26, currency: 'USD' },
    rating_avg: 4.7,
    review_count: 52,
    verified: true
  },
  {
    name: 'Lukenya Hills Climbing Area',
    description: 'Popular sport climbing destination with over 400 bolted routes ranging from beginner to advanced.',
    type: 'climbing_wall',
    location: { lat: -1.5167, lng: 37.0333 },
    region: 'Machakos',
    images: ['https://images.unsplash.com/photo-1564769625905-50e93615e769'],
    features: ['Sport climbing', 'Bouldering', 'Camping'],
    elevation_m: 1750,
    difficulty: 3,
    fees: { hasEntry: true, amount: 500, currency: 'KES' },
    contact: { phone: '+254-700-123456' },
    rating_avg: 4.6,
    review_count: 78,
    verified: true
  },

  // Camping Sites
  {
    name: 'Ol Donyo Sabuk Campsite',
    description: 'Serene camping site at the base of Ol Donyo Sabuk mountain with basic facilities.',
    type: 'camping',
    location: { lat: -1.1667, lng: 37.2333 },
    region: 'Kyanzavi',
    images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d'],
    features: ['Tents allowed', 'Firewood', 'Water source', 'Wildlife'],
    elevation_m: 1800,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 15, currency: 'USD' },
    rating_avg: 4.2,
    review_count: 34,
    verified: true
  },
  {
    name: 'Karura Forest Picnic Site',
    description: 'Urban forest picnic and camping area with scenic trails and waterfalls.',
    type: 'camping',
    location: { lat: -1.2373, lng: 36.8511 },
    region: 'Nairobi',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4'],
    features: ['Picnic tables', 'Restrooms', 'Cycling trails', 'Waterfalls'],
    elevation_m: 1700,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 100, currency: 'KES' },
    rating_avg: 4.4,
    review_count: 112,
    verified: true
  },

  // Parking Areas
  {
    name: 'Ngong Hills Main Parking',
    description: 'Main parking area and trailhead for Ngong Hills with security and facilities.',
    type: 'parking',
    location: { lat: -1.3792, lng: 36.6485 },
    region: 'Ngong',
    features: ['24/7 Security', 'Restrooms', 'Vendor stalls'],
    elevation_m: 2300,
    fees: { hasEntry: true, amount: 300, currency: 'KES' },
    rating_avg: 3.8,
    review_count: 45,
    verified: true
  },
  {
    name: 'Mount Longonot Trailhead Parking',
    description: 'Secure parking at the base of Mount Longonot with toilet facilities.',
    type: 'parking',
    location: { lat: -0.9143, lng: 36.4458 },
    region: 'Longonot',
    features: ['Security', 'Restrooms', 'Information center'],
    elevation_m: 2100,
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: true, amount: 200, currency: 'KES' },
    rating_avg: 4.0,
    review_count: 56,
    verified: true
  },

  // Water Sources
  {
    name: 'Nithi Falls Natural Spring',
    description: 'Natural spring with clean drinking water along the Nithi River trail.',
    type: 'water',
    location: { lat: -0.1833, lng: 37.4833 },
    region: 'Mount Kenya',
    features: ['Drinking water', 'Refill point', 'Scenic area'],
    elevation_m: 2800,
    difficulty: 2,
    fees: { hasEntry: false },
    rating_avg: 4.5,
    review_count: 23,
    verified: true
  },

  // Lookout Towers
  {
    name: 'Mount Longonot Crater Rim Lookout',
    description: 'Panoramic lookout point at the crater rim with 360-degree views.',
    type: 'lookout',
    location: { lat: -0.9145, lng: 36.4430 },
    region: 'Longonot',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4'],
    features: ['Panoramic views', 'Photography', 'Rest area'],
    elevation_m: 2776,
    difficulty: 4,
    fees: { hasEntry: true, amount: 26, currency: 'USD' },
    rating_avg: 4.9,
    review_count: 187,
    verified: true
  },

  // Lakes
  {
    name: 'Lake Naivasha',
    description: 'Freshwater lake famous for birdwatching, hippos, and water activities.',
    type: 'lake',
    location: { lat: -0.7667, lng: 36.3500 },
    region: 'Naivasha',
    images: ['https://images.unsplash.com/photo-1439066615861-d1af74d74000'],
    features: ['Boat rides', 'Birdwatching', 'Fishing', 'Hippos'],
    elevation_m: 1884,
    fees: { hasEntry: false },
    rating_avg: 4.6,
    review_count: 234,
    verified: true
  },

  // Caves
  {
    name: 'Kitum Cave',
    description: 'Unique cave carved by elephants mining salt, located in Mount Elgon.',
    type: 'cave',
    location: { lat: 1.1167, lng: 34.7667 },
    region: 'Mount Elgon',
    images: ['https://images.unsplash.com/photo-1544552866-d3ed42536cfd'],
    features: ['Elephant viewing', 'Geology', 'Photography'],
    elevation_m: 2500,
    difficulty: 2,
    fees: { hasEntry: true, amount: 30, currency: 'USD' },
    rating_avg: 4.7,
    review_count: 67,
    verified: true
  },

  // Wildlife Viewing
  {
    name: 'Giraffe Centre',
    description: 'Conservation center where visitors can feed and interact with endangered Rothschild giraffes.',
    type: 'wildlife',
    location: { lat: -1.3230, lng: 36.7520 },
    region: 'Nairobi',
    images: ['https://images.unsplash.com/photo-1547970810-dc1e684757a9'],
    features: ['Giraffe feeding', 'Education center', 'Nature trail'],
    elevation_m: 1680,
    openingHours: { open: '09:00', close: '17:00' },
    fees: { hasEntry: true, amount: 1500, currency: 'KES' },
    contact: { phone: '+254-20-8070804', website: 'https://giraffecentre.org' },
    rating_avg: 4.8,
    review_count: 542,
    verified: true
  },

  // Facilities
  {
    name: 'Karura Forest Visitor Center',
    description: 'Main visitor center with restrooms, information desk, and bike rentals.',
    type: 'facility',
    location: { lat: -1.2350, lng: 36.8500 },
    region: 'Nairobi',
    features: ['Restrooms', 'Information', 'Bike rental', 'First aid'],
    openingHours: { open: '06:00', close: '18:00' },
    fees: { hasEntry: false },
    rating_avg: 4.1,
    review_count: 78,
    verified: true
  },

  // Restaurants
  {
    name: 'Trout Tree Restaurant',
    description: 'Unique treehouse restaurant specializing in fresh trout from the river below.',
    type: 'restaurant',
    location: { lat: -0.4100, lng: 36.6900 },
    region: 'Nanyuki',
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'],
    features: ['Trout specialty', 'River views', 'Outdoor seating'],
    openingHours: { open: '12:00', close: '22:00' },
    contact: { phone: '+254-722-333444', website: 'https://trouttree.co.ke' },
    rating_avg: 4.5,
    review_count: 289,
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

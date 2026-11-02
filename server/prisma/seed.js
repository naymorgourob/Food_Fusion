import { prisma } from '../src/config/prisma.js'
import { hashPassword } from '../src/utils/password.js'

const menuImage = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`
const commonsImage = (name) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}.jpg?width=900`

async function seed() {
  console.log('--- Starting FoodFusion Idempotent Database Seed ---')

  // 1. SYSTEM SETTINGS
  console.log('Seeding settings...')
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {
      currencySymbol: '৳',
    },
    create: {
      id: 'singleton',
      restaurantName: 'FoodFusion Restaurant',
      restaurantAddress: '123 Gourmet Avenue, Gulshan-2, Dhaka',
      restaurantPhone: '+880 2-8833445',
      restaurantEmail: 'contact@foodfusion.com',
      vatPercentage: 10.0,
      currencySymbol: '৳',
      loyaltyPointsPerCurrency: 0.1,
      loyaltyPointValue: 0.1,
      firstOrderBonusPoints: 50,
    },
  })

  const passwordHash = await hashPassword('password123')

  // 2. STAFF & ADMIN USERS
  console.log('Seeding staff and admin users...')
  const staffUsers = [
    {
      fullName: 'Restaurant Admin',
      email: 'admin@foodfusion.com',
      phone: '+880 1711-000001',
      role: 'ADMIN',
      position: 'General Manager',
    },
    {
      fullName: 'Alex Chef',
      email: 'staff@foodfusion.com',
      phone: '+880 1711-000002',
      role: 'STAFF',
      position: 'Head Chef',
    },
    {
      fullName: 'Tanvir Ahmed',
      email: 'chef.tanvir@foodfusion.com',
      phone: '+880 1711-000003',
      role: 'STAFF',
      position: 'Sous Chef',
    },
    {
      fullName: 'Rohit Das',
      email: 'chef.rohit@foodfusion.com',
      phone: '+880 1711-000004',
      role: 'STAFF',
      position: 'Line Cook',
    },
    {
      fullName: 'Sarah Waiter',
      email: 'waiter@foodfusion.com',
      phone: '+880 1711-000005',
      role: 'STAFF',
      position: 'Head Waiter',
    },
    {
      fullName: 'Rahim Chowdhury',
      email: 'waiter.rahim@foodfusion.com',
      phone: '+880 1711-000006',
      role: 'STAFF',
      position: 'Waiter',
    },
    {
      fullName: 'Fatima Begum',
      email: 'waiter.fatima@foodfusion.com',
      phone: '+880 1711-000007',
      role: 'STAFF',
      position: 'Server',
    },
  ]

  for (const s of staffUsers) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {
        position: s.position,
        role: s.role,
      },
      create: {
        fullName: s.fullName,
        email: s.email,
        phone: s.phone,
        password: passwordHash,
        role: s.role,
        position: s.position,
        isActive: true,
      },
    })
  }

  // 3. CUSTOMER USERS
  console.log('Seeding customer users...')
  const customers = [
    {
      fullName: 'John Customer',
      email: 'customer@foodfusion.com',
      phone: '+880 1711-000100',
    },
    {
      fullName: 'Anika Rahman',
      email: 'customer.anika@foodfusion.com',
      phone: '+880 1711-000101',
    },
    {
      fullName: 'Sakib Al Hasan',
      email: 'customer.sakib@foodfusion.com',
      phone: '+880 1811-000202',
    },
    {
      fullName: 'Tahmina Islam',
      email: 'customer.tahmina@foodfusion.com',
      phone: '+880 1911-000303',
    },
    {
      fullName: 'Farhan Kabir',
      email: 'customer.farhan@foodfusion.com',
      phone: '+880 1611-000404',
    },
  ]

  const customerMap = {}
  for (const c of customers) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        password: passwordHash,
        role: 'CUSTOMER',
        isActive: true,
      },
    })
    customerMap[c.email] = user
  }

  // Fetch staff users map
  const chefAlex = await prisma.user.findUnique({ where: { email: 'staff@foodfusion.com' } })
  const chefTanvir = await prisma.user.findUnique({
    where: { email: 'chef.tanvir@foodfusion.com' },
  })
  const waiterSarah = await prisma.user.findUnique({ where: { email: 'waiter@foodfusion.com' } })
  const waiterRahim = await prisma.user.findUnique({
    where: { email: 'waiter.rahim@foodfusion.com' },
  })

  // 4. DINING FLOOR TABLES
  console.log('Seeding dining tables...')
  const tablesData = [
    {
      number: 1,
      capacity: 2,
      status: 'AVAILABLE',
      windowSidePosition: 'Window A',
      reservationCost: 1200,
      description: 'Window-side table for 2',
    },
    {
      number: 2,
      capacity: 2,
      status: 'AVAILABLE',
      windowSidePosition: 'Window B',
      reservationCost: 1100,
      description: 'Cozy table for 2',
    },
    {
      number: 3,
      capacity: 4,
      status: 'AVAILABLE',
      windowSidePosition: 'Window C',
      reservationCost: 1800,
      description: 'Dining table for 4',
    },
    {
      number: 4,
      capacity: 4,
      status: 'AVAILABLE',
      windowSidePosition: 'Interior A',
      reservationCost: 1500,
      description: 'Booth for family of 4',
    },
    {
      number: 5,
      capacity: 6,
      status: 'AVAILABLE',
      windowSidePosition: 'Interior B',
      reservationCost: 2200,
      description: 'Large dining table for 6',
    },
    {
      number: 6,
      capacity: 8,
      status: 'AVAILABLE',
      windowSidePosition: 'Interior C',
      reservationCost: 2800,
      description: 'Banquet table for 8',
    },
    {
      number: 7,
      capacity: 2,
      status: 'AVAILABLE',
      windowSidePosition: 'Garden A',
      reservationCost: 1300,
      description: 'Romantic Garden Corner for 2',
    },
    {
      number: 8,
      capacity: 4,
      status: 'OCCUPIED',
      windowSidePosition: 'Garden B',
      reservationCost: 1700,
      description: 'Garden View Booth for 4',
    },
    {
      number: 9,
      capacity: 4,
      status: 'RESERVED',
      windowSidePosition: 'Interior D',
      reservationCost: 1600,
      description: 'Center Dining Table for 4',
    },
    {
      number: 10,
      capacity: 6,
      status: 'OCCUPIED',
      windowSidePosition: 'Interior E',
      reservationCost: 2100,
      description: 'Family Dining Table for 6',
    },
    {
      number: 11,
      capacity: 8,
      status: 'AVAILABLE',
      windowSidePosition: 'Private A',
      reservationCost: 3200,
      description: 'Private Dining Alcove for 8',
    },
    {
      number: 12,
      capacity: 10,
      status: 'RESERVED',
      windowSidePosition: 'Private B',
      reservationCost: 4000,
      description: 'Executive VIP Banquet for 10',
    },
  ]

  // Photos of each table's spot in the restaurant (client/public/tables).
  const tablePhotos = {
    1: '/tables/window-live-stream-coffee.jpg',
    2: '/tables/coffee-and-conversations.jpg',
    3: '/tables/window-lounge.jpg',
    4: '/tables/velvet-booths.jpg',
    5: '/tables/coffee-therapy.jpg',
    6: '/tables/banquette-long-table.jpg',
    7: '/tables/calm-corner.jpg',
    8: '/tables/garden-library.jpg',
    9: '/tables/cheers-wall.jpg',
    10: '/tables/welcome-bear.jpg',
    11: '/tables/banquette-arches.jpg',
    12: '/tables/banquette-long-table.jpg',
  }
  for (const t of tablesData) t.imageUrl = tablePhotos[t.number] ?? null

  const tableMap = {}
  for (const t of tablesData) {
    const table = await prisma.table.upsert({
      where: { number: t.number },
      update: {
        capacity: t.capacity,
        description: t.description,
        status: t.status,
        windowSidePosition: t.windowSidePosition,
        reservationCost: t.reservationCost,
        imageUrl: t.imageUrl,
      },
      create: t,
    })
    tableMap[t.number] = table
  }

  // 5. MENU CATEGORIES & FOOD ITEMS
  console.log('Seeding categories and food items...')
  const categoriesData = [
    {
      name: 'Traditional Curries & Rice',
      description: 'Authentic subcontinental rich curries and aromatic dum biryanis',
      foods: [
        {
          name: 'Royal Mutton Kacchi Biryani',
          description:
            'Tender spiced mutton layered with fragrant basmati rice, saffron, and potato',
          price: 650.0,
          prepTimeMinutes: 20,
          imageUrl: menuImage('1563379926898-05f4575a45d8'),
        },
        {
          name: 'Beef Kala Bhuna',
          description:
            'Traditional slow-cooked Chittagong-style dark tender beef in caramelized spices',
          price: 720.0,
          prepTimeMinutes: 25,
          imageUrl: menuImage('1603360946369-dc9bb6258143'),
        },
        {
          name: 'Butter Chicken Delicacy',
          description: 'Smoked boneless chicken simmered in rich creamy tomato and butter gravy',
          price: 580.0,
          prepTimeMinutes: 18,
          imageUrl: menuImage('1603894584373-5ac82b2ae398'),
        },
        {
          name: 'Fragrant Kalijira Polao',
          description: 'Aromatic short-grain rice cooked with whole garam masala and pure ghee',
          price: 180.0,
          prepTimeMinutes: 10,
          imageUrl: menuImage('1516684732162-798a0062be99'),
        },
        {
          name: 'Garlic Butter Naan',
          description: 'Clay-oven tandoori flatbread brushed with roasted garlic and melted butter',
          price: 90.0,
          prepTimeMinutes: 8,
          imageUrl: menuImage('1601050690597-df0568f70950'),
        },
      ],
    },
    {
      name: 'Grills & Kebabs',
      description: 'Charcoal flame-grilled kebabs, tikkas and mixed sizzlers',
      foods: [
        {
          name: 'Chicken Reshmi Kebab',
          description:
            'Silky marinated minced chicken skewers infused with cream, cashew and cardamom',
          price: 450.0,
          prepTimeMinutes: 18,
          imageUrl: menuImage('1599487488170-d11ec9c172f0'),
        },
        {
          name: 'Grilled Dahi Fish Tikka',
          description: 'Spiced yogurt and ajwain marinated river fish skewers grilled over coals',
          price: 680.0,
          prepTimeMinutes: 20,
          imageUrl: menuImage('1559847844-5315695dadae'),
        },
        {
          name: 'Spiced Lamb Chops Platter',
          description:
            'Double-cut lamb chops glazed in ginger, black pepper, and papaya tenderizer',
          price: 1150.0,
          prepTimeMinutes: 25,
          imageUrl: menuImage('1544025162-d76694265947'),
        },
      ],
    },
    {
      name: 'Appetizers',
      description: 'Curated bites to start your dining experience',
      foods: [
        {
          name: 'Dhakai Crispy Prawn Tempura',
          description: 'Golden-fried tiger prawns served with sweet chili tamarind dip',
          price: 480.0,
          prepTimeMinutes: 12,
          imageUrl: menuImage('1565557623262-b51c2513a641'),
        },
        {
          name: 'Crispy Calamari',
          description: 'Golden-fried squid with garlic aioli',
          price: 420.0,
          prepTimeMinutes: 12,
          imageUrl: menuImage('1599487488170-d11ec9c172f0'),
        },
        {
          name: 'Truffle Bruschetta',
          description: 'Sourdough with heirloom tomatoes & truffle glaze',
          price: 350.0,
          prepTimeMinutes: 10,
          imageUrl: menuImage('1572695157366-5be8a3a5c6db'),
        },
        {
          name: 'Buffalo Wings',
          description: 'Crispy spicy wings with blue cheese dip',
          price: 450.0,
          prepTimeMinutes: 15,
          imageUrl: menuImage('1527477396000-e27163b481c2'),
        },
      ],
    },
    {
      name: 'Main Courses',
      description: 'Signature western and fusion entrees prepared with fresh ingredients',
      foods: [
        {
          name: 'Seafood Platter',
          description:
            'Grilled pomfret and fish steaks with jumbo prawns over seafood pulao, lime and lettuce — serves 2',
          price: 1500.0,
          prepTimeMinutes: 35,
          isChefPick: true,
          imageUrl: '/dishes/seafood-platter.jpg',
        },
        {
          name: 'Grilled Ribeye Steak',
          description: 'Prime 10oz ribeye with roasted asparagus and peppercorn jus',
          price: 1650.0,
          prepTimeMinutes: 25,
          imageUrl: menuImage('1544025162-d76694265947'),
        },
        {
          name: 'Pan-Seared Atlantic Salmon',
          description: 'Salmon fillet with lemon-dill risotto and blistered tomatoes',
          price: 1450.0,
          prepTimeMinutes: 20,
          imageUrl: menuImage('1467003909585-2f8a72700288'),
        },
        {
          name: 'Artisan Truffle Burger',
          description: 'Angus beef patty, gouda, arugula & truffle mayo with seasoned wedges',
          price: 750.0,
          prepTimeMinutes: 15,
          imageUrl: menuImage('1568901346375-23c9450c58cd'),
        },
        {
          name: 'Wild Mushroom Fettuccine',
          description: 'Handmade pasta in garlic parmesan sauce with shiitake & portobello',
          price: 680.0,
          prepTimeMinutes: 18,
          imageUrl: menuImage('1473093295043-cdd812d0e601'),
        },
      ],
    },
    {
      name: 'Desserts',
      description: 'Sweet artisanal creations crafted in-house',
      foods: [
        {
          name: 'Shahi Tukra with Rabri',
          description:
            'Golden saffron-soaked brioche topped with rich condensed milk and crushed pistachios',
          price: 280.0,
          prepTimeMinutes: 10,
          imageUrl: menuImage('1571877227200-a0d98ea607e9'),
        },
        {
          name: 'Warm Chocolate Lava Cake',
          description: 'Molten Belgian chocolate with vanilla bean ice cream',
          price: 380.0,
          prepTimeMinutes: 10,
          imageUrl: menuImage('1606313564200-e75d5e30476c'),
        },
        {
          name: 'Classic Tiramisu',
          description: 'Espresso-soaked ladyfingers with mascarpone cream',
          price: 350.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1578985545062-69928b1d9587'),
        },
      ],
    },
    {
      name: 'Beverages',
      description: 'Refreshing signature drinks, mocktails and artisanal coolers',
      foods: [
        {
          name: 'Mint Lemonade Cooler',
          description: 'Fresh mint leaves crushed with lime juice, black salt, and sparkling water',
          price: 180.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1556679343-c7306c1976bc'),
        },
        {
          name: 'Sweet Mango Lassi',
          description: 'Blended Alphonso mango puree with creamy curd and cardamom',
          price: 220.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1577805947697-89e18249d767'),
        },
        {
          name: 'Passionfruit Mocktail',
          description: 'Sparkling passionfruit nectar with mint & lime',
          price: 250.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1513558161293-cdaf765ed2fd'),
        },
        {
          name: 'Artisan Iced Latte',
          description: 'Single-origin espresso with chilled milk and caramel drizzle',
          price: 260.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1512568400610-62da28bc8a13'),
        },
      ],
    },
    {
      name: 'Bangladeshi Favorites',
      description: 'Beloved Bengali classics prepared with fragrant spices and homestyle care',
      foods: [
        {
          name: 'Dhaka Kacchi Biryani',
          description:
            'Aromatic basmati rice layered with tender mutton, potato, saffron, and barista',
          price: 620.0,
          prepTimeMinutes: 25,
          imageUrl: commonsImage('Kacchi Biryani'),
        },
        {
          name: 'Beef Tehari',
          description:
            'Fragrant kalijira rice cooked with tender beef, mustard oil, and whole spices',
          price: 560.0,
          prepTimeMinutes: 22,
          imageUrl: commonsImage('Tehari'),
        },
        {
          name: 'Ilish Bhapa',
          description: 'Steamed hilsa fish in mustard, green chili, and coconut with steamed rice',
          price: 780.0,
          prepTimeMinutes: 20,
          imageUrl: commonsImage('Ilish Bhapa'),
        },
        {
          name: 'Chingri Malai Curry',
          description: 'Juicy prawns simmered in a creamy coconut, turmeric, and green chili sauce',
          price: 690.0,
          prepTimeMinutes: 18,
          imageUrl: commonsImage('Chingri Malai Curry'),
        },
        {
          name: 'Chicken Bhuna Khichuri',
          description: 'Comforting rice and lentil khichuri with spiced chicken and fried onions',
          price: 420.0,
          prepTimeMinutes: 20,
          imageUrl: commonsImage('Bhuna Khichuri'),
        },
        {
          name: 'Shorshe Ilish Platter',
          description: 'Hilsa in a bold mustard gravy served with steamed rice and seasonal greens',
          price: 820.0,
          prepTimeMinutes: 22,
          imageUrl: commonsImage('Shorshe Ilish'),
        },
        {
          name: 'Begun Bhaja',
          description: 'Golden fried eggplant slices seasoned with turmeric, salt, and mustard oil',
          price: 180.0,
          prepTimeMinutes: 10,
          imageUrl: commonsImage('Begun Bhaja'),
        },
        {
          name: 'Mishti Doi',
          description: 'Silky caramelized sweet yogurt served chilled in a traditional clay pot',
          price: 160.0,
          prepTimeMinutes: 5,
          imageUrl: commonsImage('Mishti Doi'),
        },
        {
          name: 'Bhetki Paturi',
          description: 'Bhetki fillets in mustard-coconut paste, steamed in banana leaf',
          price: 580.0,
          prepTimeMinutes: 25,
          imageUrl: '/dishes/bhetki-paturi.jpg',
        },
        {
          name: 'Bhorta Platter',
          description:
            'Eight classic mashes on a brass thali — shutki, begun, alu, dal, tomato and more',
          price: 450.0,
          prepTimeMinutes: 15,
          imageUrl: '/dishes/bhorta-platter.jpg',
        },
        {
          name: 'Dab Chingri',
          description:
            'Golda prawns in coconut-mustard gravy, slow-cooked and served inside a tender green coconut',
          price: 950.0,
          prepTimeMinutes: 30,
          imageUrl: '/dishes/dab-chingri.jpg',
        },
      ],
    },
  ]

  // Dishes adapted from the Guilty Pleasure menu card. Categories that
  // already exist above just gain dishes; the rest are new sections. The
  // chili and star printed beside a dish on the card become isSpicy and
  // isChefPick.
  const menuAdditions = [
    {
      name: 'Appetizers',
      description: 'Curated bites to start your dining experience',
      foods: [
        {
          name: 'Chicken Strips',
          description: 'Six golden, crumb-crusted chicken strips with a creamy dip',
          price: 590.0,
          prepTimeMinutes: 12,
          imageUrl: menuImage('1562967914-608f82629710'),
        },
        {
          name: 'Naga Wings',
          description: 'Six wings tossed in fiery naga chili glaze',
          price: 520.0,
          prepTimeMinutes: 15,
          isSpicy: true,
          imageUrl: menuImage('1569058242253-92a9c755a0ec'),
        },
        {
          name: 'Fish and Chips',
          description: 'Two battered fish fillets with fries, slaw and tartar sauce',
          price: 660.0,
          prepTimeMinutes: 18,
          imageUrl: menuImage('1576777647209-e8733d7b851d'),
        },
      ],
    },
    {
      name: 'Soups',
      description: 'Slow-simmered bowls, made from scratch in house',
      foods: [
        {
          name: 'Tom Yum Goong',
          description: 'Authentic hot and sour Thai broth with sea prawns and mushrooms',
          price: 480.0,
          prepTimeMinutes: 15,
          isSpicy: true,
          imageUrl: menuImage('1548943487-a2e4e43b4853'),
        },
        {
          name: 'Seafood Chowder',
          description: 'Rich, creamy soup loaded with seafood and vegetable chunks',
          price: 610.0,
          prepTimeMinutes: 18,
          imageUrl: menuImage('1476718406336-bb5a9690ee2a'),
        },
        {
          name: 'Seafood Clear Soup',
          description: 'Light, refreshing clear broth with prawns and vegetables',
          price: 390.0,
          prepTimeMinutes: 12,
          imageUrl: menuImage('1603105037880-880cd4edfb0d'),
        },
      ],
    },
    {
      name: 'Salads',
      description: 'Crisp, fresh bowls with house-made dressings',
      foods: [
        {
          name: 'Apple Salad',
          description: 'Fresh apples, tomatoes, sautéed chicken and nuts with a creamy dressing',
          price: 550.0,
          prepTimeMinutes: 10,
          imageUrl: menuImage('1505253716362-afaea1d3d1af'),
        },
        {
          name: 'Roasted Potato Salad',
          description: 'Roasted potatoes and greens in honey mustard, finished with croutons',
          price: 320.0,
          prepTimeMinutes: 10,
          imageUrl: menuImage('1512621776951-a57141f2eefd'),
        },
        {
          name: 'Cashew Nut Chicken Salad',
          description: 'Crispy fried chicken and golden cashews in a sweet, tangy sauce',
          price: 599.0,
          prepTimeMinutes: 12,
          imageUrl: menuImage('1546069901-ba9599a7e63c'),
        },
      ],
    },
    {
      name: 'Sandwiches, Burgers & Wraps',
      description: 'Stacked, pressed and wrapped — all served with fries',
      foods: [
        {
          name: 'Sirloin Steak Sandwich',
          description: 'Thinly sliced sirloin on toasted bread with fries and dipping sauce',
          price: 830.0,
          prepTimeMinutes: 18,
          imageUrl: menuImage('1553909489-cd47e0907980'),
        },
        {
          name: 'Pesto Chicken Sandwich',
          description: 'House pesto, chicken and cheese on toasted ciabatta, fries included',
          price: 690.0,
          prepTimeMinutes: 15,
          imageUrl: menuImage('1528735602780-2552fd46c7af'),
        },
        {
          name: 'Crispy Chicken Tortilla Wrap',
          description: 'Crunchy chicken, slaw and sauce rolled in a warm tortilla',
          price: 480.0,
          prepTimeMinutes: 12,
          imageUrl: menuImage('1626700051175-6818013e1d4f'),
        },
        {
          name: 'Crispy Chicken Burger',
          description: 'Buttermilk fried chicken on a brioche bun, served with fries',
          price: 450.0,
          prepTimeMinutes: 15,
          imageUrl: menuImage('1606755962773-d324e0a13086'),
        },
      ],
    },
    {
      name: 'Pastas',
      description: 'Fresh sauces tossed to order',
      foods: [
        {
          name: 'Creamy Alfredo',
          description: 'Fettuccine in a rich cream sauce with mushroom, chicken and garlic bread',
          price: 689.0,
          prepTimeMinutes: 18,
          imageUrl: menuImage('1645112411341-6c4fd023714a'),
        },
        {
          name: 'Spicy Seafood Spaghetti',
          description: 'Prawn, dory fish and calamari in a spicy fresh tomato sauce',
          price: 610.0,
          prepTimeMinutes: 20,
          isSpicy: true,
          imageUrl: menuImage('1516100882582-96c3a05fe590'),
        },
        {
          name: 'Shazy',
          description: 'Bold, smoky Szechuan red sauce pasta with chicken',
          price: 505.0,
          prepTimeMinutes: 18,
          isSpicy: true,
          isChefPick: true,
          imageUrl: menuImage('1551183053-bf91a1d81141'),
        },
        {
          name: 'Rustic Carbonara',
          description: 'Thick, creamy sauce with beef bacon and chicken, topped with bacon bites',
          price: 690.0,
          prepTimeMinutes: 18,
          isChefPick: true,
          imageUrl: menuImage('1612874742237-6526221588e3'),
        },
        {
          name: 'Pad Thai',
          description: 'Rice noodles with chicken and prawn, crushed peanuts and chili flakes',
          price: 680.0,
          prepTimeMinutes: 15,
          imageUrl: menuImage('1559314809-0d155014e29e'),
        },
      ],
    },
    {
      name: 'Set Meals',
      description: 'A complete plate — main, sides and sauce',
      foods: [
        {
          name: 'BBQ Chicken Meal',
          description: 'Glazed grilled chicken with Thai fried rice, fries and sautéed vegetables',
          price: 690.0,
          prepTimeMinutes: 22,
          imageUrl: menuImage('1598515214211-89d3c73ae83b'),
        },
        {
          name: 'Peri Peri Chicken Meal',
          description: 'House peri peri sauce sizzled over grilled chicken, with veggies and rice',
          price: 690.0,
          prepTimeMinutes: 22,
          isSpicy: true,
          isChefPick: true,
          imageUrl: menuImage('1532550907401-a500c9a57435'),
        },
        {
          name: 'Grilled Dory Meal',
          description: 'Grilled fish with butter rice, saucy fried corn and sautéed vegetables',
          price: 705.0,
          prepTimeMinutes: 20,
          imageUrl: menuImage('1519708227418-c8fd9a32b7a2'),
        },
      ],
    },
    {
      name: 'Thai Set Meals',
      description: 'Authentic Thai plates served with rice',
      foods: [
        {
          name: 'Thai Chicken Basil',
          description: 'Wok-tossed chicken with holy basil, white rice and a fried egg on top',
          price: 510.0,
          prepTimeMinutes: 15,
          isSpicy: true,
          imageUrl: menuImage('1604908176997-125f25cc6f3d'),
        },
        {
          name: 'Thai Fried Rice',
          description: 'Chicken or prawn fried rice with chicken satay and two wings',
          price: 530.0,
          prepTimeMinutes: 15,
          imageUrl: menuImage('1603133872878-684f208fb84b'),
        },
        {
          name: 'Pa Naeng Curry Chicken',
          description: 'Rich, mildly spicy Thai curry with a nutty peanut finish, with white rice',
          price: 490.0,
          prepTimeMinutes: 18,
          isChefPick: true,
          imageUrl: menuImage('1455619452474-d2be8b1e70cd'),
        },
      ],
    },
    {
      name: 'Desserts',
      description: 'Sweet endings crafted with care',
      foods: [
        {
          name: 'Signature San Sebastian Cake',
          description:
            'Burnt Basque cheesecake with a caramelised top, finished with warm chocolate sauce',
          price: 450.0,
          prepTimeMinutes: 5,
          isChefPick: true,
          imageUrl: '/dishes/san-sebastian-cake.jpg',
        },
        {
          name: 'Chocolate Bomb with Brownie',
          description:
            'A chocolate sphere over fudgy brownie that melts open under hot chocolate sauce at the table',
          price: 520.0,
          prepTimeMinutes: 8,
          imageUrl: '/dishes/chocolate-bomb.jpg',
        },
        {
          name: 'Mango Sticky Rice',
          description: 'Sweet coconut sticky rice with ripe mango slices',
          price: 670.0,
          prepTimeMinutes: 8,
          isChefPick: true,
          imageUrl: menuImage('1711161988375-da7eff032e45'),
        },
        {
          name: 'Blueberry Cheesecake',
          description: 'Creamy baked cheesecake under a glossy blueberry topping',
          price: 390.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1533134242443-d4fd215305ad'),
        },
        {
          name: 'Crunchy Chocolate Cake',
          description: 'Dense, fudgy chocolate layers with a crackly top',
          price: 295.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1606313564200-e75d5e30476c'),
        },
        {
          name: 'Tres Leches',
          description: 'Sponge soaked in three milks, crowned with whipped cream',
          price: 305.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1571115177098-24ec42ed204d'),
        },
      ],
    },
    {
      name: 'Coffee',
      description: 'Hot and iced espresso drinks',
      foods: [
        {
          name: 'Espresso',
          description: 'Strong, bold coffee made by forcing hot water through finely ground beans',
          price: 170.0,
          prepTimeMinutes: 3,
          coffeeStrength: 3,
          milkLevel: 'NONE',
          imageUrl: menuImage('1510591509098-f4fdc6d0ff04'),
        },
        {
          name: 'Americano',
          description: 'Espresso diluted with hot water — smooth, rich and less intense',
          price: 190.0,
          prepTimeMinutes: 4,
          coffeeStrength: 2,
          milkLevel: 'NONE',
          imageUrl: menuImage('1521302080334-4bebac2763a6'),
        },
        {
          name: 'Flat White',
          description:
            'Espresso with steamed milk and a thin layer of microfoam, made with ristretto shots',
          price: 320.0,
          prepTimeMinutes: 5,
          coffeeStrength: 2,
          milkLevel: 'MORE',
          imageUrl: menuImage('1577968897966-3d4325b36b61'),
        },
        {
          name: 'Mocha',
          description: 'Espresso with steamed milk and chocolate — sweet, creamy and indulgent',
          price: 300.0,
          prepTimeMinutes: 5,
          coffeeStrength: 2,
          milkLevel: 'MORE',
          imageUrl: menuImage('1578314675249-a6910f80cc4e'),
        },
        {
          name: 'Macchiato',
          description: 'Espresso marked with a small amount of steamed milk or foam',
          price: 220.0,
          prepTimeMinutes: 4,
          coffeeStrength: 3,
          milkLevel: 'LITTLE',
          imageUrl: menuImage('1485808191679-5f86510681a2'),
        },
        {
          name: 'Caramel Macchiato',
          description:
            'Vanilla milk topped with espresso and a caramel drizzle — sweet and layered',
          price: 350.0,
          prepTimeMinutes: 5,
          coffeeStrength: 2,
          milkLevel: 'MORE',
          imageUrl: menuImage('1517701604599-bb29b565090c'),
        },
        {
          name: 'Cold Brew',
          description:
            'Coffee steeped in cold water for 12–24 hours — smooth, low-acid and refreshing',
          price: 300.0,
          prepTimeMinutes: 3,
          coffeeStrength: 2,
          milkLevel: 'NONE',
          imageUrl: menuImage('1517959105821-eaf2591984ca'),
        },
        {
          name: 'Butterscotch Latte',
          description: 'Iced latte layered with butterscotch and a cocoa-dusted cream top',
          price: 380.0,
          prepTimeMinutes: 5,
          coffeeStrength: 1,
          milkLevel: 'MORE',
          imageUrl: menuImage('1662047102608-a6f2e492411f'),
        },
        {
          name: 'Brûlée Cloud Latte',
          description: 'Latte under a torched sugar crust and a pillow of cloud foam',
          price: 420.0,
          prepTimeMinutes: 6,
          coffeeStrength: 2,
          milkLevel: 'FOAM',
          isChefPick: true,
          imageUrl: menuImage('1570968915860-54d5c301fa9f'),
        },
        {
          name: 'Espresso Ovaltine',
          description: 'Malty Ovaltine and milk crowned with a shot of espresso',
          price: 390.0,
          prepTimeMinutes: 5,
          coffeeStrength: 2,
          milkLevel: 'MORE',
          imageUrl: menuImage('1599398054066-846f28917f38'),
        },
        {
          name: 'Cappuccino',
          description: 'Espresso with steamed milk and a deep layer of foam',
          price: 295.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1572442388796-11668a67e53d'),
        },
        {
          name: 'Caffè Latte',
          description: 'Smooth espresso with silky steamed milk',
          price: 290.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1561882468-9110e03e0f78'),
        },
        {
          name: 'Hazelnut Latte',
          description: 'Latte sweetened with toasted hazelnut syrup',
          price: 400.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1509042239860-f550ce710b93'),
        },
        {
          name: 'Iced Caramel Latte',
          description: 'Chilled espresso and milk over ice with caramel',
          price: 350.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1461023058943-07fcbe16d735'),
        },
      ],
    },
    {
      name: 'Shakes & Smoothies',
      description: 'Thick shakes, fruit smoothies and floats',
      foods: [
        {
          name: 'Oreo Shake',
          description: 'Vanilla ice cream blended with crushed Oreo cookies',
          price: 310.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1572490122747-3968b75cc699'),
        },
        {
          name: 'Mango Shake',
          description: 'Ripe mango blended thick with milk and ice cream',
          price: 310.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1623065422902-30a2d299bbe4'),
        },
        {
          name: 'Tom & Berry',
          description: 'Mixed berry smoothie with a creamy finish',
          price: 420.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1553530666-ba11a7da3888'),
        },
        {
          name: 'Strawberry Float',
          description: 'Sparkling strawberry cooler topped with ice cream',
          price: 420.0,
          prepTimeMinutes: 5,
          imageUrl: menuImage('1497534446932-c925b458314e'),
        },
      ],
    },
    {
      name: 'Beverages',
      description: 'Refreshing drinks, mocktails, and artisan coffees',
      foods: [
        {
          name: 'Coffee Milk Bubble Tea',
          description: 'Iced coffee and milk poured over chewy brown-sugar boba pearls',
          price: 380.0,
          prepTimeMinutes: 5,
          coffeeStrength: 2,
          milkLevel: 'MORE',
          imageUrl: '/dishes/coffee-boba.jpg',
        },
        {
          name: 'Taro Boba Milk',
          description: 'Creamy purple taro milk over ice with tapioca pearls',
          price: 360.0,
          prepTimeMinutes: 5,
          milkLevel: 'MORE',
          imageUrl: '/dishes/taro-boba.jpg',
        },
        {
          name: 'Cloud Matcha Tea',
          description: 'Ceremonial matcha whisked with milk under a soft cloud foam',
          price: 400.0,
          prepTimeMinutes: 5,
          milkLevel: 'FOAM',
          isChefPick: true,
          imageUrl: menuImage('1515823064-d6e0c04616a7'),
        },
        {
          name: 'Peach Iced Tea',
          description: 'Brewed black tea shaken with peach and fresh mint over ice',
          price: 395.0,
          prepTimeMinutes: 4,
          milkLevel: 'NONE',
          imageUrl: menuImage('1499638673689-79a0b5115d87'),
        },
        {
          name: 'Ginger Fizz',
          description: 'Sparkling ginger, lime and mint — bright and zingy',
          price: 350.0,
          prepTimeMinutes: 4,
          milkLevel: 'NONE',
          imageUrl: menuImage('1513558161293-cdaf765ed2fd'),
        },
        {
          name: 'Hot Chocolate',
          description: 'Rich melted chocolate whisked into steaming milk',
          price: 360.0,
          prepTimeMinutes: 5,
          milkLevel: 'MORE',
          imageUrl: menuImage('1542990253-0d0f5be5f0ed'),
        },
        {
          name: 'Ginger Milk Tea',
          description: 'Spiced ginger milk tea with chewy brown-sugar pearls',
          price: 350.0,
          prepTimeMinutes: 5,
          milkLevel: 'MORE',
          imageUrl: menuImage('1558857563-b371033873b8'),
        },
        {
          name: 'Lemon Iced Tea',
          description: 'Fresh-brewed black tea over ice with lemon',
          price: 320.0,
          prepTimeMinutes: 4,
          imageUrl: menuImage('1556679343-c7306c1976bc'),
        },
        {
          name: 'Virgin Mojito',
          description: 'Lime, mint and soda muddled over crushed ice',
          price: 395.0,
          prepTimeMinutes: 4,
          imageUrl: menuImage('1551538827-9c037cb4f32a'),
        },
        {
          name: 'Orange Juice',
          description: 'Freshly squeezed oranges, nothing added',
          price: 280.0,
          prepTimeMinutes: 4,
          imageUrl: menuImage('1600271886742-f049cd451bba'),
        },
      ],
    },
  ]

  // Markers for dishes seeded before the menu card was adopted.
  // Every category gets at least one chef's pick, so that quick filter is
  // never empty; coffees get the strength/milk guide from the coffee menu.
  const existingMarkers = {
    'Buffalo Wings': { isSpicy: true },
    'Beef Kala Bhuna': { isSpicy: true },
    'Royal Mutton Kacchi Biryani': { isChefPick: true },
    'Chingri Malai Curry': { isChefPick: true },
    'Grilled Ribeye Steak': { isChefPick: true },
    'Chicken Reshmi Kebab': { isChefPick: true },
    'Fish and Chips': { isChefPick: true },
    'Seafood Chowder': { isChefPick: true },
    'Apple Salad': { isChefPick: true },
    'Sirloin Steak Sandwich': { isChefPick: true },
    'Oreo Shake': { isChefPick: true, milkLevel: 'MORE' },
    'Mango Shake': { milkLevel: 'MORE' },
    'Tom & Berry': { milkLevel: 'LITTLE' },
    'Strawberry Float': { milkLevel: 'LITTLE' },
    Cappuccino: { coffeeStrength: 2, milkLevel: 'FOAM' },
    'Caffè Latte': { coffeeStrength: 1, milkLevel: 'MORE' },
    'Hazelnut Latte': { coffeeStrength: 1, milkLevel: 'MORE' },
    'Iced Caramel Latte': { coffeeStrength: 2, milkLevel: 'MORE' },
    'Artisan Iced Latte': { coffeeStrength: 1, milkLevel: 'MORE' },
    'Sweet Mango Lassi': { milkLevel: 'MORE' },
    'Lemon Iced Tea': { milkLevel: 'NONE' },
    'Virgin Mojito': { milkLevel: 'NONE' },
    'Orange Juice': { milkLevel: 'NONE' },
    'Mint Lemonade Cooler': { milkLevel: 'NONE' },
    'Passionfruit Mocktail': { milkLevel: 'NONE' },
  }

  const foodMap = {}
  for (const cat of [...categoriesData, ...menuAdditions]) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: { name: cat.name, description: cat.description },
    })

    for (const food of cat.foods) {
      const markers = {
        isSpicy: Boolean(food.isSpicy ?? existingMarkers[food.name]?.isSpicy),
        isChefPick: Boolean(food.isChefPick ?? existingMarkers[food.name]?.isChefPick),
        coffeeStrength: food.coffeeStrength ?? existingMarkers[food.name]?.coffeeStrength ?? null,
        milkLevel: food.milkLevel ?? existingMarkers[food.name]?.milkLevel ?? null,
      }
      let existingFood = await prisma.food.findFirst({
        where: { name: food.name, categoryId: category.id },
      })
      if (!existingFood) {
        existingFood = await prisma.food.create({
          data: {
            name: food.name,
            description: food.description,
            price: food.price,
            prepTimeMinutes: food.prepTimeMinutes,
            imageUrl: food.imageUrl,
            categoryId: category.id,
            isAvailable: true,
            ...markers,
          },
        })
      } else {
        // Update price to realistic BDT value if it was old low USD seed
        existingFood = await prisma.food.update({
          where: { id: existingFood.id },
          data: {
            price: food.price,
            description: food.description,
            ...markers,
            ...(existingFood.imageUrl?.startsWith('/uploads/') ? {} : { imageUrl: food.imageUrl }),
          },
        })
      }
      foodMap[food.name] = existingFood
    }
  }

  // 6. INVENTORY ITEMS (Mix of IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
  console.log('Seeding kitchen inventory...')
  const inventoryItems = [
    // Poultry & Meats
    {
      itemName: 'Fresh Farm Chicken',
      category: 'Poultry',
      unit: 'KG',
      quantity: 45.0,
      minStockLevel: 15.0,
    }, // IN_STOCK
    {
      itemName: 'Prime Local Beef Cut',
      category: 'Meat',
      unit: 'KG',
      quantity: 6.0,
      minStockLevel: 12.0,
    }, // LOW_STOCK
    {
      itemName: 'Angus Beef Ribeye',
      category: 'Meat',
      unit: 'KG',
      quantity: 0.0,
      minStockLevel: 10.0,
    }, // OUT_OF_STOCK
    {
      itemName: 'Atlantic Salmon Fillet',
      category: 'Seafood',
      unit: 'KG',
      quantity: 18.5,
      minStockLevel: 5.0,
    }, // IN_STOCK
    {
      itemName: 'Fresh Calamari',
      category: 'Seafood',
      unit: 'KG',
      quantity: 12.0,
      minStockLevel: 4.0,
    }, // IN_STOCK
    {
      itemName: 'Whole Country Duck',
      category: 'Poultry',
      unit: 'KG',
      quantity: 0.0,
      minStockLevel: 8.0,
    }, // OUT_OF_STOCK
    // Grains & Pantry
    {
      itemName: 'Basmati Premium Rice',
      category: 'Grains',
      unit: 'KG',
      quantity: 60.0,
      minStockLevel: 20.0,
    }, // IN_STOCK
    {
      itemName: 'Arborio Rice',
      category: 'Grains',
      unit: 'KG',
      quantity: 30.0,
      minStockLevel: 8.0,
    }, // IN_STOCK
    {
      itemName: 'All-Purpose Wheat Flour',
      category: 'Pantry',
      unit: 'KG',
      quantity: 40.0,
      minStockLevel: 15.0,
    }, // IN_STOCK
    {
      itemName: 'Pure Mustard Oil',
      category: 'Pantry',
      unit: 'LITER',
      quantity: 25.0,
      minStockLevel: 10.0,
    }, // IN_STOCK
    {
      itemName: 'Extra Virgin Olive Oil',
      category: 'Pantry',
      unit: 'LITER',
      quantity: 15.0,
      minStockLevel: 5.0,
    }, // IN_STOCK
    {
      itemName: 'Truffle Oil',
      category: 'Pantry',
      unit: 'ML',
      quantity: 500.0,
      minStockLevel: 100.0,
    }, // IN_STOCK
    // Fresh Produce
    {
      itemName: 'Deshi Red Onions',
      category: 'Produce',
      unit: 'KG',
      quantity: 8.0,
      minStockLevel: 15.0,
    }, // LOW_STOCK
    {
      itemName: 'Garlic Cloves',
      category: 'Produce',
      unit: 'KG',
      quantity: 0.0,
      minStockLevel: 6.0,
    }, // OUT_OF_STOCK
    {
      itemName: 'Fresh Vine Tomatoes',
      category: 'Produce',
      unit: 'KG',
      quantity: 25.0,
      minStockLevel: 10.0,
    }, // IN_STOCK
    // Dairy
    { itemName: 'Whole Milk', category: 'Dairy', unit: 'LITER', quantity: 4.0, minStockLevel: 6.0 }, // LOW_STOCK
    {
      itemName: 'Parmesan Cheese',
      category: 'Dairy',
      unit: 'KG',
      quantity: 8.0,
      minStockLevel: 2.0,
    }, // IN_STOCK
    {
      itemName: 'Mozzarella Cheese Block',
      category: 'Dairy',
      unit: 'KG',
      quantity: 0.0,
      minStockLevel: 5.0,
    }, // OUT_OF_STOCK
    { itemName: 'Pure Cow Ghee', category: 'Dairy', unit: 'KG', quantity: 2.0, minStockLevel: 6.0 }, // LOW_STOCK
    {
      itemName: 'Sweetened Curd / Doi',
      category: 'Dairy',
      unit: 'KG',
      quantity: 12.0,
      minStockLevel: 5.0,
    }, // IN_STOCK
    // Spices
    {
      itemName: 'Garam Masala Blend',
      category: 'Spices',
      unit: 'PACK',
      quantity: 3.0,
      minStockLevel: 10.0,
    }, // LOW_STOCK
    {
      itemName: 'Kashmiri Chili Powder',
      category: 'Spices',
      unit: 'PACK',
      quantity: 15.0,
      minStockLevel: 5.0,
    }, // IN_STOCK
  ]

  for (const item of inventoryItems) {
    const existing = await prisma.inventoryItem.findFirst({
      where: { itemName: item.itemName },
    })
    if (!existing) {
      await prisma.inventoryItem.create({ data: item })
    } else {
      await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: {
          quantity: item.quantity,
          minStockLevel: item.minStockLevel,
          category: item.category,
          unit: item.unit,
        },
      })
    }
  }

  // 7. REALISTIC ORDERS
  console.log('Seeding realistic restaurant orders...')
  const now = Date.now()

  // Helper to create an order idempotently
  async function createOrGetOrder({
    uniqueMarker,
    customer,
    table,
    orderType,
    status,
    createdAtOffsetMinutes,
    specialInstructions,
    assignedStaff,
    deliveryAddress,
    deliveryPhone,
    deliveryCharge,
    scheduledArrivalTime,
    guestCount,
    estimatedReadyTime,
    items,
  }) {
    const fullInstructions = `[DEMO:${uniqueMarker}] ${specialInstructions || ''}`.trim()
    let order = await prisma.order.findFirst({
      where: { specialInstructions: { contains: `[DEMO:${uniqueMarker}]` } },
      include: { items: true, bill: true },
    })

    if (order) return order

    let totalAmount = 0
    for (const it of items) {
      totalAmount += it.food.price * it.quantity
    }
    if (deliveryCharge) totalAmount += Number(deliveryCharge)

    const createdAt = new Date(now - createdAtOffsetMinutes * 60 * 1000)

    const timeline = {}
    if (['ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'SERVED', 'COMPLETED'].includes(status)) {
      timeline.acceptedAt = new Date(createdAt.getTime() + 2 * 60 * 1000)
    }
    if (['PREPARING', 'READY', 'ON_THE_WAY', 'SERVED', 'COMPLETED'].includes(status)) {
      timeline.preparingAt = new Date(createdAt.getTime() + 5 * 60 * 1000)
    }
    if (['READY', 'ON_THE_WAY', 'SERVED', 'COMPLETED'].includes(status)) {
      timeline.readyAt = new Date(createdAt.getTime() + 18 * 60 * 1000)
    }
    if (['ON_THE_WAY'].includes(status)) {
      timeline.onTheWayAt = new Date(createdAt.getTime() + 22 * 60 * 1000)
    }
    if (['SERVED', 'COMPLETED'].includes(status)) {
      timeline.servedAt = new Date(createdAt.getTime() + 20 * 60 * 1000)
    }
    if (status === 'COMPLETED') {
      timeline.completedAt = new Date(createdAt.getTime() + 45 * 60 * 1000)
    }

    order = await prisma.order.create({
      data: {
        customerId: customer.id,
        tableId: table ? table.id : null,
        orderType,
        status,
        totalAmount,
        specialInstructions: fullInstructions,
        assignedStaffId: assignedStaff ? assignedStaff.id : null,
        deliveryAddress,
        deliveryPhone,
        deliveryCharge,
        scheduledArrivalTime,
        guestCount,
        estimatedReadyTime,
        createdAt,
        updatedAt: createdAt,
        ...timeline,
        items: {
          create: items.map((it) => ({
            menuItemId: it.food.id,
            quantity: it.quantity,
            unitPrice: it.food.price,
            subtotal: it.food.price * it.quantity,
            createdAt,
          })),
        },
      },
      include: { items: true, bill: true },
    })

    return order
  }

  // 7.1 Dine-In Order (Table 8) - READY to serve (Top item for Waiter & Chef pass)
  const _orderReadyDineIn = await createOrGetOrder({
    uniqueMarker: 'T8-READY',
    customer: customerMap['customer@foodfusion.com'],
    table: tableMap[8],
    orderType: 'DINE_IN',
    status: 'READY',
    createdAtOffsetMinutes: 25,
    specialInstructions: 'Extra salad and mint raita on the side please',
    assignedStaff: waiterSarah,
    items: [
      { food: foodMap['Royal Mutton Kacchi Biryani'], quantity: 2 },
      { food: foodMap['Sweet Mango Lassi'], quantity: 2 },
    ],
  })

  // 7.2 Dine-In Order (Table 10) - PREPARING in Kitchen
  const _orderPreparingDineIn = await createOrGetOrder({
    uniqueMarker: 'T10-PREPARING',
    customer: customerMap['customer.anika@foodfusion.com'],
    table: tableMap[10],
    orderType: 'DINE_IN',
    status: 'PREPARING',
    createdAtOffsetMinutes: 16,
    specialInstructions: 'Mild spices for the curry please',
    assignedStaff: chefAlex,
    estimatedReadyTime: new Date(now + 12 * 60 * 1000),
    items: [
      { food: foodMap['Butter Chicken Delicacy'], quantity: 1 },
      { food: foodMap['Garlic Butter Naan'], quantity: 3 },
      { food: foodMap['Fragrant Kalijira Polao'], quantity: 1 },
    ],
  })

  // 7.3 Delivery Order - PENDING (Awaiting Kitchen Accept)
  await createOrGetOrder({
    uniqueMarker: 'DEL-PENDING',
    customer: customerMap['customer.sakib@foodfusion.com'],
    table: null,
    orderType: 'DELIVERY',
    status: 'PENDING',
    createdAtOffsetMinutes: 6,
    deliveryAddress: 'House 42, Road 11, Block D, Banani, Dhaka',
    deliveryPhone: '+880 1811-000202',
    deliveryCharge: 80.0,
    specialInstructions: 'Please do not ring the bell; call when arriving',
    items: [
      { food: foodMap['Beef Kala Bhuna'], quantity: 1 },
      { food: foodMap['Fragrant Kalijira Polao'], quantity: 1 },
      { food: foodMap['Mint Lemonade Cooler'], quantity: 2 },
    ],
  })

  // 7.4 Takeaway Order - ACCEPTED with ETA
  await createOrGetOrder({
    uniqueMarker: 'TAKEAWAY-ACCEPTED',
    customer: customerMap['customer.tahmina@foodfusion.com'],
    table: null,
    orderType: 'TAKEAWAY',
    status: 'ACCEPTED',
    createdAtOffsetMinutes: 10,
    specialInstructions: 'Pack plastic cutlery and disposable napkins',
    assignedStaff: chefTanvir,
    estimatedReadyTime: new Date(now + 20 * 60 * 1000),
    items: [
      { food: foodMap['Spiced Lamb Chops Platter'], quantity: 1 },
      { food: foodMap['Shahi Tukra with Rabri'], quantity: 1 },
    ],
  })

  // 7.5 Scheduled Dine-In Order (Table 9) - Arriving today!
  await createOrGetOrder({
    uniqueMarker: 'DINEIN-SCHEDULED',
    customer: customerMap['customer.farhan@foodfusion.com'],
    table: tableMap[9],
    orderType: 'DINE_IN',
    status: 'ACCEPTED',
    createdAtOffsetMinutes: 30,
    guestCount: 4,
    scheduledArrivalTime: new Date(now + 75 * 60 * 1000),
    estimatedReadyTime: new Date(now + 70 * 60 * 1000),
    specialInstructions: 'VIP table setup for international clients',
    assignedStaff: waiterRahim,
    items: [
      { food: foodMap['Chicken Reshmi Kebab'], quantity: 1 },
      { food: foodMap['Grilled Dahi Fish Tikka'], quantity: 1 },
      { food: foodMap['Garlic Butter Naan'], quantity: 4 },
    ],
  })

  // 7.6 Urgent / Delayed Delivery Order (> 35 min waiting)
  await createOrGetOrder({
    uniqueMarker: 'DEL-URGENT',
    customer: customerMap['customer@foodfusion.com'],
    table: null,
    orderType: 'DELIVERY',
    status: 'PREPARING',
    createdAtOffsetMinutes: 38, // Exceeds 30 min urgency threshold
    deliveryAddress: 'Apartment 6B, Gulshan-1, Dhaka',
    deliveryPhone: '+880 1711-555010',
    deliveryCharge: 100.0,
    specialInstructions: 'Urgent order! Client awaiting lunch delivery',
    assignedStaff: chefAlex,
    items: [
      { food: foodMap['Artisan Truffle Burger'], quantity: 2 },
      { food: foodMap['Buffalo Wings'], quantity: 1 },
    ],
  })

  // 7.7 Live Tracking Delivery Order - ON_THE_WAY
  await createOrGetOrder({
    uniqueMarker: 'DEL-ONTHEWAY',
    customer: customerMap['customer@foodfusion.com'],
    table: null,
    orderType: 'DELIVERY',
    status: 'ON_THE_WAY',
    createdAtOffsetMinutes: 45,
    deliveryAddress: 'Plot 18, Block C, Bashundhara R/A, Dhaka',
    deliveryPhone: '+880 1711-555010',
    deliveryCharge: 80.0,
    specialInstructions: 'Gate passcode is 1423',
    items: [
      { food: foodMap['Pan-Seared Atlantic Salmon'], quantity: 1 },
      { food: foodMap['Passionfruit Mocktail'], quantity: 1 },
    ],
  })

  // 7.8 Completed Order 1 (Anika Rahman) - with Paid Bill
  const completedOrder1 = await createOrGetOrder({
    uniqueMarker: 'COMPLETED-ANIKA',
    customer: customerMap['customer.anika@foodfusion.com'],
    table: tableMap[3],
    orderType: 'DINE_IN',
    status: 'COMPLETED',
    createdAtOffsetMinutes: 240, // 4 hours ago
    specialInstructions: 'Family dinner celebration',
    assignedStaff: waiterSarah,
    items: [
      { food: foodMap['Royal Mutton Kacchi Biryani'], quantity: 2 },
      { food: foodMap['Sweet Mango Lassi'], quantity: 2 },
    ],
  })

  // 7.9 Completed Order 2 (John Customer) - with Paid Bill
  const completedOrder2 = await createOrGetOrder({
    uniqueMarker: 'COMPLETED-JOHN',
    customer: customerMap['customer@foodfusion.com'],
    table: tableMap[4],
    orderType: 'DINE_IN',
    status: 'COMPLETED',
    createdAtOffsetMinutes: 1440, // Yesterday
    specialInstructions: 'Business dinner table',
    assignedStaff: waiterRahim,
    items: [
      { food: foodMap['Grilled Ribeye Steak'], quantity: 1 },
      { food: foodMap['Warm Chocolate Lava Cake'], quantity: 1 },
      { food: foodMap['Artisan Iced Latte'], quantity: 1 },
    ],
  })

  // 7.10 Completed Order 3 (Tahmina Islam) - with Unpaid Bill
  const completedOrder3 = await createOrGetOrder({
    uniqueMarker: 'COMPLETED-TAHMINA',
    customer: customerMap['customer.tahmina@foodfusion.com'],
    table: tableMap[5],
    orderType: 'DINE_IN',
    status: 'COMPLETED',
    createdAtOffsetMinutes: 90, // 1.5 hours ago
    specialInstructions: 'Dinner with colleagues',
    assignedStaff: waiterSarah,
    items: [
      { food: foodMap['Spiced Lamb Chops Platter'], quantity: 1 },
      { food: foodMap['Mint Lemonade Cooler'], quantity: 1 },
    ],
  })

  // 8. BILLS / PAYMENTS
  console.log('Seeding bills and invoices...')
  const billsToSeed = [
    {
      order: completedOrder1,
      discount: 100.0,
      vatPercent: 10.0,
      paymentStatus: 'PAID',
    },
    {
      order: completedOrder2,
      discount: 0.0,
      vatPercent: 10.0,
      paymentStatus: 'PAID',
    },
    {
      order: completedOrder3,
      discount: 50.0,
      vatPercent: 10.0,
      paymentStatus: 'UNPAID', // Gives staff/admin unpaid bill to collect!
    },
  ]

  for (const b of billsToSeed) {
    const existingBill = await prisma.bill.findUnique({
      where: { orderId: b.order.id },
    })
    if (!existingBill) {
      const subtotal = Number(b.order.totalAmount)
      const vatAmount = Math.round(((subtotal * b.vatPercent) / 100) * 100) / 100
      const grandTotal = Math.max(0, subtotal + vatAmount - b.discount)

      await prisma.bill.create({
        data: {
          orderId: b.order.id,
          subtotal,
          vatPercent: b.vatPercent,
          vatAmount,
          discount: b.discount,
          grandTotal,
          paymentStatus: b.paymentStatus,
          billDate: b.order.createdAt,
        },
      })
    }
  }

  // 9. DINING RESERVATIONS
  console.log('Seeding reservations...')
  const today = new Date()
  const todayDateOnly = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
  const tomorrowDateOnly = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1),
  )
  const in3DaysDateOnly = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 3),
  )

  const reservationsData = [
    {
      customer: customerMap['customer.anika@foodfusion.com'],
      table: tableMap[7],
      guestCount: 2,
      reservationDate: todayDateOnly,
      reservationTime: '19:30',
      occasion: 'DATE',
      status: 'CONFIRMED',
      specialRequest: 'Romantic corner table with candlelight setup',
    },
    {
      customer: customerMap['customer.farhan@foodfusion.com'],
      table: tableMap[9],
      guestCount: 4,
      reservationDate: todayDateOnly,
      reservationTime: '20:00',
      occasion: 'BIRTHDAY',
      status: 'CONFIRMED',
      specialRequest: 'Wife birthday celebration, please bring dessert with candle after meal',
    },
    {
      customer: customerMap['customer.tahmina@foodfusion.com'],
      table: tableMap[10],
      guestCount: 6,
      reservationDate: todayDateOnly,
      reservationTime: '20:30',
      occasion: 'FAMILY_DINNER',
      status: 'PENDING',
      specialRequest: 'High chair needed for a 2-year old child',
    },
    {
      customer: customerMap['customer.sakib@foodfusion.com'],
      table: tableMap[11],
      guestCount: 8,
      reservationDate: tomorrowDateOnly,
      reservationTime: '19:00',
      occasion: 'BUSINESS_MEETING',
      status: 'CONFIRMED',
      specialRequest: 'Quiet private alcove for quarterly team celebration',
    },
    {
      customer: customerMap['customer@foodfusion.com'],
      table: tableMap[12],
      guestCount: 10,
      reservationDate: in3DaysDateOnly,
      reservationTime: '20:00',
      occasion: 'ANNIVERSARY',
      status: 'CONFIRMED',
      specialRequest: 'Silver wedding anniversary family dinner',
    },
  ]

  for (const r of reservationsData) {
    const existing = await prisma.reservation.findFirst({
      where: {
        customerId: r.customer.id,
        tableId: r.table.id,
        reservationDate: r.reservationDate,
        reservationTime: r.reservationTime,
      },
    })
    if (!existing) {
      await prisma.reservation.create({
        data: {
          customerId: r.customer.id,
          customerName: r.customer.fullName,
          customerPhone: r.customer.phone,
          tableId: r.table.id,
          guestCount: r.guestCount,
          reservationDate: r.reservationDate,
          reservationTime: r.reservationTime,
          occasion: r.occasion,
          status: r.status,
          specialRequest: r.specialRequest,
        },
      })
    }
  }

  // 10. FAVORITES & LOYALTY TRANSACTIONS
  console.log('Seeding customer favorites and loyalty transactions...')
  const favoritesData = [
    {
      customer: customerMap['customer@foodfusion.com'],
      food: foodMap['Royal Mutton Kacchi Biryani'],
    },
    {
      customer: customerMap['customer@foodfusion.com'],
      food: foodMap['Pan-Seared Atlantic Salmon'],
    },
    { customer: customerMap['customer@foodfusion.com'], food: foodMap['Warm Chocolate Lava Cake'] },
    {
      customer: customerMap['customer.anika@foodfusion.com'],
      food: foodMap['Butter Chicken Delicacy'],
    },
    { customer: customerMap['customer.anika@foodfusion.com'], food: foodMap['Sweet Mango Lassi'] },
    { customer: customerMap['customer.sakib@foodfusion.com'], food: foodMap['Beef Kala Bhuna'] },
  ]

  for (const fav of favoritesData) {
    await prisma.favoriteMenuItem.upsert({
      where: {
        customerId_menuItemId: {
          customerId: fav.customer.id,
          menuItemId: fav.food.id,
        },
      },
      update: {},
      create: {
        customerId: fav.customer.id,
        menuItemId: fav.food.id,
      },
    })
  }

  const loyaltyData = [
    {
      customer: customerMap['customer@foodfusion.com'],
      type: 'BONUS',
      points: 50,
      reason: 'Welcome bonus on signup',
      order: null,
    },
    {
      customer: customerMap['customer@foodfusion.com'],
      type: 'EARNED',
      points: 228,
      reason: 'Points earned from completed orders',
      order: completedOrder2,
    },
    {
      customer: customerMap['customer.anika@foodfusion.com'],
      type: 'BONUS',
      points: 50,
      reason: 'Welcome bonus on signup',
      order: null,
    },
    {
      customer: customerMap['customer.anika@foodfusion.com'],
      type: 'EARNED',
      points: 174,
      reason: 'Points earned from completed dine-in order',
      order: completedOrder1,
    },
  ]

  for (const l of loyaltyData) {
    const existing = await prisma.loyaltyTransaction.findFirst({
      where: {
        customerId: l.customer.id,
        reason: l.reason,
      },
    })
    if (!existing) {
      await prisma.loyaltyTransaction.create({
        data: {
          customerId: l.customer.id,
          type: l.type,
          points: l.points,
          reason: l.reason,
          orderId: l.order ? l.order.id : null,
        },
      })
    }
  }

  console.log('✅ FoodFusion Database successfully seeded with rich demo dataset!')
}

seed()
  .catch((e) => {
    console.error('Seed failed with error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

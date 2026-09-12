import { prisma } from '../src/config/prisma.js'
import { hashPassword } from '../src/utils/password.js'

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
      loyaltyPointValue: 1.0,
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
  const chefTanvir = await prisma.user.findUnique({ where: { email: 'chef.tanvir@foodfusion.com' } })
  const waiterSarah = await prisma.user.findUnique({ where: { email: 'waiter@foodfusion.com' } })
  const waiterRahim = await prisma.user.findUnique({ where: { email: 'waiter.rahim@foodfusion.com' } })

  // 4. DINING FLOOR TABLES
  console.log('Seeding dining tables...')
  const tablesData = [
    { number: 1, capacity: 2, status: 'AVAILABLE', description: 'Window-side table for 2' },
    { number: 2, capacity: 2, status: 'AVAILABLE', description: 'Cozy table for 2' },
    { number: 3, capacity: 4, status: 'AVAILABLE', description: 'Dining table for 4' },
    { number: 4, capacity: 4, status: 'AVAILABLE', description: 'Booth for family of 4' },
    { number: 5, capacity: 6, status: 'AVAILABLE', description: 'Large dining table for 6' },
    { number: 6, capacity: 8, status: 'AVAILABLE', description: 'Banquet table for 8' },
    { number: 7, capacity: 2, status: 'AVAILABLE', description: 'Romantic Garden Corner for 2' },
    { number: 8, capacity: 4, status: 'OCCUPIED', description: 'Garden View Booth for 4' },
    { number: 9, capacity: 4, status: 'RESERVED', description: 'Center Dining Table for 4' },
    { number: 10, capacity: 6, status: 'OCCUPIED', description: 'Family Dining Table for 6' },
    { number: 11, capacity: 8, status: 'AVAILABLE', description: 'Private Dining Alcove for 8' },
    { number: 12, capacity: 10, status: 'RESERVED', description: 'Executive VIP Banquet for 10' },
  ]

  const tableMap = {}
  for (const t of tablesData) {
    const table = await prisma.table.upsert({
      where: { number: t.number },
      update: {
        capacity: t.capacity,
        description: t.description,
        status: t.status,
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
          description: 'Tender spiced mutton layered with fragrant basmati rice, saffron, and potato',
          price: 650.0,
          prepTimeMinutes: 20,
        },
        {
          name: 'Beef Kala Bhuna',
          description: 'Traditional slow-cooked Chittagong-style dark tender beef in caramelized spices',
          price: 720.0,
          prepTimeMinutes: 25,
        },
        {
          name: 'Butter Chicken Delicacy',
          description: 'Smoked boneless chicken simmered in rich creamy tomato and butter gravy',
          price: 580.0,
          prepTimeMinutes: 18,
        },
        {
          name: 'Fragrant Kalijira Polao',
          description: 'Aromatic short-grain rice cooked with whole garam masala and pure ghee',
          price: 180.0,
          prepTimeMinutes: 10,
        },
        {
          name: 'Garlic Butter Naan',
          description: 'Clay-oven tandoori flatbread brushed with roasted garlic and melted butter',
          price: 90.0,
          prepTimeMinutes: 8,
        },
      ],
    },
    {
      name: 'Grills & Kebabs',
      description: 'Charcoal flame-grilled kebabs, tikkas and mixed sizzlers',
      foods: [
        {
          name: 'Chicken Reshmi Kebab',
          description: 'Silky marinated minced chicken skewers infused with cream, cashew and cardamom',
          price: 450.0,
          prepTimeMinutes: 18,
        },
        {
          name: 'Grilled Dahi Fish Tikka',
          description: 'Spiced yogurt and ajwain marinated river fish skewers grilled over coals',
          price: 680.0,
          prepTimeMinutes: 20,
        },
        {
          name: 'Spiced Lamb Chops Platter',
          description: 'Double-cut lamb chops glazed in ginger, black pepper, and papaya tenderizer',
          price: 1150.0,
          prepTimeMinutes: 25,
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
        },
        {
          name: 'Crispy Calamari',
          description: 'Golden-fried squid with garlic aioli',
          price: 420.0,
          prepTimeMinutes: 12,
        },
        {
          name: 'Truffle Bruschetta',
          description: 'Sourdough with heirloom tomatoes & truffle glaze',
          price: 350.0,
          prepTimeMinutes: 10,
        },
        {
          name: 'Buffalo Wings',
          description: 'Crispy spicy wings with blue cheese dip',
          price: 450.0,
          prepTimeMinutes: 15,
        },
      ],
    },
    {
      name: 'Main Courses',
      description: 'Signature western and fusion entrees prepared with fresh ingredients',
      foods: [
        {
          name: 'Grilled Ribeye Steak',
          description: 'Prime 10oz ribeye with roasted asparagus and peppercorn jus',
          price: 1650.0,
          prepTimeMinutes: 25,
        },
        {
          name: 'Pan-Seared Atlantic Salmon',
          description: 'Salmon fillet with lemon-dill risotto and blistered tomatoes',
          price: 1450.0,
          prepTimeMinutes: 20,
        },
        {
          name: 'Artisan Truffle Burger',
          description: 'Angus beef patty, gouda, arugula & truffle mayo with seasoned wedges',
          price: 750.0,
          prepTimeMinutes: 15,
        },
        {
          name: 'Wild Mushroom Fettuccine',
          description: 'Handmade pasta in garlic parmesan sauce with shiitake & portobello',
          price: 680.0,
          prepTimeMinutes: 18,
        },
      ],
    },
    {
      name: 'Desserts',
      description: 'Sweet artisanal creations crafted in-house',
      foods: [
        {
          name: 'Shahi Tukra with Rabri',
          description: 'Golden saffron-soaked brioche topped with rich condensed milk and crushed pistachios',
          price: 280.0,
          prepTimeMinutes: 10,
        },
        {
          name: 'Warm Chocolate Lava Cake',
          description: 'Molten Belgian chocolate with vanilla bean ice cream',
          price: 380.0,
          prepTimeMinutes: 10,
        },
        {
          name: 'Classic Tiramisu',
          description: 'Espresso-soaked ladyfingers with mascarpone cream',
          price: 350.0,
          prepTimeMinutes: 5,
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
        },
        {
          name: 'Sweet Mango Lassi',
          description: 'Blended Alphonso mango puree with creamy curd and cardamom',
          price: 220.0,
          prepTimeMinutes: 5,
        },
        {
          name: 'Passionfruit Mocktail',
          description: 'Sparkling passionfruit nectar with mint & lime',
          price: 250.0,
          prepTimeMinutes: 5,
        },
        {
          name: 'Artisan Iced Latte',
          description: 'Single-origin espresso with chilled milk and caramel drizzle',
          price: 260.0,
          prepTimeMinutes: 5,
        },
      ],
    },
  ]

  const foodMap = {}
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: { name: cat.name, description: cat.description },
    })

    for (const food of cat.foods) {
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
            categoryId: category.id,
            isAvailable: true,
          },
        })
      } else {
        // Update price to realistic BDT value if it was old low USD seed
        existingFood = await prisma.food.update({
          where: { id: existingFood.id },
          data: {
            price: food.price,
            description: food.description,
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
    { itemName: 'Fresh Farm Chicken', category: 'Poultry', unit: 'KG', quantity: 45.0, minStockLevel: 15.0 }, // IN_STOCK
    { itemName: 'Prime Local Beef Cut', category: 'Meat', unit: 'KG', quantity: 6.0, minStockLevel: 12.0 }, // LOW_STOCK
    { itemName: 'Angus Beef Ribeye', category: 'Meat', unit: 'KG', quantity: 0.0, minStockLevel: 10.0 }, // OUT_OF_STOCK
    { itemName: 'Atlantic Salmon Fillet', category: 'Seafood', unit: 'KG', quantity: 18.5, minStockLevel: 5.0 }, // IN_STOCK
    { itemName: 'Fresh Calamari', category: 'Seafood', unit: 'KG', quantity: 12.0, minStockLevel: 4.0 }, // IN_STOCK
    { itemName: 'Whole Country Duck', category: 'Poultry', unit: 'KG', quantity: 0.0, minStockLevel: 8.0 }, // OUT_OF_STOCK
    // Grains & Pantry
    { itemName: 'Basmati Premium Rice', category: 'Grains', unit: 'KG', quantity: 60.0, minStockLevel: 20.0 }, // IN_STOCK
    { itemName: 'Arborio Rice', category: 'Grains', unit: 'KG', quantity: 30.0, minStockLevel: 8.0 }, // IN_STOCK
    { itemName: 'All-Purpose Wheat Flour', category: 'Pantry', unit: 'KG', quantity: 40.0, minStockLevel: 15.0 }, // IN_STOCK
    { itemName: 'Pure Mustard Oil', category: 'Pantry', unit: 'LITER', quantity: 25.0, minStockLevel: 10.0 }, // IN_STOCK
    { itemName: 'Extra Virgin Olive Oil', category: 'Pantry', unit: 'LITER', quantity: 15.0, minStockLevel: 5.0 }, // IN_STOCK
    { itemName: 'Truffle Oil', category: 'Pantry', unit: 'ML', quantity: 500.0, minStockLevel: 100.0 }, // IN_STOCK
    // Fresh Produce
    { itemName: 'Deshi Red Onions', category: 'Produce', unit: 'KG', quantity: 8.0, minStockLevel: 15.0 }, // LOW_STOCK
    { itemName: 'Garlic Cloves', category: 'Produce', unit: 'KG', quantity: 0.0, minStockLevel: 6.0 }, // OUT_OF_STOCK
    { itemName: 'Fresh Vine Tomatoes', category: 'Produce', unit: 'KG', quantity: 25.0, minStockLevel: 10.0 }, // IN_STOCK
    // Dairy
    { itemName: 'Whole Milk', category: 'Dairy', unit: 'LITER', quantity: 4.0, minStockLevel: 6.0 }, // LOW_STOCK
    { itemName: 'Parmesan Cheese', category: 'Dairy', unit: 'KG', quantity: 8.0, minStockLevel: 2.0 }, // IN_STOCK
    { itemName: 'Mozzarella Cheese Block', category: 'Dairy', unit: 'KG', quantity: 0.0, minStockLevel: 5.0 }, // OUT_OF_STOCK
    { itemName: 'Pure Cow Ghee', category: 'Dairy', unit: 'KG', quantity: 2.0, minStockLevel: 6.0 }, // LOW_STOCK
    { itemName: 'Sweetened Curd / Doi', category: 'Dairy', unit: 'KG', quantity: 12.0, minStockLevel: 5.0 }, // IN_STOCK
    // Spices
    { itemName: 'Garam Masala Blend', category: 'Spices', unit: 'PACK', quantity: 3.0, minStockLevel: 10.0 }, // LOW_STOCK
    { itemName: 'Kashmiri Chili Powder', category: 'Spices', unit: 'PACK', quantity: 15.0, minStockLevel: 5.0 }, // IN_STOCK
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
      const vatAmount = Math.round((subtotal * b.vatPercent) / 100 * 100) / 100
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
  const tomorrowDateOnly = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1))
  const in3DaysDateOnly = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 3))

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
    { customer: customerMap['customer@foodfusion.com'], food: foodMap['Royal Mutton Kacchi Biryani'] },
    { customer: customerMap['customer@foodfusion.com'], food: foodMap['Pan-Seared Atlantic Salmon'] },
    { customer: customerMap['customer@foodfusion.com'], food: foodMap['Warm Chocolate Lava Cake'] },
    { customer: customerMap['customer.anika@foodfusion.com'], food: foodMap['Butter Chicken Delicacy'] },
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

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Env
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL is missing from your .env file!');
}

// Adapter
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Random
const randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Pick
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log('🌱 Launching Prisma 7 Analytics Data Seeding Engine...');

  // Clear
  await prisma.transaction.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // Categories
  const defaultNames = ['Food', 'Transport', 'Bills', 'Health', 'Shopping', 'Travel', 'Leisure', 'Other'];
  const categories: any[] = [];
  
  for (const name of defaultNames) {
    const cat = await prisma.category.create({
      data: { name, isDefault: true }
    });
    categories.push(cat);
  }
  console.log(`✅ System default categories provisioned: [${defaultNames.join(', ')}]`);

  // Blueprints
  const userBlueprints = [
    { name: 'S.P. Dwivedi', email: 'test@spdwivedi.me', txnTarget: 10 },
    { name: 'Amit Sharma', email: 'amit@example.com', txnTarget: 20 },
    { name: 'Priya Patel', email: 'priya@example.com', txnTarget: 30 },
    { name: 'Rahul Verma', email: 'rahul@example.com', txnTarget: 40 },
    { name: 'Sneha Gupta', email: 'sneha@example.com', txnTarget: 50 }
  ];

  // Notes
  const contextualNotes: Record<string, string[]> = {
    'Food': ['Zomato Dinner Delivery', 'Weekly Grocery Store Run', 'Blue Tokai Coffee', 'Team Lunch Outing', 'Snacks & Quick Bites'],
    'Transport': ['Uber Auto Ride', 'Petrol Pump Refuel', 'Metro Card Recharge', 'Ola Cab Booking'],
    'Bills': ['Electricity Bill Payment', 'High-Speed Broadband Internet', 'Mobile Postpaid Recharge', 'Oracle Cloud VPS Utility'],
    'Health': ['Apollo Pharmacy Medicine', 'Monthly Gym Membership', 'Doctor Consultation Fee', 'Multivitamin Supplements'],
    'Shopping': ['Amazon Electronics Purchase', 'Zara Tailored Clothing', 'Mechanical Keyboard Upgrades', 'Sneakers Purchase'],
    'Travel': ['MakeMyTrip Flight Booking', 'Hotel Advance Room Deposit', 'IRCTC Train Ticket', 'Weekend Getaway Luggage'],
    'Leisure': ['PVR Movie Tickets', 'Spotify Premium Annual Sync', 'BookMyShow Concert Entry', 'Gaming Console Skin Store'],
    'Other': ['Miscellaneous Cash ATM Outflow', 'Friend Reimbursement Transfer', 'Laundry Services']
  };

  const incomeNotes = ['Primary Software Job Salary', 'Freelance RAG Consulting Invoice', 'Algorithmic Trading Yield Dividends', 'Tech Hackathon Prize Payout'];

  // Dates
  const sampleDates = [
    new Date('2026-01-12T10:30:00Z'), new Date('2026-01-26T15:45:00Z'),
    new Date('2026-02-05T09:15:00Z'), new Date('2026-02-22T18:20:00Z'),
    new Date('2026-03-03T14:10:00Z'), new Date('2026-03-18T11:55:00Z'),
    new Date('2026-04-10T16:40:00Z'), new Date('2026-04-25T20:15:00Z'),
    new Date('2026-05-02T08:00:00Z'), new Date('2026-05-15T13:22:00Z'),
    new Date('2026-05-20T19:50:00Z'), new Date('2026-05-22T14:30:00Z')
  ];

  const genericPasswordHash = await bcrypt.hash('SecurePass123!', 10);

  // Loop
  for (const blueprint of userBlueprints) {
    const user = await prisma.user.create({
      data: {
        name: blueprint.name,
        email: blueprint.email,
        passwordHash: genericPasswordHash
      }
    });

    console.log(`👤 User Provisioned: ${user.email} (Targeting ${blueprint.txnTarget} Ledger Rows)`);

    const batchTransactions = [];

    // Income
    const incomeCount = blueprint.txnTarget <= 20 ? 2 : 4;
    for (let i = 0; i < incomeCount; i++) {
      batchTransactions.push({
        userId: user.id,
        amount: randomRange(35000, 120000),
        type: 'INCOME',
        categoryId: categories.find(c => c.name === 'Other').id,
        date: pickRandom(sampleDates),
        note: pickRandom(incomeNotes)
      });
    }

    // Expense
    const expenseCount = blueprint.txnTarget - incomeCount;
    for (let e = 0; e < expenseCount; e++) {
      const selectedCategory = pickRandom(categories);
      const randomNote = pickRandom(contextualNotes[selectedCategory.name]);
      
      batchTransactions.push({
        userId: user.id,
        amount: randomRange(250, 15000),
        type: 'EXPENSE',
        categoryId: selectedCategory.id,
        date: pickRandom(sampleDates),
        note: randomNote
      });
    }

    // Insert
    await prisma.transaction.createMany({
      data: batchTransactions
    });
  }

  console.log('\n🏁 Cloud Database Seeding Sequence Finished Successfully!');
  console.log('📊 5 Users and 150 unique multi-month transactions are live on Oracle Cloud.');
}

main()
  .catch((e) => {
    console.error('❌ Data Seeding sequence crashed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Clean
    await prisma.$disconnect();
    await pool.end();
  });
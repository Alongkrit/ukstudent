const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Adding missing column stripe_account_id to expert_profiles...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE expert_profiles 
      ADD COLUMN IF NOT EXISTS stripe_account_id text;
    `);
    console.log('Successfully added stripe_account_id column!');

    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'expert_profiles'
      ORDER BY ordinal_position;
    `;
    console.log('Updated columns in expert_profiles table:');
    console.log(columns);
  } catch (err) {
    console.error('Database migration error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();

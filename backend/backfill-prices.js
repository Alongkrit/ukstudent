const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const prices = {
  'Assignment Help': 25.0,
  'Homework Support': 15.0,
  'Dissertation Guidance': 60.0,
  'Exam Preparation': 30.0,
  'Proofreading & Editing': 20.0,
  'Programming Help': 35.0,
  'Essay Writing': 30.0,
  'Referencing Support': 12.0,
};

async function main() {
  for (const [name, price] of Object.entries(prices)) {
    const result = await prisma.service.updateMany({ where: { name }, data: { price } });
    console.log(`${name}: updated ${result.count} row(s) to £${price}`);
  }
}

main().finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'expert' } });
    console.log('Found expert user:', user.id, user.email);
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true,
        studentProfile: true,
        expertProfile: {
          include: {
            documents: true,
          },
        },
      },
    });
    console.log('Full user:', JSON.stringify(fullUser, null, 2));
  } catch (err) {
    console.error('Prisma Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();

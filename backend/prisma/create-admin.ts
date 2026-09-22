import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'scholzacoin@gmail.com';
  const password = 'scholza@123';
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: UserRole.admin, passwordHash },
    create: {
      email,
      passwordHash,
      role: UserRole.admin,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`Admin ready: ${admin.email}`);
}

main().finally(() => prisma.$disconnect());
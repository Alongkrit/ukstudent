import { PrismaClient, UserRole, VerificationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 12);
  const expertPasswordHash = await bcrypt.hash('ExpertPass123!', 12);
  const studentPasswordHash = await bcrypt.hash('StudentPass123!', 12);

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ukstudentsupport.co.uk' },
    update: {},
    create: {
      email: 'admin@ukstudentsupport.co.uk',
      passwordHash: adminPasswordHash,
      role: UserRole.admin,
      phone: '+44 20 7946 0912',
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // 2. Create Expert User & Profile
  const expertUser = await prisma.user.upsert({
    where: { email: 'robert.vance@cambridge.ac.uk' },
    update: {},
    create: {
      email: 'robert.vance@cambridge.ac.uk',
      passwordHash: expertPasswordHash,
      role: UserRole.expert,
      phone: '+44 7700 900077',
      emailVerifiedAt: new Date(),
      expertProfile: {
        create: {
          subjects: ['Assignment Help', 'Dissertation Guidance', 'Programming Help', 'Essay Writing'],
          qualifications: 'PhD Computer Science (Cambridge), Senior Lecturer',
          bio: 'Senior Academic Lecturer with 8+ years experience guiding UK undergraduate and postgraduate students in technical & research writing.',
          verificationStatus: VerificationStatus.approved,
          ratingAvg: 4.95,
          isAvailable: true,
          paypalEmail: 'robert.vance@cambridge.ac.uk',
        },
      },
    },
  });
  console.log(`✅ Expert user: ${expertUser.email}`);

  // 3. Create Student User & Profile
  const studentUser = await prisma.user.upsert({
    where: { email: 'aisha.patel@manchester.ac.uk' },
    update: {},
    create: {
      email: 'aisha.patel@manchester.ac.uk',
      passwordHash: studentPasswordHash,
      role: UserRole.student,
      phone: '+44 7700 900123',
      emailVerifiedAt: new Date(),
      studentProfile: {
        create: {
          university: 'University of Manchester',
          course: 'BSc Computer Science',
          yearOfStudy: 'Final-Year',
        },
      },
    },
  });
  console.log(`✅ Student user: ${studentUser.email}`);

  // 4. Seed Services Catalogue
  const services = [
    { name: 'Assignment Help', description: 'Step-by-step guidance on understanding assignment briefs, structural outlines, and marking rubrics.', price: 25.0, icon: 'BookOpen' },
    { name: 'Homework Support', description: 'Quick assistance with coursework questions, tutorial problem sets, and problem solving.', price: 15.0, icon: 'HelpCircle' },
    { name: 'Dissertation Guidance', description: 'Expert feedback on thesis proposals, literature reviews, methodology, and structural coherence.', price: 60.0, icon: 'FileText' },
    { name: 'Exam Preparation', description: 'Targeted revision strategies, past paper walkthroughs, and key concept consolidation.', price: 30.0, icon: 'Award' },
    { name: 'Proofreading & Editing', description: 'Academic style polish, clarity check, grammar correction, and tone adjustment.', price: 20.0, icon: 'CheckCircle2' },
    { name: 'Programming Help', description: 'Code debugging, architectural design, data structures, and algorithmic walkthroughs.', price: 35.0, icon: 'Code' },
    { name: 'Essay Writing', description: 'Academic argument structure, critical analysis guidance, and thesis statement formulation.', price: 30.0, icon: 'PenTool' },
    { name: 'Referencing Support', description: 'Harvard, APA, OSCOLA, and IEEE reference formatting, citations, and bibliography check.', price: 12.0, icon: 'Bookmark' },
  ];

  for (const s of services) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({ data: s });
    }
  }
  console.log(`✅ ${services.length} Services initialized.`);

  // 5. Seed Initial SEO Blog Posts
  const blogPosts = [
    {
      title: 'Writing a High-Quality University Essay: Where to Start',
      slug: 'writing-a-high-quality-university-essay-where-to-start',
      category: 'Essay Writing',
      body: `Writing a university essay can feel daunting, especially when faced with strict marking criteria and word counts. Here is a step-by-step breakdown on structuring your response:

1. Analyze the Prompt & Command Words: Look for key terms like 'critically analyze', 'evaluate', or 'compare'.
2. Formulate a Strong Thesis Statement: Your central thesis should answer the prompt directly in 1-2 clear sentences.
3. Construct Body Paragraphs with PEEL: Point, Evidence, Explanation, Link.
4. Integrate UK Academic Referencing: Ensure every claim is supported with credible journal sources.`,
      readTimeMin: 6,
      publishedAt: new Date(),
    },
    {
      title: 'Smarter Ways to Manage Coursework and Deadlines',
      slug: 'smarter-ways-to-manage-coursework-and-deadlines',
      category: 'Study Skills',
      body: `Balancing multiple coursework assignments alongside lectures requires active time-blocking and prioritizing:

- Break Assignments into Micro-Tasks: Instead of writing 3,000 words in one sitting, schedule reading, outlining, drafting, and proofreading across distinct days.
- Use the Pomodoro Technique: 25 minutes of focused writing followed by a 5-minute break.
- Get Early Feedback: Connecting with academic tutors early prevents last-minute panic.`,
      readTimeMin: 5,
      publishedAt: new Date(),
    },
    {
      title: 'A Simple Guide to Harvard, APA & OSCOLA Referencing',
      slug: 'a-simple-guide-to-harvard-apa-and-oscola-referencing',
      category: 'Referencing',
      body: `Referencing is key to academic integrity in UK higher education.

- Harvard Style: Author-date system, e.g., (Smith, 2024, p. 45).
- APA 7th: Similar to Harvard, with specific capitalization rules in bibliographies.
- OSCOLA: Used exclusively in Law, relying on footnotes with specific citation formatting for statutes and legal cases.`,
      readTimeMin: 4,
      publishedAt: new Date(),
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log(`✅ Blog posts initialized.`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

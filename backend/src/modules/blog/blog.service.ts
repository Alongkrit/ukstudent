import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BlogService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.blogPost.count();
    if (count === 0) {
      const defaultPosts = [
        {
          title: 'Writing a High-Quality University Essay: Where to Start',
          slug: 'writing-a-high-quality-university-essay-where-to-start',
          category: 'Essay Writing',
          readTimeMin: 6,
          publishedAt: new Date(),
          body: `Writing a compelling university essay requires structure, critical analysis, and evidence-based argumentation. 

### 1. Deconstruct the Prompt
Before writing a single word, break down the assignment question into key components: the directive verb (e.g. *critically evaluate*, *analyse*, *compare*), the core topic, and any specific parameters or context.

### 2. Formulate a Strong Thesis Statement
Your thesis is the central claim of your essay. It should be concise, arguable, and directly answer the question prompt. Avoid generic summaries; instead, take a clear stance supported by evidence.

### 3. Structural Essentials
- **Introduction (10%)**: Contextualise the topic, state thesis, outline roadmap.
- **Body Paragraphs (80%)**: Use PEEL structure (Point, Evidence, Explanation, Link).
- **Conclusion (10%)**: Synthesise key arguments without introducing new evidence.

### 4. Critical Assessment of Sources
Rely on peer-reviewed academic journals, academic monographs, and credible research repository data. Evaluate each source's methodology, potential bias, and relevance to your thesis argument.`,
        },
        {
          title: 'Smarter Ways to Manage Coursework and Deadlines',
          slug: 'smarter-ways-to-manage-coursework-and-deadlines',
          category: 'Study Skills',
          readTimeMin: 5,
          publishedAt: new Date(),
          body: `Juggling multiple module deadlines alongside lectures and personal commitments is one of the biggest challenges for university students.

### 1. Reverse Deadline Planning
Work backwards from submission date. Break down the task into milestones: topic selection, research, outline drafting, full draft completion, and final proofreading.

### 2. Time Blocking & Pomodoro Technique
Allocate dedicated 90-minute deep-work focus windows. Use 25-minute Pomodoro sprints for drafting intense sections to maintain momentum and prevent burnout.

### 3. Document Management & Backups
Store working drafts in cloud storage (OneDrive/Google Drive) with automatic version history. Keep reference files organised in folder sub-categories per module code.`,
        },
        {
          title: 'A Simple Guide to Harvard, APA & OSCOLA Referencing',
          slug: 'a-simple-guide-to-harvard-apa-and-oscola-referencing',
          category: 'Referencing',
          readTimeMin: 4,
          publishedAt: new Date(),
          body: `Referencing correctly is vital to maintaining academic integrity and avoiding accidental plagiarism in higher education assessments.

### Harvard Style (Author-Date)
Widely used across universities in business, humanities, and social sciences.
- *In-text*: (Smith, 2023, p. 45)
- *Bibliography*: Smith, J. (2023) *Academic Writing in Higher Education*. London: Palgrave Macmillan.

### OSCOLA (Oxford University Standard for Citation of Legal Authorities)
Standard citation style for Law degrees.
- *Footnotes*: Case name in italics, neutral citation, law report. e.g. *Donoghue v Stevenson* [1932] AC 562.
- *No in-text parentheses*: All citations appear in footnotes at the bottom of the page.

### APA 7th Edition
Commonly specified for Psychology, Social Sciences, and Health disciplines.
- *In-text*: (Smith & Jones, 2022)
- *Bibliography*: Includes hanging indents and DOI links for online articles.`,
        },
      ];

      for (const post of defaultPosts) {
        await this.prisma.blogPost.create({ data: post });
      }
    }
  }

  async findPublished(category?: string) {
    const where: any = { publishedAt: { not: null } };
    if (category) {
      where.category = category;
    }
    return this.prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

    async findPublishedBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
    });
    if (!post || !post.publishedAt) {
      throw new NotFoundException('Blog post not found');
    }
    return post;
  }

  // Admin CMS list — includes drafts (publishedAt: null), unlike the public findPublished().
  async findAllForAdmin() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForAdmin(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException('Blog post not found');
    }
    return post;
  }

    async create(dto: any) {
    return this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug: dto.slug || dto.title.toLowerCase().replace(/\s+/g, '-'),
        category: dto.category,
        body: dto.body,
        readTimeMin: dto.readTimeMin || 5,
        publishedAt: dto.published === false ? null : new Date(),
      },
    });
  }

  async update(id: string, dto: any) {
    const { published, ...rest } = dto;
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...rest,
        ...(published !== undefined && { publishedAt: published ? new Date() : null }),
      },
    });
  }

  async remove(id: string) {
    return this.prisma.blogPost.delete({ where: { id } });
  }
}

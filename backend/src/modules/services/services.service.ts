import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ServicesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.service.count();
    if (count === 0) {
      const defaultServices = [
        { name: 'Assignment Help', description: 'Step-by-step guidance on understanding assignment briefs and structure.', icon: 'BookOpen', price: 25.0 },
        { name: 'Homework Support', description: 'Quick assistance with coursework questions and problem sets.', icon: 'HelpCircle', price: 15.0 },
        { name: 'Dissertation Guidance', description: 'Expert feedback on thesis proposals, methodology, and literature reviews.', icon: 'FileText', price: 60.0 },
        { name: 'Exam Preparation', description: 'Targeted revision strategies and mock exam question walkthroughs.', icon: 'Award', price: 30.0 },
        { name: 'Proofreading & Editing', description: 'Academic style, clarity check, grammar, and structural polish.', icon: 'CheckCircle', price: 20.0 },
        { name: 'Programming Help', description: 'Code debugging, architecture explanation, and algorithm support.', icon: 'Code', price: 35.0 },
        { name: 'Essay Writing', description: 'Academic argument structure, critical analysis, and outline guidance.', icon: 'PenTool', price: 30.0 },
        { name: 'Referencing Support', description: 'Harvard, APA, OSCOLA and IEEE reference formatting and citations.', icon: 'Bookmark', price: 12.0 },
      ];

      for (const service of defaultServices) {
        await this.prisma.service.create({ data: service });
      }
    }
  }

  async findAllActive() {
    return this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
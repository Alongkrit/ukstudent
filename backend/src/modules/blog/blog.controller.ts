import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogService } from './blog.service';

// BLOG-1: public, read-only — category filter, article cards, detail view.
// Write access (BLOG-2, publish/unpublish) lives in the Admin module.
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('posts')
  findAll(@Query('category') category?: string) {
    return this.blogService.findPublished(category);
  }

  @Get('posts/:slug')
  findOne(@Param('slug') slug: string) {
    return this.blogService.findPublishedBySlug(slug);
  }
}

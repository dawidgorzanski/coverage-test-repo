import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PostsService } from './posts.service.js';

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Post()
  create(@Body() body: { authorId: string; title: string; content: string }) {
    return this.posts.create(body.authorId, body.title, body.content);
  }

  @Get()
  findAll() {
    return this.posts.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.posts.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { title: string; content: string }) {
    return this.posts.update(id, body.title, body.content);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.posts.remove(id);
  }
}

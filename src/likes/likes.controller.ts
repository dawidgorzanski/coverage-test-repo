import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { LikesService } from './likes.service.js';

@Controller('likes')
export class LikesController {
  constructor(private readonly likes: LikesService) {}

  @Post()
  create(@Body() body: { postId: string; username: string }) {
    return this.likes.create(body.postId, body.username);
  }

  @Get()
  findByPost(@Query('postId') postId: string) {
    return this.likes.findByPost(postId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.likes.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.likes.remove(id);
  }
}

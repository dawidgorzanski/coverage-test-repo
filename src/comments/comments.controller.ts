import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CommentsService } from './comments.service.js';

@Controller('comments')
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Post()
  create(@Body() body: { postId: string; username: string; text: string }) {
    return this.comments.create(body.postId, body.username, body.text);
  }

  @Get()
  findByPost(@Query('postId') postId: string) {
    return this.comments.findByPost(postId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comments.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { text: string }) {
    return this.comments.update(id, body.text);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.comments.remove(id);
  }
}

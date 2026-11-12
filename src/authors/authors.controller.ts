import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AuthorsService } from './authors.service.js';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authors: AuthorsService) {}

  @Post()
  create(@Body() body: { name: string }) {
    return this.authors.create(body.name);
  }

  @Get()
  findAll() {
    return this.authors.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authors.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name: string }) {
    return this.authors.update(id, body.name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.authors.remove(id);
  }
}

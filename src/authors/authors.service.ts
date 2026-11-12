import { randomUUID } from 'node:crypto';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts/posts.repository.js';
import type { Author } from './author.js';
import { AuthorsRepository } from './authors.repository.js';

@Injectable()
export class AuthorsService {
  constructor(
    private readonly authors: AuthorsRepository,
    private readonly posts: PostsRepository,
  ) {}

  create(name: string): Author {
    return this.authors.save({ id: randomUUID(), name });
  }

  findAll(): Author[] {
    return this.authors.findAll();
  }

  findOne(id: string): Author {
    const author = this.authors.findById(id);
    if (!author) throw new NotFoundException(`Author ${id} not found`);
    return author;
  }

  update(id: string, name: string): Author {
    return this.authors.save({ ...this.findOne(id), name });
  }

  remove(id: string): void {
    this.findOne(id);
    if (this.posts.findByAuthor(id).length > 0) {
      throw new ConflictException('Author still has posts');
    }
    this.authors.delete(id);
  }
}

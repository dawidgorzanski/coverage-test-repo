import { Injectable } from '@nestjs/common';
import { InMemoryRepository } from '../shared/in-memory.repository.js';
import type { Post } from './post.js';

@Injectable()
export class PostsRepository extends InMemoryRepository<Post> {
  findByAuthor(authorId: string): Post[] {
    return this.findAll().filter((post) => post.authorId === authorId);
  }
}

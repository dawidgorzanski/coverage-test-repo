import { Injectable } from '@nestjs/common';
import { InMemoryRepository } from '../shared/in-memory.repository.js';
import type { Like } from './like.js';

@Injectable()
export class LikesRepository extends InMemoryRepository<Like> {
  findByPost(postId: string): Like[] {
    return this.findAll().filter((like) => like.postId === postId);
  }
}

import { Injectable } from '@nestjs/common';
import { InMemoryRepository } from '../shared/in-memory.repository.js';
import type { Comment } from './comment.js';

@Injectable()
export class CommentsRepository extends InMemoryRepository<Comment> {
  findByPost(postId: string): Comment[] {
    return this.findAll().filter((comment) => comment.postId === postId);
  }
}

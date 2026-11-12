import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts/posts.repository.js';
import type { Comment } from './comment.js';
import { CommentsRepository } from './comments.repository.js';

@Injectable()
export class CommentsService {
  constructor(
    private readonly comments: CommentsRepository,
    private readonly posts: PostsRepository,
  ) {}

  create(postId: string, username: string, text: string): Comment {
    if (!this.posts.findById(postId)) {
      throw new NotFoundException(`Post ${postId} not found`);
    }
    return this.comments.save({ id: randomUUID(), postId, username, text });
  }

  findByPost(postId: string): Comment[] {
    return this.comments.findByPost(postId);
  }

  findOne(id: string): Comment {
    const comment = this.comments.findById(id);
    if (!comment) throw new NotFoundException(`Comment ${id} not found`);
    return comment;
  }

  update(id: string, text: string): Comment {
    return this.comments.save({ ...this.findOne(id), text });
  }

  remove(id: string): void {
    this.findOne(id);
    this.comments.delete(id);
  }
}

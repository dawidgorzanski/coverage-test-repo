import { randomUUID } from 'node:crypto';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts/posts.repository.js';
import type { Like } from './like.js';
import { LikesRepository } from './likes.repository.js';

@Injectable()
export class LikesService {
  constructor(
    private readonly likes: LikesRepository,
    private readonly posts: PostsRepository,
  ) {}

  create(postId: string, username: string): Like {
    if (!this.posts.findById(postId)) {
      throw new NotFoundException(`Post ${postId} not found`);
    }
    const alreadyLiked = this.likes
      .findByPost(postId)
      .some((like) => like.username === username);
    if (alreadyLiked) throw new ConflictException('Post already liked by user');
    return this.likes.save({ id: randomUUID(), postId, username });
  }

  findByPost(postId: string): Like[] {
    return this.likes.findByPost(postId);
  }

  findOne(id: string): Like {
    const like = this.likes.findById(id);
    if (!like) throw new NotFoundException(`Like ${id} not found`);
    return like;
  }

  remove(id: string): void {
    this.findOne(id);
    this.likes.delete(id);
  }
}

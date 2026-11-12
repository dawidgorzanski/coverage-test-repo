import { randomUUID } from 'node:crypto';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthorsRepository } from '../authors/authors.repository.js';
import { CommentsRepository } from '../comments/comments.repository.js';
import { LikesRepository } from '../likes/likes.repository.js';
import type { Post } from './post.js';
import { PostsRepository } from './posts.repository.js';

@Injectable()
export class PostsService {
  constructor(
    private readonly posts: PostsRepository,
    private readonly authors: AuthorsRepository,
    private readonly comments: CommentsRepository,
    private readonly likes: LikesRepository,
  ) {}

  create(authorId: string, title: string, content: string): Post {
    if (!this.authors.findById(authorId)) {
      throw new NotFoundException(`Author ${authorId} not found`);
    }
    return this.posts.save({ id: randomUUID(), authorId, title, content });
  }

  findAll(): Post[] {
    return this.posts.findAll();
  }

  findOne(id: string): Post {
    const post = this.posts.findById(id);
    if (!post) throw new NotFoundException(`Post ${id} not found`);
    return post;
  }

  update(id: string, title: string, content: string): Post {
    return this.posts.save({ ...this.findOne(id), title, content });
  }

  remove(id: string): void {
    this.findOne(id);
    if (this.comments.findByPost(id).length > 0) {
      throw new ConflictException('Post still has comments');
    }
    if (this.likes.findByPost(id).length > 0) {
      throw new ConflictException('Post still has likes');
    }
    this.posts.delete(id);
  }
}
